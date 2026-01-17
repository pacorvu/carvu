
const { pool } = require('./config/db');

async function checkSchema() {
  try {
    const res = await pool.query("select column_name from information_schema.columns where table_name = 'user_login'");
    console.log('Columns in user_login:', res.rows.map(r => r.column_name));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

checkSchema();
