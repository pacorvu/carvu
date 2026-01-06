import { getHeaders } from './tokenService';

const API_URL = import.meta.env.VITE_BACKEND_URL;

export const StudentProfileService = {
  // Get a specific section for a student
  getSection: async (usn, sectionName) => {
    try {
      const res = await fetch(`${API_URL}/student/${usn}/${sectionName}`, {
        headers: getHeaders()
      });
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error('Failed to fetch section');
      }
      return await res.json();
    } catch (e) {
      console.error(`Error fetching ${sectionName}:`, e);
      return null;
    }
  },

  // Save a section
  saveSection: async (usn, sectionName, data) => {
    try {
      const res = await fetch(`${API_URL}/student/${usn}/${sectionName}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to save section');
      return await res.json();
    } catch (e) {
      console.error(`Error saving ${sectionName}:`, e);
      throw e;
    }
  },

  // Get full profile for Resume generation
  getFullProfile: async (usn) => {
    try {
      const res = await fetch(`${API_URL}/student/${usn}/full`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch full profile');
      return await res.json();
    } catch (e) {
      console.error('Error fetching full profile:', e);
      return {};
    }
  }
};
