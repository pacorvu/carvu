const { pool } = require('../config/db');

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
      const base = localFromRvu || localFromEmail || (hasUsn && row.usn ? String(row.usn).toLowerCase() : null);
      const rvuCol = hasRvuEmail ? 'rvu_email' : (hasEmail ? 'email' : null);
      const personalCol = hasPersonalEmail ? 'personal_email' : (hasPersonalMail ? 'personal_mail' : null);
      if (!rvuCol || !personalCol) { skipped++; continue; }
      let newRvu = null;
      let newPersonal = null;
      if (base) {
        if (!rvu || !String(rvu).toLowerCase().endsWith('@rvu.edu.in')) {
          newRvu = `${base}@rvu.edu.in`;
        }
        if (!personal) {
          newPersonal = `${base}.personal@gmail.com`;
        } else if (String(personal).toLowerCase().endsWith('@rvu.edu.in')) {
          const local = String(personal).split('@')[0].replace(/\.personal$/i, '');
          newPersonal = `${local}.personal@gmail.com`;
        } else if (!String(personal).toLowerCase().endsWith('@gmail.com')) {
          newPersonal = `${base}.personal@gmail.com`;
        }
      }
      if (isStudent || isAlumni) {
        const updates = [];
        const params = [];
        if (newRvu) { updates.push(`"${rvuCol}"=$${params.length + 1}`); params.push(newRvu); }
        if (newPersonal) { updates.push(`"${personalCol}"=$${params.length + 1}`); params.push(newPersonal); }
        if (updates.length) {
          await pool.query(`update ${loginTable} set ${updates.join(', ')}, updated_at=now() where id=$${params.length + 1}`, [...params, row.id]);
          updated++;
          if (hasUsn && row.usn) {
            if (newRvu) {
              await pool.query("update student_profile_communication set college_email=$1, updated_at=now() where usn=$2", [newRvu, row.usn]);
            }
            if (newPersonal) {
              await pool.query("update student_profile_communication set personal_email=$1, updated_at=now() where usn=$2", [newPersonal, row.usn]);
            }
          }
        } else {
          skipped++;
        }
      } else {
        skipped++;
      }
    }
    console.log(JSON.stringify({ updated, skipped }));
  } catch (e) {
    console.error(e.message);
  } finally {
    await pool.end();
  }
}

run();
