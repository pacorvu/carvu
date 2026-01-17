const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  try {
    const loginTableRes = await pool.query(
      "select table_name from information_schema.tables where table_schema='public' and table_name in ('user_login','user_logins') order by table_name"
    );
    const loginTable = loginTableRes.rows.length ? loginTableRes.rows[0].table_name : 'user_login';
    const colsRes = await pool.query(
      "select column_name from information_schema.columns where table_schema='public' and table_name=$1",
      [loginTable]
    );
    const cols = colsRes.rows.map(r => r.column_name);
    if (!cols.includes('otp_code')) {
      await pool.query(`alter table ${loginTable} add column otp_code text`);
    }
    if (!cols.includes('otp_expires_at')) {
      await pool.query(`alter table ${loginTable} add column otp_expires_at timestamptz`);
    }
    if (!cols.includes('otp_verified')) {
      await pool.query(`alter table ${loginTable} add column otp_verified boolean default false`);
      await pool.query(`update ${loginTable} set otp_verified=false where otp_verified is null`);
    }
    const hasMail = cols.includes('mail');
    const hasMailId = cols.includes('mail_id');
    if (!hasMail) {
      await pool.query(`alter table ${loginTable} add column mail text`);
      await pool.query(`create unique index if not exists idx_${loginTable}_mail_unique on ${loginTable}(lower(mail)) where mail is not null`);
    } else {
      // Ensure unique index exists for mail
      await pool.query(`create unique index if not exists idx_${loginTable}_mail_unique on ${loginTable}(lower(mail)) where mail is not null`);
    }
    const rolesColsRes = await pool.query("select column_name from information_schema.columns where table_schema='public' and table_name='roles'");
    const rolesCols = rolesColsRes.rows.map(r => r.column_name);
    const idCol = rolesCols.includes('id') ? 'id' : (rolesCols.includes('role_id') ? 'role_id' : null);
    const nameCol = rolesCols.includes('name') ? 'name' : (rolesCols.includes('role_name') ? 'role_name' : (rolesCols.includes('role') ? 'role' : null));
    let studentRoleId = null;
    let alumniRoleId = null;
    if (idCol && nameCol) {
      const s = await pool.query(`select ${idCol} as id from roles where ${nameCol}=$1 limit 1`, ['student']);
      const a = await pool.query(`select ${idCol} as id from roles where ${nameCol}=$1 limit 1`, ['alumni']);
      studentRoleId = s.rows.length ? s.rows[0].id : null;
      alumniRoleId = a.rows.length ? a.rows[0].id : null;
    }
    const selectCols = ['id','mail'];
    if (cols.includes('usn')) selectCols.push('usn');
    if (cols.includes('role_id')) selectCols.push('role_id');
    if (cols.includes('role')) selectCols.push('role');
    if (cols.includes('role_name')) selectCols.push('role_name');
    if (cols.includes('rvu_email')) selectCols.push('rvu_email');
    if (cols.includes('personal_email')) selectCols.push('personal_email');
    if (cols.includes('personal_mail')) selectCols.push('personal_mail');
    const rowsRes = await pool.query(`select ${selectCols.map(c => `"${c}"`).join(', ')} from ${loginTable}`);
    let updated = 0;
    for (const row of rowsRes.rows) {
      const roleName = row.role || row.role_name || null;
      const isStudent = (row.role_id && studentRoleId !== null && row.role_id === studentRoleId) || (roleName && String(roleName).toLowerCase() === 'student');
      const isAlumni = (row.role_id && alumniRoleId !== null && row.role_id === alumniRoleId) || (roleName && String(roleName).toLowerCase() === 'alumni');
      const email = row.mail || null;
      const rvu = row.rvu_email || null;
      const personal = row.personal_email || row.personal_mail || null;
      let newEmail = email;
      const baseFromUsn = row.usn ? String(row.usn).toLowerCase() : null;
      const baseFromAny = (rvu || personal || email) ? String(rvu || personal || email).split('@')[0] : null;
      const base = baseFromUsn || baseFromAny;
      if (isStudent) {
        if (!email || !String(email).toLowerCase().endsWith('@rvu.edu.in')) {
          if (rvu && String(rvu).toLowerCase().endsWith('@rvu.edu.in')) {
            newEmail = rvu;
          } else if (base) {
            newEmail = `${base}@rvu.edu.in`;
          }
        }
      } else {
        if (!email) {
          newEmail = personal || rvu || email || null;
        }
      }
      if (newEmail && newEmail !== email) {
        await pool.query(`update ${loginTable} set mail=$1, updated_at=now() where id=$2`, [newEmail, row.id]);
        updated++;
      }
    }
    // Create/replace trigger to enforce student email domain
    const rolesInfo = nameCol && idCol ? await pool.query(`select ${idCol} as id from roles where ${nameCol}='student' limit 1`) : { rows: [] };
    const sId = rolesInfo.rows.length ? rolesInfo.rows[0].id : null;
    let fnSql = `create or replace function enforce_user_login_student_constraints() returns trigger as $$ begin `;
    if (cols.includes('usn')) fnSql += ` if NEW."usn" is not null then NEW."usn" := upper(trim(NEW."usn")); end if; `;
    if (sId !== null && (cols.includes('mail') || !hasMail && hasMailId)) {
      const roleCheck = cols.includes('role_id') ? `NEW."role_id" = ${sId}` : (cols.includes('role') ? `lower(NEW."role") = 'student'` : (cols.includes('role_name') ? `lower(NEW."role_name")='student'` : 'false'));
      fnSql += ` if (${roleCheck}) and NEW."mail" is not null and lower(NEW."mail") !~ '@rvu\\.edu\\.in$' then raise exception 'Student email must end with @rvu.edu.in'; end if; `;
    }
    fnSql += ` return NEW; end; $$ language plpgsql;`;
    await pool.query(fnSql);
    await pool.query(`drop trigger if exists trg_${loginTable}_student_constraints on ${loginTable}`);
    await pool.query(`create trigger trg_${loginTable}_student_constraints before insert or update on ${loginTable} for each row execute function enforce_user_login_student_constraints()`);
    // Create/replace trigger to validate USN foreign key presence
    const fnUsn = `
      create or replace function validate_student_usn() returns trigger as $$
      begin
        if NEW."usn" is not null then
          perform 1 from students_personal_details where usn = NEW."usn";
          if not found then
            raise exception 'USN not found in students_personal_details';
          end if;
        end if;
        return NEW;
      end;
      $$ language plpgsql;
    `;
    await pool.query(fnUsn);
    await pool.query(`drop trigger if exists trg_validate_student_usn on ${loginTable}`);
    await pool.query(`create trigger trg_validate_student_usn before insert or update on ${loginTable} for each row execute function validate_student_usn()`);
    // Ensure foreign key constraint on usn -> students_personal_details(usn)
    try {
      const fkName = `fk_${loginTable}_usn_students`;
      await pool.query(`alter table ${loginTable} drop constraint if exists ${fkName}`);
      await pool.query(`alter table ${loginTable} add constraint ${fkName} foreign key (usn) references students_personal_details(usn) on update cascade on delete cascade`);
    } catch {}
    // Drop legacy columns if present
    if (cols.includes('rvu_email')) {
      try { await pool.query(`alter table ${loginTable} drop column rvu_email`); } catch {}
    }
    if (cols.includes('personal_email')) {
      try { await pool.query(`alter table ${loginTable} drop column personal_email`); } catch {}
    }
    if (cols.includes('email')) {
      try { await pool.query(`alter table ${loginTable} drop column email`); } catch {}
    }
    if (hasMailId) {
      try { await pool.query(`alter table ${loginTable} drop column mail_id`); } catch {}
    }
    console.log(JSON.stringify({ updated }));
  } catch (e) {
    console.error(e.message);
  } finally {
    await pool.end();
  }
}

run();
