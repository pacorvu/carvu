const { pool } = require('../config/db');

async function checkColumns() {
  try {
    const res = await pool.query("select column_name from information_schema.columns where table_name='students_personal_details'");
    console.log('Columns:', res.rows.map(r => r.column_name));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

checkColumns();
