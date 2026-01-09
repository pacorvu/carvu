import { getHeaders } from './tokenService';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const StudentProfileService = {
  getMajors: async () => {
    const res = await fetch(`${API_URL}/student/meta/majors`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch majors');
    return await res.json();
  },
  getMinors: async () => {
    const res = await fetch(`${API_URL}/student/meta/minors`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch minors');
    return await res.json();
  },
  getSpecializations: async () => {
    const res = await fetch(`${API_URL}/student/meta/specializations`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch specializations');
    return await res.json();
  },
  getPersonalPage: async (usn) => {
    try {
      const res = await fetch(`${API_URL}/student/${usn}/personal-page`, {
        headers: getHeaders()
      });
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error('Failed to fetch personal page');
      }
      return await res.json();
    } catch (e) {
      console.error('Error fetching personal page:', e);
      return null;
    }
  },
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
      let payload = data;
      if (sectionName === 'contact' && data) {
        payload = { ...data };
        if (payload.mobileNumber && !payload.phoneNumber) {
          payload.phoneNumber = payload.mobileNumber;
        }
      }
      const res = await fetch(`${API_URL}/student/${usn}/${sectionName}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
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
