const { Pool } = require('./backend/node_modules/pg');
require('./backend/node_modules/dotenv').config({ path: './backend/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function inspect() {
  try {
    const res = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    `);
      
    const tables = res.rows.map(r => r.table_name);
    console.log("All Tables:", tables);

    for (const table of tables) {
      const res = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1
      `, [table]);
      
      console.log(`\nTable: ${table}`);
      res.rows.forEach(row => {
        console.log(`  - ${row.column_name} (${row.data_type})`);
      });
    }
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

inspect();
