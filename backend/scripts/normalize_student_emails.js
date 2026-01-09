const { pool } = require('../config/db');

async function run() {
  try {
    const rowsRes = await pool.query(
      "select usn, college_email, personal_email from student_profile_communication order by usn"
    );
    let updated = 0;
    let skipped = 0;
    for (const row of rowsRes.rows) {
      const usn = row.usn;
      const college = row.college_email || null;
      const personal = row.personal_email || null;
      const localFromCollege = college ? String(college).split('@')[0] : null;
      const localFromPersonal = personal ? String(personal).split('@')[0] : null;
      const base = localFromCollege || localFromPersonal || (usn ? String(usn).toLowerCase() : null);
      let newCollege = null;
      let newPersonal = null;
      if (base) {
        if (!college || !String(college).toLowerCase().endsWith('@rvu.edu.in')) {
          newCollege = `${base}@rvu.edu.in`;
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
      if (newCollege || newPersonal) {
        const sets = [];
        const params = [];
        if (newCollege) { sets.push(`college_email=$${params.length + 1}`); params.push(newCollege); }
        if (newPersonal) { sets.push(`personal_email=$${params.length + 1}`); params.push(newPersonal); }
        await pool.query(
          `update student_profile_communication set ${sets.join(', ')}, updated_at=now() where usn=$${params.length + 1}`,
          [...params, usn]
        );
        updated++;
        const loginTableRes = await pool.query(
          "select table_name from information_schema.tables where table_schema='public' and table_name in ('user_login','user_logins') order by table_name"
        );
        const loginTable = loginTableRes.rows.length ? loginTableRes.rows[0].table_name : 'user_login';
        const colsRes = await pool.query(
          "select column_name from information_schema.columns where table_schema='public' and table_name=$1",
          [loginTable]
        );
        const cols = colsRes.rows.map(r => r.column_name);
        const hasRvuEmail = cols.includes('rvu_email');
        const hasEmail = cols.includes('email');
        const hasPersonalEmail = cols.includes('personal_email');
        const hasPersonalMail = cols.includes('personal_mail');
        const rvuCol = hasRvuEmail ? 'rvu_email' : (hasEmail ? 'email' : null);
        const personalCol = hasPersonalEmail ? 'personal_email' : (hasPersonalMail ? 'personal_mail' : null);
        const setsLogin = [];
        const paramsLogin = [];
        if (rvuCol && newCollege) { setsLogin.push(`"${rvuCol}"=$${paramsLogin.length + 1}`); paramsLogin.push(newCollege); }
        if (personalCol && newPersonal) { setsLogin.push(`"${personalCol}"=$${paramsLogin.length + 1}`); paramsLogin.push(newPersonal); }
        if (setsLogin.length && usn) {
          await pool.query(
            `update ${loginTable} set ${setsLogin.join(', ')}, updated_at=now() where usn=$${paramsLogin.length + 1}`,
            [...paramsLogin, usn]
          );
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
