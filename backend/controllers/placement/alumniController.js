const { pool } = require('../../config/db');
const nodemailer = require('nodemailer');

// Helper to send email notification
const sendNotification = async (email, message) => {
    const smtpUser = String(process.env.SMTP_EMAIL || '').toLowerCase().trim();
    const smtpPass = String(process.env.SMTP_PASSWORD || '').trim();
    const host = String(process.env.SMTP_HOST || 'smtp.gmail.com').trim();
    const port = Number(process.env.SMTP_PORT || 587);
    
    if (!smtpUser || !smtpPass) {
        console.log(`[DEV] Would send email to ${email}: ${message}`);
        return;
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: false,
      auth: { user: smtpUser, pass: smtpPass }
    });
    
    await transporter.sendMail({
      from: smtpUser,
      to: email,
      subject: 'Welcome to Alumni Network - RVU',
      text: message,
      html: `<p>${message.replace(/\n/g, '<br>')}</p>`
    });
};

// Get all alumni
const getAllAlumni = async (req, res) => {
  try {
    const query = `
      SELECT * FROM alumni ORDER BY graduation_year DESC, full_name ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching alumni:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add new alumni
const addAlumni = async (req, res) => {
  const {
    usn,
    full_name,
    graduation_year,
    current_company,
    current_designation,
    current_work_location,
    personal_email,
    phone_number,
    linkedin,
    other_links
  } = req.body;

  try {
    // Check if alumni already exists
    const checkQuery = 'SELECT * FROM alumni WHERE usn = $1';
    const checkResult = await pool.query(checkQuery, [usn]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ error: 'Alumni with this USN already exists' });
    }

    const query = `
      INSERT INTO alumni (
        usn,
        full_name,
        graduation_year,
        current_company,
        current_designation,
        current_work_location,
        personal_email,
        phone_number,
        linkedin,
        other_links
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const values = [
      usn,
      full_name,
      graduation_year,
      current_company,
      current_designation,
      current_work_location,
      personal_email,
      phone_number,
      linkedin,
      other_links ? JSON.stringify(other_links) : null
    ];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding alumni:', err.message);
    if (err.constraint === 'fk_alumni_student') {
        return res.status(400).json({ error: 'USN must exist in student records first' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// Get alumni by USN
const getAlumniByUsn = async (req, res) => {
    try {
        const { usn } = req.params;
        const query = 'SELECT * FROM alumni WHERE usn = $1';
        const result = await pool.query(query, [usn]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Alumni not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching alumni details:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get students eligible for alumni promotion
const getEligibleForPromotion = async (req, res) => {
  try {
    const query = `
      SELECT 
        s.usn, 
        s.full_name, 
        s.school_name, 
        p.name as program_name, 
        s.year_of_joining,
        p.min_duration_years,
        (s.year_of_joining + p.min_duration_years) as expected_grad_year,
        s.personal_email,
        s.college_email,
        s.phone_number,
        (SELECT COUNT(*) FROM offers o WHERE o.usn = s.usn) as offer_count,
        (SELECT COUNT(*) FROM placement pl WHERE pl.usn = s.usn) as placement_count
      FROM students_personal_details s
      JOIN programs p ON s.program_id = p.id
      LEFT JOIN alumni a ON s.usn = a.usn
      WHERE 
        a.usn IS NULL 
        AND (
          (s.year_of_joining + p.min_duration_years) < EXTRACT(YEAR FROM CURRENT_DATE)
          OR (
            (s.year_of_joining + p.min_duration_years) = EXTRACT(YEAR FROM CURRENT_DATE)
            AND EXTRACT(MONTH FROM CURRENT_DATE) >= 7
          )
        )
      ORDER BY expected_grad_year ASC, s.usn ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching eligible alumni:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Promote students to alumni
const promoteStudents = async (req, res) => {
  console.log('Promote Alumni Payload:', JSON.stringify(req.body, null, 2));
  const { students, message, graduationYear } = req.body; // students is array of { usn }
  
  if (!students || !Array.isArray(students) || students.length === 0) {
      console.log('Validation Failed:', { students, isArray: Array.isArray(students), length: students?.length });
      return res.status(400).json({ error: "No students selected for promotion" });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const results = [];
    const errors = [];
    const currentYear = new Date().getFullYear();

    // Get Role IDs
    const alumniRoleRes = await client.query("SELECT id FROM roles WHERE LOWER(name)='alumni'");
    // const studentRoleRes = await client.query("SELECT id FROM roles WHERE LOWER(name)='student'");
    
    if (!alumniRoleRes.rows.length) throw new Error("Alumni role not found in database");
    const alumniRoleId = alumniRoleRes.rows[0].id;
    // const studentRoleId = studentRoleRes.rows[0]?.id; // Not strictly needed if we just grab any login for the USN

    for (const student of students) {
        const { usn } = student;
        try {
            // 1. Fetch Student Details
            const studentDetailsRes = await client.query('SELECT * FROM students_personal_details WHERE usn = $1', [usn]);
            if (!studentDetailsRes.rows.length) throw new Error(`Student ${usn} not found`);
            const studentData = studentDetailsRes.rows[0];
            const personalEmail = studentData.personal_email;

            if (!personalEmail) throw new Error(`No personal email found for ${usn}`);

            // 2. Get existing password hash from ANY existing login for this USN
            const loginRes = await client.query(`SELECT password_hash FROM user_login WHERE usn = $1 LIMIT 1`, [usn]);
            
            if (!loginRes.rows.length) {
                throw new Error(`No existing login/password found for ${usn}`);
            }
            const passwordHash = loginRes.rows[0].password_hash;

            // 3. Convert Existing Logins to Alumni Role and Update Email
            // We update the existing record since USN is unique in user_login
            await client.query(
                'UPDATE user_login SET role_id = $1, mail = $3 WHERE usn = $2', 
                [alumniRoleId, usn, personalEmail]
            );

            /* 
            // Previous logic tried to insert a new row, but USN is unique
            const existingPersonalLogin = await client.query('SELECT id FROM user_login WHERE mail = $1', [personalEmail]);
            
            if (!existingPersonalLogin.rows.length) {
                 await client.query(
                    'INSERT INTO user_login (usn, mail, role_id, password_hash, is_active) VALUES ($1, $2, $3, $4, true)',
                    [usn, personalEmail, alumniRoleId, passwordHash]
                );
            } else {
                // If login already exists for personal email, ensure it has alumni role
                await client.query('UPDATE user_login SET role_id = $1 WHERE mail = $2', [alumniRoleId, personalEmail]);
            }
            */

            // 5. Add to Alumni Table
            const alumniCheck = await client.query('SELECT usn FROM alumni WHERE usn = $1', [usn]);
            if (!alumniCheck.rows.length) {
                 // Try to find placement info (latest placement record)
                 const placementRes = await client.query(`
                    SELECT company_name, designation 
                    FROM placement 
                    WHERE usn = $1 
                    ORDER BY created_at DESC LIMIT 1`, [usn]);
                 
                 const company = placementRes.rows[0]?.company_name || '';
                 const designation = placementRes.rows[0]?.designation || '';

                 await client.query(`
                    INSERT INTO alumni (
                        usn, full_name, graduation_year, personal_email, phone_number, 
                        current_company, current_designation, linkedin
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 `, [
                    usn, 
                    studentData.full_name, 
                    graduationYear || currentYear,
                    personalEmail,
                    studentData.phone_number,
                    company,
                    designation,
                    studentData.links?.linkedin || ''
                 ]);
            }

            results.push(usn);
            
            // Send Email Notification if message is provided
            if (message && personalEmail) {
                try {
                    await sendNotification(personalEmail, message);
                } catch (emailErr) {
                    console.error(`Failed to send email to ${personalEmail}:`, emailErr.message);
                    // Don't fail the promotion if email fails, just log it
                }
            }

        } catch (err) {
            console.error(`Error promoting ${usn}:`, err.message);
            errors.push({ usn, error: err.message });
        }
    }

    await client.query('COMMIT');
    res.json({ 
        message: `Processed ${students.length} students`, 
        successCount: results.length, 
        failureCount: errors.length,
        results, 
        errors 
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Promote students error:', err.message);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
};

// Generate Registration Code
const generateRegistrationCode = async (req, res) => {
    const { batch_year, institution_name, remarks, max_uses } = req.body;
    
    try {
        const crypto = require('crypto');
        // Generate a random code: ALUM-<YEAR>-<RANDOM>
        const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
        const code = `ALUM-${batch_year}-${randomPart}`; 

        const query = `
            INSERT INTO alumni_registration_codes (code, batch_year, institution_name, remarks, max_uses)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const result = await pool.query(query, [code, batch_year, institution_name, remarks, max_uses || 0]); // 0 means unlimited
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error generating code:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get Registration Codes
const getRegistrationCodes = async (req, res) => {
    try {
        const query = 'SELECT * FROM alumni_registration_codes ORDER BY created_at DESC';
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching codes:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// Deactivate Code
const deleteRegistrationCode = async (req, res) => {
    const { id } = req.params;
    try {
        // We do a soft delete by setting is_active to false
        const query = 'UPDATE alumni_registration_codes SET is_active = false WHERE id = $1 RETURNING *';
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Code not found' });
        res.json({ message: 'Code deactivated successfully', code: result.rows[0] });
    } catch (err) {
        console.error('Error deleting code:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
  getAllAlumni,
  addAlumni,
  getAlumniByUsn,
  promoteStudents,
  getEligibleForPromotion,
  generateRegistrationCode,
  getRegistrationCodes,
  deleteRegistrationCode
};
