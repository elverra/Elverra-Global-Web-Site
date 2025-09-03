import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Shield, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  Coins,
  BarChart3,
  User,
  Calendar
} from 'lucide-react';

const SecoursAdmin = () => {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');

  // Fetch all rescue requests for admin review
  const { data: rescueRequests, isLoading } = useQuery({
    queryKey: ['admin-rescue-requests'],
    queryFn: async () => {
      const response = await fetch('/api/admin/secours/requests');
      
      if (!response.ok) {
        if (response.status === 404) return [];
        throw new Error('Failed to fetch rescue requests');
      }
      
      const data = await response.json();
      return data;
    }
  });

  // Fetch all subscriptions for overview
  const { data: allSubscriptions } = useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: async () => {
      const response = await fetch('/api/admin/secours/subscriptions');
      
      if (!response.ok) {
        if (response.status === 404) return [];
        throw new Error('Failed to fetch subscriptions');
      }
      
      const data = await response.json();
      return data;
    }
  });

  // Fetch token transactions
  const { data: tokenTransactions } = useQuery({
    queryKey: ['admin-token-transactions'],
    queryFn: async () => {
      const response = await fetch('/api/admin/secours/token-transactions?limit=100');
      
      if (!response.ok) {
        if (response.status === 404) return [];
        throw new Error('Failed to fetch token transactions');
      }
      
      const data = await response.json();
      return data;
    }
  });

  // Update rescue request status
  const updateRequestMutation = useMutation({
    mutationFn: async ({ 
      requestId, 
      status, 
      notes 
    }: { 
      requestId: string; 
      status: 'approved' | 'rejected' | 'completed'; 
      notes: string; 
    }) => {
      const updateData: any = {
        status,
        admin_notes: notes,
        processed_date: new Date().toISOString()
      };

      const response = await fetch(`/api/admin/secours/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update request status');
      }
      
      const data = await response.json();

      // If approved or completed, create a token transaction for the rescue claim
      if (status === 'completed') {
        const request = rescueRequests?.find((r: any) => r.id === requestId);
        if (request) {
          const transactionData = {
            subscription_id: request.subscription_id,
            transaction_type: 'rescue_claim',
            token_amount: request.token_balance_at_request,
            token_value_fcfa: request.rescue_value_fcfa,
            payment_method: 'rescue_payout',
            transaction_reference: `rescue_${requestId}`
          };
          
          await fetch('/api/admin/secours/token-transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transactionData),
          });
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rescue-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-token-transactions'] });
      toast.success('Request updated successfully');
      setSelectedRequest(null);
      setAdminNotes('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update request');
    }
  });

  const handleUpdateRequest = (status: 'approved' | 'rejected' | 'completed') => {
    if (!selectedRequest) return;
    
    updateRequestMutation.mutate({
      requestId: selectedRequest.id,
      status,
      notes: adminNotes
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'approved':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Calculate stats
  const totalRequests = rescueRequests?.length || 0;
  const pendingRequests = rescueRequests?.filter((r: any) => r.status === 'pending').length || 0;
  const completedRequests = rescueRequests?.filter((r: any) => r.status === 'completed').length || 0;
  const totalSubscriptions = allSubscriptions?.length || 0;
  const activeSubscriptions = allSubscriptions?.filter((s: any) => s.is_active).length || 0;

  if (isLoading) {
    return <div className="text-center">Loading admin dashboard...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Ô Secours Admin Dashboard</h1>
          <p className="text-gray-600">
            Manage emergency rescue requests and monitor system activity
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRequests}</div>
              <p className="text-xs text-gray-600">
                {pendingRequests} pending review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedRequests}</div>
              <p className="text-xs text-gray-600">
                {totalRequests > 0 ? Math.round((completedRequests / totalRequests) * 100) : 0}% success rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
              <Shield className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSubscriptions}</div>
              <p className="text-xs text-gray-600">
                {activeSubscriptions} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Token Volume</CardTitle>
              <Coins className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tokenTransactions?.reduce((sum: number, tx: any) => sum + tx.token_amount, 0) || 0}
              </div>
              <p className="text-xs text-gray-600">
                Total tokens transacted
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="requests">Rescue Requests</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="transactions">Token Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Requests List */}
              <Card>
                <CardHeader>
                  <CardTitle>Rescue Requests</CardTitle>
                  <CardDescription>
                    Review and manage emergency assistance requests
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {rescueRequests && rescueRequests.length > 0 ? (
                    rescueRequests.map((request: any) => (
                      <div 
                        key={request.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedRequest?.id === request.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedRequest(request)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="capitalize">
                            {request.secours_subscriptions?.subscription_type?.replace('_', ' ')}
                          </Badge>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(request.status)}
                            <Badge variant={getStatusBadgeVariant(request.status)}>
                              {request.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {request.rescue_value_fcfa.toLocaleString()} FCFA
                          </div>
                          <div className="text-xs text-gray-600 line-clamp-2">
                            {request.request_description}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(request.request_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      No rescue requests found
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Request Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Request Details</CardTitle>
                  <CardDescription>
                    {selectedRequest ? 'Review and take action' : 'Select a request to view details'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedRequest ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Service Type:</span>
                          <span className="font-medium capitalize">
                            {selectedRequest.secours_subscriptions?.subscription_type?.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Rescue Value:</span>
                          <span className="font-medium text-green-600">
                            {selectedRequest.rescue_value_fcfa.toLocaleString()} FCFA
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Token Balance:</span>
                          <span className="font-medium">
                            {selectedRequest.token_balance_at_request} tokens
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Request Date:</span>
                          <span className="font-medium">
                            {new Date(selectedRequest.request_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Subscription Date:</span>
                          <span className="font-medium">
                            {new Date(selectedRequest.secours_subscriptions?.subscription_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Description:</Label>
                        <div className="p-3 bg-gray-50 rounded-lg text-sm">
                          {selectedRequest.request_description}
                        </div>
                      </div>

                      {selectedRequest.admin_notes && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Previous Admin Notes:</Label>
                          <div className="p-3 bg-blue-50 rounded-lg text-sm">
                            {selectedRequest.admin_notes}
                          </div>
                        </div>
                      )}

                      {selectedRequest.status === 'pending' && (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="admin-notes">Admin Notes</Label>
                            <Textarea
                              id="admin-notes"
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              placeholder="Add notes about this request..."
                              rows={3}
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleUpdateRequest('approved')}
                              disabled={updateRequestMutation.isPending}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleUpdateRequest('completed')}
                              disabled={updateRequestMutation.isPending}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Complete
                            </Button>
                            <Button
                              onClick={() => handleUpdateRequest('rejected')}
                              disabled={updateRequestMutation.isPending}
                              variant="destructive"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      )}

                      {selectedRequest.status === 'approved' && (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="admin-notes">Admin Notes</Label>
                            <Textarea
                              id="admin-notes"
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              placeholder="Add completion notes..."
                              rows={3}
                            />
                          </div>

                          <Button
                            onClick={() => handleUpdateRequest('completed')}
                            disabled={updateRequestMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark as Completed
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>Select a rescue request to view details</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Subscriptions</CardTitle>
                <CardDescription>
                  Overview of all Ô Secours subscriptions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allSubscriptions && allSubscriptions.length > 0 ? (
                    allSubscriptions.map((sub: any) => (
                      <div key={sub.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="font-medium capitalize">
                            {sub.subscription_type.replace('_', ' ')} Service
                          </div>
                          <div className="text-sm text-gray-600">
                            User ID: {sub.user_id}
                          </div>
                          <div className="text-xs text-gray-500">
                            Subscribed: {new Date(sub.subscription_date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <Badge variant={sub.is_active ? "default" : "secondary"}>
                            {sub.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <div className="text-sm font-medium">
                            {sub.token_balance} tokens
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      No subscriptions found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Token Transactions</CardTitle>
                <CardDescription>
                  Recent token purchases and rescue claims
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tokenTransactions && tokenTransactions.length > 0 ? (
                    tokenTransactions.map((tx: any) => (
                      <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="font-medium">
                            {tx.transaction_type === 'purchase' ? 'Token Purchase' : 'Rescue Claim'}
                          </div>
                          <div className="text-sm text-gray-600 capitalize">
                            {tx.secours_subscriptions?.subscription_type?.replace('_', ' ')} Service
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className={`font-medium ${
                            tx.transaction_type === 'purchase' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {tx.transaction_type === 'purchase' ? '+' : '-'}{tx.token_amount} tokens
                          </div>
                          <div className="text-sm text-gray-600">
                            {tx.token_value_fcfa.toLocaleString()} FCFA
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      No transactions found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SecoursAdmin;