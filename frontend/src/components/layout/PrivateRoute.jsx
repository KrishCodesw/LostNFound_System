import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export const PrivateRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, isAdmin, isStudent, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    if (requiredRole === 'admin' && !isAdmin) {
      return <Navigate to="/" replace />;
    }
    if (requiredRole === 'student' && !isStudent) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};
