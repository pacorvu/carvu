const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

// Explicitly resolve path
const envPath = path.resolve(__dirname, '../.env');
console.log("Loading .env from:", envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error("Error loading .env:", result.error);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const updateSchema = async () => {
  const client = await pool.connect();
  try {
    console.log("Updating student_projects schema for admin ratings...");
    await client.query('BEGIN');

    // Add admin_rating
    await client.query(`
      ALTER TABLE student_projects 
      ADD COLUMN IF NOT EXISTS admin_rating integer DEFAULT 0;
    `);

    // Add admin_feedback
    await client.query(`
      ALTER TABLE student_projects 
      ADD COLUMN IF NOT EXISTS admin_feedback text;
    `);

    await client.query('COMMIT');
    console.log("Schema updated successfully.");
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error updating schema:", err);
  } finally {
    client.release();
    await pool.end();
  }
};

updateSchema();
