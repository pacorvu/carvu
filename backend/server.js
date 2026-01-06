require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { pool, supabase } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');

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
  
  // List tables on startup
  (async () => {
    try {
      const result = await pool.query(
        "select table_name from information_schema.tables where table_schema = 'public' order by table_name"
      );
      console.log(`Tables: ${result.rows.map(r => r.table_name).join(', ')}`);
    } catch (e) {
      console.error(`Failed to list tables: ${e.message}`);
    }
  })();
});
