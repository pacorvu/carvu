const { pool } = require('../config/db');

const createProjectsTable = async () => {
  const client = await pool.connect();
  try {
    console.log('Creating student_projects table...');
    
    await client.query(`
      create table if not exists public.student_projects (
        id bigserial not null,
        usn text not null,
        title text not null,
        description text null,
        skills text null,
        project_link text null,
        snaps text null,
        created_at timestamp with time zone null default CURRENT_TIMESTAMP,
        updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
        mentor_name text null,
        constraint student_projects_pkey primary key (id),
        constraint fk_project_student foreign KEY (usn) references students_personal_details (usn) on delete CASCADE
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

createProjectsTable();
