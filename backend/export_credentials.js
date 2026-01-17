require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  try {
    const tableCheck = await pool.query(
      "select table_name from information_schema.tables where table_schema='public' and table_name in ('user_logins','user_login') order by table_name"
    );
    if (!tableCheck.rows.length) {
      console.error('No user_logins or user_login table found');
      process.exit(1);
    }
    const loginTable = tableCheck.rows[0].table_name;
    const rolesCheck = await pool.query(
      "select table_name from information_schema.tables where table_schema='public' and table_name='roles'"
    );
    let rolesMap = new Map();
    if (rolesCheck.rows.length) {
      const rolesRes = await pool.query("select id, name from roles");
      for (const r of rolesRes.rows) rolesMap.set(r.id, r.name);
    }
    const q = await pool.query(`select * from ${loginTable} order by id`);
    const outPath = path.resolve(__dirname, '..', 'login_credentials.csv');
    const header = [
      'id',
      'role_id',
      'role_name',
      'mail_id',
      'password'
    ].join(',');
    const lines = [header];
    for (const row of q.rows) {
      const roleName = row.role || row.role_name || (row.role_id ? rolesMap.get(row.role_id) : null) || '';
      let passwordText = '';
      if (row.password) {
        passwordText = row.password;
      } else if (row.password_hash) {
        const ok = await bcrypt.compare('1234', row.password_hash);
        passwordText = ok ? '1234' : '';
      } else {
        passwordText = '';
      }
      const line = [
        row.id ?? '',
        row.role_id ?? '',
        roleName ?? '',
        row.mail_id ?? row.email ?? '',
        passwordText
      ].map(v => String(v).replace(/\"/g, '\"\"')).map(v => `\"${v}\"`).join(',');
      lines.push(line);
    }
    fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
    console.log(outPath);
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  }
}

main();
