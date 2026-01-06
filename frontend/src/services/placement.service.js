// Mock Service for Placement Module
// Simulates the backend tables and relationships based on the provided schema

const DELAY_MS = 500;
const STORAGE_KEY_PLACEMENT = "carvu_placement_db_v7"; // Changed key to force refresh

// Helper for random styles
const getRandomStyle = () => {
  const fonts = ['Georgia', 'Times New Roman', 'Arial', 'Helvetica', 'Verdana', 'Tahoma', 'Trebuchet MS', 'Impact', 'Courier New', 'Brush Script MT', 'Garamond', 'Palatino', 'Bookman', 'Comic Sans MS', 'Candara', 'Geneva', 'Optima', 'Cambria', 'Didot', 'Rockwell'];
  const colors = ['#E53935', '#D81B60', '#8E24AA', '#5E35B1', '#3949AB', '#1E88E5', '#039BE5', '#00ACC1', '#00897B', '#43A047', '#7CB342', '#C0CA33', '#FDD835', '#FFB300', '#FB8C00', '#F4511E', '#6D4C41', '#757575', '#546E7A'];
  return {
    fontFamily: fonts[Math.floor(Math.random() * fonts.length)],
    color: colors[Math.floor(Math.random() * colors.length)]
  };
};

// Initial Mock Data matching the NEW schema - CLEARED AS PER REQUEST
const INITIAL_DB = {
  // 1. Company Master
  companies: [],

  // 2. Company HR / SPOC (New Entity)
  company_contacts: [],

  // 3. Placement Drive (JOB POSTING)
  placements_drives: [],

  // 4. Process (Student-wise placement progress)
  process: [],

  // 5. Job Offers (Final Outcome)
  job_offers: [],

  // 6. Students
  students: []
};

// Helper to get DB from local storage or initialize
const getDB = () => {
  const stored = localStorage.getItem(STORAGE_KEY_PLACEMENT);
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem(STORAGE_KEY_PLACEMENT, JSON.stringify(INITIAL_DB));
  return INITIAL_DB;
};

// Helper to save DB
const saveDB = (db) => {
  localStorage.setItem(STORAGE_KEY_PLACEMENT, JSON.stringify(db));
};

export const PlacementService = {
  // --- COMPANIES ---
  getAllCompanies: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const db = getDB();
        resolve(db.companies);
      }, DELAY_MS);
    });
  },

  getCompanyById: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const db = getDB();
        const company = db.companies.find(c => c.id === id);
        resolve(company || null);
      }, DELAY_MS);
    });
  },

  // --- DRIVES ---
  getAllDrives: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const db = getDB();
        // Join with company details
        const drives = db.placements_drives.map(drive => {
          const company = db.companies.find(c => c.id === drive.company_id);
          return { ...drive, company };
        });
        resolve(drives);
      }, DELAY_MS);
    });
  },

  getDriveById: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const db = getDB();
        const drive = db.placements_drives.find(d => d.id === id);
        if (drive) {
          const company = db.companies.find(c => c.id === drive.company_id);
          resolve({ ...drive, company });
        } else {
          resolve(null);
        }
      }, DELAY_MS);
    });
  },
  
  // --- STUDENT PROCESS ---
  getStudentProcess: async (usn) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const db = getDB();
        const processes = db.process.filter(p => p.usn === usn);
        // Join with drive and company
        const enriched = processes.map(p => {
            const drive = db.placements_drives.find(d => d.id === p.placement_drive_id);
            const company = drive ? db.companies.find(c => c.id === drive.company_id) : null;
            return { ...p, drive, company };
        });
        resolve(enriched);
      }, DELAY_MS);
    });
  },

  registerForDrive: async (usn, driveId) => {
      return new Promise((resolve, reject) => {
          setTimeout(() => {
              const db = getDB();
              // Check if already registered
              const existing = db.process.find(p => p.usn === usn && p.placement_drive_id === driveId);
              if (existing) {
                  reject("Already registered");
                  return;
              }
              
              const newProcess = {
                  id: `P${Date.now()}`,
                  placement_drive_id: driveId,
                  usn: usn,
                  is_eligible: "Yes", // Logic to check eligibility could be added
                  registration_status: "Registered",
                  approved_status: "Pending",
                  oa_status: "Pending",
                  gd_status: "Pending",
                  technical_round_status: "Pending",
                  interview_status: "Pending",
                  hr_round_status: "Pending",
                  final_select_status: "Pending",
                  malpractice: "No",
                  remarks: "",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
              };
              
              db.process.push(newProcess);
              // Update drive registration count
              const driveIndex = db.placements_drives.findIndex(d => d.id === driveId);
              if(driveIndex !== -1) {
                  db.placements_drives[driveIndex].number_of_registrations += 1;
              }

              saveDB(db);
              resolve(newProcess);
          }, DELAY_MS);
      });
  },

  // --- JOB OFFERS ---
  getStudentOffers: async (usn) => {
      return new Promise((resolve) => {
          setTimeout(() => {
              const db = getDB();
              const offers = db.job_offers.filter(o => o.usn === usn);
              resolve(offers);
          }, DELAY_MS);
      });
  },

  // --- EVENTS (New) ---
  getAllEvents: async () => {
      return new Promise((resolve) => {
          setTimeout(() => {
              // Return drives as events for now
              const db = getDB();
              const events = db.placements_drives.map(d => {
                  const company = db.companies.find(c => c.id === d.company_id);
                  return {
                      id: d.id,
                      title: `${company?.company_name || 'Company'} Drive`,
                      date: d.event_datetime,
                      type: 'Placement Drive',
                      description: d.job_description
                  };
              });
              resolve(events);
          }, DELAY_MS);
      });
  },
  
  // --- ALUMNI FAVORITES (New) ---
  getAlumniFavorites: async (alumniId) => {
      return new Promise((resolve) => {
        setTimeout(() => {
            // Mock empty favorites
            resolve([]);
        }, DELAY_MS);
      });
  },

  getAllStudentProjects: async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Mock empty projects
            resolve([]);
        }, DELAY_MS);
    });
  },

  // --- STUDENT INFO ---
  getStudentByUsn: async (usn) => {
      return new Promise((resolve) => {
          setTimeout(() => {
              const db = getDB();
              const student = db.students.find(s => s.usn === usn);
              resolve(student || null);
          }, DELAY_MS);
      });
  }
};
