const { pool } = require('../config/db');

const tableMapping = {
  personal: 'students_personal_details',
  contact: 'student_profile_communication',
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
      minorId: 'minor_id'
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
      minor_id: 'minorId'
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
      phoneNumber: 'phone_number'
    },
    fromDb: {
      parent_type: 'parentType',
      phone_country_code: 'phoneCountryCode',
      phone_number: 'phoneNumber'
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
      gapType: 'gap_type',
      gapDurationMonths: 'gap_duration_months',
      gapReason: 'gap_reason'
    },
    fromDb: {
      education_level: 'educationLevel',
      institute_name: 'instituteName',
      year_of_passing: 'yearOfPassing',
      result_type: 'resultType',
      marksheet_file: 'marksheetFile',
      gap_type: 'gapType',
      gap_duration_months: 'gapDurationMonths',
      gap_reason: 'gapReason'
    }
  },
  academics: {
    toDb: {
      academicYear: 'academic_year',
      resultInSgpa: 'result_in_sgpa',
      closedBacklogs: 'closed_backlogs',
      liveBacklogs: 'live_backlogs',
      provisionalResultUploadLink: 'provisional_result_upload_link'
    },
    fromDb: {
      academic_year: 'academicYear',
      result_in_sgpa: 'resultInSgpa',
      closed_backlogs: 'closedBacklogs',
      live_backlogs: 'liveBacklogs',
      provisional_result_upload_link: 'provisionalResultUploadLink'
    }
  },
  projects: {
    toDb: {
      projectLink: 'project_link',
      link: 'project_link',
      technologies: 'skills',
      skills: 'skills',
      proofFile: 'snaps',
      snaps: 'snaps',
      mentorName: 'mentor_name'
    },
    fromDb: {
      project_link: 'projectLink',
      skills: 'technologies',
      snaps: 'proofFile',
      mentor_name: 'mentorName'
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
      certificateLink: 'proof_document'
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
      proof_document: 'certificateLink'
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
      certificateLink: 'proof_document'
    },
    fromDb: {
      title: 'title',
      institution: 'organization', // Match form
      training_type: 'trainingType',
      start_date: 'startDate',
      end_date: 'endDate',
      proof_document: 'certificateLink'
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
      description: 'description'
    },
    fromDb: {
      title: 'title',
      publication_name: 'journalConference',
      publication_type: 'publicationType',
      publication_date: 'publicationDate',
      author_count: 'authorCount',
      mentor_name: 'mentorName',
      evidence_document: 'link', // Form uses link
      description: 'description'
    }
  },
  otherExperiences: {
    toDb: {
      startDate: 'start_date',
      endDate: 'end_date',
      proofDocument: 'proof_document'
    },
    fromDb: {
      start_date: 'startDate',
      end_date: 'endDate',
      proof_document: 'proofDocument'
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
        newItem[val] = item[key];
        delete newItem[key];
      }
    }
    return newItem;
  };

  if (Array.isArray(data)) {
    return data.map(processItem);
  }
  return processItem(data);
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
      for (const [key, table] of Object.entries(tableMapping)) {
        const isArray = arrayTables.includes(table);
        const query = `select * from ${table} where usn = $1`;
        const result = await pool.query(query, [usn]);
        let data = isArray ? result.rows : (result.rows[0] || {});
        
        // Map from DB to Frontend
        data = mapData(key, data, 'fromDb');
        
        fullProfile[key] = data;
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
          for (const item of data) {
            // Filter out fields that are not columns? 
            // Ideally we should query columns first. 
            // For now, let's assume the frontend sends valid keys matching columns (except maybe 'id', 'created_at', etc.)
            
            // We need to get columns dynamically to be safe, or just try insert
            // To be safe, let's get columns for the table once
            const colsRes = await client.query(
              "select column_name from information_schema.columns where table_schema='public' and table_name=$1",
              [tableName]
            );
            const validCols = colsRes.rows.map(r => r.column_name).filter(c => c !== 'id' && c !== 'created_at' && c !== 'updated_at');
            
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
            
            // Add updated_at if it exists in schema (we filtered it out above to let DB handle default, but for update we might want to set it)
            // Actually, let DB handle created_at/updated_at defaults if possible.
            
            const sql = `insert into ${tableName} ("${insertCols.join('", "')}") values (${placeholders.join(', ')})`;
            await client.query(sql, insertParams);
          }
        }
      } else {
        // Upsert logic for single record
        const colsRes = await client.query(
          "select column_name from information_schema.columns where table_schema='public' and table_name=$1",
          [tableName]
        );
        const validCols = colsRes.rows.map(r => r.column_name).filter(c => c !== 'id' && c !== 'created_at' && c !== 'updated_at');

        const insertCols = ['usn'];
        const insertParams = [usn];
        const placeholders = ['$1'];
        const updateSets = [];
        
        for (const col of validCols) {
          if (data[col] !== undefined) {
            insertCols.push(col);
            insertParams.push(data[col]);
            placeholders.push(`$${insertParams.length}`);
            updateSets.push(`"${col}" = $${insertParams.length}`);
          }
        }
        
        if (updateSets.length > 0) {
          const sql = `
            insert into ${tableName} ("${insertCols.join('", "')}") 
            values (${placeholders.join(', ')})
            on conflict (usn) do update set ${updateSets.join(', ')}, updated_at = now()
          `;
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

module.exports = {
  getSection,
  saveSection
};
