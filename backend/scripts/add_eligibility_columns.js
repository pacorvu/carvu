require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  try {
    const client = await pool.connect();
    console.log('Connected to database');
    
    const queries = [
      "ALTER TABLE students_personal_details ADD COLUMN IF NOT EXISTS is_eligible_internship boolean DEFAULT false;",
      "ALTER TABLE students_personal_details ADD COLUMN IF NOT EXISTS is_eligible_immersion boolean DEFAULT false;",
      "ALTER TABLE students_personal_details ADD COLUMN IF NOT EXISTS is_eligible_capstone boolean DEFAULT false;",
      "ALTER TABLE students_personal_details ADD COLUMN IF NOT EXISTS is_eligible_placement boolean DEFAULT false;"
    ];

    for (const query of queries) {
      await client.query(query);
      console.log(`Executed: ${query}`);
    }

    client.release();
    console.log('Migration completed successfully');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

migrate();
