const { pool } = require('../../config/db');
const { mapData, columnMapping } = require('./utils');

const tableName = 'student_projects';
const sectionName = 'projects';

const getProjects = async (req, res) => {
  try {
    const { usn } = req.params;

    const isOwner = req.user?.usn === usn;
    const isAdmin = req.user?.role_name === 'admin' || req.user?.role_name === 'superadmin' || req.user?.role === 'admin' || req.user?.role === 'superadmin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Unauthorized access to this profile' });
    }

    const query = `select * from ${tableName} where usn = $1 order by priority asc, created_at desc`;
    const result = await pool.query(query, [usn]);
    
    res.json(mapData(sectionName, result.rows, 'fromDb'));
  } catch (e) {
    console.error(`Get ${sectionName} error: ${e.message}`);
    res.status(500).json({ error: e.message });
  }
};

const updateProjects = async (req, res) => {
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
    
    // Fetch existing stats to preserve them
    const existingRes = await pool.query(`select id, views, likes, downloads from ${tableName} where usn = $1`, [usn]);
    const statsMap = new Map();
    existingRes.rows.forEach(row => {
        // Use loose comparison by converting ID to string
        statsMap.set(String(row.id), { views: row.views, likes: row.likes, downloads: row.downloads });
    });

    if (Array.isArray(mappedData)) {
        let priorityCounter = 1;
        for (const item of mappedData) {
            // Skip if title is missing (it is required)
            if (!item.title) continue;

            const filteredItem = {};
            for (const key of Object.keys(item)) {
                if (validColumns.includes(key)) {
                    // Only include columns that are actually in the DB table
                    // Note: 'role' and 'team_size' are mapped in utils but NOT in the new table schema.
                    // We must filter them out to prevent SQL errors.
                    if (['role', 'team_size'].includes(key)) continue;

                    let value = item[key];
                    filteredItem[key] = value;
                }
            }

            // --- Preserve Stats from DB ---
            // Because we delete and re-insert, we must carry over the stats from the previous record (matched by ID)
            // If ID is missing or new, default to 0.
            if (filteredItem.id && statsMap.has(String(filteredItem.id))) {
                const stats = statsMap.get(String(filteredItem.id));
                filteredItem.views = stats.views;
                filteredItem.likes = stats.likes;
                filteredItem.downloads = stats.downloads;
            } else {
                 // Defaults for new items
                 if (filteredItem.views === undefined) filteredItem.views = 0;
                 if (filteredItem.likes === undefined) filteredItem.likes = 0;
                 if (filteredItem.downloads === undefined) filteredItem.downloads = 0;
            }
            
            // Remove ID so we don't try to insert it (let DB generate new serial)
            // The frontend will receive the new ID in the response.
            delete filteredItem.id;

            // --- Add Defaults & Transformations ---

            // Priority
            filteredItem.priority = priorityCounter++;

            // Genre
            if (!filteredItem.genre) filteredItem.genre = 'General';

            // Visibility
            if (!filteredItem.visibility) filteredItem.visibility = 'PRIVATE';

            // Self Rating
            if (!filteredItem.self_rating) filteredItem.self_rating = 5;

            // One Line Description
            if (!filteredItem.one_line_description) {
                const desc = filteredItem.full_description || '';
                filteredItem.one_line_description = desc.length > 150 ? desc.substring(0, 147) + '...' : desc;
            }
            if (!filteredItem.one_line_description) filteredItem.one_line_description = 'No description'; // Constraint NOT NULL

            // Technologies: Convert comma-sep string to array if needed
            if (filteredItem.technologies && typeof filteredItem.technologies === 'string') {
                filteredItem.technologies = filteredItem.technologies.split(',').map(s => s.trim()).filter(Boolean);
            }
            if (!filteredItem.technologies) filteredItem.technologies = [];

            // Project Snaps: Ensure array
            if (filteredItem.project_snaps) {
                if (typeof filteredItem.project_snaps === 'string') {
                    // If single string (URL), make array
                    filteredItem.project_snaps = [filteredItem.project_snaps];
                }
            } else {
                filteredItem.project_snaps = [];
            }
            // Limit to 4 snaps (Schema Check)
            if (Array.isArray(filteredItem.project_snaps) && filteredItem.project_snaps.length > 4) {
                filteredItem.project_snaps = filteredItem.project_snaps.slice(0, 4);
            }

            // Mentor Name defaults to null if missing (allowed)

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
      
      // Return updated data
      const query = `select * from ${tableName} where usn = $1 order by priority asc, created_at desc`;
      const result = await client.query(query, [usn]);
      res.json(mapData(sectionName, result.rows, 'fromDb'));

    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (e) {
    console.error(`Update ${sectionName} error: ${e.message}`);
    res.status(500).json({ error: e.message });
  }
};

const incrementProjectStats = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { type } = req.body; // 'view' or 'download' or 'like'

        let column = 'views';
        if (type === 'download') column = 'downloads';
        if (type === 'like') column = 'likes';
        
        // Sanity check for column name to avoid SQL injection
        if (!['views', 'downloads', 'likes'].includes(column)) {
            return res.status(400).json({ error: 'Invalid stat type' });
        }

        const query = `UPDATE ${tableName} SET ${column} = ${column} + 1 WHERE id = $1 RETURNING ${column}`;
        const result = await pool.query(query, [projectId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json({ [column]: result.rows[0][column] });
    } catch (e) {
        console.error(`Increment stats error: ${e.message}`);
        res.status(500).json({ error: e.message });
    }
};

module.exports = {
  getProjects,
  updateProjects,
  incrementProjectStats
};
