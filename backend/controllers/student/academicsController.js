const { pool } = require('../../config/db');
const { mapData, columnMapping } = require('./utils');

const tableName = 'student_semester_academics';
const sectionName = 'academics';

const getAcademics = async (req, res) => {
  try {
    const { usn } = req.params;

    const isOwner = req.user?.usn === usn;
    const isAdmin = req.user?.role_name === 'admin' || req.user?.role_name === 'superadmin' || req.user?.role === 'admin' || req.user?.role === 'superadmin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Unauthorized access to this profile' });
    }

    const query = `select * from ${tableName} where usn = $1 order by semester asc`;
    const result = await pool.query(query, [usn]);
    
    res.json(mapData(sectionName, result.rows, 'fromDb'));
  } catch (e) {
    console.error(`Get ${sectionName} error: ${e.message}`);
    res.status(500).json({ error: e.message });
  }
};

const updateAcademics = async (req, res) => {
  try {
    const { usn } = req.params;
    let data = req.body;

    // Normalize USNs for comparison
    const tokenUsn = (req.user?.usn || '').toString().trim().toLowerCase();
    const paramUsn = (usn || '').toString().trim().toLowerCase();

    const isOwner = tokenUsn === paramUsn;
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

    const mappedData = mapData(sectionName, arrayData, 'toDb');

    // Filter to include only valid columns and sanitize data
    const validColumns = Object.values(columnMapping[sectionName].toDb);
    const dbData = [];
    
    if (Array.isArray(mappedData)) {
        for (const item of mappedData) {
            // Skip if semester is missing (it is required)
            if (!item.semester) continue;

            const filteredItem = {};
            for (const key of Object.keys(item)) {
                if (validColumns.includes(key)) {
                    let value = item[key];
                    
                    // Sanitize numeric fields
                    if (['academic_year', 'semester', 'closed_backlogs', 'live_backlogs'].includes(key)) {
                         if (value === '' || value === null || value === undefined) {
                             if (key === 'closed_backlogs' || key === 'live_backlogs') {
                                 value = 0;
                             } else {
                                 value = null;
                             }
                         }
                    }
                     // Sanitize result_in_sgpa
                    if (key === 'result_in_sgpa') {
                        if (value === '' || value === null || value === undefined) {
                            value = null;
                        }
                    }
                    
                    filteredItem[key] = value;
                }
            }
            if (Object.keys(filteredItem).length > 0) {
                dbData.push(filteredItem);
            }
        }
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(`delete from ${tableName} where usn = $1`, [usn]);

      if (dbData.length > 0) {
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
      
      const result = await client.query(`select * from ${tableName} where usn = $1 order by semester asc`, [usn]);
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
    getAcademics,
    updateAcademics
};
