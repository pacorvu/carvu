import { getHeaders } from './tokenService';

const API_URL = import.meta.env.VITE_BACKEND_URL;

export const PlacementService = {
  // --- COMPANIES ---
  getAllCompanies: async () => {
    try {
      const res = await fetch(`${API_URL}/placement/companies`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch companies');
      return await res.json();
    } catch (error) {
      console.error('Error fetching companies:', error);
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
      if (!res.ok) throw new Error('Failed to fetch drives');
      return await res.json();
    } catch (error) {
      console.error('Error fetching drives:', error);
      return [];
    }
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
  }
};
