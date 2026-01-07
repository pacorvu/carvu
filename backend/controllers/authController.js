const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

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

async function ensureAuthTables() {
  try {
    const fkCheck = await pool.query(
      "select table_name from information_schema.tables where table_schema='public' and table_name in ('user_logins','user_login') order by table_name"
    );
    const fkTable = fkCheck.rows.length ? fkCheck.rows[0].table_name : 'user_login';
    const fkSql = `
      create table if not exists auth_refresh_tokens (
        id uuid primary key default gen_random_uuid(),
        user_login_id bigint not null references ${fkTable}(id) on delete cascade,
        token_hash text not null,
        jti uuid not null,
        expires_at timestamptz not null,
        revoked_at timestamptz,
        replaced_by uuid,
        user_agent text,
        ip text,
        created_at timestamptz not null default now()
      )`;
    await pool.query(`
      ${fkSql}
    `);
    await pool.query(`create index if not exists idx_auth_refresh_tokens_user_login_id on auth_refresh_tokens(user_login_id)`);
    await pool.query(`create index if not exists idx_auth_refresh_tokens_token_hash on auth_refresh_tokens(token_hash)`);
  } catch (e) {
    try {
      await pool.query(`create table if not exists auth_refresh_tokens (id uuid primary key, user_login_id bigint not null, token_hash text not null, jti uuid not null, expires_at timestamptz not null, revoked_at timestamptz, replaced_by uuid, user_agent text, ip text, created_at timestamptz not null default now())`);
      await pool.query(`create index if not exists idx_auth_refresh_tokens_user_login_id on auth_refresh_tokens(user_login_id)`);
      await pool.query(`create index if not exists idx_auth_refresh_tokens_token_hash on auth_refresh_tokens(token_hash)`);
    } catch (e2) {
      console.error(`Failed to ensure auth tables: ${e2.message}`);
    }
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
    for (const c of ['rvu_email','email','personal_email','personal_mail']) {
      if (cols.includes(c)) {
        checks.push(`"${c}" = $${params.length + 1}`);
        params.push(email);
      }
    }
    const where = checks.length ? checks.join(' or ') : 'false';
    const res = await pool.query(`select * from ${loginTable} where ${where} limit 1`, params);
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

function setRefreshCookie(res, raw) {
  res.cookie('refresh_token', raw, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
  });
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'invalid credentials' });
    let ok = false;
    if (user.password_hash) ok = await bcrypt.compare(password, user.password_hash);
    else if (user.password) ok = password === user.password;
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });
    const access = signAccess(user);
    const r = newRefresh();
    const exp = new Date(Date.now() + (parseTtl(process.env.JWT_REFRESH_EXPIRE || '30d'))).toISOString();
    await pool.query(
      'insert into auth_refresh_tokens (user_login_id, token_hash, jti, expires_at, user_agent, ip) values ($1,$2,$3,$4,$5,$6)',
      [user.id, r.hash, r.jti, exp, req.headers['user-agent'] || null, req.ip || null]
    );
    setRefreshCookie(res, r.raw);
    res.json({ access, user: { email: user.rvu_email || user.email, role_id: user.role_id, usn: user.usn } });
  } catch (e) {
    console.error(`Login error: ${e.message}`);
    res.status(500).json({ error: e.message });
  }
};

const refresh = async (req, res) => {
  try {
    const raw = req.cookies?.refresh_token;
    if (!raw) {
      console.log('Refresh failed: No refresh token in cookies', req.cookies);
      return res.status(401).json({ error: 'no refresh' });
    }
    const hash = sha256(raw);
    const loginTable = await getLoginTable();
    // Use explicit aliasing to avoid ID collision between token ID (uuid) and user ID (bigint)
    const q = await pool.query(
      `select art.id as refresh_token_id, art.user_login_id, ul.* 
       from auth_refresh_tokens art 
       join ${loginTable} ul on ul.id=art.user_login_id 
       where art.token_hash=$1 and (art.revoked_at is null) and art.expires_at > now() 
       limit 1`,
      [hash]
    );
    if (!q.rows.length) {
      console.log('Refresh failed: Token not found or invalid/expired', { hash });
      return res.status(401).json({ error: 'invalid refresh' });
    }
    const row = q.rows[0];
    
    // row contains user details for signAccess (it expects .id to be user id usually, but let's check signAccess)
    // signAccess uses: user.id, user.role_id, user.role/role_name, user.token_version, user.usn
    // row.id is from ul.* (user id), so that's fine. 
    // Wait, if I select ul.*, row.id WILL be user id.
    // BUT I need the refresh token ID for the update query.
    
    const access = signAccess(row);
    const r = newRefresh();
    const exp = new Date(Date.now() + (parseTtl(process.env.JWT_REFRESH_EXPIRE || '30d'))).toISOString();
    
    await pool.query('update auth_refresh_tokens set revoked_at=now(), replaced_by=$1 where id=$2', [r.jti, row.refresh_token_id]);
    await pool.query(
      'insert into auth_refresh_tokens (user_login_id, token_hash, jti, expires_at, user_agent, ip) values ($1,$2,$3,$4,$5,$6)',
      [row.user_login_id, r.hash, r.jti, exp, req.headers['user-agent'] || null, req.ip || null]
    );
    setRefreshCookie(res, r.raw);
    res.json({ access });
  } catch (e) {
    console.error(`Refresh error: ${e.message}`);
    res.status(401).json({ error: 'refresh failed' });
  }
};

const logout = async (req, res) => {
  const raw = req.cookies?.refresh_token;
  if (raw) {
    const hash = sha256(raw);
    await pool.query('update auth_refresh_tokens set revoked_at=now() where token_hash=$1', [hash]);
  }
  res.clearCookie('refresh_token');
  res.json({ ok: true });
};

const registerStudent = async (req, res) => {
  try {
    const { usn, email, rvuEmail, password } = req.body || {};
    if (!usn || !password) return res.status(400).json({ error: 'USN and password required' });
    const loginTable = await getLoginTable();
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
    let roleId = null;
    if (idCol && nameCol) {
      const r = await pool.query(`select ${idCol} as id from roles where ${nameCol}=$1 limit 1`, ['student']);
      roleId = r.rows.length ? r.rows[0].id : null;
    }
    const emailCols = ['rvu_email','email','personal_email','personal_mail'].filter(c => cols.includes(c));
    const whereChecks = [];
    const paramsChecks = [];
    if (cols.includes('usn')) { whereChecks.push(`usn = $${paramsChecks.length + 1}`); paramsChecks.push(usn); }
    if (emailCols.length && email) {
      whereChecks.push(emailCols.map(c => `"${c}" = $${paramsChecks.length + 1}`).join(' or '));
      paramsChecks.push(email);
    }
    const exists = whereChecks.length
      ? await pool.query(`select 1 from ${loginTable} where ${whereChecks.join(' or ')} limit 1`, paramsChecks)
      : { rows: [] };
    if (exists.rows.length) return res.status(400).json({ error: 'User already exists' });
    const insertCols = [];
    const insertParams = [];
    const placeholders = [];
    if (cols.includes('usn')) { insertCols.push('usn'); insertParams.push(usn); }
    if (roleId && cols.includes('role_id')) { insertCols.push('role_id'); insertParams.push(roleId); }
    else if (cols.includes('role') || cols.includes('role_name')) {
      const rn = cols.includes('role') ? 'role' : 'role_name';
      insertCols.push(rn); insertParams.push('student');
    }
    if (email) {
      const eCol = cols.includes('personal_email') ? 'personal_email'
        : (cols.includes('personal_mail') ? 'personal_mail'
        : (cols.includes('email') ? 'email'
        : (cols.includes('rvu_email') ? 'rvu_email' : null)));
      if (eCol) { insertCols.push(eCol); insertParams.push(email); }
    } else if (rvuEmail && cols.includes('rvu_email')) {
      insertCols.push('rvu_email'); insertParams.push(rvuEmail);
    }
    if (cols.includes('password_hash')) {
      const hashed = await bcrypt.hash(password, 10);
      insertCols.push('password_hash'); insertParams.push(hashed);
    } else if (cols.includes('password')) {
      insertCols.push('password'); insertParams.push(password);
    }
    if (cols.includes('is_active')) { insertCols.push('is_active'); insertParams.push(true); }
    if (cols.includes('created_at')) { insertCols.push('created_at'); insertParams.push(new Date().toISOString()); }
    if (cols.includes('updated_at')) { insertCols.push('updated_at'); insertParams.push(new Date().toISOString()); }
    for (let i = 0; i < insertParams.length; i++) placeholders.push(`$${i + 1}`);
    if (!insertCols.length) return res.status(500).json({ error: 'Unable to register user (no insertable columns)' });
    await pool.query(
      `insert into ${loginTable} (${insertCols.map(c => `"${c}"`).join(', ')}) values (${placeholders.join(', ')})`,
      insertParams
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
const verifyUsn = async (req, res) => {
  try {
    const { usn } = req.body;
    if (!usn) {
      return res.status(400).json({ error: 'USN required' });
    }
    const loginTable = await getLoginTable();
    const userRes = await pool.query(`select * from ${loginTable} where usn=$1`, [usn]);
    if (userRes.rows.length) {
      const user = userRes.rows[0];
      let name = '';
      let school = null;
      let program = null;
      try {
        const pr = await pool.query('select full_name, school_name, program_id from students_personal_details where usn=$1', [usn]);
        if (pr.rows.length) {
          name = pr.rows[0].full_name || '';
          school = pr.rows[0].school_name || null;
          const pid = pr.rows[0].program_id;
          if (pid) {
            const p = await pool.query('select name from programs where id=$1', [pid]);
            if (p.rows.length) program = p.rows[0].name;
          }
        }
      } catch {}
      return res.json({
        exists: true,
        isRegistered: true,
        name,
        email: user.rvu_email || user.email || user.personal_email,
        school,
        program
      });
    }
    const personalRes = await pool.query('select full_name, school_name, program_id from students_personal_details where usn=$1', [usn]);
    if (!personalRes.rows.length) {
      return res.status(404).json({ error: 'USN not found in personal details. Please contact administration.' });
    }
    const row = personalRes.rows[0];
    const name = row.full_name;
    const school = row.school_name || null;
    let program = null;
    if (row.program_id) {
      const p = await pool.query('select name from programs where id=$1', [row.program_id]);
      if (p.rows.length) program = p.rows[0].name;
    }
    let email = null;
    try {
      const commRes = await pool.query('select college_email, personal_email from student_profile_communication where usn=$1', [usn]);
      if (commRes.rows.length) {
        email = commRes.rows[0].college_email || null;
      }
    } catch {}
    return res.json({
      exists: true,
      isRegistered: false,
      name,
      email,
      school,
      program
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Initialize
ensureAuthTables();

module.exports = {
  login,
  refresh,
  logout,
  verifyUsn,
  getLoginTable
};
