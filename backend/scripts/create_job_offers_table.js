
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { pool } = require('../config/db');

async function createTable() {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS job_offers (
        id SERIAL PRIMARY KEY,
        usn VARCHAR(20) NOT NULL,
        company_id INTEGER,
        designation VARCHAR(255),
        job_type VARCHAR(50),
        internship_duration VARCHAR(100),
        internship_stipend VARCHAR(100),
        ctc_min_lpa NUMERIC(10, 2),
        ctc_max_lpa NUMERIC(10, 2),
        ctc_variable_pay VARCHAR(255),
        offer_letter_status VARCHAR(50),
        final_interview_status VARCHAR(50),
        remarks TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await pool.query(query);
    console.log('Table job_offers created successfully');
  } catch (err) {
    console.error('Error creating table:', err);
  } finally {
    await pool.end();
  }
}

createTable();
