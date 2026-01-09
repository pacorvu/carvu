const { pool } = require('../config/db');

const sql = `
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students_personal_details' AND column_name = 'personal_email') THEN
        ALTER TABLE students_personal_details ADD COLUMN personal_email text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students_personal_details' AND column_name = 'phone_number') THEN
        ALTER TABLE students_personal_details ADD COLUMN phone_number text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students_personal_details' AND column_name = 'dob') THEN
        ALTER TABLE students_personal_details ADD COLUMN dob date;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students_personal_details' AND column_name = 'gender') THEN
        ALTER TABLE students_personal_details ADD COLUMN gender text;
    END IF;
END $$;
`;

async function run() {
  try {
    await pool.query(sql);
    console.log('Schema update successful');
    process.exit(0);
  } catch (e) {
    console.error('Schema update failed:', e);
    process.exit(1);
  }
}

run();
