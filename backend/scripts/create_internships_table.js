const { pool } = require('../config/db');

const createInternshipsTable = async () => {
  const client = await pool.connect();
  try {
    console.log('Creating student_internships table...');
    
    await client.query(`
      create table if not exists public.student_internships (
        id bigserial not null,
        usn text not null,
        job_role text not null,
        organization text not null,
        organization_details text null,
        duration_months integer null,
        start_date date null,
        end_date date null,
        location text null,
        stipend numeric null,
        skills text null,
        description text null,
        mentor_name text null,
        proof_document text null,
        created_at timestamp with time zone null default CURRENT_TIMESTAMP,
        updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
        constraint student_internships_pkey primary key (id),
        constraint fk_internship_student foreign KEY (usn) references students_personal_details (usn) on delete CASCADE
      ) TABLESPACE pg_default;
    `);

    console.log('Table created successfully.');
  } catch (e) {
    console.error('Error creating table:', e);
  } finally {
    client.release();
    pool.end();
  }
};

createInternshipsTable();
