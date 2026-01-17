const { pool } = require('../../config/db');

const getStudentProcess = async (req, res) => {
  try {
    const { usn } = req.params;
    const requestedUsn = String(usn || '').toUpperCase();
    const tokenUsn = String(req.user?.usn || '').toUpperCase();

    let rawRole = req.user?.role || req.user?.role_name;
    let userRole = String(rawRole || '').toLowerCase().trim();

    if (!userRole && req.user?.role_id) {
      try {
        const roleRes = await pool.query('select name from roles where id=$1 limit 1', [req.user.role_id]);
        const dbRole = roleRes.rows[0]?.name;
        if (dbRole) {
          rawRole = dbRole;
          userRole = String(dbRole).toLowerCase().trim();
        }
      } catch (e) {
        console.error('getStudentProcess role lookup failed:', e.message);
      }
    }

    const allowedRoles = [
      'admin',
      'superadmin',
      'sudo_admin',
      'placement_director',
      'placement_officers',
      'placement_officer',
      'placement officer',
      'admin_viewer',
      'alumni',
      'company',
      'dean',
      'management',
      'parent'
    ];

    const isOwner = !!tokenUsn && tokenUsn === requestedUsn;
    const isAdmin = allowedRoles.includes(userRole);

    if (!isOwner && !isAdmin) {
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

const getStudentOffers = async (req, res) => {
  try {
    const { usn } = req.params;

    const tokenUsn = String(req.user?.usn || '').toUpperCase();
    const requestedUsn = String(usn || '').toUpperCase();

    let rawRole = req.user?.role || req.user?.role_name;
    let userRole = String(rawRole || '').toLowerCase().trim();

    if (!userRole && req.user?.role_id) {
      try {
        const roleRes = await pool.query('select name from roles where id=$1 limit 1', [req.user.role_id]);
        const dbRole = roleRes.rows[0]?.name;
        if (dbRole) {
          rawRole = dbRole;
          userRole = String(dbRole).toLowerCase().trim();
        }
      } catch (e) {
        console.error('getStudentOffers role lookup failed:', e.message);
      }
    }

    const allowedRoles = [
      'admin',
      'superadmin',
      'sudo_admin',
      'placement_director',
      'placement_officers',
      'placement_officer',
      'placement officer',
      'admin_viewer'
    ];

    const isOwner = !!tokenUsn && tokenUsn === requestedUsn;
    const isAdmin = allowedRoles.includes(userRole);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const check = await pool.query("SELECT to_regclass('public.offers') as tbl");
    const tbl = check.rows[0] && check.rows[0].tbl;
    if (!tbl) {
      return res.json([]);
    }

    const query = `
      SELECT
        o.id,
        o.usn,
        spd.full_name as student_name,
        spd.school_name as school,
        o.job_type,
        o.remarks,
        o.created_at,
        o.company_id,
        c.company_name,
        COALESCE(p.designation, cp.designation) as designation,
        CASE
          WHEN o.job_type IN ('full time', 'internship_cum_full_time') THEN p.ctc_min_lpa
          ELSE NULL
        END as ctc_min_lpa,
        CASE
          WHEN o.job_type IN ('full time', 'internship_cum_full_time') THEN p.ctc_max_lpa
          ELSE NULL
        END as ctc_max_lpa,
        CASE
          WHEN o.job_type IN ('full time', 'internship_cum_full_time') THEN p.ctc_variable_pay
          ELSE NULL
        END as ctc_variable_pay,
        CASE
          WHEN o.job_type IN ('internship', 'internship_cum_full_time') THEN cp.internship_duration_months
          ELSE NULL
        END as internship_duration,
        CASE
          WHEN o.job_type IN ('internship', 'internship_cum_full_time') THEN COALESCE(cp.internship_stipend_min, cp.internship_stipend_max)
          ELSE NULL
        END as internship_stipend,
        CASE
          WHEN o.job_type IN ('full time', 'internship_cum_full_time') THEN p.offer_letter_status
          ELSE cp.offer_letter_status
        END as offer_letter_status
      FROM offers o
      LEFT JOIN placement p ON o.placement_id = p.id
      LEFT JOIN capstone cp ON o.capstone_id = cp.id
      LEFT JOIN students_personal_details spd ON o.usn = spd.usn
      LEFT JOIN companies c ON o.company_id = c.id
      WHERE o.usn = $1
      ORDER BY o.created_at DESC
    `;

    const result = await pool.query(query, [usn]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error in getStudentOffers:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const getAllJobOffers = async (req, res) => {
  try {
    const check = await pool.query(
      "SELECT to_regclass('public.offers') as tbl"
    );
    const tbl = check.rows[0] && check.rows[0].tbl;
    if (!tbl) {
      return res.json([]);
    }

    const query = `
      SELECT
        o.id,
        o.usn,
        spd.full_name as student_name,
        spd.school_name as school,
        o.job_type,
        o.remarks,
        o.created_at,
        o.company_id,
        c.company_name,
        COALESCE(p.designation, cp.designation) as designation,
        CASE
          WHEN o.job_type IN ('full time', 'internship_cum_full_time') THEN p.ctc_min_lpa
          ELSE NULL
        END as ctc_min_lpa,
        CASE
          WHEN o.job_type IN ('full time', 'internship_cum_full_time') THEN p.ctc_max_lpa
          ELSE NULL
        END as ctc_max_lpa,
        CASE
          WHEN o.job_type IN ('full time', 'internship_cum_full_time') THEN p.ctc_variable_pay
          ELSE NULL
        END as ctc_variable_pay,
        CASE
          WHEN o.job_type IN ('internship', 'internship_cum_full_time') THEN cp.internship_duration_months
          ELSE NULL
        END as internship_duration,
        CASE
          WHEN o.job_type IN ('internship', 'internship_cum_full_time') THEN COALESCE(cp.internship_stipend_min, cp.internship_stipend_max)
          ELSE NULL
        END as internship_stipend,
        CASE
          WHEN o.job_type IN ('full time', 'internship_cum_full_time') THEN p.offer_letter_status
          ELSE cp.offer_letter_status
        END as offer_letter_status,
        COALESCE(
          p.ctc_max_lpa::text,
          p.ctc_min_lpa::text,
          cp.internship_stipend_max::text,
          cp.internship_stipend_min::text,
          '-'
        ) as ctc
      FROM offers o
      LEFT JOIN placement p ON o.placement_id = p.id
      LEFT JOIN capstone cp ON o.capstone_id = cp.id
      LEFT JOIN students_personal_details spd ON o.usn = spd.usn
      LEFT JOIN companies c ON o.company_id = c.id
      ORDER BY o.created_at DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error in getAllJobOffers:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const addJobOffer = async (req, res) => {
  try {
    const { 
      usn, 
      company_name, 
      company_id,
      designation, 
      job_type, 
      internship_duration, 
      internship_stipend, 
      ctc_min_lpa, 
      ctc_max_lpa, 
      ctc_variable_pay, 
      offer_letter_status, 
      final_interview_status, 
      remarks,
      placement_drive_id,
      process_id
    } = req.body;

    const studentCheck = await pool.query('SELECT usn FROM students_personal_details WHERE usn = $1', [usn]);
    if (studentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Student with this USN not found' });
    }

    let companyId = company_id || null;
    if (!companyId && company_name) {
      const companyRes = await pool.query('SELECT id FROM companies WHERE company_name ILIKE $1', [company_name]);
      if (companyRes.rows.length > 0) {
        companyId = companyRes.rows[0].id;
      } else {
        return res.status(404).json({ error: 'Company not found. Please add company first.' });
      }
    }

    let processId = process_id || null;
    if (processId) {
      const procCheck = await pool.query(
        'SELECT id FROM student_placement_process WHERE id = $1 AND usn = $2',
        [processId, usn]
      );
      if (procCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Placement process not found for this student' });
      }
    } else if (placement_drive_id) {
      const procFallback = await pool.query(
        'SELECT id FROM student_placement_process WHERE usn = $1 AND placement_drive_id = $2 ORDER BY created_at DESC LIMIT 1',
        [usn, placement_drive_id]
      );
      if (procFallback.rows.length > 0) {
        processId = procFallback.rows[0].id;
      }
    }

    const toNullable = (val) => {
      if (val === undefined || val === null || val === '') return null;
      return val;
    };

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      let placementId = null;
      let capstoneId = null;

      if (job_type === 'internship') {
        const capRes = await client.query(
          `
            INSERT INTO capstone (
              usn,
              internship_duration_months,
              designation,
              offer_letter_status,
              remarks,
              internship_stipend_min,
              internship_stipend_max,
              company_name
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id
          `,
          [
            usn,
            toNullable(internship_duration),
            designation,
            offer_letter_status,
            remarks,
            toNullable(internship_stipend),
            toNullable(internship_stipend),
            company_name
          ]
        );
        capstoneId = capRes.rows[0].id;
      } else if (job_type === 'full time') {
        const placeRes = await client.query(
          `
            INSERT INTO placement (
              usn,
              designation,
              offer_letter_status,
              remarks,
              ctc_min_lpa,
              ctc_max_lpa,
              ctc_variable_pay,
              company_name
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id
          `,
          [
            usn,
            designation,
            offer_letter_status,
            remarks,
            toNullable(ctc_min_lpa),
            toNullable(ctc_max_lpa),
            toNullable(ctc_variable_pay),
            company_name
          ]
        );
        placementId = placeRes.rows[0].id;
      } else if (job_type === 'internship_cum_full_time') {
        const capRes = await client.query(
          `
            INSERT INTO capstone (
              usn,
              internship_duration_months,
              designation,
              offer_letter_status,
              remarks,
              internship_stipend_min,
              internship_stipend_max,
              company_name
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id
          `,
          [
            usn,
            toNullable(internship_duration),
            designation,
            offer_letter_status,
            remarks,
            toNullable(internship_stipend),
            toNullable(internship_stipend),
            company_name
          ]
        );
        capstoneId = capRes.rows[0].id;

        const placeRes = await client.query(
          `
            INSERT INTO placement (
              usn,
              designation,
              offer_letter_status,
              remarks,
              ctc_min_lpa,
              ctc_max_lpa,
              ctc_variable_pay,
              company_name
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id
          `,
          [
            usn,
            designation,
            offer_letter_status,
            remarks,
            toNullable(ctc_min_lpa),
            toNullable(ctc_max_lpa),
            toNullable(ctc_variable_pay),
            company_name
          ]
        );
        placementId = placeRes.rows[0].id;
      }

      const offerRes = await client.query(
        `
          INSERT INTO offers (
            usn,
            job_type,
            remarks,
            company_id,
            process_id,
            placement_id,
            capstone_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *
        `,
        [
          usn,
          job_type,
          remarks,
          companyId,
          processId,
          placementId,
          capstoneId
        ]
      );

      await client.query('COMMIT');
      res.json(offerRes.rows[0]);
    } catch (e) {
      await client.query('ROLLBACK');
      console.error('Error in addJobOffer transaction:', e.message);
      res.status(500).json({ error: 'Server error' });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateProcessStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const {
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
    } = req.body || {};

    let rawRole = req.user?.role || req.user?.role_name;
    let userRole = String(rawRole || '').toLowerCase().trim();
    console.log('[UpdateProcessStatus] user from token:', req.user);

    // If role name missing in token, derive from role_id
    if (!userRole && req.user?.role_id) {
      try {
        const roleRes = await pool.query('select name from roles where id=$1 limit 1', [req.user.role_id]);
        const dbRole = roleRes.rows[0]?.name;
        if (dbRole) {
          rawRole = dbRole;
          userRole = String(dbRole).toLowerCase().trim();
          console.log('[UpdateProcessStatus] role derived from DB:', dbRole);
        }
      } catch (e) {
        console.error('[UpdateProcessStatus] failed to derive role from DB:', e.message);
      }
    }

    const allowedRoles = [
      'admin',
      'superadmin',
      'sudo_admin',
      'placement_director',
      'placement_officers',
      'placement_officer',
      'placement officer',
      'admin_viewer'
    ];
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const fields = [];
    const values = [];
    let idx = 1;

    const parseRoundBool = (val) => {
      if (val === undefined) return { shouldSet: false, value: null };
      if (val === null || val === '') return { shouldSet: true, value: null };
      if (typeof val === 'boolean') return { shouldSet: true, value: val };
      if (typeof val === 'number') return { shouldSet: true, value: val === 1 };
      if (typeof val === 'string') {
        const lower = val.toLowerCase().trim();
        if (['true', '1', 'yes', 'y', 'qualified', 'selected', 'shortlisted'].includes(lower)) {
          return { shouldSet: true, value: true };
        }
        if (['false', '0', 'no', 'n', 'not qualified', 'rejected'].includes(lower)) {
          return { shouldSet: true, value: false };
        }
        if (['', 'skipped', 'pending', 'na', 'n/a'].includes(lower)) {
          return { shouldSet: true, value: null };
        }
      }
      return { shouldSet: false, value: null };
    };

    if (typeof is_eligible === 'boolean') {
      fields.push(`is_eligible = $${idx++}`);
      values.push(is_eligible);
    }
    if (registration_status !== undefined) {
      fields.push(`registration_status = $${idx++}`);
      values.push(registration_status === '' ? null : registration_status);
    }
    if (approved_status !== undefined && approved_status !== '') {
      fields.push(`approved_status = $${idx++}`);
      values.push(approved_status);
    }

    const roundFields = [
      ['oa_status', oa_status],
      ['gd_status', gd_status],
      ['technical_round_status', technical_round_status],
      ['interview_status', interview_status],
      ['hr_round_status', hr_round_status],
      ['final_select_status', final_select_status]
    ];

    roundFields.forEach(([col, raw]) => {
      const parsed = parseRoundBool(raw);
      if (parsed.shouldSet) {
        fields.push(`${col} = $${idx++}`);
        values.push(parsed.value);
      }
    });

    if (typeof malpractice === 'boolean') {
      fields.push(`malpractice = $${idx++}`);
      values.push(malpractice);
    }
    if (remarks !== undefined) {
      fields.push(`remarks = $${idx++}`);
      values.push(remarks);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    fields.push(`updated_at = NOW()`);

    const query = `
      UPDATE student_placement_process
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING *
    `;

    values.push(id);

    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Process record not found' });
    }

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
  addJobOffer,
  updateProcessStatus
};
