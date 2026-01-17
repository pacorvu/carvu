const { pool } = require('../config/db');

async function run() {
  try {
    const nullableCheck = await pool.query(
      "select is_nullable from information_schema.columns where table_schema='public' and table_name='student_profile_communication' and column_name='personal_email' limit 1"
    );
    const isNullable = (nullableCheck.rows[0]?.is_nullable || 'YES') === 'YES';
    const select = await pool.query(
      "select usn, college_email, personal_email from student_profile_communication where personal_email ilike '%@rvu.edu.in'"
    );
    console.log(`Found ${select.rows.length} rows with RVU domain in personal_email`);
    for (const row of select.rows) {
      const usn = row.usn;
      const personal = row.personal_email;
      const college = row.college_email;
      if (!personal) continue;
      const isRvu = personal.toLowerCase().endsWith('@rvu.edu.in');
      if (!isRvu) continue;
      if (!college) {
        await pool.query(
          `update student_profile_communication 
           set college_email=$1, personal_email=${isNullable ? 'null' : "''"}, updated_at=now() 
           where usn=$2`,
          [personal, usn]
        );
        console.log(`USN ${usn}: moved ${personal} from personal_email to college_email`);
      } else if (college.toLowerCase() === personal.toLowerCase()) {
        await pool.query(
          `update student_profile_communication 
           set personal_email=${isNullable ? 'null' : "''"}, updated_at=now() 
           where usn=$1`, [usn]
        );
        console.log(`USN ${usn}: cleared duplicate RVU personal_email`);
      } else {
        // keep both, but ensure RVU domain is in college_email
        await pool.query(
          "update student_profile_communication set college_email=$1, updated_at=now() where usn=$2",
          [personal, usn]
        );
        console.log(`USN ${usn}: copied RVU email into college_email`);
      }
    }
  } catch (e) {
    console.error('fix_personal_email_rvu_domain error:', e.message);
  } finally {
    await pool.end();
  }
}

run();
