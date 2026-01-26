const { pool } = require('../config/db');

const createProjectsTable = async () => {
  const client = await pool.connect();
  try {
    console.log("Setting up student_projects schema...");
    await client.query('BEGIN');

    // 1. Drop old table if exists (Schema change)
    console.log("Dropping old student_projects table...");
    await client.query('DROP TABLE IF EXISTS public.student_projects CASCADE');

    // 2. Create student_projects table
    console.log("Creating student_projects table...");
    await client.query(`
      CREATE TABLE public.student_projects (
        id bigserial PRIMARY KEY,
        usn text NOT NULL,
        title text NOT NULL,
        one_line_description text NOT NULL,
        full_description text,
        genre text NOT NULL,
        visibility text NOT NULL DEFAULT 'PRIVATE' CHECK (visibility IN ('PRIVATE', 'PUBLIC')),
        self_rating smallint NOT NULL CHECK (self_rating BETWEEN 1 AND 10),
        admin_rating smallint CHECK (admin_rating BETWEEN 1 AND 10),
        priority smallint NOT NULL,
        project_snaps text[] NOT NULL CHECK (array_length(project_snaps, 1) <= 4),
        hosted_link text,
        github_repo text,
        views_count integer DEFAULT 0,
        likes_count integer DEFAULT 0,
        favorites_count integer DEFAULT 0,
        created_at timestamp with time zone DEFAULT now(),
        updated_at timestamp with time zone DEFAULT now(),
        CONSTRAINT fk_project_student FOREIGN KEY (usn) REFERENCES students_personal_details (usn)
      );
    `);

    // 2. Create unique index for priority per student
    console.log("Creating unique index on (usn, priority)...");
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uniq_project_priority_per_student 
      ON student_projects (usn, priority);
    `);

    // 3. Update alumni table
    console.log("Updating alumni table with tracking arrays...");
    await client.query(`
      ALTER TABLE alumni ADD COLUMN IF NOT EXISTS viewed_project_ids bigint[] DEFAULT '{}';
      ALTER TABLE alumni ADD COLUMN IF NOT EXISTS liked_project_ids bigint[] DEFAULT '{}';
      ALTER TABLE alumni ADD COLUMN IF NOT EXISTS favorited_project_ids bigint[] DEFAULT '{}';
    `);

    await client.query('COMMIT');
    console.log("Schema setup completed successfully.");

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error setting up schema:", err);
  } finally {
    client.release();
    pool.end();
  }
};

createProjectsTable();
