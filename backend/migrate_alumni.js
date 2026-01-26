const { pool } = require('./config/db');

const migrate = async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to DB');
    
    // Add alumni column to batch_academic_policies
    try {
        await client.query('ALTER TABLE batch_academic_policies ADD COLUMN alumni BOOLEAN DEFAULT FALSE;');
        console.log('Added alumni column to batch_academic_policies');
    } catch (e) {
        if (e.code === '42701') { // duplicate_column
            console.log('Column alumni already exists');
        } else {
            console.error('Error adding column:', e.message);
        }
    }
    
    client.release();
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migrate();
