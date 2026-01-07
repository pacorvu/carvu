require('dotenv').config();
const { pool } = require('../config/db');

async function pickProgramId() {
  const byName = await pool.query("select id from programs where name ilike '%B.Tech%' or name ilike '%BTech%' limit 1");
  if (byName.rows.length) return byName.rows[0].id;
  const any = await pool.query("select id from programs order by id limit 1");
  return any.rows.length ? any.rows[0].id : null;
}

async function run() {
  const programId = await pickProgramId();
  const schoolName = 'SoCSE';
  const res = await pool.query("select usn from students_personal_details where usn like '1RVU23FAKE%'");
  for (const r of res.rows) {
    await pool.query("update students_personal_details set school_name=$1, program_id=$2, updated_at=now() where usn=$3", [schoolName, programId, r.usn]);
    // ensure communication email exists for registration masking
    const email = `${r.usn.toLowerCase()}@rvu.edu.in`;
    await pool.query("insert into student_profile_communication (usn, college_email, personal_email, created_at, updated_at) values ($1, $2, $3, now(), now()) on conflict (usn) do update set college_email=excluded.college_email, personal_email=excluded.personal_email, updated_at=now()", [r.usn, email, email]);
  }
  console.log('updated', res.rows.length, 'fake students');
}

run().then(() => pool.end()).catch(e => { console.error(e.message); pool.end(); });
