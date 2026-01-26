const { pool } = require('../config/db');

async function checkAndUpdateSchema() {
  try {
    console.log('Checking student_projects table schema...');
    
    // Get current columns
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'student_projects';
    `);
    
    const columns = res.rows.map(row => row.column_name);
    console.log('Current columns:', columns);
    
    const missingColumns = [];
    
    // Check for admin_rating
    if (!columns.includes('admin_rating')) {
        missingColumns.push('ADD COLUMN admin_rating INTEGER CHECK (admin_rating >= 1 AND admin_rating <= 10)');
    }
    
    // Check for admin_feedback
    if (!columns.includes('admin_feedback')) {
        missingColumns.push('ADD COLUMN admin_feedback TEXT');
    }
    
    // Check for views
    if (!columns.includes('views')) {
        missingColumns.push('ADD COLUMN views INTEGER DEFAULT 0');
    }
    
    // Check for likes
    if (!columns.includes('likes')) {
        missingColumns.push('ADD COLUMN likes INTEGER DEFAULT 0');
    }
    
    // Check for downloads
    if (!columns.includes('downloads')) {
        missingColumns.push('ADD COLUMN downloads INTEGER DEFAULT 0');
    }

    // Check for github_link (frontend expects github_repo)
    if (!columns.includes('github_link')) {
        missingColumns.push('ADD COLUMN github_link TEXT');
    }
    
    // Check for hosted_link (frontend expects hosted_link, DB has project_link usually)
    // We will assume project_link is the hosted link, but if we want a separate one:
    if (!columns.includes('hosted_link')) {
        // Only add if project_link is intended for something else, 
        // but typically project_link IS the hosted link.
        // Let's add it just in case to match frontend explicitly if needed, 
        // or we map it in controller. 
        // Let's add it to be safe and explicit.
        missingColumns.push('ADD COLUMN hosted_link TEXT');
    }

    if (missingColumns.length > 0) {
        const alterQuery = `ALTER TABLE student_projects ${missingColumns.join(', ')}`;
        console.log('Executing:', alterQuery);
        await pool.query(alterQuery);
        console.log('Schema updated successfully.');
    } else {
        console.log('Schema is already up to date.');
    }

  } catch (err) {
    console.error('Error updating schema:', err.message);
  } finally {
    await pool.end();
  }
}

checkAndUpdateSchema();
