const { pool } = require('../config/db');

// Get all companies
const getAllCompanies = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM companies ORDER BY company_name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get company by ID
const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM companies WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all placement drives (with company details)
const getAllDrives = async (req, res) => {
  try {
    const query = `
      SELECT pd.*, c.company_name, c.company_logo_link, c.company_type
      FROM placements_drives pd
      LEFT JOIN companies c ON pd.company_id = c.id
      ORDER BY pd.event_datetime DESC
    `;
    const result = await pool.query(query);
    
    const enriched = result.rows.map(row => ({
        ...row,
        company: {
            company_name: row.company_name,
            company_logo_link: row.company_logo_link,
            company_type: row.company_type
        }
    }));
    
    res.json(enriched);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get drive by ID
const getDriveById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT pd.*, c.company_name, c.company_logo_link, c.description as company_description, c.company_type
      FROM placements_drives pd
      LEFT JOIN companies c ON pd.company_id = c.id
      WHERE pd.id = $1
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Drive not found' });
    }
    
    const row = result.rows[0];
    const enriched = {
        ...row,
        company: {
            company_name: row.company_name,
            company_logo_link: row.company_logo_link,
            description: row.company_description,
            company_type: row.company_type
        }
    };
    
    res.json(enriched);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get student process (applications)
const getStudentProcess = async (req, res) => {
  try {
    const { usn } = req.params;
    
    // Authorization check
    if (req.user.usn !== usn && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const query = `
      SELECT p.*, pd.job_type, pd.event_datetime, c.company_name, c.company_logo_link
      FROM process p
      JOIN placements_drives pd ON p.placement_drive_id = pd.id
      LEFT JOIN companies c ON pd.company_id = c.id
      WHERE p.usn = $1
      ORDER BY p.created_at DESC
    `;
    const result = await pool.query(query, [usn]);
    
    // Map result to match frontend expectations if necessary
    // Frontend expects: drive object, company object inside
    const enriched = result.rows.map(row => ({
      ...row,
      drive: {
        id: row.placement_drive_id,
        job_type: row.job_type,
        event_datetime: row.event_datetime
      },
      company: {
        company_name: row.company_name,
        company_logo_link: row.company_logo_link
      }
    }));

    res.json(enriched);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Register for a drive
const registerForDrive = async (req, res) => {
  try {
    const { usn } = req.body; // or from req.user
    const { driveId } = req.body;

    if (req.user.usn !== usn) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check if already registered
    const checkQuery = 'SELECT * FROM process WHERE usn = $1 AND placement_drive_id = $2';
    const checkResult = await pool.query(checkQuery, [usn, driveId]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ error: 'Already registered' });
    }

    // Insert registration
    const insertQuery = `
      INSERT INTO process (
        placement_drive_id, usn, registration_status, 
        approved_status, oa_status, gd_status, technical_round_status, 
        interview_status, hr_round_status, final_select_status, 
        malpractice, created_at, updated_at
      ) VALUES ($1, $2, 'Registered', 'Pending', 'Pending', 'Pending', 'Pending', 'Pending', 'Pending', 'Pending', false, NOW(), NOW())
      RETURNING *
    `;
    const insertResult = await pool.query(insertQuery, [driveId, usn]);

    // Update drive registration count
    await pool.query('UPDATE placements_drives SET number_of_registrations = COALESCE(number_of_registrations, 0) + 1 WHERE id = $1', [driveId]);

    res.json(insertResult.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get student job offers
const getStudentOffers = async (req, res) => {
  try {
    const { usn } = req.params;
    
    if (req.user.usn !== usn && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const result = await pool.query('SELECT * FROM job_offers WHERE usn = $1', [usn]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getAllCompanies,
  getCompanyById,
  getAllDrives,
  getDriveById,
  getStudentProcess,
  registerForDrive,
  getStudentOffers
};
