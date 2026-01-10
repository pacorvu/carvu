const { pool } = require('../../config/db');
const { mapData, tableMapping, arrayTables } = require('./utils');

const getFullProfile = async (req, res) => {
  try {
    const { usn } = req.params;
    
    const isOwner = req.user?.usn === usn;
    const isAdmin = req.user?.role_name === 'admin' || req.user?.role_name === 'superadmin' || req.user?.role === 'admin' || req.user?.role === 'superadmin';

    if (!isOwner && !isAdmin) {
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

      const offersRes = await pool.query('SELECT * FROM job_offers WHERE usn = $1', [usn]);
      fullProfile.jobOffers = offersRes.rows;
    } catch (err) {
      console.error('Error fetching placements/offers for full profile:', err);
      // Don't fail the whole request if these fail, just log
      fullProfile.placements = [];
      fullProfile.jobOffers = [];
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
