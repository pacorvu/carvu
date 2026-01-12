const { pool } = require('../../config/db');

// Get all placement drives (with company details)
const getAllDrives = async (req, res) => {
  try {
    const query = `
      SELECT pd.*, c.company_name, c.company_logo_link, c.company_type, s.name as school_name,
             p.name as program_name, sp.name as specialization_name
      FROM placements_drives pd
      LEFT JOIN companies c ON pd.company_id = c.id
      LEFT JOIN schools s ON pd.school_id = s.id
      LEFT JOIN programs p ON pd.program_id = p.id
      LEFT JOIN specializations sp ON pd.specialization_id = sp.id
      ORDER BY pd.event_datetime DESC
    `;
    const result = await pool.query(query);
    
    const enriched = result.rows.map(row => ({
        ...row,
        school: row.school_name, // Map school_name to school for frontend compatibility
        program: row.program_name,
        specialization: row.specialization_name,
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
      SELECT pd.*, c.company_name, c.company_logo_link, c.description as company_description, c.company_type, s.name as school_name,
             p.name as program_name, sp.name as specialization_name
      FROM placements_drives pd
      LEFT JOIN companies c ON pd.company_id = c.id
      LEFT JOIN schools s ON pd.school_id = s.id
      LEFT JOIN programs p ON pd.program_id = p.id
      LEFT JOIN specializations sp ON pd.specialization_id = sp.id
      WHERE pd.id = $1
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Drive not found' });
    }
    
    const row = result.rows[0];
    const enriched = {
        ...row,
        school: row.school_name,
        program: row.program_name,
        specialization: row.specialization_name,
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

// Register for a drive
const registerForDrive = async (req, res) => {
  try {
    const { usn } = req.body; // or from req.user
    const { driveId } = req.body;

    if (req.user.usn !== usn) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check if already registered
    const checkQuery = 'SELECT * FROM student_placement_process WHERE usn = $1 AND placement_drive_id = $2';
    const checkResult = await pool.query(checkQuery, [usn, driveId]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ error: 'Already registered' });
    }

    // Insert registration
    const insertQuery = `
      INSERT INTO student_placement_process (
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

// Create a new placement drive
const createDrive = async (req, res) => {
  try {
    const {
      company_id,
      tpo,
      year,
      school_id,
      program_id,
      specialization_id,
      job_description,
      job_type,
      job_location,
      ctc_structure,
      stipend_structure,
      eligibility_academics,
      event_datetime,
      last_date_to_registration,
      type_of_hiring,
      number_of_openings,
      placement_status,
      company_remarks,
      institution_id
    } = req.body;

    const query = `
      INSERT INTO placements_drives (
        company_id, tpo, year, school_id, program_id, specialization_id,
        job_description, job_type, job_location, ctc_structure, stipend_structure,
        eligibility_academics, event_datetime, last_date_to_registration,
        type_of_hiring, number_of_openings, placement_status, company_remarks,
        institution_id, number_of_registrations, offer_letter_status, no_shortlisted
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, 0, 'Pending', 0
      ) RETURNING *
    `;

    const values = [
      company_id, tpo, year, school_id, program_id, specialization_id,
      job_description, job_type, job_location, ctc_structure, stipend_structure,
      eligibility_academics, event_datetime, last_date_to_registration,
      type_of_hiring, number_of_openings, placement_status, company_remarks,
      institution_id
    ];

    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update a placement drive
const updateDrive = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      company_id,
      tpo,
      year,
      school_id,
      program_id,
      specialization_id,
      job_description,
      job_type,
      job_location,
      ctc_structure,
      stipend_structure,
      eligibility_academics,
      event_datetime,
      last_date_to_registration,
      type_of_hiring,
      number_of_openings,
      placement_status,
      company_remarks,
      institution_id
    } = req.body;

    const query = `
      UPDATE placements_drives SET
        company_id = COALESCE($1, company_id),
        tpo = COALESCE($2, tpo),
        year = COALESCE($3, year),
        school_id = COALESCE($4, school_id),
        program_id = COALESCE($5, program_id),
        specialization_id = COALESCE($6, specialization_id),
        job_description = COALESCE($7, job_description),
        job_type = COALESCE($8, job_type),
        job_location = COALESCE($9, job_location),
        ctc_structure = COALESCE($10, ctc_structure),
        stipend_structure = COALESCE($11, stipend_structure),
        eligibility_academics = COALESCE($12, eligibility_academics),
        event_datetime = COALESCE($13, event_datetime),
        last_date_to_registration = COALESCE($14, last_date_to_registration),
        type_of_hiring = COALESCE($15, type_of_hiring),
        number_of_openings = COALESCE($16, number_of_openings),
        placement_status = COALESCE($17, placement_status),
        company_remarks = COALESCE($18, company_remarks),
        institution_id = COALESCE($19, institution_id),
        updated_at = NOW()
      WHERE id = $20
      RETURNING *
    `;

    const values = [
      company_id, tpo, year, school_id, program_id, specialization_id,
      job_description, job_type, job_location, ctc_structure, stipend_structure,
      eligibility_academics, event_datetime, last_date_to_registration,
      type_of_hiring, number_of_openings, placement_status, company_remarks,
      institution_id,
      id
    ];

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Drive not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getAllDrives,
  getDriveById,
  registerForDrive,
  createDrive,
  updateDrive
};
