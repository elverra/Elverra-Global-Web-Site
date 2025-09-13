import React from 'react';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PartnerDashboard: React.FC = () => {
  return (
    <ProtectedRoute requireAuth={true} allowedRoles={['PARTNER']}>
      <Layout>
        <div className="container mx-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle>Partner Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">Welcome to your partner dashboard.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default PartnerDashboard;
