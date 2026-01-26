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

console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Defined" : "Undefined");
// console.log("DATABASE_URL Value:", process.env.DATABASE_URL); // Be careful not to leak secrets in logs if not needed

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const updateSchema = async () => {
  const client = await pool.connect();
  try {
    console.log("Updating student_projects schema for stats...");
    await client.query('BEGIN');

    // Add views
    await client.query(`
      ALTER TABLE student_projects 
      ADD COLUMN IF NOT EXISTS views integer DEFAULT 0;
    `);

    // Add likes
    await client.query(`
      ALTER TABLE student_projects 
      ADD COLUMN IF NOT EXISTS likes integer DEFAULT 0;
    `);

    // Add downloads/installs
    await client.query(`
      ALTER TABLE student_projects 
      ADD COLUMN IF NOT EXISTS downloads integer DEFAULT 0;
    `);

    await client.query('COMMIT');
    console.log("Schema updated successfully.");
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error updating schema:", err);
  } finally {
    client.release();
    pool.end();
  }
};

updateSchema();
