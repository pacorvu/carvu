const { pool } = require('../config/db');

const createAcademicsTable = async () => {
  const client = await pool.connect();
  try {
    console.log('Creating student_semester_academics table...');
    
    await client.query(`
      create table if not exists public.student_semester_academics (
        id bigserial not null,
        usn text not null,
        academic_year integer not null,
        semester integer not null,
        result_in_sgpa numeric(4, 2) not null,
        closed_backlogs integer null default 0,
        live_backlogs integer null default 0,
        provisional_result_upload_link text[] not null,
        uploaded_at timestamp with time zone null default CURRENT_TIMESTAMP,
        constraint student_semester_academics_pkey primary key (id),
        constraint uq_student_semester unique (usn, semester),
        constraint fk_semester_academics_student foreign KEY (usn) references students_personal_details (usn) on delete CASCADE,
        constraint student_semester_academics_semester_check check (
          (
            (semester >= 1)
            and (semester <= 8)
          )
        )
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

createAcademicsTable();
