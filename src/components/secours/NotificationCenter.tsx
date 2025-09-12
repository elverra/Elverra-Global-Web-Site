import { useState, useEffect } from 'react';
import { useState(null);
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Check, X, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'token_purchase' | 'low_balance' | 'rescue_approved' | 'rescue_rejected' | 'rescue_pending';
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

const NotificationCenter = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Fetch user's subscriptions to generate notifications
  const { data: subscriptions } = useQuery({
    queryKey: ['secours-subscriptions'],
    queryFn: async () => {
      const response = null;
      if (!response.ok) throw new Error('Failed to fetch user subscriptions');
      return response.json();
    },
    enabled: !!user
  });

  // Fetch recent token transactions
  const { data: recentTransactions } = useQuery({
    queryKey: ['recent-token-transactions'],
    queryFn: async () => {
      const response = null;
      if (!response.ok) throw new Error('Failed to fetch recent transactions');
      return response.json();
    },
    enabled: !!user
  });

  // Fetch recent rescue requests
  const { data: recentRescueRequests } = useQuery({
    queryKey: ['recent-rescue-requests'],
    queryFn: async () => {
      const response = null;
      if (!response.ok) throw new Error('Failed to fetch recent rescue requests');
      return response.json();
    },
    enabled: !!user
  });

  // Generate notifications based on data
  useEffect(() => {
    const generatedNotifications: Notification[] = [];

    // Check for low balance notifications
    if (subscriptions) {
      subscriptions.forEach(sub => {
        if (sub.token_balance < 30) {
          generatedNotifications.push({
            id: `low-balance-${sub.id}`,
            type: 'low_balance',
            title: 'Low Token Balance',
            message: `Your ${sub.subscription_type.replace('_', ' ')} subscription has only ${sub.token_balance} tokens remaining. Consider purchasing more tokens to maintain rescue eligibility.`,
            created_at: new Date().toISOString(),
            read: false,
            priority: 'high'
          });
        }
      });
    }

    // Add transaction notifications
    if (recentTransactions) {
      recentTransactions.forEach(transaction => {
        if (transaction.secours_subscriptions?.user_id === user?.id) {
          generatedNotifications.push({
            id: `transaction-${transaction.id}`,
            type: 'token_purchase',
            title: 'Token Purchase Successful',
            message: `Successfully purchased ${transaction.token_amount} tokens for ${transaction.token_value_fcfa.toLocaleString()} FCFA`,
            created_at: transaction.created_at,
            read: false,
            priority: 'medium'
          });
        }
      });
    }

    // Add rescue request notifications
    if (recentRescueRequests) {
      recentRescueRequests.forEach(request => {
        if (request.secours_subscriptions?.user_id === user?.id) {
          const statusMap = {
            pending: { title: 'Rescue Request Submitted', priority: 'medium' as const },
            approved: { title: 'Rescue Request Approved', priority: 'high' as const },
            rejected: { title: 'Rescue Request Rejected', priority: 'high' as const },
            completed: { title: 'Rescue Completed', priority: 'medium' as const }
          };

          const status = statusMap[request.status as keyof typeof statusMap];
          
          generatedNotifications.push({
            id: `rescue-${request.id}`,
            type: `rescue_${request.status}` as any,
            title: status.title,
            message: `Your rescue request for ${request.rescue_value_fcfa.toLocaleString()} FCFA is now ${request.status}.`,
            created_at: request.created_at,
            read: false,
            priority: status.priority
          });
        }
      });
    }

    setNotifications(generatedNotifications.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ));
  }, [subscriptions, recentTransactions, recentRescueRequests, user]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'token_purchase':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'low_balance':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'rescue_approved':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'rescue_rejected':
        return <X className="h-4 w-4 text-red-500" />;
      case 'rescue_pending':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-300';
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!user) {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <Check className="h-4 w-4 mr-1" />
            Mark all read
          </Button>
        </div>
        <CardDescription>
          Recent Ô Secours activity notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BellOff className="h-8 w-8 mx-auto mb-2 opacity-50" />
            No notifications yet
          </div>
        ) : (
          notifications.slice(0, 10).map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg border-l-4 ${getPriorityColor(notification.priority)} ${
                notification.read ? 'bg-gray-50' : 'bg-blue-50'
              }`}
            >
              <div className="flex items-start gap-3">
                {getNotificationIcon(notification.type)}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
                    {notification.title}
                  </p>
                  <p className={`text-xs mt-1 ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;