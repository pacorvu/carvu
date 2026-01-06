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
    if (!raw) return res.status(401).json({ error: 'no refresh' });
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
    if (!q.rows.length) return res.status(401).json({ error: 'invalid refresh' });
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

// Initialize
ensureAuthTables();

module.exports = {
  login,
  refresh,
  logout,
  getLoginTable
};
