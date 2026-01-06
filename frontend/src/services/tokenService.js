let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'Authorization': accessToken ? `Bearer ${accessToken}` : ''
  };
};
