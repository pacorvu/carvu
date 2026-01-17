const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const nodemailer = require('nodemailer');

function sha256(s) { return crypto.createHash('sha256').update(s).digest('hex'); }
function uuid() { return crypto.randomUUID(); }

let loginTableCache = null;
async function getLoginTable() {
  if (loginTableCache) return loginTableCache;
  try {
    const check = await pool.query(
      "select table_name from information_schema.tables where table_schema='public' and table_name in ('user_login','user_logins') order by table_name"
    );
    loginTableCache = check.rows.length ? check.rows[0].table_name : 'user_login';
  } catch {
    loginTableCache = 'user_login';
  }
  console.log(`Auth using login table: ${loginTableCache}`);
  return loginTableCache;
}

let studentEmailColCache = undefined;
async function getStudentEmailColumn() {
  if (studentEmailColCache !== undefined) return studentEmailColCache;
  try {
    const colsRes = await pool.query(
      "select column_name from information_schema.columns where table_schema='public' and table_name='students_personal_details'"
    );
    const cols = new Set(colsRes.rows.map(r => r.column_name));
    for (const c of ['rvu_email', 'college_email', 'email', 'mail']) {
      if (cols.has(c)) {
        studentEmailColCache = c;
        return c;
      }
    }
    studentEmailColCache = null;
    return null;
  } catch {
    studentEmailColCache = null;
    return null;
  }
}

async function ensureAuthTables() {
  try {
    const fkCheck = await pool.query(
      "select table_name from information_schema.tables where table_schema='public' and table_name in ('user_logins','user_login') order by table_name"
    );
    const fkTable = fkCheck.rows.length ? fkCheck.rows[0].table_name : 'user_login';
    await pool.query(`
      create table if not exists public.auth_refresh_tokens (
        id uuid not null default gen_random_uuid(),
        user_login_id bigint not null,
        token_hash text not null,
        jti uuid not null,
        expires_at timestamp with time zone not null,
        revoked_at timestamp with time zone null,
        replaced_by uuid null,
        user_agent text null,
        ip text null,
        created_at timestamp with time zone not null default now(),
        constraint auth_refresh_tokens_pkey primary key (id),
        constraint unique_user_jti unique (user_login_id, jti),
        constraint auth_refresh_tokens_user_login_id_fkey foreign key (user_login_id) references public.${fkTable} (id) on delete cascade
      )
    `);
    await pool.query(`create index if not exists idx_auth_refresh_tokens_user_login_id on public.auth_refresh_tokens using btree (user_login_id)`);
    await pool.query(`create index if not exists idx_auth_refresh_tokens_token_hash on public.auth_refresh_tokens using btree (token_hash)`);

    try {
      await pool.query(`alter table public.auth_refresh_tokens add constraint unique_user_jti unique (user_login_id, jti)`);
    } catch {}
    try {
      await pool.query(`alter table public.auth_refresh_tokens add constraint auth_refresh_tokens_user_login_id_fkey foreign key (user_login_id) references public.${fkTable} (id) on delete cascade`);
    } catch {}
  } catch (e) {
    console.error(`Failed to ensure auth tables: ${e.message}`);
  }
}

async function findUserByEmail(email) {
  try {
    const loginTable = await getLoginTable();
    const colsRes = await pool.query(
      "select column_name from information_schema.columns where table_schema='public' and table_name=$1",
      [loginTable]
    );
    const cols = colsRes.rows.map(r => r.column_name);
    const checks = [];
    const params = [];
    for (const c of ['mail','email','rvu_email','personal_email','personal_mail']) {
      if (cols.includes(c)) {
        checks.push(`"${c}" = $${params.length + 1}`);
        params.push(email);
      }
    }
    const where = checks.length ? checks.join(' or ') : 'false';
    const res = await pool.query(
      `select ul.*, r.name as role_name 
       from ${loginTable} ul 
       left join roles r on r.id = ul.role_id 
       where ${where} 
       limit 1`, 
      params
    );
    return res.rows[0] || null;
  } catch (e) {
    return null;
  }
}

function signAccess(user) {
  const payload = { sub: String(user.id), role_id: user.role_id, role_name: user.role || user.role_name, token_version: user.token_version || 0, usn: user.usn };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m' });
}

function newRefresh() {
  const raw = crypto.randomBytes(64).toString('base64url');
  return { raw, jti: uuid(), hash: sha256(raw) };
}

function parseTtl(s) {
  const m = /^(\d+)([smhd])$/.exec(s);
  if (!m) return 30 * 24 * 60 * 60 * 1000;
  const n = Number(m[1]); const u = m[2];
  if (u === 's') return n * 1000;
  if (u === 'm') return n * 60 * 1000;
  if (u === 'h') return n * 60 * 60 * 1000;
  return n * 24 * 60 * 60 * 1000;
}

function refreshCookieOptions() {
  const sameSiteRaw = String(process.env.COOKIE_SAMESITE || 'lax').toLowerCase().trim();
  const sameSite = (sameSiteRaw === 'none' || sameSiteRaw === 'lax' || sameSiteRaw === 'strict') ? sameSiteRaw : 'lax';
  const secureRaw = String(process.env.COOKIE_SECURE || '').toLowerCase().trim();
  const secure = secureRaw === 'true' || process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    sameSite,
    secure,
    path: '/',
  };
}

function setRefreshCookie(res, raw, expiresAt) {
  const opts = refreshCookieOptions();
  if (expiresAt) opts.expires = expiresAt;
  res.cookie('refresh_token', raw, opts);
}

function clearRefreshCookie(res) {
  res.clearCookie('refresh_token', refreshCookieOptions());
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'invalid credentials' });
    const roleName = user.role || user.role_name;
    const provided = String(email).toLowerCase();
    const mailId = (user.mail || user.email || '').toLowerCase();
    if (roleName === 'student') {
      if (!mailId || provided !== mailId || !provided.endsWith('@rvu.edu.in')) {
        return res.status(401).json({ error: 'Use RVU email (@rvu.edu.in) to login' });
      }
    } else if (roleName === 'alumni') {
      // Alumni can login with any email; no domain restriction
    }
    let ok = false;
    if (user.password_hash) ok = await bcrypt.compare(password, user.password_hash);
    else if (user.password) ok = password === user.password;
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });
    const access = signAccess(user);
    const r = newRefresh();
    const expDate = new Date(Date.now() + (parseTtl(process.env.JWT_REFRESH_EXPIRE || '30d')));
    await pool.query(
      'insert into auth_refresh_tokens (user_login_id, token_hash, jti, expires_at, user_agent, ip) values ($1,$2,$3,$4,$5,$6)',
      [user.id, r.hash, r.jti, expDate.toISOString(), req.headers['user-agent'] || null, req.ip || null]
    );
    setRefreshCookie(res, r.raw, expDate);
    res.json({ access, user: { email: user.mail || user.email, role_id: user.role_id, usn: user.usn } });
  } catch (e) {
    console.error(`Login error: ${e.message}`);
    res.status(500).json({ error: e.message });
  }
};

const refresh = async (req, res) => {
  const client = await pool.connect();
  try {
    const raw = req.cookies?.refresh_token;
    if (!raw) return res.status(401).json({ error: 'no refresh' });

    const hash = sha256(raw);
    const loginTable = await getLoginTable();

    await client.query('begin');
    const q = await client.query(
      `select art.id as refresh_token_id, art.user_login_id, ul.*, r.name as role_name
       from auth_refresh_tokens art 
       join ${loginTable} ul on ul.id=art.user_login_id 
       left join roles r on r.id = ul.role_id
       where art.token_hash=$1 and art.revoked_at is null and art.expires_at > now() 
       limit 1
       for update`,
      [hash]
    );
    if (!q.rows.length) {
      await client.query('rollback');
      clearRefreshCookie(res);
      return res.status(401).json({ error: 'invalid refresh' });
    }

    const row = q.rows[0];
    const access = signAccess(row);

    const r = newRefresh();
    const newId = uuid();
    const expDate = new Date(Date.now() + (parseTtl(process.env.JWT_REFRESH_EXPIRE || '30d')));

    const upd = await client.query(
      'update auth_refresh_tokens set revoked_at=now(), replaced_by=$1 where id=$2 and revoked_at is null',
      [newId, row.refresh_token_id]
    );
    if (upd.rowCount !== 1) {
      await client.query('rollback');
      clearRefreshCookie(res);
      return res.status(401).json({ error: 'invalid refresh' });
    }

    await client.query(
      'insert into auth_refresh_tokens (id, user_login_id, token_hash, jti, expires_at, user_agent, ip) values ($1,$2,$3,$4,$5,$6,$7)',
      [newId, row.user_login_id, r.hash, r.jti, expDate.toISOString(), req.headers['user-agent'] || null, req.ip || null]
    );
    await client.query('commit');

    setRefreshCookie(res, r.raw, expDate);
    res.json({ access });
  } catch (e) {
    try { await client.query('rollback'); } catch {}
    console.error(`Refresh error: ${e.message}`);
    clearRefreshCookie(res);
    res.status(401).json({ error: 'refresh failed' });
  } finally {
    client.release();
  }
};

const logout = async (req, res) => {
  const raw = req.cookies?.refresh_token;
  if (raw) {
    const hash = sha256(raw);
    await pool.query('update auth_refresh_tokens set revoked_at=now() where token_hash=$1', [hash]);
  }
  clearRefreshCookie(res);
  res.json({ ok: true });
};

const sendRegistrationOtp = async (req, res) => {
  try {
    let { usn, email } = req.body || {};
    usn = String(usn || '').toUpperCase();
    email = String(email || '').toLowerCase();
    if (!usn || !email) return res.status(400).json({ error: 'USN and email required' });
    if (!email.endsWith('@rvu.edu.in')) return res.status(400).json({ error: 'Email must end with @rvu.edu.in' });
    
    // Verify USN exists in student records
    const pr = await pool.query('select usn from students_personal_details where usn=$1 limit 1', [usn]);
    if (!pr.rows.length) return res.status(404).json({ error: 'USN not found' });
    
    // Check if already registered
    const loginTable = await getLoginTable();
    const existingUser = await pool.query(`select id from ${loginTable} where usn=$1`, [usn]);
    if (existingUser.rows.length) return res.status(400).json({ error: 'Student already registered' });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const ttlMin = Number(process.env.OTP_TTL_MINUTES || 10);

    // Insert into user_otp_verification
    await pool.query(
      `insert into user_otp_verification (identifier, otp_hash, purpose, expires_at)
       values ($1, $2, 'REGISTRATION', (now()::timestamp + make_interval(mins => $3)))`,
      [email, otp, ttlMin]
    );

    const smtpUser = String(process.env.SMTP_EMAIL || '').toLowerCase().trim();
    const smtpPass = String(process.env.SMTP_PASSWORD || '').trim();
    const host = String(process.env.SMTP_HOST || 'smtp.gmail.com').trim();
    const port = Number(process.env.SMTP_PORT || 587);
    
    if (!smtpUser || !smtpPass) {
        // Fallback for dev if no SMTP - verify via logs
        console.log(`[DEV] OTP for ${email}: ${otp}`);
        return res.json({ ok: true, dev: true });
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: false,
      auth: { user: smtpUser, pass: smtpPass }
    });
    
    await transporter.sendMail({
      from: smtpUser,
      to: email,
      subject: 'RVU Registration OTP',
      text: `Your OTP is ${otp}. It expires in ${ttlMin} minutes.`,
      html: `<p>Your OTP is <strong>${otp}</strong>. It expires in ${ttlMin} minutes.</p>`
    });
    
    return res.json({ ok: true });
  } catch (e) {
    console.error('Send OTP Error:', e);
    res.status(500).json({ error: e.message });
  }
};

const verifyRegistrationOtp = async (req, res) => {
  try {
    let { usn, email, otp } = req.body || {};
    email = String(email || '').toLowerCase();
    otp = String(otp || '').trim();
    
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP required' });

    const q = await pool.query(
      `select id, otp_hash, expires_at, (expires_at <= now()::timestamp) as expired
       from user_otp_verification
       where identifier=$1 and purpose='REGISTRATION' and verified=false
       order by created_at desc
       limit 1`,
      [email]
    );
    
    if (!q.rows.length) return res.status(400).json({ error: 'No pending OTP found' });
    const row = q.rows[0];
    
    if (row.expired) return res.status(400).json({ error: 'OTP expired' });
    if (row.otp_hash !== otp) return res.status(400).json({ error: 'Invalid OTP' });
    
    await pool.query('update user_otp_verification set verified=true where id=$1', [row.id]);
    
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const sendPersonalOtp = async (req, res) => {
  try {
    let { email } = req.body || {};
    email = String(email || '').toLowerCase();
    
    if (!email) return res.status(400).json({ error: 'Email required' });
    
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const ttlMin = Number(process.env.OTP_TTL_MINUTES || 10);

    await pool.query(
      `insert into user_otp_verification (identifier, otp_hash, purpose, expires_at)
       values ($1, $2, 'REGISTRATION', (now()::timestamp + make_interval(mins => $3)))`,
      [email, otp, ttlMin]
    );

    const smtpUser = String(process.env.SMTP_EMAIL || '').toLowerCase().trim();
    const smtpPass = String(process.env.SMTP_PASSWORD || '').trim();
    const host = String(process.env.SMTP_HOST || 'smtp.gmail.com').trim();
    const port = Number(process.env.SMTP_PORT || 587);

    if (!smtpUser || !smtpPass) {
         console.log(`[DEV] Personal OTP for ${email}: ${otp}`);
         return res.json({ ok: true, dev: true });
    }

    const transporter = nodemailer.createTransport({
      host, port, secure: false, auth: { user: smtpUser, pass: smtpPass }
    });

    await transporter.sendMail({
      from: smtpUser,
      to: email,
      subject: 'RVU Personal Email Verification',
      text: `Your Verification Code is ${otp}.`,
      html: `<p>Your Verification Code is <strong>${otp}</strong>.</p>`
    });

    res.json({ ok: true });
  } catch (e) {
    console.error('Send Personal OTP Error:', e);
    res.status(500).json({ error: e.message });
  }
};

const verifyUsn = async (req, res) => {
  try {
    let { usn } = req.body;
    if (!usn) return res.status(400).json({ error: 'USN required' });
    usn = String(usn).toUpperCase();

    const studentRes = await pool.query(
      'select usn, college_email, full_name from students_personal_details where usn=$1',
      [usn]
    );

    if (!studentRes.rows.length) {
      return res.status(404).json({ error: 'USN not found in records' });
    }

    const student = studentRes.rows[0];

    // Check if already registered
    const loginTable = await getLoginTable();
    const loginRes = await pool.query(
      `select id from ${loginTable} where usn=$1`,
      [usn]
    );

    if (loginRes.rows.length > 0) {
      return res.status(400).json({ error: 'Student already registered' });
    }

    res.json({ 
      ok: true, 
      data: {
        usn: student.usn,
        email: student.college_email,
        name: student.full_name
      }
    });
  } catch (e) {
    console.error('Verify USN Error:', e);
    res.status(500).json({ error: e.message });
  }
};

const verifyPersonalOtp = async (req, res) => {
  try {
    let { email, otp } = req.body || {};
    email = String(email || '').toLowerCase();
    otp = String(otp || '').trim();

    const q = await pool.query(
      `select id, otp_hash, expires_at, (expires_at <= now()::timestamp) as expired
       from user_otp_verification
       where identifier=$1 and purpose='REGISTRATION' and verified=false
       order by created_at desc
       limit 1`,
      [email]
    );

    if (!q.rows.length) return res.status(400).json({ error: 'No pending OTP found' });
    const row = q.rows[0];

    if (row.expired) return res.status(400).json({ error: 'OTP expired' });
    if (row.otp_hash !== otp) return res.status(400).json({ error: 'Invalid OTP' });

    await pool.query('update user_otp_verification set verified=true where id=$1', [row.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const registerStudent = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    let { 
      usn, rvuEmail, password,
      personalEmail, phone, dob, gender,
      parents // Array of { type, name, occupation, organization, email, phone }
    } = req.body;

    usn = String(usn).toUpperCase();
    rvuEmail = String(rvuEmail).toLowerCase();
    
    // 1. Verify Registration OTP was verified (Security check)
    const otpCheck = await client.query(
      `select verified from user_otp_verification where identifier=$1 and purpose='REGISTRATION' order by created_at desc limit 1`,
      [rvuEmail]
    );
    if (!otpCheck.rows.length || !otpCheck.rows[0].verified) {
       throw new Error('RVU Email OTP not verified');
    }
    
    // 2. Verify Personal Email OTP was verified
    if (personalEmail) {
        const pOtpCheck = await client.query(
          `select verified from user_otp_verification where identifier=$1 and purpose='REGISTRATION' order by created_at desc limit 1`,
          [personalEmail]
        );
        if (!pOtpCheck.rows.length || !pOtpCheck.rows[0].verified) {
           throw new Error('Personal Email OTP not verified');
        }
    }

    const normalizedGender = (() => {
      const g = String(gender || '').trim();
      if (!g) return null;
      const up = g.toUpperCase();
      if (up === 'MALE' || up === 'FEMALE') return up;
      if (g === 'Other' || up === 'OTHER') return 'Other';
      return null;
    })();

    // 3. Update Personal Details
    await client.query(
      `update students_personal_details set 
       personal_email=$1,
       phone_number=$2,
       date_of_birth=$3,
       gender=$4
       where usn=$5`,
      [personalEmail || null, phone || null, dob || null, normalizedGender, usn]
    );

    // 4. Insert Parent Details
    if (Array.isArray(parents)) {
      for (const p of parents) {
        const parentType = String(p?.type || p?.parent_type || '').trim();
        const parentName = String(p?.name || '').trim();
        if (!parentType || !parentName) continue;
        if (!['Father', 'Mother', 'Guardian'].includes(parentType)) continue;

        await client.query(
          `insert into student_parent_details (usn, parent_type, name, occupation, organisation, email, phone_country_code, phone_number)
           values ($1, $2, $3, $4, $5, $6, $7, $8)
           on conflict (usn, parent_type) do update set
           name=excluded.name, occupation=excluded.occupation, organisation=excluded.organisation,
           email=excluded.email, phone_country_code=excluded.phone_country_code, phone_number=excluded.phone_number, updated_at=now()`,
          [usn, parentType, parentName, p.occupation || null, p.organization || p.organisation || null, p.email || null, p.phoneCountryCode || p.phone_country_code || null, p.phone || p.phone_number || null]
        );
      }
    }

    // 5. Create User Login
    const loginTable = await getLoginTable();
    const roleRes = await client.query("select id from roles where name='student'");
    const roleId = roleRes.rows[0]?.id;
    const passwordHash = await bcrypt.hash(password, 10);
    
    const userRes = await client.query(
      `insert into ${loginTable} (usn, mail, role_id, password_hash, is_active)
       values ($1, $2, $3, $4, true)
       returning id`,
      [usn, rvuEmail, roleId, passwordHash]
    );
    const userId = userRes.rows[0].id;

    await client.query('COMMIT');
    
    // Auto Login
    const tokenPayload = { sub: String(userId), role_id: roleId, role_name: 'student', usn };
    const access = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'dev-fallback-secret', { expiresIn: '1d' });
    const r = newRefresh();
    const exp = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    await pool.query(
      'insert into auth_refresh_tokens (user_login_id, token_hash, jti, expires_at, user_agent, ip) values ($1,$2,$3,$4,$5,$6)',
      [userId, r.hash, r.jti, exp, req.headers['user-agent'], req.ip]
    );
    setRefreshCookie(res, r.raw);
    
    res.json({ ok: true, access, user: { usn, email: rvuEmail, role_id: roleId } });

  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Registration Error:', e);
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
};

module.exports = {
  login,
  refresh,
  logout,
  verifyUsn,
  getLoginTable,
  registerStudent,
  sendRegistrationOtp,
  verifyRegistrationOtp,
  sendPersonalOtp,
  verifyPersonalOtp
};
