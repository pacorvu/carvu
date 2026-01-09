const { pool } = require('../config/db');

const sql = `
create table if not exists public.user_otp_verification (
  id bigserial not null,
  identifier character varying(255) not null,
  otp_hash text not null,
  purpose character varying(30) null,
  expires_at timestamp without time zone not null,
  verified boolean null default false,
  attempts integer null default 0,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint user_otp_verification_pkey primary key (id),
  constraint user_otp_verification_purpose_check check (
    (
      (purpose)::text = any (
        (
          array[
            'REGISTRATION'::character varying,
            'PASSWORD_RESET'::character varying,
            'LOGIN'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

create table if not exists public.student_parent_details (
  id bigserial not null,
  usn text not null,
  parent_type text not null,
  name text not null,
  occupation text null,
  organisation text null,
  email text null,
  phone_country_code text null,
  phone_number text null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint student_parent_details_pkey primary key (id),
  constraint uq_student_parent unique (usn, parent_type),
  constraint student_parent_details_parent_type_check check (
    (
      parent_type = any (
        array['Father'::text, 'Mother'::text, 'Guardian'::text]
      )
    )
  )
) TABLESPACE pg_default;
`;

async function run() {
  try {
    console.log('Running migration...');
    await pool.query(sql);
    console.log('Migration successful');
    process.exit(0);
  } catch (e) {
    console.error('Migration failed:', e);
    process.exit(1);
  }
}

run();
