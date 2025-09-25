import React from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import UserManagement from '@/components/superadmin/UserManagement';

const UserManagementPage: React.FC = () => {
  const { tab } = useParams<{ tab?: string }>();

  return (
    <ProtectedRoute requireAdmin={true}>
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">User & Role Management</h1>
          <p className="text-gray-600 mb-8">
            Manage users, roles, and permissions for the Elverra platform.
          </p>
          
          <UserManagement />
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default UserManagementPage;
