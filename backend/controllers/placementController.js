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
      FROM student_placement_process p
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
    const checkQuery = 'SELECT * FROM student_placement_process WHERE usn = $1 AND placement_drive_id = $2';
    const checkResult = await pool.query(checkQuery, [usn, driveId]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ error: 'Already registered' });
    }

    const insertQuery = `
      INSERT INTO student_placement_process (
        placement_drive_id,
        usn,
        is_eligible,
        registration_status,
        approved_status,
        oa_status,
        gd_status,
        technical_round_status,
        interview_status,
        hr_round_status,
        final_select_status,
        malpractice,
        remarks
      ) VALUES (
        $1,
        $2,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL
      )
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

// Get all job offers (Admin)
const getAllJobOffers = async (req, res) => {
  try {
    const query = `
      SELECT 
        jo.*, 
        spd.full_name as student_name, 
        spd.school_name as school,
        c.company_name,
        COALESCE(jo.ctc_min_lpa::text, '-') as ctc
      FROM job_offers jo
      LEFT JOIN students_personal_details spd ON jo.usn = spd.usn
      LEFT JOIN companies c ON jo.company_id = c.id
      ORDER BY jo.created_at DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add Job Offer
const addJobOffer = async (req, res) => {
  try {
    const { 
      usn, 
      company_name, 
      designation, 
      job_type, 
      internship_duration, 
      internship_stipend, 
      ctc_min_lpa, 
      ctc_max_lpa, 
      ctc_variable_pay, 
      offer_letter_status, 
      final_interview_status, 
      remarks 
    } = req.body;

    // Validate USN
    const studentCheck = await pool.query('SELECT usn FROM students_personal_details WHERE usn = $1', [usn]);
    if (studentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Student with this USN not found' });
    }

    // Resolve Company ID
    let companyId = null;
    if (company_name) {
      const companyRes = await pool.query('SELECT id FROM companies WHERE company_name ILIKE $1', [company_name]);
      if (companyRes.rows.length > 0) {
        companyId = companyRes.rows[0].id;
      } else {
        return res.status(404).json({ error: 'Company not found. Please add company first.' });
      }
    }

    const query = `
      INSERT INTO job_offers (
        usn, company_id, designation, job_type, 
        internship_duration, internship_stipend, 
        ctc_min_lpa, ctc_max_lpa, ctc_variable_pay, 
        offer_letter_status, final_interview_status, remarks
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    
    const values = [
      usn, companyId, designation, job_type,
      internship_duration, internship_stipend,
      ctc_min_lpa, ctc_max_lpa, ctc_variable_pay,
      offer_letter_status, final_interview_status, remarks
    ];

    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all students
const getAllStudents = async (req, res) => {
  try {
    const query = `
      SELECT 
        spd.full_name as name,
        spd.usn,
        spd.gender,
        spd.date_of_birth,
        spd.blood_group,
        spd.marital_status,
        spd.specially_abled,
        spd.languages,
        spd.school_name as school,
        spd.year_of_joining,
        spd.profile_image,
        p.name as program,
        s.name as specialization,
        m.name as major,
        mi.name as minor,
         spd.college_email,
         spd.personal_email,
         COALESCE(spd.personal_email, spd.college_email) as email,
         spd.phone_number as contact,
         spd.links,
         
         -- Academics (Latest Snapshot)
         (SELECT academic_year FROM student_semester_academics WHERE usn = spd.usn ORDER BY academic_year DESC, semester DESC LIMIT 1) as latest_academic_year,
         (SELECT semester FROM student_semester_academics WHERE usn = spd.usn ORDER BY academic_year DESC, semester DESC LIMIT 1) as latest_semester,
         (SELECT result_in_sgpa FROM student_semester_academics WHERE usn = spd.usn ORDER BY academic_year DESC, semester DESC LIMIT 1) as latest_sgpa,
         (SELECT SUM(closed_backlogs) FROM student_semester_academics WHERE usn = spd.usn) as closed_backlogs,
         (SELECT SUM(live_backlogs) FROM student_semester_academics WHERE usn = spd.usn) as live_backlogs,
 
         -- Education History (Latest/Highest)
         (SELECT education_level FROM student_education_history WHERE usn = spd.usn ORDER BY year_of_passing DESC LIMIT 1) as highest_education_level,
         (SELECT institute_name FROM student_education_history WHERE usn = spd.usn ORDER BY year_of_passing DESC LIMIT 1) as latest_institute,
         (SELECT year_of_passing FROM student_education_history WHERE usn = spd.usn ORDER BY year_of_passing DESC LIMIT 1) as latest_year_of_passing,
         (SELECT result FROM student_education_history WHERE usn = spd.usn ORDER BY year_of_passing DESC LIMIT 1) as latest_result,
 
         -- Projects
         (SELECT count(*) FROM student_projects WHERE usn = spd.usn) as projects_count,
         (SELECT title FROM student_projects WHERE usn = spd.usn ORDER BY created_at DESC LIMIT 1) as latest_project_title,
 
         -- Internships
         (SELECT count(*) FROM student_internships WHERE usn = spd.usn) as internships_count,
         (SELECT organization FROM student_internships WHERE usn = spd.usn ORDER BY end_date DESC LIMIT 1) as latest_internship_org,
         (SELECT stipend FROM student_internships WHERE usn = spd.usn ORDER BY end_date DESC LIMIT 1) as latest_internship_stipend,
 
         -- Trainings
         (SELECT count(*) FROM student_trainings WHERE usn = spd.usn) as trainings_count,
         (SELECT title FROM student_trainings WHERE usn = spd.usn ORDER BY end_date DESC LIMIT 1) as latest_training_title,
 
         -- Certifications
         (SELECT count(*) FROM student_certifications WHERE usn = spd.usn) as certifications_count,
         (SELECT title FROM student_certifications WHERE usn = spd.usn ORDER BY issue_date DESC LIMIT 1) as latest_certification_title,
 
         -- Publications
         (SELECT count(*) FROM student_publications WHERE usn = spd.usn) as publications_count,
         (SELECT title FROM student_publications WHERE usn = spd.usn ORDER BY publication_date DESC LIMIT 1) as latest_publication_title,
         (SELECT publication_date FROM student_publications WHERE usn = spd.usn ORDER BY publication_date DESC LIMIT 1) as latest_publication_date,

         -- Placement Process (Latest Drive Interaction)
         (SELECT is_eligible FROM student_placement_process WHERE usn = spd.usn ORDER BY created_at DESC LIMIT 1) as is_eligible,
         (SELECT registration_status FROM student_placement_process WHERE usn = spd.usn ORDER BY created_at DESC LIMIT 1) as registration_status,
         (SELECT approved_status FROM student_placement_process WHERE usn = spd.usn ORDER BY created_at DESC LIMIT 1) as approved_status,
         (SELECT oa_status FROM student_placement_process WHERE usn = spd.usn ORDER BY created_at DESC LIMIT 1) as oa_status,
         (SELECT gd_status FROM student_placement_process WHERE usn = spd.usn ORDER BY created_at DESC LIMIT 1) as gd_status,
         (SELECT technical_round_status FROM student_placement_process WHERE usn = spd.usn ORDER BY created_at DESC LIMIT 1) as technical_round_status,
         (SELECT interview_status FROM student_placement_process WHERE usn = spd.usn ORDER BY created_at DESC LIMIT 1) as interview_status,
         (SELECT hr_round_status FROM student_placement_process WHERE usn = spd.usn ORDER BY created_at DESC LIMIT 1) as hr_round_status,
         (SELECT final_select_status FROM student_placement_process WHERE usn = spd.usn ORDER BY created_at DESC LIMIT 1) as final_select_status,
 
         -- Job Offers
         (SELECT c.company_name FROM job_offers jo LEFT JOIN companies c ON jo.company_id = c.id WHERE jo.usn = spd.usn ORDER BY jo.created_at DESC LIMIT 1) as offer_company_name,
         (SELECT job_type FROM job_offers WHERE usn = spd.usn ORDER BY created_at DESC LIMIT 1) as offer_job_type,
         (SELECT designation FROM job_offers WHERE usn = spd.usn ORDER BY created_at DESC LIMIT 1) as offer_designation,
         (SELECT offer_letter_status FROM job_offers WHERE usn = spd.usn ORDER BY created_at DESC LIMIT 1) as offer_letter_status,
         (SELECT ctc_min_lpa FROM job_offers WHERE usn = spd.usn ORDER BY created_at DESC LIMIT 1) as ctc_min_lpa,
         (SELECT ctc_max_lpa FROM job_offers WHERE usn = spd.usn ORDER BY created_at DESC LIMIT 1) as ctc_max_lpa,

        -- Placement Summary Object (for existing frontend compatibility)
        (
          SELECT json_build_object(
            'company_name', c.company_name,
            'company_id', c.id
          )
          FROM job_offers jo
          LEFT JOIN companies c ON jo.company_id = c.id
          WHERE jo.usn = spd.usn
          ORDER BY jo.created_at DESC
          LIMIT 1
        ) as placement

      FROM students_personal_details spd
      LEFT JOIN programs p ON spd.program_id = p.id
      LEFT JOIN specializations s ON spd.specialization_id = s.id
      LEFT JOIN majors m ON spd.major_id = m.id
      LEFT JOIN minors mi ON spd.minor_id = mi.id
      ORDER BY spd.usn ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all users (Admin)
const getAllUsers = async (req, res) => {
  try {
    const query = `
      SELECT 
        ul.id, 
        COALESCE(spd.full_name, split_part(COALESCE(ul.mail, ul.email), '@', 1)) as name,
        COALESCE(ul.mail, ul.email) as email,
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
  getAllCompanies,
  getCompanyById,
  getAllDrives,
  getDriveById,
  getStudentProcess,
  registerForDrive,
  getStudentOffers,
  getAllJobOffers,
  addJobOffer,
  getAllStudents,
  getAllUsers
};
