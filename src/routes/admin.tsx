import { Route, Routes } from 'react-router-dom';
import { lazy } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Lazy load admin components
const ContactManagement = lazy(() => import('@/pages/superadmin/ContactManagement'));
const ContactDetail = lazy(() => import('@/pages/superadmin/ContactDetail'));

export const AdminRoutes = () => (
  <Routes>
    <Route 
      path="contact" 
      element={
        <ProtectedRoute requiredRole="admin">
          <ContactManagement />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="contact/:id" 
      element={
        <ProtectedRoute requiredRole="admin">
          <ContactDetail />
        </ProtectedRoute>
      } 
    />
  </Routes>
);

export default AdminRoutes;
