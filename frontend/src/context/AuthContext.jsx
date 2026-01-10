import { createContext, useContext, useState, useEffect } from 'react';
import { setAccessToken, getAccessToken } from '../services/tokenService';
import { decodeJwt } from '../utils/jwt';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Helper to process token and set user state
  const handleToken = (token) => {
    setAccessToken(token);
    const payload = decodeJwt(token);
    
    let role = payload?.role_name;
    if (!role && payload?.role_id) {
      // Map role_id to role_name
      switch(Number(payload.role_id)) {
        case 1: role = 'superadmin'; break;
        case 2: role = 'student'; break;
        case 3: // placement_director
        case 4: // placement_officers
        case 8: // admin_viewer
          role = 'admin'; break;
        case 5: role = 'alumni'; break;
        case 6: role = 'management'; break;
        case 7: role = 'parent'; break;
        case 9: role = 'company'; break;
        case 12: role = 'dean'; break;
        default: role = 'student';
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
      // Attempt to restore from localStorage first
      const storedToken = getAccessToken();
      if (storedToken) {
        const payload = decodeJwt(storedToken);
        const currentTime = Date.now() / 1000;
        
        // If token is valid and not expired
        if (payload && payload.exp > currentTime) {
          handleToken(storedToken);
        }
      }

      try {
        const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include' // Important for sending the cookie
        });
        
        if (resp.ok) {
          const data = await resp.json();
          handleToken(data.access);
        }
      } catch (e) {
        console.log('Silent refresh failed:', e);
      } finally {
        setLoading(false);
      }
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
