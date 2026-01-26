
const { pool } = require('../config/db');

const JOB_CODE = 'PROMOTION_CHECK';

const runPromotionCheck = async () => {
  const client = await pool.connect();
  try {
    console.log(`[${new Date().toISOString()}] Starting PROMOTION_CHECK job...`);

    // 1. Update Job Status to RUNNING
    await client.query(`
      UPDATE system_jobs 
      SET job_status = 'RUNNING', last_started_at = NOW(), last_error = NULL
      WHERE job_code = $1
    `, [JOB_CODE]);

    // 2. Execute Promotion Logic
    // Auto-correct current semester and year based on joining year.
    // Logic:
    // If Month >= 7 (July), it implies Odd Semester (1, 3, 5...). 
    // If Month < 7, it implies Even Semester (2, 4, 6...).
    // Constraints: semester 1-12, year 1-6.
    
    const query = `
      UPDATE students_personal_details
      SET 
        current_semester = LEAST(12, GREATEST(1, CASE 
          WHEN EXTRACT(MONTH FROM CURRENT_DATE) >= 7 THEN (EXTRACT(YEAR FROM CURRENT_DATE) - year_of_joining) * 2 + 1
          ELSE (EXTRACT(YEAR FROM CURRENT_DATE) - year_of_joining) * 2
        END)),
        current_year = LEAST(6, GREATEST(1, CASE 
          WHEN EXTRACT(MONTH FROM CURRENT_DATE) >= 7 THEN (EXTRACT(YEAR FROM CURRENT_DATE) - year_of_joining) + 1
          ELSE (EXTRACT(YEAR FROM CURRENT_DATE) - year_of_joining)
        END)),
        updated_at = NOW()
      WHERE year_of_joining IS NOT NULL
        AND year_of_joining > 2000
    `;
    
    const result = await client.query(query);
    console.log(`[${new Date().toISOString()}] PROMOTION_CHECK: Updated ${result.rowCount} students.`);

    // 3. Update Job Status to SUCCESS
    await client.query(`
      UPDATE system_jobs 
      SET job_status = 'SUCCESS', last_finished_at = NOW(), progress_percentage = 100, last_summary = $2
      WHERE job_code = $1
    `, [JOB_CODE, `Updated ${result.rowCount} students.`]);

  } catch (error) {
    console.error(`[${new Date().toISOString()}] PROMOTION_CHECK job failed:`, error);
    await client.query(`
      UPDATE system_jobs 
      SET job_status = 'FAILED', last_error = $2, last_finished_at = NOW()
      WHERE job_code = $1
    `, [JOB_CODE, error.message]);
  } finally {
    client.release();
  }
};

module.exports = { runPromotionCheck, JOB_CODE };
