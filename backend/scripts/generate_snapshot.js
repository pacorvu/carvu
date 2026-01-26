const { pool } = require('../config/db');

// Configuration
const ACADEMIC_YEARS = ['2022-23', '2023-24', '2024-25', '2025-26'];

// Helpers
const getEndYear = (yearStr) => {
    try {
        const parts = yearStr.split('-');
        let endYear = parseInt(parts[1]);
        if (endYear < 100) endYear += 2000;
        return endYear;
    } catch (e) { return 0; }
};

const getCutoffDate = (yearStr) => {
    const endYear = getEndYear(yearStr);
    return new Date(`${endYear}-06-30`);
};

async function generateSnapshots() {
    const client = await pool.connect();
    try {
        console.log("Starting Snapshot Generation...");

        // Loop through Academic Years
        for (const year of ACADEMIC_YEARS) {
            console.log(`Processing ${year}...`);
            const cutoffDate = getCutoffDate(year);
            const endYear = getEndYear(year);

            // --- Generate Aggregated Snapshot Directly ---
            
            // First, clear existing snapshot for this year
            await client.query(`DELETE FROM placement_academic_year_snapshot WHERE academic_year = $1`, [year]);

            // Query to aggregate directly from source tables
            const aggQuery = `
                WITH CalculatedStatus AS (
                    SELECT 
                        s.usn,
                        s.school_name,
                        p.name as program_name,
                        -- Calculate current year: endYear - joinYear
                        ($2 - s.year_of_joining) as current_year,
                        (s.eligible_at IS NOT NULL AND s.eligible_at <= $3) as is_eligible,
                        (s.opted_in_at IS NOT NULL AND s.opted_in_at <= $3) as opt_in
                    FROM students_personal_details s
                    LEFT JOIN programs p ON s.program_id = p.id
                    WHERE s.year_of_joining IS NOT NULL 
                      AND ($2 - s.year_of_joining) > 0
                ),
                StudentStats AS (
                    SELECT 
                        cs.school_name,
                        cs.program_name,
                        cs.current_year,
                        cs.usn,
                        cs.is_eligible,
                        cs.opt_in,
                        -- Check for Offer in this Academic Year
                        EXISTS (
                            SELECT 1 FROM placement p 
                            WHERE p.usn = cs.usn 
                            AND p.academic_year = $1
                            AND p.offer_letter_status ILIKE 'accepted'
                        ) as has_offer,
                        -- Get Max Salary for this student in this year
                        (
                            SELECT MAX(GREATEST(COALESCE(p.ctc_max_lpa, 0), COALESCE(p.ctc_min_lpa, 0)))
                            FROM placement p
                            WHERE p.usn = cs.usn 
                            AND p.academic_year = $1
                            AND p.offer_letter_status ILIKE 'accepted'
                        ) as max_salary,
                        -- Check Paid Internship
                        EXISTS (
                            SELECT 1 FROM offers o
                            WHERE o.usn = cs.usn
                            AND o.academic_year = $1
                            AND o.job_type ILIKE '%internship%'
                        ) as has_paid_internship
                    FROM CalculatedStatus cs
                )
                INSERT INTO placement_academic_year_snapshot 
                (academic_year, school_name, program_name, current_year, batch_strength, eligible_count, opt_in_count, placed_count, not_placed_count, min_ctc, max_ctc, avg_ctc, median_ctc, paid_internships_count)
                SELECT
                    $1 as academic_year,
                    school_name,
                    program_name,
                    current_year,
                    COUNT(*) as batch_strength,
                    COUNT(CASE WHEN is_eligible THEN 1 END) as eligible_count,
                    COUNT(CASE WHEN opt_in THEN 1 END) as opt_in_count,
                    COUNT(CASE WHEN has_offer THEN 1 END) as placed_count,
                    COUNT(*) - COUNT(CASE WHEN has_offer THEN 1 END) as not_placed_count,
                    
                    MIN(NULLIF(max_salary, 0)) as min_ctc,
                    MAX(max_salary) as max_ctc,
                    AVG(NULLIF(max_salary, 0)) as avg_ctc,
                    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY max_salary) as median_ctc,
                    
                    COUNT(CASE WHEN has_paid_internship THEN 1 END) as paid_internships_count
                FROM StudentStats
                GROUP BY school_name, program_name, current_year;
            `;
            
            await client.query(aggQuery, [year, endYear, cutoffDate]);
            console.log(`  -> Generated snapshot for ${year}.`);
        }

        console.log("Snapshot Generation Complete.");

    } catch (err) {
        console.error("Error generating snapshots:", err);
    } finally {
        client.release();
        pool.end();
    }
}

generateSnapshots();
