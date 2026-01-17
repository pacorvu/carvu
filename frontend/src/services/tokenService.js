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
    const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    if (!resp.ok) {
      return null;
    }
    const data = await resp.json();
    if (data && data.access) {
      setAccessToken(data.access);
      return data.access;
    }
    return null;
  } catch (e) {
    console.error('Token refresh failed:', e);
    return null;
  }
};
