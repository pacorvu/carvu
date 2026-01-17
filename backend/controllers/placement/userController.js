const { pool } = require('../../config/db');

// Get all users (Admin)
const getAllUsers = async (req, res) => {
  try {
    const query = `
      SELECT 
        ul.id,
        COALESCE(spd.full_name, split_part(ul.mail, '@', 1)) as name,
        ul.mail as email,
        r.name as role,
        ul.created_at,
        ul.usn
      FROM user_login ul
      LEFT JOIN roles r ON ul.role_id = r.id
      LEFT JOIN students_personal_details spd ON ul.usn = spd.usn
      ORDER BY ul.created_at DESC
    `;
    const result = await pool.query(query);
    
    // Map DB roles to Frontend roles/stakeholders if needed, 
    // but sending raw data is better, let frontend handle display logic.
    // However, we can add a helper field for stakeholder to make frontend easier.
    const users = result.rows.map(user => {
      let stakeholder = 'Other';
      const role = user.role;
      
      if (['sudo_admin', 'placement_director', 'placement_officers', 'admin_viewer'].includes(role)) {
        stakeholder = 'Placement Team';
      } else if (role === 'student') {
        stakeholder = 'Students';
      } else if (role === 'alumni') {
        stakeholder = 'Alumni';
      } else if (role === 'company') {
        stakeholder = 'Company Reps';
      } else if (['school_dean', 'spc_core', 'spc_school'].includes(role)) {
        stakeholder = 'Placement Team'; // Or new category
      }
      
      return { ...user, stakeholder };
    });

    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getAllUsers
};
