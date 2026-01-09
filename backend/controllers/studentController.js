const { pool } = require('../config/db');

const tableMapping = {
  personal: 'students_personal_details',
  contact: 'students_personal_details',
  family: 'student_parent_details',
  career: 'student_profile_details',
  education: 'student_education_history',
  academics: 'student_semester_academics',
  projects: 'student_projects',
  internships: 'student_internships',
  trainings: 'student_trainings',
  publications: 'student_publications',
  otherExperiences: 'student_other_experiences',
  certifications: 'student_certifications',
  extraCurricular: 'student_extra_curricular_activities',
};

const arrayTables = [
  'student_parent_details',
  'student_education_history',
  'student_semester_academics',
  'student_projects',
  'student_internships',
  'student_trainings',
  'student_publications',
  'student_other_experiences',
  'student_certifications',
  'student_extra_curricular_activities'
];

const columnMapping = {
  personal: {
    toDb: {
      fullName: 'full_name',
      dateOfBirth: 'date_of_birth',
      bloodGroup: 'blood_group',
      maritalStatus: 'marital_status',
      speciallyAbled: 'specially_abled',
      profileImage: 'profile_image',
      schoolName: 'school_name',
      yearOfJoining: 'year_of_joining',
      programId: 'program_id',
      specializationId: 'specialization_id',
      majorId: 'major_id',
      minorId: 'minor_id',
      isProfileLocked: 'is_profile_locked',
      gender: 'gender',
      languages: 'languages'
    },
    fromDb: {
      full_name: 'fullName',
      date_of_birth: 'dateOfBirth',
      blood_group: 'bloodGroup',
      marital_status: 'maritalStatus',
      specially_abled: 'speciallyAbled',
      profile_image: 'profileImage',
      school_name: 'schoolName',
      year_of_joining: 'yearOfJoining',
      program_id: 'programId',
      specialization_id: 'specializationId',
      major_id: 'majorId',
      minor_id: 'minorId',
      is_profile_locked: 'isProfileLocked',
      gender: 'gender',
      languages: 'languages'
    }
  },
  contact: {
    toDb: {
      collegeEmail: 'college_email',
      personalEmail: 'personal_email',
      phoneCountryCode: 'phone_country_code',
      phoneNumber: 'phone_number',
      links: 'links'
    },
    fromDb: {
      college_email: 'collegeEmail',
      personal_email: 'personalEmail',
      phone_country_code: 'phoneCountryCode',
      phone_number: 'phoneNumber',
      links: 'links'
    }
  },
  family: {
    toDb: {
      parentType: 'parent_type',
      phoneCountryCode: 'phone_country_code',
      phoneNumber: 'phone_number',
      name: 'name',
      occupation: 'occupation',
      organisation: 'organisation',
      email: 'email'
    },
    fromDb: {
      parent_type: 'parentType',
      phone_country_code: 'phoneCountryCode',
      phone_number: 'phoneNumber',
      name: 'name',
      occupation: 'occupation',
      organisation: 'organisation',
      email: 'email'
    }
  },
  career: {
    toDb: {
      briefSummary: 'brief_summary',
      keyExpertise: 'key_expertise',
      hobbiesInterests: 'hobbies_interests',
      careerObjective: 'career_objective',
      dreamPackage: 'dream_package',
      dreamCompany: 'dream_company'
    },
    fromDb: {
      brief_summary: 'briefSummary',
      key_expertise: 'keyExpertise',
      hobbies_interests: 'hobbiesInterests',
      career_objective: 'careerObjective',
      dream_package: 'dreamPackage',
      dream_company: 'dreamCompany'
    }
  },
  education: {
    toDb: {
      educationLevel: 'education_level',
      instituteName: 'institute_name',
      yearOfPassing: 'year_of_passing',
      resultType: 'result_type',
      marksheetFile: 'marksheet_file',
      proofFile: 'marksheet_file', // Allow proofFile from frontend
      gapType: 'gap_type',
      gapDurationMonths: 'gap_duration_months',
      gapReason: 'gap_reason',
      result: 'result',
      boardOrUniversity: 'board', // Map frontend boardOrUniversity to DB board
      board: 'board', // Keep board if sent directly
      subjects: 'subjects',
      city: 'city'
    },
    fromDb: {
      education_level: 'educationLevel',
      institute_name: 'instituteName',
      year_of_passing: 'yearOfPassing',
      result_type: 'resultType',
      marksheet_file: 'proofFile', // Return as proofFile for frontend consistency
      gap_type: 'gapType',
      gap_duration_months: 'gapDurationMonths',
      gap_reason: 'gapReason',
      result: 'result',
      board: 'boardOrUniversity', // Return as boardOrUniversity
      subjects: 'subjects',
      city: 'city'
    }
  },
  academics: {
    toDb: {
      academicYear: 'academic_year',
      resultInSgpa: 'result_in_sgpa',
      sgpa: 'result_in_sgpa', // Map frontend sgpa to DB result_in_sgpa
      closedBacklogs: 'closed_backlogs',
      liveBacklogs: 'live_backlogs',
      provisionalResultUploadLink: 'provisional_result_upload_link',
      resultUploadLink: 'provisional_result_upload_link', // Map frontend resultUploadLink
      semester: 'semester'
    },
    fromDb: {
      academic_year: 'academicYear',
      result_in_sgpa: 'sgpa', // Return as sgpa
      closed_backlogs: 'closedBacklogs',
      live_backlogs: 'liveBacklogs',
      provisional_result_upload_link: 'resultUploadLink', // Return as resultUploadLink
      semester: 'semester'
    }
  },
  projects: {
    toDb: {
      title: 'title',
      projectLink: 'project_link',
      link: 'project_link',
      technologies: 'skills',
      skills: 'skills',
      proofFile: 'snaps',
      snaps: 'snaps',
      mentorName: 'mentor_name',
      description: 'description'
    },
    fromDb: {
      title: 'title',
      project_link: 'projectLink',
      skills: 'skills', // Changed from technologies to match other sections
      snaps: 'proofFile',
      mentor_name: 'mentorName',
      description: 'description'
    }
  },
  internships: {
    toDb: {
      jobRole: 'job_role',
      role: 'job_role',
      companyName: 'organization',
      organization: 'organization',
      organizationDetails: 'organization_details',
      durationMonths: 'duration_months',
      startDate: 'start_date',
      endDate: 'end_date',
      location: 'location',
      stipend: 'stipend',
      mentorName: 'mentor_name',
      proofDocument: 'proof_document',
      certificateLink: 'proof_document',
      skills: 'skills',
      description: 'description'
    },
    fromDb: {
      job_role: 'role',
      organization: 'companyName',
      organization_details: 'organizationDetails',
      duration_months: 'durationMonths',
      start_date: 'startDate',
      end_date: 'endDate',
      location: 'location',
      stipend: 'stipend',
      mentor_name: 'mentorName',
      proof_document: 'certificateLink',
      skills: 'skills',
      description: 'description'
    }
  },
  trainings: {
    toDb: {
      title: 'title',
      organization: 'institution', // Form uses organization
      institution: 'institution',
      trainingType: 'training_type',
      startDate: 'start_date',
      endDate: 'end_date',
      proofDocument: 'proof_document',
      certificateLink: 'proof_document',
      skills: 'skills',
      description: 'description'
    },
    fromDb: {
      title: 'title',
      institution: 'organization', // Match form
      training_type: 'trainingType',
      start_date: 'startDate',
      end_date: 'endDate',
      proof_document: 'certificateLink',
      skills: 'skills',
      description: 'description'
    }
  },
  publications: {
    toDb: {
      title: 'title',
      publicationName: 'publication_name',
      journalConference: 'publication_name', // Form uses journalConference
      publicationType: 'publication_type',
      publicationDate: 'publication_date',
      authorCount: 'author_count',
      mentorName: 'mentor_name',
      evidenceDocument: 'evidence_document',
      link: 'evidence_document', // Form uses link?
      description: 'description',
      skills: 'skills'
    },
    fromDb: {
      title: 'title',
      publication_name: 'journalConference',
      publication_type: 'publicationType',
      publication_date: 'publicationDate',
      author_count: 'authorCount',
      mentor_name: 'mentorName',
      evidence_document: 'link', // Form uses link
      description: 'description',
      skills: 'skills'
    }
  },
  otherExperiences: {
    toDb: {
      title: 'title',
      organization: 'organization',
      startDate: 'start_date',
      endDate: 'end_date',
      proofDocument: 'proof_document',
      location: 'location',
      skills: 'skills',
      description: 'description'
    },
    fromDb: {
      title: 'title',
      organization: 'organization',
      start_date: 'startDate',
      end_date: 'endDate',
      proof_document: 'proofDocument',
      location: 'location',
      skills: 'skills',
      description: 'description'
    }
  },
  certifications: {
    toDb: {
      title: 'title',
      name: 'title',
      issuingOrganization: 'organization',
      organization: 'organization',
      issueDate: 'issue_date',
      expiryDate: 'expiry_date',
      credentialUrl: 'proof_document',
      certificateLink: 'proof_document',
      certificationType: 'certification_type',
      skills: 'skills',
      score: 'score'
    },
    fromDb: {
      title: 'title',
      organization: 'issuingOrganization',
      issue_date: 'issueDate',
      expiry_date: 'expiryDate',
      proof_document: 'certificateLink',
      certification_type: 'certificationType',
      skills: 'skills',
      score: 'score'
    }
  },
  extraCurricular: {
    toDb: {
      activityName: 'activity_name',
      startDate: 'start_date',
      endDate: 'end_date',
      date: 'start_date', // Form uses date
      proofDocument: 'proof_document',
      proofFile: 'proof_document',
      activityType: 'activity_type',
      role: 'role',
      organization: 'organization',
      achievements: 'achievements',
      achievement: 'achievements', // Form uses achievement
      skills: 'skills',
      description: 'description'
    },
    fromDb: {
      activity_name: 'activityName',
      start_date: 'date', // Form uses date
      end_date: 'endDate',
      proof_document: 'proofFile',
      activity_type: 'activityType',
      role: 'role',
      organization: 'organization',
      achievements: 'achievement',
      skills: 'skills',
      description: 'description'
    }
  }
};

const mapData = (section, data, direction) => {
  if (!columnMapping[section]) return data;
  
  const map = columnMapping[section][direction];
  if (!map) return data;

  const processItem = (item) => {
    const newItem = { ...item };
    for (const [key, val] of Object.entries(map)) {
      if (item[key] !== undefined) {
        if (key !== val) {
          newItem[val] = item[key];
          delete newItem[key];
        } else {
          newItem[key] = item[key];
        }
      }
    }
    return newItem;
  };

  if (Array.isArray(data)) {
    return data.map(processItem);
  }
  return processItem(data);
};

const getPersonalPage = async (req, res) => {
  try {
    const { usn } = req.params;

    const isOwner = req.user?.usn === usn;
    const isAdmin = req.user?.role_name === 'admin' || req.user?.role_name === 'superadmin' || req.user?.role === 'admin' || req.user?.role === 'superadmin';
    const isStudent = req.user?.role_name === 'student' || req.user?.role === 'student';

    if (!isOwner && !isAdmin) {
      console.warn(`Unauthorized access attempt by ${req.user?.usn || req.user?.id} to ${usn}`);
      return res.status(403).json({ error: 'Unauthorized access to this profile' });
    }

    const result = await pool.query(
      `select spd.*,
              p.name as program_name,
              mj.name as major_name,
              mn.name as minor_name,
              sz.name as specialization_name
       from students_personal_details spd
       left join programs p on p.id = spd.program_id
       left join majors mj on mj.id = spd.major_id
       left join minors mn on mn.id = spd.minor_id
       left join specializations sz on sz.id = spd.specialization_id
       where spd.usn = $1
       limit 1`,
      [usn]
    );
    const row = result.rows[0] || {};

    const personal = mapData('personal', row, 'fromDb');
    if (row.program_name !== undefined) personal.programName = row.program_name;
    if (row.major_name !== undefined) personal.majorName = row.major_name;
    if (row.minor_name !== undefined) personal.minorName = row.minor_name;
    if (row.specialization_name !== undefined) personal.specializationName = row.specialization_name;

    if (isOwner && isStudent) {
      delete personal.created_at;
      delete personal.updated_at;
      delete personal.isProfileLocked;
      delete personal.is_profile_locked;
    }

    res.json({
      personal,
      contact: mapData('contact', row, 'fromDb'),
    });
  } catch (e) {
    console.error(`Get personal page error: ${e.message}`);
    res.status(500).json({ error: e.message });
  }
};

const getSection = async (req, res) => {
  try {
    const { usn, section } = req.params;
    
    // Strict Authorization Check
    // 1. Check if user is authenticated (req.user exists)
    // 2. Check if user is accessing their own profile (req.user.usn === usn)
    // 3. Allow admins (role_name 'admin' or 'superadmin')
    
    const isOwner = req.user?.usn === usn;
    const isAdmin = req.user?.role_name === 'admin' || req.user?.role_name === 'superadmin' || req.user?.role === 'admin' || req.user?.role === 'superadmin';

    if (!isOwner && !isAdmin) {
      console.warn(`Unauthorized access attempt by ${req.user?.usn || req.user?.id} to ${usn}`);
      return res.status(403).json({ error: 'Unauthorized access to this profile' });
    }

    if (section === 'full') {
      const fullProfile = {};

      // 1. Fetch Personal & Contact Details with Joins (Programs, etc.)
      const personalQuery = `
        select spd.*,
               p.name as program_name,
               mj.name as major_name,
               mn.name as minor_name,
               sz.name as specialization_name
        from students_personal_details spd
        left join programs p on p.id = spd.program_id
        left join majors mj on mj.id = spd.major_id
        left join minors mn on mn.id = spd.minor_id
        left join specializations sz on sz.id = spd.specialization_id
        where spd.usn = $1
      `;
      const personalRes = await pool.query(personalQuery, [usn]);
      const personalRow = personalRes.rows[0] || {};

      // Map Personal
      const personalData = mapData('personal', personalRow, 'fromDb');
      if (personalRow.program_name) personalData.programName = personalRow.program_name;
      if (personalRow.major_name) personalData.majorName = personalRow.major_name;
      if (personalRow.minor_name) personalData.minorName = personalRow.minor_name;
      if (personalRow.specialization_name) personalData.specializationName = personalRow.specialization_name;
      
      fullProfile.personal = personalData;
      fullProfile.contact = mapData('contact', personalRow, 'fromDb');

      // 2. Fetch other sections from tableMapping
      for (const [key, table] of Object.entries(tableMapping)) {
        if (key === 'personal' || key === 'contact') continue;

        const isArray = arrayTables.includes(table);
        const query = `select * from ${table} where usn = $1`;
        const result = await pool.query(query, [usn]);
        let data = isArray ? result.rows : (result.rows[0] || {});
        
        // Map from DB to Frontend
        data = mapData(key, data, 'fromDb');
        
        fullProfile[key] = data;
      }

      // 3. Add Placements and Job Offers (Not in tableMapping but part of full profile)
      try {
        const placementsRes = await pool.query(`
          SELECT p.*, pd.job_type, pd.event_datetime, c.company_name, c.company_logo_link
          FROM student_placement_process p
          JOIN placements_drives pd ON p.placement_drive_id = pd.id
          LEFT JOIN companies c ON pd.company_id = c.id
          WHERE p.usn = $1
          ORDER BY p.created_at DESC
        `, [usn]);
        fullProfile.placements = placementsRes.rows;

        const offersRes = await pool.query('SELECT * FROM job_offers WHERE usn = $1', [usn]);
        fullProfile.jobOffers = offersRes.rows;
      } catch (err) {
        console.error('Error fetching placements/offers for full profile:', err);
        // Don't fail the whole request if these fail, just log
        fullProfile.placements = [];
        fullProfile.jobOffers = [];
      }

      return res.json(fullProfile);
    }

    const tableName = tableMapping[section];
    if (!tableName) {
      return res.status(404).json({ error: 'Section not found' });
    }

    const isArray = arrayTables.includes(tableName);
    const query = `select * from ${tableName} where usn = $1`;
    const result = await pool.query(query, [usn]);

    let data = isArray ? result.rows : (result.rows[0] || {});
    data = mapData(section, data, 'fromDb');

    res.json(data);
  } catch (e) {
    console.error(`Get section error: ${e.message}`);
    res.status(500).json({ error: e.message });
  }
};

const saveSection = async (req, res) => {
  try {
    const { usn, section } = req.params;
    let data = req.body;

    const isOwner = req.user?.usn === usn;
    const isAdmin = req.user?.role_name === 'admin' || req.user?.role_name === 'superadmin' || req.user?.role === 'admin' || req.user?.role === 'superadmin';
    const isStudent = req.user?.role_name === 'student' || req.user?.role === 'student';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Unauthorized modification of this profile' });
    }

    const tableName = tableMapping[section];
    if (!tableName) {
      return res.status(404).json({ error: 'Section not found' });
    }

    // Map to DB
    data = mapData(section, data, 'toDb');

    const isArray = arrayTables.includes(tableName);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      if (isArray) {
        // Replace all logic
        // 1. Delete existing
        await client.query(`delete from ${tableName} where usn = $1`, [usn]);
        
        // 2. Insert new
        if (Array.isArray(data) && data.length > 0) {
          // Get columns once, outside the loop
          const colsRes = await client.query(
            "select column_name from information_schema.columns where table_schema='public' and table_name=$1",
            [tableName]
          );
          // Filter out id, timestamps, and USN (since we add USN manually)
          const validCols = colsRes.rows.map(r => r.column_name).filter(c => c !== 'id' && c !== 'created_at' && c !== 'updated_at' && c !== 'usn');
          
          for (const item of data) {
            const insertCols = ['usn'];
            const insertParams = [usn];
            const placeholders = ['$1'];
            
            for (const col of validCols) {
              if (item[col] !== undefined) {
                insertCols.push(col);
                insertParams.push(item[col]);
                placeholders.push(`$${insertParams.length}`);
              }
            }
            
            if (insertCols.length > 1) { // Only insert if we have more than just USN
              const sql = `insert into ${tableName} ("${insertCols.join('", "')}") values (${placeholders.join(', ')})`;
              await client.query(sql, insertParams);
            }
          }
        }
      } else {
        // Non-array tables (personal, contact, career, etc.)
        // Check if record exists first to avoid NOT NULL constraint violations on partial inserts
        const checkRes = await client.query(`SELECT 1 FROM ${tableName} WHERE usn = $1`, [usn]);
        const exists = checkRes.rows.length > 0;

        const colsRes = await client.query(
          "select column_name from information_schema.columns where table_schema='public' and table_name=$1",
          [tableName]
        );
        // Filter out id, timestamps, and USN (since we handle USN manually)
        const validCols = colsRes.rows.map(r => r.column_name).filter(c => c !== 'id' && c !== 'created_at' && c !== 'updated_at' && c !== 'usn');

        if (exists) {
          // UPDATE Logic
          const updateSets = [];
          const updateParams = [];
          let paramIdx = 1;

          for (const col of validCols) {
            if (data[col] !== undefined) {
              updateSets.push(`"${col}" = $${paramIdx}`);
              updateParams.push(data[col]);
              paramIdx++;
            }
          }

          if (updateSets.length > 0) {
            updateParams.push(usn); // Add USN as the last parameter
            const sql = `UPDATE ${tableName} SET ${updateSets.join(', ')}, updated_at = now() WHERE usn = $${paramIdx}`;
            await client.query(sql, updateParams);
          }
        } else {
          // INSERT Logic (Only for new records)
          const insertCols = ['usn'];
          const insertParams = [usn];
          const placeholders = ['$1'];
          
          for (const col of validCols) {
            if (data[col] !== undefined) {
              insertCols.push(col);
              insertParams.push(data[col]);
              placeholders.push(`$${insertParams.length}`);
            }
          }
          
          const sql = `insert into ${tableName} ("${insertCols.join('", "')}") values (${placeholders.join(', ')})`;
          await client.query(sql, insertParams);
        }
      }

      await client.query('COMMIT');
      res.json({ success: true });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

  } catch (e) {
    console.error(`Save section error: ${e.message}`);
    res.status(500).json({ error: e.message });
  }
};

// Public meta endpoints (no auth required when mounted accordingly)
const getMajors = async (req, res) => {
  try {
    const result = await pool.query('select id, name from majors order by name asc');
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const getMinors = async (req, res) => {
  try {
    const result = await pool.query('select id, name from minors order by name asc');
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const getSpecializations = async (req, res) => {
  try {
    const result = await pool.query('select id, name from specializations order by name asc');
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = {
  getPersonalPage,
  getSection,
  saveSection,
  getMajors,
  getMinors,
  getSpecializations
};
