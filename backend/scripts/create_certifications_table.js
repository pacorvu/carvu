const { pool } = require('../config/db');

const createCertificationsTable = async () => {
  const client = await pool.connect();
  try {
    console.log('Creating student_certifications table...');
    
    await client.query(`
      create table if not exists public.student_certifications (
        id bigserial not null,
        usn text not null,
        title text not null,
        organization text not null,
        certification_type text null,
        skills text null,
        score text null,
        issue_date date null,
        expiry_date date null,
        proof_document text null,
        created_at timestamp with time zone null default CURRENT_TIMESTAMP,
        updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
        constraint student_certifications_pkey primary key (id),
        constraint fk_certification_student foreign KEY (usn) references students_personal_details (usn) on delete CASCADE
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

createCertificationsTable();
