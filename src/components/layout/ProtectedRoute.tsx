import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean; // backward-compat: SUPERADMIN or SUPPORT
  requireAuth?: boolean;
  allowedRoles?: string[]; // e.g. ['USER'] | ['SUPPORT'] | ['SUPERADMIN'] | ['PARTNER']
}

const ProtectedRoute = ({ children, requireAdmin = false, requireAuth = true, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading, userRole, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If a specific role is required, user must be authenticated
  if ((requireAuth || allowedRoles) && !user) {
    return <Navigate to="/login" replace />;
  }

  // Map legacy requireAdmin to allowedRoles SUPERADMIN/SUPPORT
  const rolesNeeded = allowedRoles || (requireAdmin ? ['SUPERADMIN', 'SUPPORT'] : undefined);

  if (rolesNeeded) {
    const roleUpper = (userRole || '').toUpperCase();
    const ok = rolesNeeded.map(r => r.toUpperCase()).includes(roleUpper);
    if (!ok) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
              <p className="text-gray-600 mb-6">
                You don't have permission to access this area.
               
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  // Legacy: if requireAdmin but role detection failed, keep isAdmin fallback
  if (!rolesNeeded && requireAdmin && !isAdmin && user?.email !== 'admin@elverra.com' && user?.email !== 'oladokunefi123@gmail.com') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              You don't have permission to access this admin area. 
              {userRole ? ` Your current role: ${userRole}` : ''}
            </p>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                If you believe this is an error, please contact support.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;