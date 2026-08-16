import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, tokenStorage } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

function decodeToken(token) {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }
  const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
  const email = payload.sub || payload.email;
  if (!email) {
    throw new Error('Token missing email');
  }
  const exp = payload.exp;
  if (!exp || Date.now() >= exp * 1000) {
    throw new Error('Token expired');
  }
  // The backend now signs the role directly into the JWT (see JwtUtil#generateToken).
  // This is authoritative — never inferred from the email string.
  const role = (payload.role || 'STUDENT').toLowerCase();
  return { email, role };
}

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for token on load and restore the session from it.
  useEffect(() => {
    const token = tokenStorage.getAccessToken();
    if (token) {
      try {
        setUser(decodeToken(token));
      } catch (e) {
        console.warn('Failed to parse token', e);
        tokenStorage.clear();
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  // Shared by password login, register, Google login and the silent-refresh
  // path: stashes the access+refresh pair and updates the in-memory user.
  function applyAuthResponse(data, { redirect } = { redirect: true }) {
    if (!data?.token || !data.email) {
      throw new Error('Invalid auth response');
    }
    tokenStorage.setTokens(data.token, data.refreshToken);
    const role = (data.role || 'STUDENT').toLowerCase();
    const nextUser = { email: data.email, role };
    setUser(nextUser);
    if (redirect) {
      navigate(role === 'admin' ? '/admin' : '/', { replace: true });
    }
    return nextUser;
  }

  const login = async (credentials) => {
    try {
      const data = await authApi.login(credentials);
      applyAuthResponse(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const data = await authApi.register(userData);
      if (data?.token && data.email) {
        // New registrations are always STUDENT accounts (enforced server-side).
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

  // Kicks off Google Sign-In/Sign-Up: ask the backend for the consent URL,
  // then hand the browser off to Google. It comes back to /auth/google/callback.
  const loginWithGoogle = async () => {
    try {
      const { url } = await authApi.getGoogleUrl();
      window.location.href = url;
    } catch (err) {
      setError(err.message || 'Could not start Google sign-in.');
      throw err;
    }
  };

  // Called by the /auth/google/callback page once Google redirects back with ?code=.
  const completeGoogleLogin = async (code) => {
    try {
      const data = await authApi.googleCallback(code);
      applyAuthResponse(data);
      return data;
    } catch (err) {
      setError(err.message || 'Google sign-in failed.');
      throw err;
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    navigate('/login', { replace: true });
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    loginWithGoogle,
    completeGoogleLogin,
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
