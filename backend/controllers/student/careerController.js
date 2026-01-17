const { pool } = require('../../config/db');
const { mapData, columnMapping } = require('./utils');

const tableName = 'student_profile_details';
const sectionName = 'career';

const getCareer = async (req, res) => {
  try {
    const { usn } = req.params;

    const isOwner = req.user?.usn === usn;
    const isAdmin = req.user?.role_name === 'admin' || req.user?.role_name === 'superadmin' || req.user?.role === 'admin' || req.user?.role === 'superadmin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Unauthorized access to this profile' });
    }

    const query = `select * from ${tableName} where usn = $1`;
    const result = await pool.query(query, [usn]);
    const row = result.rows[0] || {};
    
    res.json(mapData(sectionName, row, 'fromDb'));
  } catch (e) {
    console.error(`Get ${sectionName} error: ${e.message}`);
    res.status(500).json({ error: e.message });
  }
};

const updateCareer = async (req, res) => {
  try {
    const { usn } = req.params;
    let data = req.body;

    // Normalize USNs for comparison
    const tokenUsn = (req.user?.usn || '').toString().trim().toLowerCase();
    const paramUsn = (usn || '').toString().trim().toLowerCase();

    const isOwner = tokenUsn === paramUsn;
    const isAdmin = req.user?.role_name === 'admin' || req.user?.role_name === 'superadmin' || req.user?.role === 'admin' || req.user?.role === 'superadmin';
    
    if (!isOwner && !isAdmin) {
      console.log(`Authorization failed: tokenUsn=${tokenUsn}, paramUsn=${paramUsn}, role=${req.user?.role_name}`);
      return res.status(403).json({ error: 'Unauthorized modification of this profile' });
    }

    const mappedData = mapData(sectionName, data, 'toDb');
    
    // Filter to include only valid columns
    const validColumns = Object.values(columnMapping[sectionName].toDb);
    const dbData = {};
    for (const key of Object.keys(mappedData)) {
        if (validColumns.includes(key)) {
            dbData[key] = mappedData[key];
        }
    }
    
    const check = await pool.query(`select usn from ${tableName} where usn = $1`, [usn]);
    
    if (check.rows.length === 0) {
        // Insert
        const keys = Object.keys(dbData);
        const values = Object.values(dbData);
        keys.push('usn');
        values.push(usn);
        
        const query = `insert into ${tableName} (${keys.join(', ')}) values (${keys.map((_, i) => `$${i+1}`).join(', ')}) returning *`;
        const result = await pool.query(query, values);
        res.json(mapData(sectionName, result.rows[0], 'fromDb'));
    } else {
        // Update
        const keys = Object.keys(dbData);
        const values = Object.values(dbData);
        
        if (keys.length === 0) return res.json({});

        const setClause = keys.map((k, i) => `${k} = $${i+1}`).join(', ');
        const query = `update ${tableName} set ${setClause} where usn = $${keys.length + 1} returning *`;
        
        const result = await pool.query(query, [...values, usn]);
        res.json(mapData(sectionName, result.rows[0], 'fromDb'));
    }
  } catch (e) {
    console.error(`Update ${sectionName} error: ${e.message}`);
    res.status(500).json({ error: e.message });
  }
};

module.exports = {
    getCareer,
    updateCareer
};
