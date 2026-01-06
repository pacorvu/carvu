import { createContext, useContext, useState, useEffect } from 'react';
import { setAccessToken } from '../services/tokenService';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Helper to process token and set user state
  const handleToken = (token) => {
    setAccessToken(token);
    const payload = decodeJwt(token);
    const u = {
      id: payload?.sub,
      role: payload?.role_name || payload?.role_id || 'student',
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

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
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

function decodeJwt(token) {
  try {
    const parts = token.split('.');
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return {};
  }
}
