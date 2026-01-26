
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { pool } = require('../config/db');

async function createTable() {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS public.batch_academic_policies ( 
        id bigserial not null, 
        joining_year integer not null, 
        school_id bigint not null, 
        program_id bigint not null, 
        summer_immersion boolean null default false, 
        summer_internship boolean null default false, 
        capstone boolean null default false, 
        placement boolean null default false, 
        remarks text null, 
        created_at timestamp without time zone null default CURRENT_TIMESTAMP, 
        constraint batch_academic_policies_pkey primary key (id), 
        constraint batch_academic_policies_joining_year_school_id_program_id_key unique (joining_year, school_id, program_id), 
        constraint fk_policy_program foreign KEY (program_id) references programs (id), 
        constraint fk_policy_school foreign KEY (school_id) references schools (id) 
      ) TABLESPACE pg_default;
    `;

    await pool.query(query);
    console.log('Table batch_academic_policies created successfully');
  } catch (err) {
    console.error('Error creating table:', err);
  } finally {
    await pool.end();
  }
}

createTable();
