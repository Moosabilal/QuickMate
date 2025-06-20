import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ roles }: { roles: string[] }) => {
  const { user, token } = useAuth();

  if (!token) return <Navigate to="/login" />;
  if (!user || !roles.includes(user.role)) return <Navigate to="/" />;

  return <Outlet />;
};

export default ProtectedRoute;