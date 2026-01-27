import { getHeaders, refreshAccessToken } from './tokenService';

const API_URL = import.meta.env.VITE_BACKEND_URL || '';

const authFetch = async (url, options = {}) => {
  const doFetch = () => {
    const baseHeaders = getHeaders();
    const mergedHeaders = { ...baseHeaders, ...(options.headers || {}) };
    return fetch(url, { ...options, headers: mergedHeaders });
  };
  let res = await doFetch();
  if (res.status === 401 || res.status === 403) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      res = await doFetch();
    }
  }
  return res;
};

export const PlacementService = {
  // --- COMPANIES ---
  getAllCompanies: async () => {
    try {
      const res = await authFetch(`${API_URL}/placement/companies`, {
        headers: getHeaders()
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) throw new Error('Forbidden');
        throw new Error('Failed to fetch companies');
      }
      return await res.json();
    } catch (error) {
      console.error('Error fetching companies:', error);
      if (error.message === 'Forbidden') throw error;
      return [];
    }
  },

  getCompanyById: async (id) => {
    try {
      const res = await authFetch(`${API_URL}/placement/companies/${id}`, {
        headers: getHeaders()
      });
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error('Failed to fetch company');
      }
      return await res.json();
    } catch (error) {
      console.error('Error fetching company:', error);
      return null;
    }
  },

  // --- DRIVES ---
  getAllDrives: async () => {
    try {
      const res = await authFetch(`${API_URL}/placement/drives`, {
        headers: getHeaders()
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) throw new Error('Forbidden');
        throw new Error('Failed to fetch drives');
      }
      return await res.json();
    } catch (error) {
      console.error('Error fetching drives:', error);
      if (error.message === 'Forbidden') throw error;
      return [];
    }
  },

  addPlacementDrive: async (data) => {
    const res = await authFetch(`${API_URL}/placement/drives`, {
        method: 'POST',
        headers: {
            ...getHeaders(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to add placement drive');
    }
    return await res.json();
  },

  updatePlacementDrive: async (id, data) => {
    const res = await authFetch(`${API_URL}/placement/drives/${id}`, {
        method: 'PUT',
        headers: {
            ...getHeaders(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update placement drive');
    }
    return await res.json();
  },

  getDriveById: async (id) => {
    try {
      const res = await authFetch(`${API_URL}/placement/drives/${id}`, {
        headers: getHeaders()
      });
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error('Failed to fetch drive');
      }
      return await res.json();
    } catch (error) {
      console.error('Error fetching drive:', error);
      return null;
    }
  },

  getDriveProcesses: async (driveId) => {
    try {
      const res = await authFetch(`${API_URL}/placement/drives/${driveId}/registrations`, {
        headers: getHeaders()
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) throw new Error('Forbidden');
        throw new Error('Failed to fetch drive processes');
      }
      return await res.json();
    } catch (error) {
      console.error('Error fetching drive processes:', error);
      if (error.message === 'Forbidden') throw error;
      return [];
    }
  },

  getSchools: async () => {
    try {
      const res = await authFetch(`${API_URL}/student/meta/schools`, {
        headers: getHeaders()
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) throw new Error('Forbidden');
        throw new Error('Failed to fetch schools');
      }
      return await res.json();
    } catch (error) {
      console.error('Error fetching schools:', error);
      if (error.message === 'Forbidden') throw error;
      return [];
    }
  },

  getPrograms: async (schoolId) => {
    try {
      const url = schoolId 
        ? `${API_URL}/student/meta/programs?schoolId=${schoolId}` 
        : `${API_URL}/student/meta/programs`;
      const res = await authFetch(url, {
        headers: getHeaders()
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) throw new Error('Forbidden');
        throw new Error('Failed to fetch programs');
      }
      return await res.json();
    } catch (error) {
      console.error('Error fetching programs:', error);
      if (error.message === 'Forbidden') throw error;
      return [];
    }
  },

  getSpecializations: async (programId) => {
    try {
      const url = programId 
        ? `${API_URL}/student/meta/specializations?programId=${programId}` 
        : `${API_URL}/student/meta/specializations`;
      const res = await authFetch(url, {
        headers: getHeaders()
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) throw new Error('Forbidden');
        throw new Error('Failed to fetch specializations');
      }
      return await res.json();
    } catch (error) {
      console.error('Error fetching specializations:', error);
      if (error.message === 'Forbidden') throw error;
      return [];
    }
  },
  
  // --- STUDENTS ---
  getAllStudents: async () => {
    try {
      const res = await authFetch(`${API_URL}/placement/students?t=${Date.now()}`, {
        headers: getHeaders()
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) throw new Error('Forbidden');
        throw new Error('Failed to fetch students');
      }
      return await res.json();
    } catch (error) {
      console.error('Error fetching students:', error);
      if (error.message === 'Forbidden') throw error;
      return [];
    }
  },

  updateStudentEligibility: async (usn, data) => {
    const res = await authFetch(`${API_URL}/placement/students/${usn}/eligibility`, {
      method: 'PUT',
      headers: {
        ...getHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to update student eligibility');
    }
    return await res.json();
  },

  getPlacementOverview: async (academicYear) => {
    try {
      const query = academicYear ? `?academic_year=${encodeURIComponent(academicYear)}` : '';
      const res = await authFetch(`${API_URL}/placement/students/overview${query}`, {
        headers: getHeaders()
      });
      if (!res.ok) {
         if (res.status === 401 || res.status === 403) throw new Error('Forbidden');
         throw new Error('Failed to fetch placement overview');
      }
      return await res.json();
    } catch (error) {
      console.error('Error fetching placement overview:', error);
      if (error.message === 'Forbidden') throw error;
      return { rows: [], academicYears: [] };
    }
  },

  promoteStudents: async (data) => {
    const res = await authFetch(`${API_URL}/placement/students/promote`, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to promote students');
    }
    return await res.json();
  },

  promoteToAlumni: async (data) => {
    const res = await authFetch(`${API_URL}/placement/alumni/promote`, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to promote students to alumni');
    }
    return await res.json();
  },

  // --- STUDENT PROCESS ---
  getStudentProcess: async (usn) => {
    try {
      const res = await authFetch(`${API_URL}/placement/process/${usn}`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch student process');
      return await res.json();
    } catch (error) {
      console.error('Error fetching student process:', error);
      return [];
    }
  },

  updateProcessStatus: async (id, data) => {
    const res = await authFetch(`${API_URL}/placement/process/${id}`, {
      method: 'PATCH',
      headers: {
        ...getHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to update process status');
    }
    return await res.json();
  },

  registerForDrive: async (usn, driveId) => {
    const res = await authFetch(`${API_URL}/placement/register`, {
        method: 'POST',
        headers: {
            ...getHeaders(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ usn, driveId })
    });
    
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to register for drive');
    }
    return await res.json();
  },

  // --- JOB OFFERS ---
  getAllJobOffers: async () => {
    try {
      const res = await authFetch(`${API_URL}/placement/job-offers`, {
        headers: getHeaders()
      });
      if (!res.ok) {
        console.error('Failed to fetch job offers, status:', res.status, res.statusText);
        throw new Error('Failed to fetch job offers');
      }
      return await res.json();
    } catch (error) {
      console.error('Error fetching job offers:', error);
      return [];
    }
  },

  addJobOffer: async (data) => {
    const res = await authFetch(`${API_URL}/placement/job-offers`, {
        method: 'POST',
        headers: {
            ...getHeaders(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to add job offer');
    }
    return await res.json();
  },

  getStudentOffers: async (usn) => {
    try {
      const res = await authFetch(`${API_URL}/placement/offers/${usn}`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch student offers');
      return await res.json();
    } catch (error) {
      console.error('Error fetching student offers:', error);
      return [];
    }
  },

  // --- ALUMNI ---
  getAllAlumni: async () => {
    try {
      const res = await authFetch(`${API_URL}/placement/alumni`, {
        headers: getHeaders()
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) throw new Error('Forbidden');
        throw new Error('Failed to fetch alumni');
      }
      return await res.json();
    } catch (error) {
      console.error('Error fetching alumni:', error);
      if (error.message === 'Forbidden') throw error;
      return [];
    }
  },

  getEligibleAlumni: async () => {
    try {
      const res = await authFetch(`${API_URL}/placement/alumni/eligible`, {
        headers: getHeaders()
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) throw new Error('Forbidden');
        throw new Error('Failed to fetch eligible alumni');
      }
      return await res.json();
    } catch (error) {
      console.error('Error fetching eligible alumni:', error);
      if (error.message === 'Forbidden') throw error;
      return [];
    }
  },

  addAlumni: async (data) => {
    const res = await authFetch(`${API_URL}/placement/alumni`, {
        method: 'POST',
        headers: {
            ...getHeaders(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to add alumni');
    }
    return await res.json();
  },

  getAlumniByUsn: async (usn) => {
    try {
      const res = await authFetch(`${API_URL}/placement/alumni/${usn}`, {
        headers: getHeaders()
      });
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error('Failed to fetch alumni details');
      }
      return await res.json();
    } catch (error) {
      console.error('Error fetching alumni details:', error);
      return null;
    }
  },

  // --- ALUMNI CODES ---
  generateRegistrationCode: async (data) => {
    const res = await authFetch(`${API_URL}/placement/alumni/codes`, {
        method: 'POST',
        headers: {
            ...getHeaders(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to generate code');
    }
    return await res.json();
  },

  getRegistrationCodes: async () => {
    try {
      const res = await authFetch(`${API_URL}/placement/alumni/codes`, {
        headers: getHeaders()
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) throw new Error('Forbidden');
        throw new Error('Failed to fetch codes');
      }
      return await res.json();
    } catch (error) {
      console.error('Error fetching codes:', error);
      if (error.message === 'Forbidden') throw error;
      return [];
    }
  },

  deleteRegistrationCode: async (id) => {
    const res = await authFetch(`${API_URL}/placement/alumni/codes/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete code');
    }
    return await res.json();
  },

  // --- EVENTS (New) ---
  getAllEvents: async () => {
      // Reuse drives as events for now, as implemented in mock
      // Ideally, this should call a separate /events endpoint if it exists
      try {
        const drives = await PlacementService.getAllDrives();
        return drives.map(d => ({
            id: d.id,
            title: `${d.company_name || 'Company'} Drive`,
            event_date: d.event_datetime, // Mapped to event_date for StudentEvents.jsx
            type: 'Placement Drive',
            description: d.job_description,
            location: d.job_location || 'Campus' // Mapped location
        }));
      } catch (error) {
        console.error('Error fetching events:', error);
        return [];
      }
  },
  
  // --- ALUMNI FAVORITES (New) ---
  getAlumniFavorites: async () => {
      // Placeholder: Return empty array as backend endpoint not yet implemented
      return [];
  },

  toggleFavorite: async (userId, projectId) => {
      // Placeholder: Fake implementation
      return { success: true, isFavorited: true };
  },

  getAllStudentProjects: async (params = {}) => {
    try {
        // Construct query string
        const queryString = new URLSearchParams(params).toString();
        const url = `${API_URL}/placement/projects${queryString ? `?${queryString}` : ''}`;
        
        const res = await authFetch(url, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch projects');
        return await res.json();
    } catch (error) {
        console.error('Error fetching projects:', error);
        return [];
    }
  },

  rateProject: async (id, rating, feedback) => {
    const res = await authFetch(`${API_URL}/placement/projects/${id}/rate`, {
        method: 'PUT',
        headers: {
            ...getHeaders(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rating, feedback })
    });
    
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to rate project');
    }
    return await res.json();
  },

  // --- STUDENT INFO ---
  getStudentByUsn: async () => {
      // Placeholder: This should be handled by StudentProfileService
      return null;
  },

  // --- USER MANAGEMENT ---
  getAllUsers: async () => {
    try {
      const res = await authFetch(`${API_URL}/placement/users`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      return await res.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  // --- BATCH ACADEMIC POLICIES ---
  getAllPolicies: async () => {
    try {
      const res = await authFetch(`${API_URL}/placement/policies`, {
        headers: getHeaders()
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) throw new Error('Forbidden');
        throw new Error('Failed to fetch policies');
      }
      return await res.json();
    } catch (error) {
      console.error('Error fetching policies:', error);
      if (error.message === 'Forbidden') throw error;
      return [];
    }
  },

  upsertPolicy: async (data) => {
    const res = await authFetch(`${API_URL}/placement/policies`, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to upsert policy');
    }
    return await res.json();
  },

  applyPolicyToStudents: async (id) => {
    const res = await authFetch(`${API_URL}/placement/policies/${id}/apply`, {
      method: 'POST',
      headers: getHeaders()
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to apply policy');
    }
    return await res.json();
  },

  syncPolicies: async () => {
    const res = await authFetch(`${API_URL}/placement/policies/sync`, {
      method: 'POST',
      headers: getHeaders()
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to sync policies');
    }
    return await res.json();
  }
};
