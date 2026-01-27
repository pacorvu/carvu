const { pool } = require('../../config/db');
const { mapData, tableMapping, arrayTables } = require('./utils');

const getFullProfile = async (req, res) => {
  try {
    const { usn } = req.params;
    
    // Normalize USN
    const targetUsn = String(usn || '').toUpperCase();
    const tokenUsn = String(req.user?.usn || '').toUpperCase();
    const isOwner = tokenUsn === targetUsn;

    let rawRole = req.user?.role_name || req.user?.role;
    let userRole = String(rawRole || '').toLowerCase().trim();

    if (!userRole && req.user?.role_id) {
      try {
        const roleRes = await pool.query('select name from roles where id=$1 limit 1', [req.user.role_id]);
        const dbRole = roleRes.rows[0]?.name;
        if (dbRole) {
          userRole = String(dbRole).toLowerCase().trim();
          console.log(`[getFullProfile] Role derived from DB for user ${req.user.id}: ${userRole}`);
        }
      } catch (e) {
        console.error('[getFullProfile] Role lookup failed:', e);
      }
    }

    const allowedRoles = [
      'admin',
      'superadmin',
      'sudo_admin',
      'placement_director',
      'placement_officers',
      'placement_officer',
      'placement officer',
      'admin_viewer',
      'alumni',
      'company',
      'dean',
      'management',
      'parent'
    ];
    const isAuthorized = allowedRoles.includes(userRole);

    console.log(
      `[getFullProfile] Access check: User=${req.user?.sub}, Role=${userRole}, TargetUSN=${targetUsn}, Owner=${isOwner}, Authorized=${isAuthorized}`
    );

    if (!isOwner && !isAuthorized) {
      return res.status(403).json({ error: 'Unauthorized access to this profile' });
    }

    const fullProfile = {};

    // 1. Fetch Personal & Contact Details with Joins (Programs, etc.)
    const personalQuery = `
      select spd.*,
             p.name as program_name,
             mj.name as major_name,
             mn.name as minor_name,
             sz.name as specialization_name
      from students_personal_details spd
      left join programs p on p.id = spd.program_id
      left join majors mj on mj.id = spd.major_id
      left join minors mn on mn.id = spd.minor_id
      left join specializations sz on sz.id = spd.specialization_id
      where spd.usn = $1
    `;
    const personalRes = await pool.query(personalQuery, [usn]);
    const personalRow = personalRes.rows[0] || {};

    // Map Personal
    const personalData = mapData('personal', personalRow, 'fromDb');
    if (personalRow.program_name) personalData.programName = personalRow.program_name;
    if (personalRow.major_name) personalData.majorName = personalRow.major_name;
    if (personalRow.minor_name) personalData.minorName = personalRow.minor_name;
    if (personalRow.specialization_name) personalData.specializationName = personalRow.specialization_name;
    
    fullProfile.personal = personalData;
    fullProfile.contact = mapData('contact', personalRow, 'fromDb');

    // 2. Fetch other sections from tableMapping
    for (const [key, table] of Object.entries(tableMapping)) {
      if (key === 'personal' || key === 'contact') continue;

      const isArray = arrayTables.includes(table);
      const query = `select * from ${table} where usn = $1`;
      const result = await pool.query(query, [usn]);
      let data = isArray ? result.rows : (result.rows[0] || {});
      
      // Map from DB to Frontend
      data = mapData(key, data, 'fromDb');
      
      fullProfile[key] = data;
    }

    // 3. Add Placements and Job Offers (Not in tableMapping but part of full profile)
    try {
      const placementsRes = await pool.query(`
        SELECT p.*, pd.job_type, pd.event_datetime, c.company_name, c.company_logo_link
        FROM student_placement_process p
        JOIN placements_drives pd ON p.placement_drive_id = pd.id
        LEFT JOIN companies c ON pd.company_id = c.id
        WHERE p.usn = $1
        ORDER BY p.created_at DESC
      `, [usn]);
      fullProfile.placements = placementsRes.rows;

      const offersTableCheck = await pool.query("SELECT to_regclass('public.offers') as tbl");
      const offersTable = offersTableCheck.rows[0] && offersTableCheck.rows[0].tbl;

      if (offersTable) {
        const offersRes = await pool.query('SELECT * FROM offers WHERE usn = $1', [usn]);
        fullProfile.jobOffers = offersRes.rows;
      } else {
        fullProfile.jobOffers = [];
      }
    } catch (err) {
      console.error('Error fetching placements/offers for full profile:', err);
      fullProfile.placements = fullProfile.placements || [];
      fullProfile.jobOffers = fullProfile.jobOffers || [];
    }

    return res.json(fullProfile);
  } catch (e) {
    console.error(`Get full profile error: ${e.message}`);
    res.status(500).json({ error: e.message });
  }
};

module.exports = {
    getFullProfile
};
