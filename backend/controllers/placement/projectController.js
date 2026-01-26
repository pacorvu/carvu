const { pool } = require('../../config/db');

// Get all student projects
const getAllProjects = async (req, res) => {
  try {
    const { rated, limit } = req.query;
    
    let query = `
      SELECT p.*, s.full_name as student_name, pr.name as branch, s.profile_image as student_image
      FROM student_projects p
      LEFT JOIN students_personal_details s ON p.usn = s.usn
      LEFT JOIN programs pr ON s.program_id = pr.id
    `;
    
    const params = [];
    const conditions = [];

    // Filter by rated (for alumni view)
    if (rated === 'true') {
        conditions.push(`(p.admin_rating IS NOT NULL AND p.admin_rating > 0)`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    // Default sort by created_at desc, but we can also add sorts for likes/views
    query += ` ORDER BY p.created_at DESC`;

    if (limit) {
        query += ` LIMIT $${params.length + 1}`;
        params.push(parseInt(limit));
    }

    const result = await pool.query(query, params);
    
    // Transform data to match frontend expectations
    const transformedProjects = result.rows.map(project => ({
        ...project,
        // Map DB columns to frontend keys if they differ
        // DB has 'skills' (array) or 'technologies' (text/array)
        // We prefer 'technologies' if available, else 'skills'
        technologies: project.technologies || project.skills || [],
        
        // DB has 'snaps' (text) or 'project_snaps' (array)
        // If project_snaps is null, try parsing snaps
        project_snaps: project.project_snaps || (project.snaps ? (typeof project.snaps === 'string' && project.snaps.startsWith('[') ? JSON.parse(project.snaps) : [project.snaps]) : []),
        
        // Map links
        hosted_link: project.hosted_link || project.project_link,
        github_repo: project.github_repo || project.github_link,
        
        // Ensure stats are numbers
        views: parseInt(project.views || 0),
        likes: parseInt(project.likes || 0),
        downloads: parseInt(project.downloads || 0),
        admin_rating: project.admin_rating ? parseInt(project.admin_rating) : null
    }));

    res.json(transformedProjects);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Rate a project
const rateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, feedback } = req.body;

        if (!rating) {
            return res.status(400).json({ error: 'Rating is required' });
        }

        const query = `
            UPDATE student_projects
            SET admin_rating = $1, admin_feedback = $2
            WHERE id = $3
            RETURNING *
        `;
        
        const result = await pool.query(query, [rating, feedback, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getAllProjects,
    rateProject
};
