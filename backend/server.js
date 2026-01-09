require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const nodemailer = require('nodemailer');
const { pool, supabase } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const placementRoutes = require('./routes/placementRoutes');

const PORT = Number(process.env.PORT) || 3000;

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (origin.startsWith('http://localhost:')) return callback(null, true);
    const allowed = process.env.FRONTEND_URL;
    if (allowed && origin === allowed) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Logging middleware
app.use((req, res, next) => {
  const now = new Date().toISOString();
  const remote = req.ip || req.socket.remoteAddress;
  console.log(`[${now}] ${req.method} ${req.originalUrl} ${remote}`);
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/student', studentRoutes);
app.use('/placement', placementRoutes);

// Verify SMTP Connection
const verifySmtp = async () => {
  const smtpUser = process.env.SMTP_EMAIL;
  const smtpPass = process.env.SMTP_PASSWORD;
  if (!smtpUser || !smtpPass) {
    console.log('SMTP credentials missing. Skipping SMTP check.');
    return;
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: smtpUser, pass: smtpPass }
  });
  try {
    await transporter.verify();
    console.log('SMTP connection verified successfully.');
  } catch (error) {
    console.error('SMTP connection failed:', error.message);
  }
};
verifySmtp();

async function ensureUserLoginTrigger() {
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
    const rolesColsRes = await pool.query(
      "select column_name from information_schema.columns where table_schema='public' and table_name='roles'"
    );
    const rolesCols = rolesColsRes.rows.map(r => r.column_name);
    const idCol = rolesCols.includes('id') ? 'id' : (rolesCols.includes('role_id') ? 'role_id' : null);
    const nameCol = rolesCols.includes('name') ? 'name' : (rolesCols.includes('role_name') ? 'role_name' : (rolesCols.includes('role') ? 'role' : null));
    let studentRoleId = null;
    if (idCol && nameCol) {
      const r = await pool.query(`select ${idCol} as id from roles where ${nameCol}=$1 limit 1`, ['student']);
      studentRoleId = r.rows.length ? r.rows[0].id : null;
    }
    const hasUsn = cols.includes('usn');
    const hasRoleId = cols.includes('role_id') && studentRoleId !== null;
    const hasRole = cols.includes('role');
    const hasRoleName = cols.includes('role_name');
    const hasMail = cols.includes('mail');
    let isStudentExprParts = [];
    if (hasRoleId) isStudentExprParts.push(`NEW."role_id" = ${studentRoleId}`);
    if (hasRole) isStudentExprParts.push(`lower(NEW."role") = 'student'`);
    if (hasRoleName) isStudentExprParts.push(`lower(NEW."role_name") = 'student'`);
    const isStudentExpr = isStudentExprParts.length ? isStudentExprParts.join(' or ') : 'false';
    let fnSql = `create or replace function enforce_user_login_student_constraints() returns trigger as $$ begin `;
    if (hasUsn) fnSql += ` if NEW."usn" is not null then NEW."usn" := upper(trim(NEW."usn")); end if; `;
    if (hasMail) fnSql += ` if (${isStudentExpr}) and NEW."mail" is not null and lower(NEW."mail") !~ '@rvu\\.edu\\.in$' then raise exception 'Mail must end with @rvu.edu.in for students'; end if; `;
    if (hasUsn) fnSql += ` if (${isStudentExpr}) then perform 1 from students_personal_details where usn = NEW."usn"; if not found then raise exception 'USN not found in students_personal_details'; end if; end if; `;
    fnSql += ` return NEW; end; $$ language plpgsql;`;
    await pool.query(fnSql);
    await pool.query(`drop trigger if exists trg_${loginTable}_student_constraints on ${loginTable}`);
    await pool.query(`create trigger trg_${loginTable}_student_constraints before insert or update on ${loginTable} for each row execute function enforce_user_login_student_constraints()`);
  } catch (e) {
    console.error(`Failed to ensure user_login trigger: ${e.message}`);
  }
}

app.get('/audit-user-login', async (req, res) => {
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
    const hasUsn = cols.includes('usn');
    const hasRoleId = cols.includes('role_id');
    const hasRole = cols.includes('role');
    const hasRoleName = cols.includes('role_name');
    const hasRvuEmail = cols.includes('rvu_email');
    const hasEmail = cols.includes('email');
    const hasPersonalEmail = cols.includes('personal_email');
    const hasPersonalMail = cols.includes('personal_mail');
    const selectCols = ['id'];
    if (hasUsn) selectCols.push('usn');
    if (hasRoleId) selectCols.push('role_id');
    if (hasRole) selectCols.push('role');
    if (hasRoleName) selectCols.push('role_name');
    if (hasRvuEmail) selectCols.push('rvu_email');
    if (hasEmail) selectCols.push('email');
    if (hasPersonalEmail) selectCols.push('personal_email');
    if (hasPersonalMail) selectCols.push('personal_mail');
    const rowsRes = await pool.query(`select ${selectCols.map(c => `"${c}"`).join(', ')} from ${loginTable}`);
    const dupRvu = hasRvuEmail ? (await pool.query(`select lower(rvu_email) as e, count(*) from ${loginTable} where rvu_email is not null group by lower(rvu_email) having count(*) > 1`)).rows.map(r => r.e) : [];
    const dupEmail = hasEmail ? (await pool.query(`select lower(email) as e, count(*) from ${loginTable} where email is not null group by lower(email) having count(*) > 1`)).rows.map(r => r.e) : [];
    const dupPersonal = hasPersonalEmail ? (await pool.query(`select lower(personal_email) as e, count(*) from ${loginTable} where personal_email is not null group by lower(personal_email) having count(*) > 1`)).rows.map(r => r.e) : (hasPersonalMail ? (await pool.query(`select lower(personal_mail) as e, count(*) from ${loginTable} where personal_mail is not null group by lower(personal_mail) having count(*) > 1`)).rows.map(r => r.e) : []);
    let studentRoleId = null;
    const rolesColsRes = await pool.query("select column_name from information_schema.columns where table_schema='public' and table_name='roles'");
    const rolesCols = rolesColsRes.rows.map(r => r.column_name);
    const idCol = rolesCols.includes('id') ? 'id' : (rolesCols.includes('role_id') ? 'role_id' : null);
    const nameCol = rolesCols.includes('name') ? 'name' : (rolesCols.includes('role_name') ? 'role_name' : (rolesCols.includes('role') ? 'role' : null));
    if (idCol && nameCol) {
      const r = await pool.query(`select ${idCol} as id from roles where ${nameCol}=$1 limit 1`, ['student']);
      studentRoleId = r.rows.length ? r.rows[0].id : null;
    }
    const usnExists = async (u) => {
      if (!hasUsn || !u) return true;
      const q = await pool.query('select 1 from students_personal_details where usn=$1 limit 1', [u]);
      return !!q.rows.length;
    };
    const issues = [];
    for (const row of rowsRes.rows) {
      const roleName = (hasRole && row.role) ? row.role : ((hasRoleName && row.role_name) ? row.role_name : null);
      const isStudent = (hasRoleId && studentRoleId !== null && row.role_id === studentRoleId) || (roleName && String(roleName).toLowerCase() === 'student');
      const rv = hasRvuEmail ? (row.rvu_email || null) : (hasEmail ? (row.email || null) : null);
      const pe = hasPersonalEmail ? (row.personal_email || null) : (hasPersonalMail ? (row.personal_mail || null) : null);
      const rowIssues = [];
      if (isStudent) {
        if (rv && !String(rv).toLowerCase().endsWith('@rvu.edu.in')) rowIssues.push('Invalid RVU email domain');
        if (pe && !String(pe).toLowerCase().endsWith('@gmail.com')) rowIssues.push('Invalid personal email domain');
        if (!(await usnExists(row.usn || null))) rowIssues.push('USN missing in students_personal_details');
      }
      if (rv && (dupRvu.includes(String(rv).toLowerCase()) || dupEmail.includes(String(rv).toLowerCase()))) rowIssues.push('Duplicate RVU/email');
      if (pe && dupPersonal.includes(String(pe).toLowerCase())) rowIssues.push('Duplicate personal email');
      if (rowIssues.length) {
        issues.push({
          id: row.id,
          usn: row.usn || null,
          role: roleName || null,
          rvuEmail: rv || null,
          personalEmail: pe || null,
          issues: rowIssues
        });
      }
    }
    res.json({ issues });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/fix-user-login-data', async (req, res) => {
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
    const hasUsn = cols.includes('usn');
    const hasRoleId = cols.includes('role_id');
    const hasRole = cols.includes('role');
    const hasRoleName = cols.includes('role_name');
    const hasRvuEmail = cols.includes('rvu_email');
    const hasEmail = cols.includes('email');
    const hasPersonalEmail = cols.includes('personal_email');
    const hasPersonalMail = cols.includes('personal_mail');
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
    const selectCols = ['id'];
    if (hasUsn) selectCols.push('usn');
    if (hasRoleId) selectCols.push('role_id');
    if (hasRole) selectCols.push('role');
    if (hasRoleName) selectCols.push('role_name');
    if (hasRvuEmail) selectCols.push('rvu_email');
    if (hasEmail) selectCols.push('email');
    if (hasPersonalEmail) selectCols.push('personal_email');
    if (hasPersonalMail) selectCols.push('personal_mail');
    const rowsRes = await pool.query(`select ${selectCols.map(c => `"${c}"`).join(', ')} from ${loginTable}`);
    let updated = 0;
    let skipped = 0;
    for (const row of rowsRes.rows) {
      const roleName = (hasRole && row.role) ? row.role : ((hasRoleName && row.role_name) ? row.role_name : null);
      const isStudent = (hasRoleId && studentRoleId !== null && row.role_id === studentRoleId) || (roleName && String(roleName).toLowerCase() === 'student');
      const isAlumni = (hasRoleId && alumniRoleId !== null && row.role_id === alumniRoleId) || (roleName && String(roleName).toLowerCase() === 'alumni');
      const rvu = hasRvuEmail ? (row.rvu_email || null) : (hasEmail ? (row.email || null) : null);
      let personal = hasPersonalEmail ? (row.personal_email || null) : (hasPersonalMail ? (row.personal_mail || null) : null);
      const localFromRvu = rvu ? String(rvu).split('@')[0] : null;
      const localFromEmail = hasEmail && row.email ? String(row.email).split('@')[0] : null;
      const targetCol = hasPersonalEmail ? 'personal_email' : (hasPersonalMail ? 'personal_mail' : null);
      if (!targetCol) { skipped++; continue; }
      let newPersonal = null;
      if (isStudent) {
        if (personal && String(personal).toLowerCase().endsWith('@rvu.edu.in') && String(personal).toLowerCase().includes('personal')) {
          newPersonal = String(personal).replace(/@rvu\.edu\.in$/i, '@gmail.com');
        } else if (!personal) {
          const base = localFromRvu || localFromEmail;
          if (base) newPersonal = `${base}.personal@gmail.com`;
        } else if (!String(personal).toLowerCase().endsWith('@gmail.com')) {
          newPersonal = null;
        }
      } else if (isAlumni) {
        if (personal && String(personal).toLowerCase().endsWith('@rvu.edu.in') && String(personal).toLowerCase().includes('personal')) {
          newPersonal = String(personal).replace(/@rvu\.edu\.in$/i, '@gmail.com');
        } else if (!personal) {
          const base = localFromRvu || localFromEmail;
          if (base) newPersonal = `${base}.personal@gmail.com`;
        } else if (!String(personal).toLowerCase().endsWith('@gmail.com')) {
          newPersonal = null;
        }
      }
      if (newPersonal) {
        await pool.query(`update ${loginTable} set "${targetCol}"=$1 where id=$2`, [newPersonal, row.id]);
        updated++;
      } else {
        skipped++;
      }
    }
    res.json({ updated, skipped });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin/Dev endpoints (kept for utility)
app.get('/tables', async (req, res) => {
  try {
    const result = await pool.query(
      "select table_name from information_schema.tables where table_schema = 'public' order by table_name"
    );
    res.json(result.rows.map(r => r.table_name));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Seed logins endpoint (logic can be moved to a controller later)
const bcrypt = require('bcryptjs'); // Need this for seed-logins
app.get('/seed-logins', async (req, res) => {
  try {
    // Dynamic table detection logic (similar to authController)
    const loginTableRes = await pool.query(
      "select table_name from information_schema.tables where table_schema='public' and table_name in ('user_login','user_logins') order by table_name"
    );
    const loginTable = loginTableRes.rows.length ? loginTableRes.rows[0].table_name : 'user_login';
    
    const colsLoginRes = await pool.query(
      "select column_name from information_schema.columns where table_schema='public' and table_name=$1",
      [loginTable]
    );
    const loginCols = colsLoginRes.rows.map(r => r.column_name);
    
    const colsRolesRes = await pool.query(
      "select column_name from information_schema.columns where table_schema='public' and table_name='roles'"
    );
    const rolesCols = colsRolesRes.rows.map(r => r.column_name);
    
    const idCol = rolesCols.includes('id') ? 'id' : (rolesCols.includes('role_id') ? 'role_id' : null);
    const nameCol = rolesCols.includes('name') ? 'name' : (rolesCols.includes('role_name') ? 'role_name' : (rolesCols.includes('role') ? 'role' : null));
    
    if (!idCol || !nameCol) {
      res.status(500).json({ error: 'Unable to identify roles id/name columns' });
      return;
    }
    
    const rolesRes = await pool.query(`select ${idCol} as id, ${nameCol} as name from roles`);
    
    const roleIdColInLogin = loginCols.includes('role_id') ? 'role_id' : null;
    const roleNameColInLogin = loginCols.includes('role') ? 'role' : (loginCols.includes('role_name') ? 'role_name' : null);
    const emailCol = loginCols.includes('rvu_email') ? 'rvu_email' : (loginCols.includes('email') ? 'email' : null);
    const personalEmailCol = loginCols.includes('personal_email') ? 'personal_email' : (loginCols.includes('personal_mail') ? 'personal_mail' : null);
    const passwordHashCol = loginCols.includes('password_hash') ? 'password_hash' : null;
    const passwordCol = loginCols.includes('password') ? 'password' : null;
    const isActiveCol = loginCols.includes('is_active') ? 'is_active' : null;
    const createdAtCol = loginCols.includes('created_at') ? 'created_at' : null;
    const updatedAtCol = loginCols.includes('updated_at') ? 'updated_at' : null;
    
    const createdRows = [];
    
    for (const r of rolesRes.rows) {
      const base = r.name.replace(/\s+/g, '_').toLowerCase();
      const officialEmail = emailCol ? `${base}@rvu.edu.in` : null;
      const personalEmail = personalEmailCol ? `${base}.personal@rvu.edu.in` : null;
      const hashed = passwordHashCol ? await bcrypt.hash('1234', 10) : null;
      
      const whereChecks = [];
      const paramsChecks = [];
      
      if (roleIdColInLogin) {
        whereChecks.push(`"${roleIdColInLogin}" = $${paramsChecks.length + 1}`);
        paramsChecks.push(r.id);
      } else if (roleNameColInLogin) {
        whereChecks.push(`"${roleNameColInLogin}" = $${paramsChecks.length + 1}`);
        paramsChecks.push(r.name);
      } else if (emailCol && officialEmail) {
        whereChecks.push(`"${emailCol}" = $${paramsChecks.length + 1}`);
        paramsChecks.push(officialEmail);
      }
      
      const existsRes = whereChecks.length
        ? await pool.query(`select 1 from ${loginTable} where ${whereChecks.join(' and ')} limit 1`, paramsChecks)
        : { rows: [] };
      
      if (existsRes.rows.length) continue;
      
      const insertCols = [];
      const insertParams = [];
      const placeholders = [];
      
      if (roleIdColInLogin) { insertCols.push(roleIdColInLogin); insertParams.push(r.id); }
      if (roleNameColInLogin) { insertCols.push(roleNameColInLogin); insertParams.push(r.name); }
      if (emailCol && officialEmail) { insertCols.push(emailCol); insertParams.push(officialEmail); }
      if (personalEmailCol && personalEmail) { insertCols.push(personalEmailCol); insertParams.push(personalEmail); }
      if (passwordHashCol && hashed) { insertCols.push(passwordHashCol); insertParams.push(hashed); }
      else if (passwordCol) { insertCols.push(passwordCol); insertParams.push('1234'); }
      if (isActiveCol) { insertCols.push(isActiveCol); insertParams.push(true); }
      if (createdAtCol) { insertCols.push(createdAtCol); insertParams.push(new Date().toISOString()); }
      if (updatedAtCol) { insertCols.push(updatedAtCol); insertParams.push(new Date().toISOString()); }
      
      for (let i = 0; i < insertParams.length; i++) placeholders.push(`$${i + 1}`);
      
      const sql = `insert into ${loginTable} (${insertCols.map(c => `"${c}"`).join(', ')}) values (${placeholders.join(', ')})`;
      await pool.query(sql, insertParams);
      createdRows.push({ role: r.name, email: officialEmail, personal_email: personalEmail });
    }
    
    res.json({ created: createdRows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/buckets', async (req, res) => {
  const { data, error } = await supabase.storage.listBuckets();
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json(data.map(b => b.name));
});

app.get('/', (req, res) => {
  res.type('text').send('OK');
});

app.listen(PORT, () => {
  const url = `http://localhost:${PORT}/`;
  console.log(`Server listening at ${url}`);
  
  (async () => {
    try {
      try {
        await pool.query('select 1');
        console.log('Database connected');
      } catch (e) {
        console.error(`Database connection failed: ${e.message}`);
      }
      try {
        const host = String(process.env.SMTP_HOST || 'smtp.gmail.com').trim();
        const port = Number(process.env.SMTP_PORT || 587);
        const user = String(process.env.SMTP_EMAIL || '').trim();
        const pass = String(process.env.SMTP_PASSWORD || '').trim();
        const doVerify = String(process.env.ENABLE_SMTP_VERIFY || '').toLowerCase() === 'true';
        if (!user || !pass || !doVerify) {
          console.log('SMTP verify skipped');
        } else {
          const transporter = nodemailer.createTransport({
            host,
            port,
            secure: false,
            auth: { user, pass },
          });
          await transporter.verify();
          console.log('SMTP connection established');
        }
      } catch (e) {
        const msg = e && e.message ? e.message : String(e);
        if (/535.*5\.7\.8/i.test(msg)) {
          console.error('SMTP login rejected: use Gmail App Password with 2-Step Verification; ensure from address matches account');
        } else {
          console.error(`SMTP connection failed: ${msg}`);
        }
      }
      try {
        const { data, error } = await supabase.storage.listBuckets();
        if (error) {
          console.error(`Storage connection failed: ${error.message}`);
        } else {
          const names = (data || []).map(b => b.name);
          if (names.length) {
            console.log(`Storage connected: buckets ${names.join(', ')}`);
          } else {
            console.log('Storage connected: no buckets');
          }
        }
      } catch (e) {
        console.error(`Storage connection failed: ${e.message}`);
      }
      await ensureUserLoginTrigger();
    } catch (e) {
      console.error(`Startup initialization failed: ${e.message}`);
    }
  })();
});
