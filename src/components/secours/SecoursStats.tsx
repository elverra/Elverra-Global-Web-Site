import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Shield, Coins, AlertTriangle } from 'lucide-react';

const SecoursStats = () => {
  // Fetch user's subscriptions with detailed stats
  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['secours-stats'],
    queryFn: async () => {
      return [] as any[];
    }
  });

  // Fetch token transactions for charts
  const { data: transactions } = useQuery({
    queryKey: ['token-transactions-stats'],
    queryFn: async () => {
      return [] as any[];
    }
  });

  // Fetch rescue requests stats
  const { data: rescueStats } = useQuery({
    queryKey: ['rescue-stats'],
    queryFn: async () => {
      return [] as any[];
    }
  });

  if (isLoading) {
    return <div className="text-center">Loading statistics...</div>;
  }

  const totalTokens = subscriptions?.reduce((sum, sub) => sum + sub.token_balance, 0) || 0;
  const totalSubscriptions = subscriptions?.length || 0;
  const activeSubscriptions = subscriptions?.filter(sub => sub.is_active).length || 0;
  const totalRescueRequests = rescueStats?.length || 0;
  const completedRescues = rescueStats?.filter(req => req.status === 'completed').length || 0;

  // Prepare chart data
  const subscriptionData = subscriptions?.map(sub => ({
    name: sub.subscription_type.replace('_', ' ').toUpperCase(),
    tokens: sub.token_balance,
    type: sub.subscription_type
  })) || [];

  const transactionData = transactions?.reduce((acc: any[], tx) => {
    const month = new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const existing = acc.find(item => item.month === month);
    
    if (existing) {
      existing.tokens += tx.token_amount;
      existing.value += tx.token_value_fcfa;
    } else {
      acc.push({
        month,
        tokens: tx.token_amount,
        value: tx.token_value_fcfa
      });
    }
    return acc;
  }, []) || [];

  const statusData = [
    { name: 'Pending', value: rescueStats?.filter(r => r.status === 'pending').length || 0, color: '#f59e0b' },
    { name: 'Approved', value: rescueStats?.filter(r => r.status === 'approved').length || 0, color: '#10b981' },
    { name: 'Completed', value: rescueStats?.filter(r => r.status === 'completed').length || 0, color: '#3b82f6' },
    { name: 'Rejected', value: rescueStats?.filter(r => r.status === 'rejected').length || 0, color: '#ef4444' }
  ].filter(item => item.value > 0);

  const getSubscriptionTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      motors: '#3b82f6',
      cata_catanis: '#10b981',
      auto: '#f59e0b',
      telephone: '#8b5cf6',
      school_fees: '#ef4444'
    };
    return colors[type] || '#6b7280';
  };

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <BarChart className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-900">No Data Available</h3>
            <p className="text-gray-600">
              Subscribe to Ô Secours services to view your statistics and analytics.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Your Ô Secours Statistics</h2>
        <p className="text-gray-600">
          Track your token usage, subscriptions, and rescue history.
        </p>
      </div>

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
              Across all subscriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptions}</div>
            <p className="text-xs text-gray-600">
              Out of {totalSubscriptions} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rescue Requests</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRescueRequests}</div>
            <p className="text-xs text-gray-600">
              {completedRescues} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalRescueRequests > 0 ? Math.round((completedRescues / totalRescueRequests) * 100) : 0}%
            </div>
            <p className="text-xs text-gray-600">
              Rescue completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Token Balance by Subscription */}
        <Card>
          <CardHeader>
            <CardTitle>Token Balance by Service</CardTitle>
            <CardDescription>
              Current token distribution across your subscriptions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subscriptionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="tokens" 
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rescue Request Status */}
        <Card>
          <CardHeader>
            <CardTitle>Rescue Request Status</CardTitle>
            <CardDescription>
              Distribution of your rescue request statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No rescue requests yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Token Purchase History */}
      {transactionData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Token Purchase History</CardTitle>
            <CardDescription>
              Your monthly token purchase trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={transactionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'tokens' ? `${value} tokens` : `${value} FCFA`,
                    name === 'tokens' ? 'Tokens' : 'Value'
                  ]}
                />
                <Bar dataKey="tokens" fill="#3b82f6" name="tokens" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Subscription Details */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Details</CardTitle>
          <CardDescription>
            Detailed view of all your Ô Secours subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                    {sub.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <div className="text-sm font-medium">
                    {sub.token_balance} tokens
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecoursStats;
