import { getHeaders, refreshAccessToken, getAccessToken } from './tokenService';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

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

export const StudentProfileService = {
  getMajors: async () => {
    const res = await authFetch(`${API_URL}/student/meta/majors`);
    if (!res.ok) throw new Error('Failed to fetch majors');
    return await res.json();
  },
  getMinors: async () => {
    const res = await authFetch(`${API_URL}/student/meta/minors`);
    if (!res.ok) throw new Error('Failed to fetch minors');
    return await res.json();
  },
  getSpecializations: async () => {
    const res = await authFetch(`${API_URL}/student/meta/specializations`);
    if (!res.ok) throw new Error('Failed to fetch specializations');
    return await res.json();
  },
  getSchools: async () => {
    const res = await authFetch(`${API_URL}/student/meta/schools`);
    if (!res.ok) throw new Error('Failed to fetch schools');
    return await res.json();
  },
  getPrograms: async () => {
    const res = await authFetch(`${API_URL}/student/meta/programs`);
    if (!res.ok) throw new Error('Failed to fetch programs');
    return await res.json();
  },
  getPersonalPage: async (usn) => {
    try {
      const res = await authFetch(`${API_URL}/student/${usn}/personal-page`);
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
      const res = await authFetch(`${API_URL}/student/${usn}/${sectionName}`);
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
      const res = await authFetch(`${API_URL}/student/${usn}/${sectionName}`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to save section (${res.status}): ${errorText}`);
      }
      return await res.json();
    } catch (e) {
      console.error(`Error saving ${sectionName}:`, e);
      throw e;
    }
  },

  // Get full profile for Resume generation
  getFullProfile: async (usn) => {
    try {
      const res = await authFetch(`${API_URL}/student/${usn}/full`);
      if (!res.ok) throw new Error('Failed to fetch full profile');
      return await res.json();
    } catch (e) {
      console.error('Error fetching full profile:', e);
      return null;
    }
  },

  uploadFile: async (usn, file, options = {}) => {
    const folder = options.folder || '';
    const formData = new FormData();
    formData.append('file', file);
    if (folder) {
      formData.append('folder', folder);
    }
    const doFetch = () => {
      const token = getAccessToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const query = folder ? `?folder=${encodeURIComponent(folder)}` : '';
      return fetch(`${API_URL}/student/${usn}/files/upload${query}`, {
        method: 'POST',
        headers,
        body: formData
      });
    };
    let res = await doFetch();
    if (res.status === 401 || res.status === 403) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        res = await doFetch();
      }
    }
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'File upload failed');
    }
    return res.json();
  },

  incrementProjectStats: async (projectId, type = 'view') => {
    try {
        const res = await authFetch(`${API_URL}/student/projects/${projectId}/stats`, {
            method: 'POST',
            body: JSON.stringify({ type })
        });
        if (!res.ok) throw new Error('Failed to update stats');
        return await res.json();
    } catch (e) {
        console.error('Error updating stats:', e);
        return null;
    }
  }
};
