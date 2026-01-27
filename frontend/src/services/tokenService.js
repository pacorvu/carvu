const ACCESS_TOKEN_KEY = 'carv_u_access_token';
let accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

export const setAccessToken = (token) => {
  accessToken = token;
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
};

export const getAccessToken = () => accessToken;

export const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'Authorization': accessToken ? `Bearer ${accessToken}` : ''
  };
};

export const refreshAccessToken = async () => {
  try {
    const API_URL = import.meta.env.VITE_BACKEND_URL || '';
    const resp = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    if (!resp.ok) {
      // If refresh fails (401), dispatch logout event so AuthContext can handle it
      window.dispatchEvent(new Event('auth:logout'));
      return null;
    }
    const data = await resp.json();
    if (data && data.access) {
      setAccessToken(data.access);
      return data.access;
    }
    window.dispatchEvent(new Event('auth:logout'));
    return null;
  } catch (e) {
    console.error('Token refresh failed:', e);
    return null;
  }
};
