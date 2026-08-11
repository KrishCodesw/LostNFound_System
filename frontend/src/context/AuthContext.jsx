import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for token on load and set user (decode JWT)
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      try {
        // Check token format
        const parts = token.split('.');
        if (parts.length !== 3) {
          throw new Error('Invalid token format');
        }
        // Decode JWT (payload is second part)
        const payload = JSON.parse(atob(parts[1]));
        // The backend uses 'sub' for email in the token
        const email = payload.sub || payload.email;
        if (!email) {
          throw new Error('Token missing email');
        }
        // Check if token expired
        const exp = payload.exp;
        if (!exp || Date.now() >= exp * 1000) {
          throw new Error('Token expired');
        }
        // Determine role based on email (simple heuristic)
        const role = email.toLowerCase().includes('admin') ? 'admin' : 'student';
        setUser({ email, role });
      } catch (e) {
        console.warn('Failed to parse token', e);
        localStorage.removeItem('jwt_token');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const data = await authApi.login(credentials);
      if (data?.token && data.email) {
        localStorage.setItem('jwt_token', data.token);
        const role = data.email.toLowerCase().includes('admin') ? 'admin' : 'student';
        setUser({ email: data.email, role });
        // Redirect based on role
        navigate(role === 'admin' ? '/admin' : '/', { replace: true });
        return data;
      } else {
        throw new Error('Invalid login response');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const data = await authApi.register(userData);
      if (data?.token && data.email) {
        localStorage.setItem('jwt_token', data.token);
        const role = data.email.toLowerCase().includes('admin') ? 'admin' : 'student';
        setUser({ email: data.email, role });
        navigate('/login', { replace: true });
        return data;
      } else {
        throw new Error('Invalid registration response');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    authApi.logout();
    localStorage.removeItem('jwt_token');
    setUser(null);
    navigate('/login', { replace: true });
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
  };

  if (loading) {
    return <div>Loading auth...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
