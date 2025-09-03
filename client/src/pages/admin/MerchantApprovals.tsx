import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, User, Mail, Phone, MapPin } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
// Direct fetch calls like other components

interface MerchantApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  createdAt: string;
  merchantApprovalStatus: 'pending' | 'approved' | 'rejected';
}

const MerchantApprovals = () => {
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['/api/admin/merchant-applications'],
    queryFn: async () => {
      const response = await fetch('/api/admin/merchant-applications');
      if (!response.ok) throw new Error('Failed to fetch merchant applications');
      return response.json();
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/approve-merchant/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvedBy: 'admin' // In a real app, this would be the current admin's ID
        })
      });
      if (!response.ok) throw new Error('Failed to approve merchant');
      return response.json();
    },
    onSuccess: () => {
      toast.success('Merchant approved successfully!');
      queryClient.invalidateQueries({ queryKey: ['/api/admin/merchant-applications'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to approve merchant: ${error.message}`);
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const response = await fetch(`/api/admin/reject-merchant/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (!response.ok) throw new Error('Failed to reject merchant');
      return response.json();
    },
    onSuccess: () => {
      toast.success('Merchant application rejected.');
      queryClient.invalidateQueries({ queryKey: ['/api/admin/merchant-applications'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to reject merchant: ${error.message}`);
    }
  });

  const handleApprove = (userId: string) => {
    approveMutation.mutate(userId);
  };

  const handleReject = (userId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      rejectMutation.mutate({ userId, reason });
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute requireAdmin={true}>
        <Layout>
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAdmin={true}>
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Merchant Approvals</h1>
            <p className="text-gray-600">Review and approve pending merchant applications</p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Applications</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {applications.filter((app: MerchantApplication) => app.merchantApprovalStatus === 'pending').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Merchants</p>
                    <p className="text-2xl font-bold text-green-600">
                      {applications.filter((app: MerchantApplication) => app.merchantApprovalStatus === 'approved').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">
                      {applications.filter((app: MerchantApplication) => app.merchantApprovalStatus === 'rejected').length}
                    </p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Merchant Applications List */}
          <div className="space-y-6">
            {applications.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No merchant applications</h3>
                  <p className="text-gray-600">There are currently no merchant applications to review.</p>
                </CardContent>
              </Card>
            ) : (
              applications.map((application: MerchantApplication) => (
                <Card key={application.id} className="overflow-hidden">
                  <CardHeader className="bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{application.fullName}</CardTitle>
                        <CardDescription>
                          Applied on {new Date(application.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={
                          application.merchantApprovalStatus === 'pending' ? 'secondary' :
                          application.merchantApprovalStatus === 'approved' ? 'default' : 'destructive'
                        }
                        className={
                          application.merchantApprovalStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          application.merchantApprovalStatus === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }
                      >
                        {application.merchantApprovalStatus.charAt(0).toUpperCase() + application.merchantApprovalStatus.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Contact Information */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Contact Information</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{application.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{application.phone}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {application.address}, {application.city}, {application.country}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Actions</h4>
                        {application.merchantApprovalStatus === 'pending' && (
                          <div className="flex space-x-3">
                            <Button
                              onClick={() => handleApprove(application.id)}
                              disabled={approveMutation.isPending}
                              className="bg-green-600 hover:bg-green-700"
                              data-testid={`button-approve-${application.id}`}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              {approveMutation.isPending ? 'Approving...' : 'Approve'}
                            </Button>
                            <Button
                              onClick={() => handleReject(application.id)}
                              disabled={rejectMutation.isPending}
                              variant="destructive"
                              data-testid={`button-reject-${application.id}`}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
                            </Button>
                          </div>
                        )}
                        {application.merchantApprovalStatus === 'approved' && (
                          <Badge className="bg-green-100 text-green-800">
                            Merchant Approved
                          </Badge>
                        )}
                        {application.merchantApprovalStatus === 'rejected' && (
                          <Badge variant="destructive">
                            Application Rejected
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default MerchantApprovals;