const { pool } = require('./backend/config/db');

async function checkSchema() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'student_projects';
    `);
    
    console.log("Columns in student_projects:");
    result.rows.forEach(row => {
      console.log(`${row.column_name} (${row.data_type})`);
    });

  } catch (err) {
    console.error("Error:", err);
  } finally {
    pool.end();
  }
}

checkSchema();
