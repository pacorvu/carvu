const { pool } = require('../../config/db');

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
        COALESCE(jo.ctc_min_lpa, '-') as ctc
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

module.exports = {
  getStudentProcess,
  getStudentOffers,
  getAllJobOffers,
  addJobOffer
};
