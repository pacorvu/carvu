const { pool } = require('../../config/db');
const { mapData } = require('./utils');
const fs = require('fs');
const path = require('path');

const getPersonal = async (req, res) => {
  try {
    const { usn } = req.params;

    // Authorization
    const isOwner = req.user?.usn === usn;
    const isAdmin = req.user?.role_name === 'admin' || req.user?.role_name === 'superadmin' || req.user?.role === 'admin' || req.user?.role === 'superadmin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Unauthorized access to this profile' });
    }

    const query = `
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
    const result = await pool.query(query, [usn]);
    const row = result.rows[0] || {};
    
    const data = mapData('personal', row, 'fromDb');
    if (row.program_name !== undefined) data.programName = row.program_name;
    if (row.major_name !== undefined) data.majorName = row.major_name;
    if (row.minor_name !== undefined) data.minorName = row.minor_name;
    if (row.specialization_name !== undefined) data.specializationName = row.specialization_name;
    
    res.json(data);
  } catch (e) {
    console.error(`Get personal error: ${e.message}`);
    res.status(500).json({ error: e.message });
  }
};

const updatePersonal = async (req, res) => {
  try {
    const { usn } = req.params;
    let data = req.body;

    const isOwner = req.user?.usn === usn;
    const isAdmin = req.user?.role_name === 'admin' || req.user?.role_name === 'superadmin' || req.user?.role === 'admin' || req.user?.role === 'superadmin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Unauthorized modification of this profile' });
    }

    const dbData = mapData('personal', data, 'toDb');
    
    // Fix: Whitelist allowed columns to prevent "column does not exist" and "invalid input syntax" errors
    // This removes read-only fields (program_name etc) and unrelated fields (links from other sections)
    const allowedColumns = [
        'full_name', 'date_of_birth', 'blood_group', 'marital_status', 
        'specially_abled', 'profile_image', 'school_name', 'year_of_joining', 
        'program_id', 'specialization_id', 'major_id', 'minor_id', 
        'is_profile_locked', 'gender', 'languages', 'section'
    ];
    
    Object.keys(dbData).forEach(key => {
        if (!allowedColumns.includes(key)) {
            delete dbData[key];
        }
    });
    
    // Fix: Convert empty strings to null for integer/FK/date columns to avoid syntax errors
    const numericFields = ['year_of_joining', 'program_id', 'specialization_id', 'major_id', 'minor_id', 'date_of_birth'];
    for (const field of numericFields) {
        if (dbData[field] === "") {
            dbData[field] = null;
        }
    }
    
    const existingRes = await pool.query('select usn, profile_image from students_personal_details where usn = $1', [usn]);
    const hasExisting = existingRes.rows.length > 0;
    const oldProfileImage = existingRes.rows[0]?.profile_image || null;

    let dbResult;
    
    if (!hasExisting) {
        const keys = Object.keys(dbData);
        const values = Object.values(dbData);
        keys.push('usn');
        values.push(usn);
        
        const query = `insert into students_personal_details (${keys.join(', ')}) values (${keys.map((_, i) => `$${i+1}`).join(', ')}) returning *`;
        dbResult = await pool.query(query, values);
    } else {
        const keys = Object.keys(dbData);
        const values = Object.values(dbData);
        
        if (keys.length === 0) return res.json({});

        const setClause = keys.map((k, i) => `${k} = $${i+1}`).join(', ');
        const query = `update students_personal_details set ${setClause} where usn = $${keys.length + 1} returning *`;
        
        dbResult = await pool.query(query, [...values, usn]);
    }

    const updatedRow = dbResult.rows[0];

    try {
      const newProfileImage = dbData.profile_image;
      if (oldProfileImage && newProfileImage && oldProfileImage !== newProfileImage) {
        let relativePath = oldProfileImage;
        const uploadsIndex = oldProfileImage.indexOf('/uploads/');
        if (uploadsIndex !== -1) {
          relativePath = oldProfileImage.substring(uploadsIndex);
        }
        const absolutePath = path.join(__dirname, '..', '..', 'public', relativePath.replace(/^\/+/, ''));
        fs.unlink(absolutePath, (err) => {
          if (err && err.code !== 'ENOENT') {
            console.error('Failed to delete old profile image:', err.message);
          }
        });
      }
    } catch (cleanupError) {
      console.error('Error while cleaning up old profile image:', cleanupError.message);
    }

    res.json(mapData('personal', updatedRow, 'fromDb'));
  } catch (e) {
    console.error(`Update personal error: ${e.message}`);
    res.status(500).json({ error: e.message });
  }
};

module.exports = {
    getPersonal,
    updatePersonal
};
