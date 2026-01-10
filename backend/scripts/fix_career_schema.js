
const { pool } = require('../config/db');

async function fixSchema() {
  try {
    console.log('Checking student_profile_details schema...');
    
    // Check if column exists
    const check = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='student_profile_details' AND column_name='future_goals'
    `);

    if (check.rows.length === 0) {
      console.log('Column future_goals missing. Adding it...');
      await pool.query(`
        ALTER TABLE student_profile_details 
        ADD COLUMN IF NOT EXISTS future_goals text null;
      `);
      console.log('Successfully added future_goals column.');
    } else {
      console.log('Column future_goals already exists.');
    }

    process.exit(0);
  } catch (e) {
    console.error('Error updating schema:', e);
    process.exit(1);
  }
}

fixSchema();
