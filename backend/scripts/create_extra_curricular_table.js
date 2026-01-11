const { pool } = require('../config/db');

const createExtraCurricularTable = async () => {
  const client = await pool.connect();
  try {
    console.log('Creating student_extra_curricular_activities table...');
    
    await client.query(`
      create table if not exists public.student_extra_curricular_activities (
        id bigserial not null,
        usn text not null,
        activity_name text not null,
        activity_type text not null,
        role text null,
        organization text null,
        start_date date null,
        end_date date null,
        achievements text null,
        skills text null,
        description text null,
        proof_document text null,
        created_at timestamp with time zone null default CURRENT_TIMESTAMP,
        updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
        constraint student_extra_curricular_activities_pkey primary key (id),
        constraint fk_extra_curricular_student foreign KEY (usn) references students_personal_details (usn) on delete CASCADE
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

createExtraCurricularTable();
