const { pool } = require('../config/db');

const createTables = async () => {
  try {
    console.log("Creating snapshot tables...");

    // 1. Placement Overview Snapshot (Aggregated per group per year)
    await pool.query('DROP TABLE IF EXISTS placement_academic_year_snapshot');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS placement_academic_year_snapshot (
        id BIGSERIAL PRIMARY KEY,
        academic_year VARCHAR(20) NOT NULL,
        
        -- Grouping Keys
        school_name TEXT,
        program_name TEXT,
        current_year INT, -- Added: 1st year, 2nd year, etc.
        
        -- Metrics
        batch_strength INT DEFAULT 0,
        eligible_count INT DEFAULT 0,
        opt_in_count INT DEFAULT 0,
        placed_count INT DEFAULT 0,
        not_placed_count INT DEFAULT 0,
        
        -- Salary Stats (Stored as JSON for flexibility or separate cols)
        min_ctc NUMERIC(10,2) DEFAULT 0,
        max_ctc NUMERIC(10,2) DEFAULT 0,
        avg_ctc NUMERIC(10,2) DEFAULT 0,
        median_ctc NUMERIC(10,2) DEFAULT 0,
        
        paid_internships_count INT DEFAULT 0,
        
        generated_at TIMESTAMPTZ DEFAULT NOW(),
        
        UNIQUE(academic_year, school_name, program_name, current_year)
      );
    `);

    console.log("Created placement_academic_year_snapshot table.");
    
  } catch (err) {
    console.error("Error creating tables:", err);
  } finally {
    pool.end();
  }
};

createTables();
