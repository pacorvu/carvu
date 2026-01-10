const { pool } = require('../../config/db');
const { mapData } = require('./utils');

const getContact = async (req, res) => {
  try {
    const { usn } = req.params;

    const isOwner = req.user?.usn === usn;
    const isAdmin = req.user?.role_name === 'admin' || req.user?.role_name === 'superadmin' || req.user?.role === 'admin' || req.user?.role === 'superadmin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Unauthorized access to this profile' });
    }

    const query = `select * from students_personal_details where usn = $1`;
    const result = await pool.query(query, [usn]);
    const row = result.rows[0] || {};
    
    res.json(mapData('contact', row, 'fromDb'));
  } catch (e) {
    console.error(`Get contact error: ${e.message}`);
    res.status(500).json({ error: e.message });
  }
};

const updateContact = async (req, res) => {
  try {
    const { usn } = req.params;
    let data = req.body;

    const isOwner = req.user?.usn === usn;
    const isAdmin = req.user?.role_name === 'admin' || req.user?.role_name === 'superadmin' || req.user?.role === 'admin' || req.user?.role === 'superadmin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Unauthorized modification of this profile' });
    }

    // Special handling for mobileNumber -> phoneNumber mapping if needed (frontend might send mobileNumber)
    if (data.mobileNumber && !data.phoneNumber) {
        data.phoneNumber = data.mobileNumber;
    }

    const dbData = mapData('contact', data, 'toDb');
    
    const check = await pool.query('select usn from students_personal_details where usn = $1', [usn]);
    
    if (check.rows.length === 0) {
        // Insert
        const keys = Object.keys(dbData);
        const values = Object.values(dbData);
        keys.push('usn');
        values.push(usn);
        
        const query = `insert into students_personal_details (${keys.join(', ')}) values (${keys.map((_, i) => `$${i+1}`).join(', ')}) returning *`;
        const result = await pool.query(query, values);
        res.json(mapData('contact', result.rows[0], 'fromDb'));
    } else {
        // Update
        const keys = Object.keys(dbData);
        const values = Object.values(dbData);
        
        if (keys.length === 0) return res.json({});

        const setClause = keys.map((k, i) => `${k} = $${i+1}`).join(', ');
        const query = `update students_personal_details set ${setClause} where usn = $${keys.length + 1} returning *`;
        
        const result = await pool.query(query, [...values, usn]);
        res.json(mapData('contact', result.rows[0], 'fromDb'));
    }
  } catch (e) {
    console.error(`Update contact error: ${e.message}`);
    res.status(500).json({ error: e.message });
  }
};

module.exports = {
    getContact,
    updateContact
};
