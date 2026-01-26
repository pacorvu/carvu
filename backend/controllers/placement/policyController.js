
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

// Helper to promote a batch of students to alumni
const promoteBatchToAlumni = async (client, joining_year, program_id) => {
    console.log(`Starting batch promotion for Year: ${joining_year}, Program ID: ${program_id}`);
    
    // 1. Get Eligible Students in this batch
    // We only select students who are NOT already in alumni table
    // And belong to the specific batch (joining_year + program_id)
    const studentsQuery = `
      SELECT s.usn, s.full_name, s.personal_email, s.phone_number, s.links
      FROM students_personal_details s
      LEFT JOIN alumni a ON s.usn = a.usn
      WHERE s.year_of_joining = $1 
        AND s.program_id = $2
        AND a.usn IS NULL
    `;
    
    const studentsRes = await client.query(studentsQuery, [joining_year, program_id]);
    const students = studentsRes.rows;
    
    if (students.length === 0) {
        console.log('No new students to promote in this batch.');
        return { successCount: 0, failureCount: 0, errors: [] };
    }

    // 2. Get Alumni Role ID
    const alumniRoleRes = await client.query("SELECT id FROM roles WHERE LOWER(name)='alumni'");
    if (!alumniRoleRes.rows.length) throw new Error("Alumni role not found in database");
    const alumniRoleId = alumniRoleRes.rows[0].id;

    const currentYear = new Date().getFullYear();
    const results = [];
    const errors = [];
    const message = "Congratulations on your graduation! You have been added to the Alumni Network.";

    for (const student of students) {
        const { usn, full_name, personal_email, phone_number, links } = student;
        
        try {
            if (!personal_email) throw new Error(`No personal email found for ${usn}`);

            // 3. Get existing password hash (USN is unique in user_login)
            const loginRes = await client.query(`SELECT password_hash FROM user_login WHERE usn = $1 LIMIT 1`, [usn]);
            
            if (!loginRes.rows.length) {
                // If no login exists, we skip role update but maybe should log it?
                // For now, assume student must have a login to be promoted properly as user
                console.warn(`No existing login found for ${usn}, skipping role update.`);
            } else {
                 // 4. Update Role to Alumni
                 await client.query(
                    'UPDATE user_login SET role_id = $1, mail = $3 WHERE usn = $2', 
                    [alumniRoleId, usn, personal_email]
                );
            }

            // 5. Add to Alumni Table
            // Fetch placement info for defaults
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
                full_name, 
                currentYear, // Default to current year as graduation year
                personal_email,
                phone_number,
                company,
                designation,
                links?.linkedin || ''
            ]);

            results.push(usn);

            // 6. Send Email (non-blocking)
            if (personal_email) {
                sendNotification(personal_email, message).catch(err => 
                    console.error(`Failed to send email to ${personal_email}:`, err.message)
                );
            }

        } catch (err) {
            console.error(`Error promoting ${usn}:`, err.message);
            errors.push({ usn, error: err.message });
        }
    }

    return { 
        successCount: results.length, 
        failureCount: errors.length, 
        errors 
    };
};

// Get all policies
const getAllPolicies = async (req, res) => {
  try {
    // We need to join with schools and programs to get names
    const query = `
      SELECT p.*, s.name as school_name, pr.name as program_name 
      FROM batch_academic_policies p
      JOIN schools s ON p.school_id = s.id
      JOIN programs pr ON p.program_id = pr.id
      ORDER BY p.joining_year DESC, s.name ASC, pr.name ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create or Update Policy (Upsert) AND Apply to Students
const upsertPolicy = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { 
      joining_year, 
      school_id, 
      program_id, 
      summer_immersion, 
      summer_internship, 
      capstone, 
      placement, 
      alumni,
      remarks 
    } = req.body;

    // Basic validation
    if (!joining_year || !school_id || !program_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if alumni is being toggled ON
    // We can check previous state if needed, but since we promote only those NOT in alumni table,
    // running it multiple times is safe (idempotent-ish).
    // However, we only run promotion if alumni=true in the request.

    const query = `
      INSERT INTO batch_academic_policies (
        joining_year, school_id, program_id, 
        summer_immersion, summer_internship, capstone, placement, alumni, remarks
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (joining_year, school_id, program_id) 
      DO UPDATE SET 
        summer_immersion = EXCLUDED.summer_immersion,
        summer_internship = EXCLUDED.summer_internship,
        capstone = EXCLUDED.capstone,
        placement = EXCLUDED.placement,
        alumni = EXCLUDED.alumni,
        remarks = EXCLUDED.remarks,
        created_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const values = [
      joining_year, school_id, program_id, 
      summer_immersion || false, 
      summer_internship || false, 
      capstone || false, 
      placement || false, 
      alumni || false,
      remarks
    ];

    const result = await client.query(query, values);
    const policy = result.rows[0];

    // Automatically apply eligibility rules to all students in this batch/program
    const updateStudentsQuery = `
      UPDATE students_personal_details
      SET 
        is_eligible_internship = $1,
        is_eligible_immersion = $2,
        is_eligible_capstone = $3,
        is_eligible_placement = $4
      WHERE 
        year_of_joining = $5
        AND program_id = $6
    `;
    
    await client.query(updateStudentsQuery, [
      policy.summer_internship,
      policy.summer_immersion,
      policy.capstone,
      policy.placement,
      policy.joining_year,
      policy.program_id
    ]);

    // TRIGGER ALUMNI PROMOTION IF ENABLED
    let promotionStats = null;
    if (policy.alumni) {
        promotionStats = await promoteBatchToAlumni(client, policy.joining_year, policy.program_id);
    }

    await client.query('COMMIT');
    res.json({ ...policy, promotionStats });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
};

// Apply policy to students (Bulk Update)
const applyPolicyToStudents = async (req, res) => {
  try {
    const { id } = req.params; // Policy ID

    // First get the policy
    const policyRes = await pool.query('SELECT * FROM batch_academic_policies WHERE id = $1', [id]);
    if (policyRes.rows.length === 0) {
      return res.status(404).json({ error: 'Policy not found' });
    }
    const policy = policyRes.rows[0];

    // Update students matching program and joining_year
    const updateQuery = `
      UPDATE students_personal_details
      SET 
        is_eligible_internship = $1,
        is_eligible_immersion = $2,
        is_eligible_capstone = $3,
        is_eligible_placement = $4
      WHERE 
        year_of_joining = $5
        AND program_id = $6
    `;
    
    const result = await pool.query(updateQuery, [
      policy.summer_internship,
      policy.summer_immersion,
      policy.capstone,
      policy.placement,
      policy.joining_year,
      policy.program_id
    ]);

    res.json({ message: `Policy applied to ${result.rowCount} students` });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Sync policies (Auto-generate for all programs/years)
const syncPolicies = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Get all distinct joining years from students
    // We only care about years that actually have students
    const yearsRes = await client.query(
      'SELECT DISTINCT year_of_joining FROM students_personal_details WHERE year_of_joining IS NOT NULL ORDER BY year_of_joining'
    );
    const years = yearsRes.rows.map(r => r.year_of_joining);

    // 2. Get all schools to map name -> id
    const schoolsRes = await client.query('SELECT id, name FROM schools');
    const schoolMap = {}; // name -> id
    schoolsRes.rows.forEach(s => { schoolMap[s.name] = s.id; });

    // 3. Get all programs
    const programsRes = await client.query('SELECT id, school_name FROM programs');
    
    let addedCount = 0;

    for (const year of years) {
      for (const program of programsRes.rows) {
        const schoolId = schoolMap[program.school_name];
        if (!schoolId) continue; // Skip if school not found

        // Insert if not exists with default false
        const insertQuery = `
          INSERT INTO batch_academic_policies 
            (joining_year, school_id, program_id, summer_immersion, summer_internship, capstone, placement, alumni)
          VALUES ($1, $2, $3, false, false, false, false, false)
          ON CONFLICT (joining_year, school_id, program_id) DO NOTHING
        `;
        const res = await client.query(insertQuery, [year, schoolId, program.id]);
        addedCount += res.rowCount;
      }
    }

    await client.query('COMMIT');
    res.json({ message: `Synced policies. Added ${addedCount} new policies.` });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Sync failed' });
  } finally {
    client.release();
  }
};

module.exports = {
  getAllPolicies,
  upsertPolicy,
  applyPolicyToStudents,
  syncPolicies
};
