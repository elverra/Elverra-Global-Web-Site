import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { 
  Shield, 
  Coins, 
  AlertTriangle, 
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  CreditCard,
  User,
  Settings
} from 'lucide-react';
import MembershipGuard from '@/components/membership/MembershipGuard';

const SecoursMyAccount = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch user's subscriptions
  const { data: subscriptions, isLoading: subscriptionsLoading } = useQuery({
    queryKey: ['user-secours-subscriptions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const mockResult = { data: [], error: null }; // TODO: Replace with API call
      const { data, error } = mockResult;
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Fetch user's rescue requests
  const { data: rescueRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ['user-rescue-requests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const mockResult = { data: [], error: null }; // TODO: Replace with API call
      const { data, error } = mockResult;
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Fetch user's token transactions
  const { data: tokenTransactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['user-token-transactions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const response = await fetch(`/api/users/${user.id}/token-transactions?limit=50`);
      
      if (!response.ok) {
        if (response.status === 404) return [];
        throw new Error('Failed to fetch token transactions');
      }
      
      const data = await response.json();
      return data;
    },
    enabled: !!user?.id
  });

  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async (subscriptionId: string) => {
      const response = await fetch(`/api/secours/subscriptions/${subscriptionId}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }
      
      const data = await response.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-secours-subscriptions'] });
      toast.success('Subscription cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to cancel subscription');
    }
  });

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

  const getSubscriptionProgress = (subscription: any) => {
    const subscriptionDate = new Date(subscription.subscription_date);
    const thirtyDaysLater = new Date(subscriptionDate);
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
    const now = new Date();
    
    if (now >= thirtyDaysLater) return 100;
    
    const totalTime = thirtyDaysLater.getTime() - subscriptionDate.getTime();
    const elapsedTime = now.getTime() - subscriptionDate.getTime();
    
    return Math.max(0, Math.min(100, (elapsedTime / totalTime) * 100));
  };

  const getDaysUntilEligible = (subscription: any) => {
    const subscriptionDate = new Date(subscription.subscription_date);
    const thirtyDaysLater = new Date(subscriptionDate);
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
    const now = new Date();
    
    if (now >= thirtyDaysLater) return 0;
    
    return Math.ceil((thirtyDaysLater.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getTokenValue = (subscriptionType: string) => {
    switch (subscriptionType) {
      case 'auto':
        return 750;
      case 'cata_catanis':
      case 'school_fees':
        return 500;
      case 'motors':
      case 'telephone':
        return 250;
      default:
        return 0;
    }
  };

  // Calculate stats
  const totalTokens = subscriptions?.reduce((sum, sub) => sum + sub.token_balance, 0) || 0;
  const activeSubscriptions = subscriptions?.filter(sub => sub.is_active).length || 0;
  const totalRequests = rescueRequests?.length || 0;
  const completedRequests = rescueRequests?.filter(req => req.status === 'completed').length || 0;
  const totalTokensPurchased = tokenTransactions?.filter(tx => tx.transaction_type === 'purchase')
    .reduce((sum, tx) => sum + tx.token_amount, 0) || 0;
  const totalSpent = tokenTransactions?.filter(tx => tx.transaction_type === 'purchase')
    .reduce((sum, tx) => sum + tx.token_value_fcfa, 0) || 0;

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please log in to access your Ô Secours account.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  const isLoading = subscriptionsLoading || requestsLoading || transactionsLoading;

  return (
    <MembershipGuard requiredFeature="canAccessOSecours">
      <Layout>
        <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">My Ô Secours Account</h1>
            <p className="text-gray-600">
              Manage your emergency assistance subscriptions and track your activity
            </p>
          </div>

          {isLoading ? (
            <div className="text-center">Loading your account information...</div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
                    <Coins className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalTokens}</div>
                    <p className="text-xs text-gray-600">
                      Across {activeSubscriptions} active services
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Services</CardTitle>
                    <Shield className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{activeSubscriptions}</div>
                    <p className="text-xs text-gray-600">
                      Out of {subscriptions?.length || 0} total
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Rescue Requests</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalRequests}</div>
                    <p className="text-xs text-gray-600">
                      {completedRequests} completed
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalSpent.toLocaleString()}</div>
                    <p className="text-xs text-gray-600">
                      FCFA spent on {totalTokensPurchased} tokens
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="subscriptions">My Services</TabsTrigger>
                  <TabsTrigger value="requests">Rescue History</TabsTrigger>
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Service Status Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {subscriptions && subscriptions.length > 0 ? (
                      subscriptions.map((subscription) => {
                        const progress = getSubscriptionProgress(subscription);
                        const daysLeft = getDaysUntilEligible(subscription);
                        const tokenValue = getTokenValue(subscription.subscription_type);
                        const estimatedRescueValue = Math.floor(subscription.token_balance * tokenValue * 1.5);

                        return (
                          <Card key={subscription.id} className={`${subscription.is_active ? 'border-green-200' : 'border-gray-200'}`}>
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle className="capitalize">
                                  {subscription.subscription_type.replace('_', ' ')} Service
                                </CardTitle>
                                <Badge variant={subscription.is_active ? "default" : "secondary"}>
                                  {subscription.is_active ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                              <CardDescription>
                                Subscribed on {new Date(subscription.subscription_date).toLocaleDateString()}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Emergency Eligibility</span>
                                  <span>{progress >= 100 ? 'Eligible' : `${daysLeft} days left`}</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                              </div>

                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <div className="text-gray-600">Token Balance</div>
                                  <div className="font-medium">{subscription.token_balance} tokens</div>
                                </div>
                                <div>
                                  <div className="text-gray-600">Rescue Value</div>
                                  <div className="font-medium text-green-600">
                                    {estimatedRescueValue.toLocaleString()} FCFA
                                  </div>
                                </div>
                              </div>

                              {subscription.last_token_purchase_date && (
                                <div className="text-xs text-gray-500">
                                  Last token purchase: {new Date(subscription.last_token_purchase_date).toLocaleDateString()}
                                </div>
                              )}

                              {subscription.is_active && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => cancelSubscriptionMutation.mutate(subscription.id)}
                                  disabled={cancelSubscriptionMutation.isPending}
                                  className="w-full"
                                >
                                  Cancel Subscription
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })
                    ) : (
                      <Card className="col-span-full">
                        <CardContent className="pt-6">
                          <div className="text-center space-y-4">
                            <Shield className="h-12 w-12 text-gray-400 mx-auto" />
                            <h3 className="text-lg font-semibold text-gray-900">No Active Services</h3>
                            <p className="text-gray-600">
                              Subscribe to Ô Secours emergency services to get started with your protection plan.
                            </p>
                            <Button onClick={() => window.location.href = '/services/osecours'}>
                              <Plus className="h-4 w-4 mr-2" />
                              Browse Services
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="subscriptions" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>My Service Subscriptions</CardTitle>
                      <CardDescription>
                        Manage your Ô Secours emergency service subscriptions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {subscriptions && subscriptions.length > 0 ? (
                        <div className="space-y-4">
                          {subscriptions.map((sub) => (
                            <div key={sub.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="space-y-1">
                                <div className="font-medium capitalize">
                                  {sub.subscription_type.replace('_', ' ')} Service
                                </div>
                                <div className="text-sm text-gray-600">
                                  Subscribed: {new Date(sub.subscription_date).toLocaleDateString()}
                                </div>
                                {sub.last_token_purchase_date && (
                                  <div className="text-xs text-gray-500">
                                    Last purchase: {new Date(sub.last_token_purchase_date).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                              <div className="text-right space-y-2">
                                <Badge variant={sub.is_active ? "default" : "secondary"}>
                                  {sub.is_active ? "Active" : "Cancelled"}
                                </Badge>
                                <div className="text-sm font-medium">
                                  {sub.token_balance} tokens
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-8">
                          No subscriptions found
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="requests" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Rescue Request History</CardTitle>
                      <CardDescription>
                        Track your emergency assistance requests
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {rescueRequests && rescueRequests.length > 0 ? (
                        <div className="space-y-4">
                          {rescueRequests.map((request) => (
                            <div key={request.id} className="p-4 border rounded-lg space-y-3">
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="capitalize">
                                  {request.secours_subscriptions?.subscription_type?.replace('_', ' ')}
                                </Badge>
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(request.status)}
                                  <Badge variant={
                                    request.status === 'completed' ? 'default' :
                                    request.status === 'approved' ? 'secondary' :
                                    request.status === 'rejected' ? 'destructive' : 'outline'
                                  }>
                                    {request.status}
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-sm text-gray-700">
                                {request.request_description}
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Rescue Value:</span>
                                <span className="font-medium text-green-600">
                                  {request.rescue_value_fcfa.toLocaleString()} FCFA
                                </span>
                              </div>
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>Requested: {new Date(request.request_date).toLocaleDateString()}</span>
                                {request.processed_date && (
                                  <span>Processed: {new Date(request.processed_date).toLocaleDateString()}</span>
                                )}
                              </div>
                              {request.admin_notes && (
                                <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                                  Admin Note: {request.admin_notes}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-8">
                          No rescue requests yet
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="transactions" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Token Transaction History</CardTitle>
                      <CardDescription>
                        View your token purchases and rescue claims
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {tokenTransactions && tokenTransactions.length > 0 ? (
                        <div className="space-y-4">
                          {tokenTransactions.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="space-y-1">
                                <div className="font-medium flex items-center gap-2">
                                  {tx.transaction_type === 'purchase' ? 
                                    <CreditCard className="h-4 w-4 text-green-600" /> : 
                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                  }
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
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-8">
                          No transactions found
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
          </div>
        </div>
      </Layout>
    </MembershipGuard>
  );
};

export default SecoursMyAccount;