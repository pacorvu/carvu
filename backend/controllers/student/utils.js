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
      organization: 'organisation',
      email: 'email'
    },
    fromDb: {
      parent_type: 'parentType',
      phone_country_code: 'phoneCountryCode',
      phone_number: 'phoneNumber',
      name: 'name',
      occupation: 'occupation',
      organisation: 'organization',
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
      dreamCompany: 'dream_company',
      dreamCompanies: 'dream_company', // Handle plural from frontend
      futureGoals: 'future_goals'
    },
    fromDb: {
      brief_summary: 'briefSummary',
      key_expertise: 'keyExpertise',
      hobbies_interests: 'hobbiesInterests',
      career_objective: 'careerObjective',
      dream_package: 'dreamPackage',
      dream_company: 'dreamCompanies', // Map back to plural for frontend
      future_goals: 'futureGoals'
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
      description: 'description',
      role: 'role',
      teamSize: 'team_size'
    },
    fromDb: {
      title: 'title',
      project_link: 'projectLink',
      skills: 'skills', 
      snaps: 'proofFile',
      mentor_name: 'mentorName',
      description: 'description',
      role: 'role',
      team_size: 'teamSize'
    }
  },
  internships: {
    toDb: {
      jobRole: 'job_role',
      role: 'job_role',
      organization: 'organization',
      companyName: 'organization',
      organizationDetails: 'organization_details',
      durationMonths: 'duration_months',
      startDate: 'start_date',
      endDate: 'end_date',
      location: 'location',
      stipend: 'stipend',
      skills: 'skills',
      description: 'description',
      mentorName: 'mentor_name',
      proofDocument: 'proof_document',
      proofFile: 'proof_document',
      certificateLink: 'proof_document'
    },
    fromDb: {
      job_role: 'jobRole',
      organization: 'organization',
      organization_details: 'organizationDetails',
      duration_months: 'durationMonths',
      start_date: 'startDate',
      end_date: 'endDate',
      location: 'location',
      stipend: 'stipend',
      skills: 'skills',
      description: 'description',
      mentor_name: 'mentorName',
      proof_document: 'proofDocument'
    }
  },

  trainings: {
    toDb: {
      title: 'title',
      organization: 'institution',
      institution: 'institution',
      trainingType: 'training_type',
      startDate: 'start_date',
      endDate: 'end_date',
      proofDocument: 'proof_document',
      proofFile: 'proof_document',
      certificateLink: 'proof_document',
      skills: 'skills',
      description: 'description'
    },
    fromDb: {
      title: 'title',
      institution: 'organization',
      training_type: 'trainingType',
      start_date: 'startDate',
      end_date: 'endDate',
      proof_document: 'proofDocument',
      skills: 'skills',
      description: 'description'
    }
  },
  publications: {
    toDb: {
      title: 'title',
      publicationName: 'publication_name',
      journalConference: 'publication_name',
      publicationType: 'publication_type',
      publicationDate: 'publication_date',
      authorCount: 'author_count',
      mentorName: 'mentor_name',
      evidenceDocument: 'evidence_document',
      link: 'evidence_document',
      description: 'description',
      skills: 'skills'
    },
    fromDb: {
      title: 'title',
      publication_name: 'publicationName',
      publication_type: 'publicationType',
      publication_date: 'publicationDate',
      author_count: 'authorCount',
      mentor_name: 'mentorName',
      evidence_document: 'evidenceDocument',
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
      proofDocument: 'proof_document',
      credentialUrl: 'proof_document',
      certificateLink: 'proof_document',
      certificationType: 'certification_type',
      skills: 'skills',
      score: 'score'
    },
    fromDb: {
      title: 'title',
      organization: 'organization',
      issue_date: 'issueDate',
      expiry_date: 'expiryDate',
      proof_document: 'proofDocument',
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
      date: 'start_date',
      proofDocument: 'proof_document',
      proofFile: 'proof_document',
      activityType: 'activity_type',
      role: 'role',
      organization: 'organization',
      achievements: 'achievements',
      achievement: 'achievements',
      skills: 'skills',
      description: 'description'
    },
    fromDb: {
      activity_name: 'activityName',
      start_date: 'startDate',
      end_date: 'endDate',
      proof_document: 'proofDocument',
      activity_type: 'activityType',
      role: 'role',
      organization: 'organization',
      achievements: 'achievements',
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

module.exports = {
    tableMapping,
    arrayTables,
    columnMapping,
    mapData
};
