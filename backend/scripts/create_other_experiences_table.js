const { pool } = require('../config/db');

const createOtherExperiencesTable = async () => {
  const client = await pool.connect();
  try {
    console.log('Creating student_other_experiences table...');
    
    await client.query(`
      create table if not exists public.student_other_experiences (
        id bigserial not null,
        usn text not null,
        title text not null,
        organization text null,
        start_date date null,
        end_date date null,
        location text null,
        skills text null,
        description text null,
        proof_document text null,
        created_at timestamp with time zone null default CURRENT_TIMESTAMP,
        updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
        constraint student_other_experiences_pkey primary key (id),
        constraint fk_other_experience_student foreign KEY (usn) references students_personal_details (usn) on delete CASCADE
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

createOtherExperiencesTable();
