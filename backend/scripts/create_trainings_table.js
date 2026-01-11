const { pool } = require('../config/db');

const createTrainingsTable = async () => {
  const client = await pool.connect();
  try {
    console.log('Creating student_trainings table...');
    
    await client.query(`
      create table if not exists public.student_trainings (
        id bigserial not null,
        usn text not null,
        title text not null,
        institution text not null,
        training_type text null,
        start_date date null,
        end_date date null,
        skills text null,
        description text null,
        proof_document text null,
        created_at timestamp with time zone null default CURRENT_TIMESTAMP,
        updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
        constraint student_trainings_pkey primary key (id),
        constraint fk_training_student foreign KEY (usn) references students_personal_details (usn) on delete CASCADE
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

createTrainingsTable();
