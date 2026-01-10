const { pool } = require('../../config/db');
const { mapData, columnMapping } = require('./utils');

const tableName = 'student_parent_details';
const sectionName = 'family';

const getFamily = async (req, res) => {
  try {
    const { usn } = req.params;

    const isOwner = req.user?.usn === usn;
    const isAdmin = req.user?.role_name === 'admin' || req.user?.role_name === 'superadmin' || req.user?.role === 'admin' || req.user?.role === 'superadmin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Unauthorized access to this profile' });
    }

    const query = `select * from ${tableName} where usn = $1`;
    const result = await pool.query(query, [usn]);
    
    res.json(mapData(sectionName, result.rows, 'fromDb'));
  } catch (e) {
    console.error(`Get ${sectionName} error: ${e.message}`);
    res.status(500).json({ error: e.message });
  }
};

const updateFamily = async (req, res) => {
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

    // Handle data wrapping if any
    let arrayData = data;
    if (!Array.isArray(data) && typeof data === 'object') {
         const potentialArray = Object.values(data).find(v => Array.isArray(v));
         if (potentialArray) {
             arrayData = potentialArray;
         }
    }

    const dbData = mapData(sectionName, arrayData, 'toDb');

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Delete existing
      await client.query(`delete from ${tableName} where usn = $1`, [usn]);

      // 2. Insert new
      if (Array.isArray(dbData) && dbData.length > 0) {
        const validColumns = Object.values(columnMapping[sectionName].toDb);
        
        for (const item of dbData) {
          // Filter item to only include valid columns
          const filteredItem = {};
          for (const key of Object.keys(item)) {
             if (validColumns.includes(key)) {
                 filteredItem[key] = item[key];
             }
          }

          const keys = Object.keys(filteredItem);
          const values = Object.values(filteredItem);
          keys.push('usn');
          values.push(usn);

          if (keys.length === 1) continue; // Skip if only USN (empty object)

          const query = `insert into ${tableName} (${keys.join(', ')}) values (${keys.map((_, i) => `$${i+1}`).join(', ')})`;
          await client.query(query, values);
        }
      }

      await client.query('COMMIT');
      
      // Return updated data
      const result = await client.query(`select * from ${tableName} where usn = $1`, [usn]);
      res.json(mapData(sectionName, result.rows, 'fromDb'));
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (e) {
    console.error(`Update ${sectionName} error: ${e.message}`);
    res.status(500).json({ error: e.message });
  }
};

module.exports = {
    getFamily,
    updateFamily
};
