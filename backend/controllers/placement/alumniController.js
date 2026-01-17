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

// Promote students to alumni
const promoteStudents = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { students, message, graduationYear } = req.body; // students is array of { usn }

    const results = [];
    const errors = [];
    const currentYear = new Date().getFullYear();

    // Get Role IDs
    const alumniRoleRes = await client.query("SELECT id FROM roles WHERE name='alumni'");
    const studentRoleRes = await client.query("SELECT id FROM roles WHERE name='student'");
    
    if (!alumniRoleRes.rows.length) throw new Error("Alumni role not found");
    const alumniRoleId = alumniRoleRes.rows[0].id;
    const studentRoleId = studentRoleRes.rows[0]?.id;

    for (const student of students) {
        const { usn } = student;
        try {
            // 1. Fetch Student Details
            const studentDetailsRes = await client.query('SELECT * FROM students_personal_details WHERE usn = $1', [usn]);
            if (!studentDetailsRes.rows.length) throw new Error(`Student ${usn} not found`);
            const studentData = studentDetailsRes.rows[0];
            const personalEmail = studentData.personal_email;

            if (!personalEmail) throw new Error(`No personal email found for ${usn}`);

            // 2. Get existing password hash from student login
            let passwordHash = null;
            if (studentRoleId) {
                const loginRes = await client.query(`SELECT password_hash FROM user_login WHERE usn = $1 AND role_id = $2`, [usn, studentRoleId]);
                if (loginRes.rows.length) {
                    passwordHash = loginRes.rows[0].password_hash;
                }
            }

            if (!passwordHash) {
                // If no student login/password, we can't reuse it. 
                // Option: Generate random, or fail. 
                // For now, we'll error out as per requirement "same password which they kept as student"
                throw new Error(`No existing student login/password found for ${usn}`);
            }

            // 3. Create Alumni Login (if not exists)
            const existingLogin = await client.query('SELECT id FROM user_login WHERE mail = $1', [personalEmail]);
            if (!existingLogin.rows.length) {
                 await client.query(
                    'INSERT INTO user_login (usn, mail, role_id, password_hash, is_active) VALUES ($1, $2, $3, $4, true)',
                    [usn, personalEmail, alumniRoleId, passwordHash]
                );
            } else {
                // Check if it is already an alumni login?
                const ex = existingLogin.rows[0];
                // Optional: Update role if needed, but risky if it's another user.
                // Assuming uniqueness of personal email.
            }

            // 4. Add to Alumni Table
            const alumniCheck = await client.query('SELECT usn FROM alumni WHERE usn = $1', [usn]);
            if (!alumniCheck.rows.length) {
                 // Try to find placement info (latest job offer)
                 const offerRes = await client.query(`
                    SELECT c.company_name, jo.role 
                    FROM job_offers jo 
                    JOIN companies c ON jo.company_id = c.id 
                    WHERE jo.usn = $1 
                    ORDER BY jo.created_at DESC LIMIT 1`, [usn]);
                 
                 const company = offerRes.rows[0]?.company_name || '';
                 const designation = offerRes.rows[0]?.role || '';

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

module.exports = {
  getAllAlumni,
  addAlumni,
  getAlumniByUsn,
  promoteStudents
};
