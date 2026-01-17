const { pool } = require('../config/db');

const createPublicationsTable = async () => {
  const client = await pool.connect();
  try {
    console.log('Creating student_publications table...');
    
    await client.query(`
      create table if not exists public.student_publications (
        id bigserial not null,
        usn text not null,
        title text not null,
        publication_name text null,
        publication_type text not null,
        publication_date date null,
        author_count integer null,
        mentor_name text null,
        skills text null,
        description text null,
        evidence_document text null,
        created_at timestamp with time zone null default CURRENT_TIMESTAMP,
        updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
        constraint student_publications_pkey primary key (id),
        constraint fk_publication_student foreign KEY (usn) references students_personal_details (usn) on delete CASCADE,
        constraint student_publications_author_count_check check ((author_count > 0))
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

createPublicationsTable();
