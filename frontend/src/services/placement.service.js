import { getHeaders } from './tokenService';

const API_URL = import.meta.env.VITE_BACKEND_URL;

export const PlacementService = {
  // --- COMPANIES ---
  getAllCompanies: async () => {
    try {
      const res = await fetch(`${API_URL}/placement/companies`, {
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
      const res = await fetch(`${API_URL}/placement/companies/${id}`, {
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
      const res = await fetch(`${API_URL}/placement/drives`, {
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
    const res = await fetch(`${API_URL}/placement/drives`, {
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
    const res = await fetch(`${API_URL}/placement/drives/${id}`, {
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
      const res = await fetch(`${API_URL}/placement/drives/${id}`, {
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

  getSchools: async () => {
    try {
      const res = await fetch(`${API_URL}/student/meta/schools`, {
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
      const res = await fetch(url, {
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
  
  // --- STUDENTS ---
  getAllStudents: async () => {
    try {
      const res = await fetch(`${API_URL}/placement/students`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch students');
      return await res.json();
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  },

  // --- STUDENT PROCESS ---
  getStudentProcess: async (usn) => {
    try {
      const res = await fetch(`${API_URL}/placement/process/${usn}`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch student process');
      return await res.json();
    } catch (error) {
      console.error('Error fetching student process:', error);
      return [];
    }
  },

  registerForDrive: async (usn, driveId) => {
    const res = await fetch(`${API_URL}/placement/register`, {
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
      const res = await fetch(`${API_URL}/placement/job-offers`, {
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
    const res = await fetch(`${API_URL}/placement/job-offers`, {
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
      const res = await fetch(`${API_URL}/placement/offers/${usn}`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch student offers');
      return await res.json();
    } catch (error) {
      console.error('Error fetching student offers:', error);
      return [];
    }
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
  getAlumniFavorites: async (alumniId) => {
      // Placeholder: Return empty array as backend endpoint not yet implemented
      return [];
  },

  getAllStudentProjects: async () => {
    // Placeholder: Return empty array as backend endpoint not yet implemented
    return [];
  },

  // --- STUDENT INFO ---
  getStudentByUsn: async (usn) => {
      // Placeholder: This should be handled by StudentProfileService
      return null;
  },

  // --- USER MANAGEMENT ---
  getAllUsers: async () => {
    try {
      const res = await fetch(`${API_URL}/placement/users`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      return await res.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }
};
