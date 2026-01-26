const { Pool } = require('pg');
const path = require('path');
// Try loading .env from backend root or project root
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const setupAlumniRegistration = async () => {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not defined in environment variables.');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('Creating alumni_registration_codes table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.alumni_registration_codes (
        id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        code text NOT NULL UNIQUE,
        batch_year integer NOT NULL,
        institution_name text NOT NULL,
        remarks text NOT NULL,
        max_uses integer DEFAULT 0,
        used_count integer DEFAULT 0,
        is_active boolean DEFAULT true,
        expires_at timestamp with time zone,
        created_by bigint,
        created_at timestamp with time zone DEFAULT now()
      );
    `);

    console.log('Creating alumni_registration_requests table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.alumni_registration_requests (
        id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        registration_code_id bigint NOT NULL,
        email text NOT NULL,
        otp_hash text NOT NULL,
        otp_expires_at timestamp with time zone NOT NULL,
        is_email_verified boolean DEFAULT false,
        is_completed boolean DEFAULT false,
        created_at timestamp with time zone DEFAULT now(),
        verified_at timestamp with time zone,
        CONSTRAINT fk_alumni_reg_code
          FOREIGN KEY (registration_code_id)
          REFERENCES public.alumni_registration_codes(id)
      );
    `);

    console.log('Altering alumni table...');
    const checkCols = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='alumni' AND column_name IN ('registration_code_id', 'institution_name', 'alumni_remark', 'is_verified');
    `);
    
    const existingCols = checkCols.rows.map(r => r.column_name);

    if (!existingCols.includes('registration_code_id')) {
      await client.query(`ALTER TABLE public.alumni ADD COLUMN registration_code_id bigint;`);
    }
    if (!existingCols.includes('institution_name')) {
      await client.query(`ALTER TABLE public.alumni ADD COLUMN institution_name text;`);
    }
    if (!existingCols.includes('alumni_remark')) {
      await client.query(`ALTER TABLE public.alumni ADD COLUMN alumni_remark text;`);
    }
    if (!existingCols.includes('is_verified')) {
      await client.query(`ALTER TABLE public.alumni ADD COLUMN is_verified boolean DEFAULT true;`);
    }

    try {
        await client.query(`
            ALTER TABLE public.alumni 
            ADD CONSTRAINT fk_alumni_reg_code 
            FOREIGN KEY (registration_code_id) 
            REFERENCES public.alumni_registration_codes(id);
        `);
    } catch (e) {
        if (e.code === '42710' || e.message.includes('already exists')) { 
            console.log('Constraint fk_alumni_reg_code already exists, skipping.');
        } else {
            throw e;
        }
    }

    await client.query('COMMIT');
    console.log('Alumni registration tables setup successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error setting up alumni registration tables:', error);
  } finally {
    client.release();
    pool.end();
  }
};

setupAlumniRegistration();
