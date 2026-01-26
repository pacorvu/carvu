import { createContext, useContext, useState, useEffect } from 'react';
import { setAccessToken, getAccessToken, refreshAccessToken } from '../services/tokenService';
import { decodeJwt } from '../utils/jwt';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleToken = (token) => {
    setAccessToken(token);
    const payload = decodeJwt(token);
    
    let role;
    if (payload?.role_id) {
      switch (Number(payload.role_id)) {
        case 1: role = 'superadmin'; break;
        case 2: role = 'student'; break;
        case 3:
        case 4:
        case 8:
          role = 'admin'; break;
        case 5: role = 'alumni'; break;
        case 6: role = 'management'; break;
        case 7: role = 'parent'; break;
        case 9: role = 'company'; break;
        case 12: role = 'dean'; break;
        default: role = 'student';
      }
    } else if (payload?.role_name) {
      const rn = String(payload.role_name).toLowerCase();
      if (['placement_director', 'placement_officers', 'placement_officer', 'admin_viewer'].includes(rn)) {
        role = 'admin';
      } else if (rn === 'sudo_admin') {
        role = 'superadmin';
      } else if (['student', 'alumni', 'management', 'parent', 'company', 'dean'].includes(rn)) {
        role = rn;
      } else {
        role = 'student';
      }
    }

    const u = {
      id: payload?.sub,
      role: role || 'student',
      token_version: payload?.token_version || 0,
      usn: payload?.usn
    };
    setUser(u);
    setIsAuthenticated(true);
    return u;
  };

  // Silent refresh on load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getAccessToken();
      let hasValidToken = false;
      if (storedToken) {
        const payload = decodeJwt(storedToken);
        const currentTime = Date.now() / 1000;
        if (payload && payload.exp > currentTime) {
          handleToken(storedToken);
          hasValidToken = true;
        }
      }
      if (!hasValidToken) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          handleToken(refreshed);
        } else {
          setAccessToken(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      
      if (!resp.ok) {
        setLoading(false);
        return { success: false, message: 'Invalid credentials' };
      }
      
      const data = await resp.json();
      const u = handleToken(data.access);
      
      // Merge extra user data from login response if needed (e.g. email)
      if (data.user) {
        setUser(prev => ({ ...prev, ...data.user }));
      }

      setLoading(false);
      return { success: true, user: u };
    } catch (e) {
      setLoading(false);
      return { success: false, message: 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (e) {
      console.error('Logout failed:', e);
    }
    
    setAccessToken(null);
    setUser(null);
    setIsAuthenticated(false);
    // Optional: Clear other app state if needed
  };

  const setSession = (access, extraUser) => {
    const u = handleToken(access);
    if (extraUser) {
      setUser(prev => ({ ...prev, ...extraUser }));
    }
    return u;
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    setSession,
    isAdmin: user?.role === 'admin' || user?.role === 'superadmin',
    isSuperAdmin: user?.role === 'superadmin',
    userRole: user?.role
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
