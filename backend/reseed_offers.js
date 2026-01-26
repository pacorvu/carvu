const { pool } = require('./config/db');

async function reseedOffers() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log("1. Clearing existing offers, placement, capstone, and alumni data...");
    await client.query('DELETE FROM offers');
    await client.query('DELETE FROM placement');
    await client.query('DELETE FROM capstone');
    await client.query('DELETE FROM alumni');
    console.log("   Cleared.");

    console.log("2. Fetching potential candidates...");
    // Fetch students with program info
    const studentsRes = await client.query(`
      SELECT s.usn, s.current_year, s.program_id, p.graduation_level, p.name as program_name
      FROM students_personal_details s
      LEFT JOIN programs p ON s.program_id = p.id
    `);
    const students = studentsRes.rows;
    
    // Create Dummy Alumni
    console.log("   Creating Dummy Alumni...");
    const alumniBatches = [
        { year: 2023, count: 5 }, // 2022-23 Offers
        { year: 2024, count: 5 }, // 2023-24 Offers (Skipping as per request? User asked for 22-23, 24-25, 25-26)
        { year: 2025, count: 5 }  // 2024-25 Offers
    ];
    
    const alumni = [];
    
    for (const batch of alumniBatches) {
        for (let i = 0; i < batch.count; i++) {
            const usn = `1RVU${batch.year % 100}ALM${String(i).padStart(3, '0')}`;
            const name = `Alumni ${batch.year} ${i}`;
            const email = `${usn.toLowerCase()}@rvu.edu.in`;

            // Insert into students_personal_details FIRST to satisfy FK constraint
            // Determine dates based on graduation year
            let dateYear = batch.year - 1; // e.g. 2023 grad -> 2022-23 placement -> opt in 2022
            const optDate = `${dateYear}-09-01 10:00:00+00`;
            
            await client.query(`
                INSERT INTO students_personal_details (usn, full_name, college_email, personal_email, current_year, program_id, school_name, year_of_joining, current_semester, "Opt_In", is_eligible, eligible_at, opted_in_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, true, $10, $10)
                ON CONFLICT (usn) DO NOTHING
            `, [usn, name, email, email, 4, 1, 'SoB', 2021, 8, optDate]); // Assuming program_id 1 exists (B.Des or similar), current_year 4

            await client.query(`
                INSERT INTO alumni (usn, full_name, graduation_year, personal_email)
                VALUES ($1, $2, $3, $4)
            `, [usn, name, batch.year, email]);
            
            alumni.push({ usn, graduation_year: batch.year });
        }
    }
    console.log(`   Created ${alumni.length} alumni.`);

    console.log(`   Found ${students.length} students.`);

    // --- Helper Functions ---

    const createPlacement = async (usn, ctc, year, company) => {
      const res = await client.query(`
        INSERT INTO placement (
          usn, company_name, designation, ctc_min_lpa, ctc_max_lpa, 
          offer_letter_status, academic_year, type_of_hiring
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id
      `, [usn, company, 'Associate', ctc, ctc, 'Released', year, 'On Campus']);
      return res.rows[0].id;
    };

    const createCapstone = async (usn, stipend, year, company) => {
      const res = await client.query(`
        INSERT INTO capstone (
          usn, company_name, designation, internship_stipend_min, internship_stipend_max,
          offer_letter_status, academic_year, internship_duration_months
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id
      `, [usn, company, 'Intern', stipend, stipend, 'Released', year, 6]);
      return res.rows[0].id;
    };

    const createOffer = async (usn, type, placementId, capstoneId, year) => {
      await client.query(`
        INSERT INTO offers (
          usn, job_type, placement_id, capstone_id, academic_year
        ) VALUES ($1, $2, $3, $4, $5)
      `, [usn, type, placementId, capstoneId, year]);
    };

    const updateStudentOptIn = async (usn, dateStr = '2025-09-01 10:00:00+00') => {
      await client.query(`
        UPDATE students_personal_details 
        SET "Opt_In" = true, is_eligible = true,
            eligible_at = $2, opted_in_at = $2
        WHERE usn = $1
      `, [usn, dateStr]);
    };

    // --- Seeding Logic ---

    // Companies list
    const companies = ['Google', 'Microsoft', 'Amazon', 'Flipkart', 'TCS', 'Infosys', 'Wipro', 'Accenture', 'Deloitte', 'Goldman Sachs'];
    const getRandomCompany = () => companies[Math.floor(Math.random() * companies.length)];

    // 1. Current Students (2025-2026)
    // Only give offers to 3rd year+ (UG) or 2nd year+ (PG)
    console.log("   Seeding Current Students (2025-2026)...");
    let updatedStudents = 0;
    
    for (const s of students) {
      const level = (s.graduation_level || 'UG').toUpperCase();
      const year = s.current_year || 1;
      
      let isFinalYear = false;
      let isPreFinal = false;

      if (level === 'UG') {
        // Assume 4 year course for simplicity in logic, or 3.
        // If year >= 4 -> Final. Year == 3 -> Pre-Final.
        if (year >= 4) isFinalYear = true;
        else if (year === 3) isPreFinal = true;
      } else {
        // PG
        if (year >= 2) isFinalYear = true;
      }

      // Logic: 
      // Final Year -> High chance of Full Time or Internship+FullTime
      // Pre-Final -> Chance of Internship
      // Others -> No offers (to fix user complaint)

      if (isFinalYear && Math.random() > 0.3) { // 70% placed
        const company = getRandomCompany();
        const ctc = 6 + Math.floor(Math.random() * 20); // 6 to 26 LPA
        
        // Full Time Offer
        const pid = await createPlacement(s.usn, ctc, '2025-26', company);
        await createOffer(s.usn, 'full_time', pid, null, '2025-26');
        await updateStudentOptIn(s.usn);
        updatedStudents++;

      } else if (isPreFinal && Math.random() > 0.6) { // 40% interns
        const company = getRandomCompany();
        const stipend = 15000 + Math.floor(Math.random() * 50000);
        
        // Internship Offer
        const cid = await createCapstone(s.usn, stipend, '2025-26', company);
        await createOffer(s.usn, 'internship', null, cid, '2025-26');
        await updateStudentOptIn(s.usn);
        updatedStudents++;
      }
    }
    console.log(`   Assigned offers to ${updatedStudents} current students.`);

    // 2. Alumni (2022-2023, 2024-2025)
    console.log("   Seeding Alumni (2022-23, 2024-25)...");
    for (const a of alumni) {
      // Determine year based on graduation year
      let offerYear = '2024-25';
      if (a.graduation_year === 2023) offerYear = '2022-23';
      else if (a.graduation_year === 2024) offerYear = '2024-25'; // User requested 24-25
      else if (a.graduation_year === 2025) offerYear = '2024-25';
      
      // Alumni mostly have Full Time offers
      const company = getRandomCompany();
      const ctc = 8 + Math.floor(Math.random() * 25);
      
      const pid = await createPlacement(a.usn, ctc, offerYear, company);
      await createOffer(a.usn, 'full_time', pid, null, offerYear);
      
      // Also update opt-in just in case (though they are alumni)
      // await updateStudentOptIn(a.usn); // Optional for alumni
    }
    console.log(`   Assigned offers to ${alumni.length} alumni.`);

    await client.query('COMMIT');
    console.log("   Seeding Complete.");

  } catch (e) {
    await client.query('ROLLBACK');
    console.error("   Seeding Failed:", e);
  } finally {
    client.release();
    pool.end();
  }
}

reseedOffers();
