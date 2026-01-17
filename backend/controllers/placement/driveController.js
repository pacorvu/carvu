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

    // Authorization Check
    const isOwner = req.user.usn === usn;
    
    // Allow admins/placement officers to register students
    let userRole = req.user.role_name || req.user.role;
    let roleId = req.user.role_id;

    console.log(`[RegisterDrive] User: ${req.user.usn}, RoleID: ${roleId}, RoleName: ${userRole}, TargetUSN: ${usn}`);

    // If role name is missing or we want to be sure, fetch from DB
    if (roleId) {
        try {
            const roleRes = await pool.query('SELECT name FROM roles WHERE id = $1', [roleId]);
            if (roleRes.rows.length > 0) {
                const dbRoleName = roleRes.rows[0].name;
                // If token role is missing or different, use DB role
                if (!userRole || userRole !== dbRoleName) {
                    console.log(`[RegisterDrive] Role name corrected from '${userRole}' to '${dbRoleName}'`);
                    userRole = dbRoleName;
                }
            }
        } catch (e) {
            console.error('[RegisterDrive] Error fetching role name:', e);
        }
    }

    // Normalize role for comparison
    const normalizedRole = String(userRole || '').toLowerCase().trim();
    const isAdmin = ['admin', 'superadmin', 'sudo_admin', 'placement_officer', 'placement officer'].includes(normalizedRole);

    if (!isOwner && !isAdmin) {
      console.warn(`[RegisterDrive] Authorization failed. USN: ${req.user.usn}, Role: ${normalizedRole}, IsOwner: ${isOwner}, IsAdmin: ${isAdmin}`);
      return res.status(403).json({ error: 'Unauthorized', details: `User role '${userRole}' is not authorized to register others.` });
    }

    // Check if a process record already exists for this student and drive
    const checkQuery = 'SELECT * FROM student_placement_process WHERE usn = $1 AND placement_drive_id = $2';
    const checkResult = await pool.query(checkQuery, [usn, driveId]);

    const registrationStatus = 'Registered';

    if (checkResult.rows.length > 0) {
      const existing = checkResult.rows[0];
      const existingStatusRaw = existing.registration_status;
      const existingStatus = existingStatusRaw ? String(existingStatusRaw).toLowerCase() : '';
      const alreadyRegistered =
        !!existingStatus && existingStatus !== 'false' && existingStatus !== 'not registered';

      if (alreadyRegistered) {
        return res.status(400).json({ error: 'Already registered' });
      }

      const updateQuery = `
        UPDATE student_placement_process
        SET registration_status = $3, updated_at = NOW()
        WHERE placement_drive_id = $1 AND usn = $2
        RETURNING *
      `;
      const updateResult = await pool.query(updateQuery, [driveId, usn, registrationStatus]);
      const updatedRow = updateResult.rows[0];

      if (!existingStatus || existingStatus === 'false' || existingStatus === 'not registered') {
        await pool.query(
          'UPDATE placements_drives SET number_of_registrations = COALESCE(number_of_registrations, 0) + 1 WHERE id = $1',
          [driveId]
        );
      }

      return res.json(updatedRow);
    }

    const insertQuery = `
      INSERT INTO student_placement_process (
        placement_drive_id,
        usn,
        registration_status
      ) VALUES ($1, $2, $3)
      RETURNING *
    `;
    const insertResult = await pool.query(insertQuery, [driveId, usn, registrationStatus]);

    await pool.query(
      'UPDATE placements_drives SET number_of_registrations = COALESCE(number_of_registrations, 0) + 1 WHERE id = $1',
      [driveId]
    );

    res.json(insertResult.rows[0]);
  } catch (err) {
    console.error('[RegisterDrive] Error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
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
      process_rounds,
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
        type_of_hiring, process_rounds, number_of_openings, placement_status, company_remarks,
        institution_id, number_of_registrations, offer_letter_status, no_shortlisted
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, 0, 'Pending', 0
      ) RETURNING *
    `;

    const values = [
      company_id, tpo, year, school_id, program_id, specialization_id,
      job_description, job_type, job_location, ctc_structure, stipend_structure,
      eligibility_academics, event_datetime, last_date_to_registration,
      type_of_hiring, process_rounds, number_of_openings, placement_status, company_remarks,
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
      process_rounds,
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
        process_rounds = COALESCE($16, process_rounds),
        number_of_openings = COALESCE($17, number_of_openings),
        placement_status = COALESCE($18, placement_status),
        company_remarks = COALESCE($19, company_remarks),
        institution_id = COALESCE($20, institution_id),
        updated_at = NOW()
      WHERE id = $21
      RETURNING *
    `;

    const values = [
      company_id, tpo, year, school_id, program_id, specialization_id,
      job_description, job_type, job_location, ctc_structure, stipend_structure,
      eligibility_academics, event_datetime, last_date_to_registration,
      type_of_hiring, process_rounds, number_of_openings, placement_status, company_remarks,
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

// Get all registrations for a drive
const getDriveRegistrations = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        spp.*, 
        spd.full_name as student_name,
        
        -- Academics (Latest Snapshot for filtering)
        (SELECT result_in_sgpa FROM student_semester_academics WHERE usn = spp.usn ORDER BY academic_year DESC, semester DESC LIMIT 1) as latest_cgpa,
        (SELECT live_backlogs FROM student_semester_academics WHERE usn = spp.usn ORDER BY academic_year DESC, semester DESC LIMIT 1) as live_backlogs,
        (SELECT closed_backlogs FROM student_semester_academics WHERE usn = spp.usn ORDER BY academic_year DESC, semester DESC LIMIT 1) as closed_backlogs,
        
        -- Education History (10th/12th/Degree) - often needed for criteria
        (SELECT result FROM student_education_history WHERE usn = spp.usn AND education_level = '10TH' LIMIT 1) as tenth_marks,
        (SELECT result FROM student_education_history WHERE usn = spp.usn AND education_level = '12TH' LIMIT 1) as twelfth_marks

      FROM student_placement_process spp
      LEFT JOIN students_personal_details spd ON spp.usn = spd.usn
      WHERE spp.placement_drive_id = $1
      ORDER BY spp.created_at DESC
    `;
    const result = await pool.query(query, [id]);
    
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getAllDrives,
  getDriveById,
  getDriveRegistrations,
  registerForDrive,
  createDrive,
  updateDrive
};
