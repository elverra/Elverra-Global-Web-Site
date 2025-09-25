import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'support';
}

export const ProtectedRoute = ({ children, requiredRole = 'admin' }: ProtectedRouteProps) => {
  const { user, loading, userRole, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    // Redirect to login with a return URL
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Check if user has the required role
  if (requiredRole === 'admin' && !isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  // For support role, check if user has either admin or support role
  if (requiredRole === 'support' && !(isAdmin || userRole === 'support')) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
