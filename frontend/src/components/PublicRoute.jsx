import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    return user.role === 'company'
      ? <Navigate to="/company/dashboard" replace />
      : <Navigate to="/seeker/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;
