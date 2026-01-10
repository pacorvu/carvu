const { pool } = require('../../config/db');
const { mapData } = require('./utils');

const tableName = 'student_other_experiences';
const sectionName = 'otherExperiences';

const getOtherExperiences = async (req, res) => {
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

const updateOtherExperiences = async (req, res) => {
  try {
    const { usn } = req.params;
    let data = req.body;

    const isOwner = req.user?.usn === usn;
    const isAdmin = req.user?.role_name === 'admin' || req.user?.role_name === 'superadmin' || req.user?.role === 'admin' || req.user?.role === 'superadmin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Unauthorized modification of this profile' });
    }

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

      await client.query(`delete from ${tableName} where usn = $1`, [usn]);

      if (Array.isArray(dbData) && dbData.length > 0) {
        for (const item of dbData) {
          const keys = Object.keys(item);
          const values = Object.values(item);
          keys.push('usn');
          values.push(usn);

          const query = `insert into ${tableName} (${keys.join(', ')}) values (${keys.map((_, i) => `$${i+1}`).join(', ')})`;
          await client.query(query, values);
        }
      }

      await client.query('COMMIT');
      
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
    getOtherExperiences,
    updateOtherExperiences
};
