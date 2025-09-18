import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Crown,
  Calendar,
  CreditCard,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Download,
  Star,
  Shield,
  Zap,
  Gift
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { useMembership } from '@/hooks/useMembership';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCardNumber } from '@/utils/cardUtils';

const SubscriptionsSection = () => {
  const { user } = useAuth();
  const { membership } = useMembership();
  const { t } = useLanguage();

  // Real billing data from API
  type Tx = {
    id: string;
    type: 'debit' | 'pending';
    amount: number;
    description: string;
    date: string;
    category: string;
    merchant: string;
    status: 'completed' | 'pending' | 'failed' | string;
  };

  type CardData = {
    cardNumber: string;
    expiryDate: string;
    cardType: 'essential' | 'premium' | 'elite' | 'child';
    status: 'Active' | 'Inactive';
    issueDate: string;
    lastTransactionDate: string;
    holderName?: string;
    address?: string;
    qrCodeData?: string;
  };

  const [billingLoading, setBillingLoading] = useState(true);
  const [cards, setCards] = useState<CardData[]>([]);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [nextBillingDate, setNextBillingDate] = useState<string | null>(null);
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);
  const [activeSubscriptions, setActiveSubscriptions] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);

  useEffect(() => {
    const fetchBilling = async () => {
      try {
        if (!user?.id) return;
        setBillingLoading(true);
        
        // Get user's subscriptions directly from Supabase
        const { data: subscriptions, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select('id, user_id, product_id, status, start_date, end_date, is_child, created_at')
          .eq('user_id', user.id);

        console.log('Direct Supabase - Raw subscriptions:', subscriptions);
        console.log('Direct Supabase - Subscription error:', subscriptionError);

        if (subscriptionError) {
          console.error('Subscription query failed:', subscriptionError);
          throw subscriptionError;
        }

        // Get user's payment history - handle permission errors gracefully
        let payments: any[] = [];
        try {
          const { data: paymentsData, error: paymentsError } = await supabase
            .from('payments')
            .select('*')
            .eq('user_id', user.id)
            .in('payment_method', ['orange_money', 'sama_money', 'stripe'])
            .order('created_at', { ascending: false })
            .limit(10);

          if (paymentsError) {
            console.warn('Payments query failed (using empty array):', paymentsError);
            payments = [];
          } else {
            payments = paymentsData || [];
          }
        } catch (error) {
          console.warn('Payments query exception (using empty array):', error);
          payments = [];
        }

        // Get product info for subscriptions
        const productIds = [...new Set((subscriptions || []).map(s => s.product_id).filter(Boolean))];
        let productsById: Record<string, { id: string; name: string }> = {};
        if (productIds.length > 0) {
          const { data: products } = await supabase
            .from('membership_products')
            .select('id, name')
            .in('id', productIds);
          (products || []).forEach(p => { productsById[p.id] = p; });
        }

        // Get membership cards
        const subIds = subscriptions?.map(s => s.id) || [];
        let cardsRows: any[] = [];
        if (subIds.length > 0) {
          const { data: mCards } = await supabase
            .from('membership_cards')
            .select('id, card_identifier, holder_full_name, holder_city, owner_user_id, subscription_id, product_id, status, issued_at, card_expiry_date, qr_data')
            .eq('owner_user_id', user.id)
            .in('subscription_id', subIds);
          cardsRows = mCards || [];
        }

        // Helper to infer adult tier from product name
        const inferTier = (name: string): 'essential' | 'premium' | 'elite' => {
          const n = (name || '').toLowerCase();
          if (n.includes('premium')) return 'premium';
          if (n.includes('elite')) return 'elite';
          return 'essential';
        };

        const cards: CardData[] = [];
        
        // Process subscriptions to create cards - prioritize active subscriptions
        const activeSubscriptions = (subscriptions || []).filter(s => s.status === 'active');
        const inactiveSubscriptions = (subscriptions || []).filter(s => s.status !== 'active');
        const allSubs = [...activeSubscriptions, ...inactiveSubscriptions];

        // Child card - prioritize active child subscription
        const childSub = allSubs.find(s => s.is_child === true);
        if (childSub) {
          const card = cardsRows.find(c => c.subscription_id === childSub.id);
          cards.push({
            cardNumber: card?.card_identifier ? formatCardNumber(card.card_identifier) : `**** **** **** ${user.id.slice(-4)}`,
            expiryDate: card?.card_expiry_date ? new Date(card.card_expiry_date).toLocaleDateString('en-GB', { month: '2-digit', year: '2-digit' }).replace('/', '/') : (childSub.end_date ? new Date(childSub.end_date).toLocaleDateString('en-GB', { month: '2-digit', year: '2-digit' }).replace('/', '/') : '12/25'),
            cardType: 'child',
            status: (card?.status || childSub.status) === 'active' ? 'Active' : 'Inactive',
            issueDate: card?.issued_at || childSub.start_date || new Date().toISOString().split('T')[0],
            lastTransactionDate: payments?.[0]?.created_at || new Date().toISOString().split('T')[0],
            holderName: card?.holder_full_name || (user as any)?.user_metadata?.full_name || 'Client',
            address: card?.holder_city || 'Bamako, Mali',
            qrCodeData: JSON.stringify(card?.qr_data || { clientId: user.id, cardType: 'child', status: childSub.status, expiryDate: childSub.end_date, holderName: (user as any)?.user_metadata?.full_name || 'Client' })
          });
        }

        // Adult card - prioritize active adult subscription
        const adultSub = allSubs.find(s => s.is_child !== true);
        if (adultSub) {
          const card = cardsRows.find(c => c.subscription_id === adultSub.id);
          const productName = productsById[adultSub.product_id]?.name || '';
          const tier = inferTier(productName) as 'essential' | 'premium' | 'elite';
          cards.push({
            cardNumber: card?.card_identifier ? formatCardNumber(card.card_identifier) : `**** **** **** ${user.id.slice(-4)}`,
            expiryDate: card?.card_expiry_date ? new Date(card.card_expiry_date).toLocaleDateString('en-GB', { month: '2-digit', year: '2-digit' }).replace('/', '/') : (adultSub.end_date ? new Date(adultSub.end_date).toLocaleDateString('en-GB', { month: '2-digit', year: '2-digit' }).replace('/', '/') : '12/25'),
            cardType: tier,
            status: (card?.status || adultSub.status) === 'active' ? 'Active' : 'Inactive',
            issueDate: card?.issued_at || adultSub.start_date || new Date().toISOString().split('T')[0],
            lastTransactionDate: payments?.[0]?.created_at || new Date().toISOString().split('T')[0],
            holderName: card?.holder_full_name || (user as any)?.user_metadata?.full_name || 'Client',
            address: card?.holder_city || 'Bamako, Mali',
            qrCodeData: JSON.stringify(card?.qr_data || { clientId: user.id, cardType: 'adult', plan: tier, status: adultSub.status, expiryDate: adultSub.end_date, holderName: (user as any)?.user_metadata?.full_name || 'Client' })
          });
        }

        console.log('Processed subscriptions:', allSubs.length, 'Active:', activeSubscriptions.length);
        console.log('Generated cards:', cards.length);



        // Format transactions for display - fallback to subscription data if no payments
        let formattedTransactions: Tx[] = [];
        
        if (payments && payments.length > 0) {
          formattedTransactions = payments.map(payment => ({
            id: payment.id,
            type: (payment.status === 'completed' ? 'debit' : 'pending') as 'debit' | 'pending',
            amount: payment.amount,
            description: `${(payment.payment_method || 'payment').replace('_', ' ')}${payment.metadata?.label ? ` - ${payment.metadata.label}` : payment.metadata?.tier ? ` - ${payment.metadata.tier}` : ''}`,
            date: payment.created_at.split('T')[0],
            category: 'Subscription',
            merchant: payment.payment_method === 'orange_money' ? 'Orange Money' : 
                      payment.payment_method === 'sama_money' ? 'SAMA Money' : 'Card Payment',
            status: payment.status
          }));
        } else if (subscriptions && subscriptions.length > 0) {
          // Fallback: create transaction entries from subscriptions
          formattedTransactions = subscriptions
            .filter(sub => sub.created_at)
            .map(sub => ({
              id: sub.id,
              type: 'debit' as 'debit',
              amount: 0, // Amount unknown without payment data
              description: `Subscription ${sub.is_child ? 'Enfant' : 'Adulte'} - ${productsById[sub.product_id]?.name || 'Plan'}`,
              date: sub.created_at.split('T')[0],
              category: 'Subscription',
              merchant: 'Elverra Global',
              status: sub.status === 'active' ? 'completed' : 'pending'
            }))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 10);
        }

        // Calculate billing summary
        const totalPaid = payments?.filter(p => p.status === 'completed')
          .reduce((sum, p) => sum + p.amount, 0) || 0;

        const activeSubs = subscriptions?.filter(sub => sub.status === 'active') || [];
        const nextBillingDate = activeSubs.length > 0 ? 
          Math.min(...activeSubs.map(sub => new Date(sub.end_date).getTime())) : null;
        const isExpiringSoon = nextBillingDate ? 
          new Date(nextBillingDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : false;

        console.log('Direct Supabase - Processed cards:', cards);
        console.log('Direct Supabase - Active subscriptions:', activeSubs);
        
        setCards(cards);
        setTransactions(formattedTransactions);
        setNextBillingDate(nextBillingDate ? new Date(nextBillingDate).toISOString() : null);
        setIsExpiringSoon(isExpiringSoon);
        setActiveSubscriptions(activeSubs.length);
        setTotalPaid(totalPaid);

      } catch (e) {
        console.error('Failed to load billing data from Supabase:', e);
        // Set empty states to show 'no data' instead of loading forever
        setCards([]);
        setTransactions([]);
        setActiveSubscriptions(0);
        setTotalPaid(0);
      } finally {
        setBillingLoading(false);
      }
    };
    fetchBilling();
  }, [user?.id]);

  // Subscription plans
  const plans = [
    {
      id: 'essential',
      name: 'Essential',
      price: 10000,
      monthlyPrice: 1000,
      yearlyPrice: 10000,
      yearlyDiscount: 5,
      features: [
        'Basic job search access',
        'Community forum access',
        'Basic customer support',
        'Limited job applications (5/month)',
        'Basic profile features'
      ],
      popular: false,
      color: 'gray'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 10000,
      monthlyPrice: 2000,
      yearlyPrice: 10000,
      yearlyDiscount: 10,
      features: [
        'Everything in Essential',
        'Unlimited job applications',
        'Priority customer support',
        'Resume builder & templates',
        'Job alerts & notifications',
        'Profile boost & visibility',
        'Basic affiliate program',
        'Ô Secours emergency services',
        'Online store seller access',
        'E-Library access (basic)'
      ],
      popular: true,
      color: 'blue'
    },
    {
      id: 'elite',
      name: 'Elite',
      price: 10000,
      monthlyPrice: 5000,
      yearlyPrice: 10000,
      yearlyDiscount: 20,
      features: [
        'Everything in Premium',
        'VIP job matching',
        '24/7 priority support',
        'Career coaching sessions',
        'Advanced analytics & insights',
        'Networking events access',
        'Premium affiliate program',
        'Full Ô Secours coverage',
        'Advanced e-library access',
        'Exclusive discounts & offers',
        'Personal account manager'
      ],
      popular: false,
      color: 'purple'
    }
  ];

  // Determine current adult tier (one of essential/premium/elite) and kiddies ownership
  type AdultTier = 'essential' | 'premium' | 'elite';
  const hasChildCard = cards.some(c => c.cardType === 'child');
  const adultTier: AdultTier | null = (() => {
    // Prefer active adult card, else any adult card
    const activeAdult = cards.find(c => c.cardType !== 'child' && c.status === 'Active');
    if (activeAdult) return activeAdult.cardType as AdultTier;
    const anyAdult = cards.find(c => c.cardType !== 'child');
    return (anyAdult?.cardType as AdultTier | undefined) || null;
  })();
  
  console.log('SubscriptionsSection - Cards:', cards);
  console.log('SubscriptionsSection - hasChildCard:', hasChildCard, 'adultTier:', adultTier);
  console.log('SubscriptionsSection - Transactions:', transactions);
  console.log('SubscriptionsSection - Billing data:', { nextBillingDate, isExpiringSoon, activeSubscriptions, totalPaid });
  console.log('SubscriptionsSection - API Response Check - User ID:', user?.id);

  // Build current subscription summary - reflect multiple cards
  const currentSubscription = {
    plan: adultTier ? adultTier.charAt(0).toUpperCase() + adultTier.slice(1) : 'No Adult Plan',
    status: (hasChildCard || adultTier) ? 'active' : 'inactive',
    billingCycle: 'monthly',
    nextBillingDate: nextBillingDate ? new Date(nextBillingDate).toISOString().split('T')[0] : '—',
    price: adultTier === 'elite' ? 5000 : adultTier === 'premium' ? 2000 : 0,
    startDate: membership?.start_date || '—',
    autoRenew: true,
    // Additional info for multiple cards display
    hasMultipleCards: hasChildCard && !!adultTier,
    cardsSummary: [
      ...(hasChildCard ? ['Kiddies Card'] : []),
      ...(adultTier ? [`${adultTier.charAt(0).toUpperCase() + adultTier.slice(1)} Card`] : [])
    ].join(' + ')
  };

  const [selectedBillingCycle, setSelectedBillingCycle] = useState('monthly');

  const getPlanColor = (color: string) => {
    const colors = {
      gray: 'border-gray-300 bg-gray-50',
      blue: 'border-blue-300 bg-blue-50',
      purple: 'border-purple-300 bg-purple-50'
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="h-3 w-3 mr-1" />Paused</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getBillingStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handlePlanChange = (planId: string) => {
    // Redirect to unified subscription/payment page where user selects gateway
    // This preserves the same payment structure across flows
    window.location.href = `/client-subscription?target=${planId}`;
  };

  // Label helper for adult plan actions
  const getPlanActionLabel = (targetId: AdultTier): string => {
    if (!adultTier) return 'Choose';
    if (adultTier === targetId) return 'Current';
    const rank: Record<AdultTier, number> = { essential: 1, premium: 2, elite: 3 };
    const current = rank[adultTier];
    return rank[targetId] > current ? 'Upgrade' : 'Downgrade';
  };

  const handleCancelSubscription = () => {
    if (window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium features.')) {
      alert('Subscription cancellation request submitted. Your subscription will remain active until the next billing date.');
    }
  };

  const toggleAutoRenew = () => {
    alert(`Auto-renewal ${currentSubscription.autoRenew ? 'disabled' : 'enabled'} successfully!`);
  };

  const downloadInvoice = (invoiceId: string) => {
    alert(`Downloading invoice ${invoiceId}...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{t('subscriptions.title') || 'Subscriptions'}</h2>
        <div className="flex items-center gap-2">
          {getStatusBadge(currentSubscription.status)}
          <Badge className="bg-blue-100 text-blue-800 capitalize">
            {currentSubscription.plan}
          </Badge>
        </div>
      </div>

      {billingLoading && (
        <div className="p-4 bg-gray-50 border rounded text-sm text-gray-600">Loading billing information...</div>
      )}

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current">Current Plan</TabsTrigger>
          <TabsTrigger value="plans">Available Plans</TabsTrigger>
          <TabsTrigger value="billing">Billing History</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          {/* Current Subscription Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Your Active Cards</span>
                {getStatusBadge(currentSubscription.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentSubscription.hasMultipleCards ? (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">You have multiple active cards:</p>
                  <p className="text-lg font-semibold text-blue-900">{currentSubscription.cardsSummary}</p>
                </div>
              ) : cards.length === 0 && !billingLoading ? (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800">No active cards found in database</p>
                  <p className="text-sm text-yellow-700">Please check your subscription status or contact support</p>
                </div>
              ) : null}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Primary Adult Plan</p>
                    <p className="text-xl font-semibold">{currentSubscription.plan}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Kiddies Card</p>
                    <p className="font-medium">{hasChildCard ? 'Active' : 'Not Purchased'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Next Billing Date</p>
                    <p className="font-medium">{currentSubscription.nextBillingDate}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Adult Plan Cost</p>
                    <p className="text-xl font-semibold text-green-600">CFA {currentSubscription.price.toLocaleString()}/month</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Active Subscriptions</p>
                    <p className="font-medium">{activeSubscriptions}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Auto-renewal</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleAutoRenew}
                    >
                      {currentSubscription.autoRenew ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </div>
              </div>
              
              {currentSubscription.status === 'active' && (
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Manage Subscription</h4>
                      <p className="text-sm text-gray-600">Cancel or modify your current plan</p>
                    </div>
                    <div className="space-x-2">
                      <Button variant="outline" size="sm">
                        Modify Plan
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={handleCancelSubscription}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Usage Progress (for non-unlimited plans) */}
              {adultTier && adultTier !== 'elite' && (
                <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-orange-800">Usage This Month</span>
                    <span className="text-sm text-orange-600">4/{adultTier === 'premium' ? '15' : '5'} Applications</span>
                  </div>
                  <div className="w-full bg-orange-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: adultTier === 'premium' ? '27%' : '80%' }}></div>
                  </div>
                  <p className="text-xs text-orange-700 mt-2">
                    You've used most of your {adultTier} plan limits. Upgrade to Elite for unlimited access.
                  </p>
                  <Button size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={() => handlePlanChange('elite')}>
                    <Zap className="h-4 w-4 mr-2" />
                    Upgrade to Elite
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Usage Summary */}
          <Card>
            <CardHeader>
              <CardTitle>This Month's Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Job Applications</span>
                    <span>8 / {currentSubscription.plan === 'Essential' ? '5' : '∞'}</span>
                  </div>
                  <Progress 
                    value={currentSubscription.plan === 'Essential' ? 100 : 25} 
                    className="h-2" 
                  />
                  {currentSubscription.plan === 'Essential' && (
                    <p className="text-xs text-red-600 mt-1">Limit exceeded - Upgrade to continue applying</p>
                  )}
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Support Tickets</span>
                    <span>2 / {currentSubscription.plan === 'Elite' ? '∞' : '5'}</span>
                  </div>
                  <Progress value={40} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>E-Library Downloads</span>
                    <span>12 / {currentSubscription.plan === 'Essential' ? '0' : currentSubscription.plan === 'Premium' ? '50' : '∞'}</span>
                  </div>
                  <Progress 
                    value={currentSubscription.plan === 'Essential' ? 0 : currentSubscription.plan === 'Premium' ? 24 : 15} 
                    className="h-2" 
                  />
                </div>
              </div>

              {currentSubscription.plan === 'Essential' && (
                <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-semibold text-orange-800 mb-2">Upgrade for More Features</h4>
                  <p className="text-sm text-orange-700 mb-3">
                    You've reached the limits of your Essential plan. Upgrade to Premium or Elite for unlimited access.
                  </p>
                  <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                    <Zap className="h-4 w-4 mr-2" />
                    Upgrade Now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Kiddies Card Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Kiddies (Child) Card
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Status</p>
                  {hasChildCard ? (
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">Not Purchased</Badge>
                  )}
                </div>
                {!hasChildCard && (
                  <Button className="bg-pink-600 hover:bg-pink-700" onClick={() => window.location.href = '/client-subscription?target=child'}>
                    Purchase Kiddies Card
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Billing Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Account Billing Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Active Subscriptions</p>
                  <p className="font-semibold">{activeSubscriptions}</p>
                </div>
                <div>
                  <p className="text-gray-600">Next Billing Date</p>
                  <p className={`font-semibold ${isExpiringSoon ? 'text-orange-600' : ''}`}>{nextBillingDate ? new Date(nextBillingDate).toLocaleDateString() : '—'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Spent</p>
                  <p className="font-semibold">CFA {totalPaid.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  {isExpiringSoon ? (
                    <Badge className="bg-yellow-100 text-yellow-800">Expiring Soon</Badge>
                  ) : (
                    <Badge variant="outline">OK</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          {/* Billing Cycle Toggle */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-4">
                <span className={selectedBillingCycle === 'monthly' ? 'font-semibold' : 'text-gray-600'}>
                  Monthly
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedBillingCycle(selectedBillingCycle === 'monthly' ? 'yearly' : 'monthly')}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <span className={selectedBillingCycle === 'yearly' ? 'font-semibold' : 'text-gray-600'}>
                  Yearly
                  <Badge className="ml-2 bg-green-100 text-green-800">Save 17%</Badge>
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Your Cards (reflect child + one adult if available) */}
          <Card>
            <CardHeader>
              <CardTitle>Your Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cards.slice(0, 2).map((c, idx) => (
                  <div key={`${c.cardType}-${idx}`} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">{c.cardType === 'child' ? 'Kiddies' : c.cardType}</Badge>
                        <span className="text-xs text-gray-500">{c.cardNumber}</span>
                      </div>
                      <Badge className={c.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>{c.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>
                        <span className="block">Issued</span>
                        <span className="font-medium">{c.issueDate?.split('T')[0] || '—'}</span>
                      </div>
                      <div>
                        <span className="block">Expires</span>
                        <span className="font-medium">{c.expiryDate || '—'}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {cards.length === 0 && (
                  <p className="text-sm text-gray-600">No cards yet. Purchase an adult plan or a Kiddies card to get started.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Kiddies Purchase Tile */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold mb-1">Kiddies (Child) Card</h4>
                  <p className="text-sm text-gray-600">A dedicated card for children with protective features.</p>
                </div>
                {hasChildCard ? (
                  <Badge className="bg-green-100 text-green-800">Already Purchased</Badge>
                ) : (
                  <Button className="bg-pink-600 hover:bg-pink-700" onClick={() => window.location.href = '/client-subscription?target=child'}>
                    Buy Kiddies Card
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Plans Grid: if adult tier exists, offer upgrade/downgrade; else allow purchase */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative ${getPlanColor(plan.color)} ${plan.popular ? 'border-2 border-blue-500' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-4 py-1">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      {selectedBillingCycle === 'monthly' ? (
                        <div>
                          <span className="text-3xl font-bold">CFA {plan.monthlyPrice.toLocaleString()}</span>
                          <span className="text-gray-600">/month</span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-3xl font-bold">CFA {plan.yearlyPrice.toLocaleString()}</span>
                          <span className="text-gray-600">/year</span>
                          {plan.yearlyDiscount > 0 && (
                            <div className="text-sm text-green-600 font-medium">
                              Save {plan.yearlyDiscount}% annually
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="text-center">
                    {adultTier === plan.id ? (
                      <Badge className="w-full py-3 bg-green-100 text-green-800">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Current Plan
                      </Badge>
                    ) : (
                      <Button
                        className={`w-full ${
                          plan.color === 'purple' 
                            ? 'bg-purple-600 hover:bg-purple-700' 
                            : plan.color === 'blue'
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : ''
                        }`}
                        variant={plan.color === 'gray' ? 'outline' : 'default'}
                        onClick={() => handlePlanChange(plan.id)}
                      >
                        {getPlanActionLabel(plan.id as AdultTier)} to {plan.name}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Plan Comparison Note */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Gift className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold mb-2">Special Offers</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• New clients get 50% off their first month on Premium or Elite plans</li>
                    <li>• Annual billing saves you 17% compared to monthly billing</li>
                    <li>• Students get an additional 25% discount with valid student ID</li>
                    <li>• Refer friends and earn 1 month free for each successful referral</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Billing History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold">Invoice/Tx ID</th>
                      <th className="text-left py-3 px-4 font-semibold">Date</th>
                      <th className="text-left py-3 px-4 font-semibold">Description</th>
                      <th className="text-left py-3 px-4 font-semibold">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold">Payment Method</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 px-4 text-center text-gray-500">
                          {billingLoading ? 'Loading transactions...' : 'No billing history found'}
                        </td>
                      </tr>
                    ) : (
                      transactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4 font-medium">{tx.id}</td>
                          <td className="py-4 px-4">{new Date(tx.date).toLocaleDateString()}</td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-700">{tx.description}</span>
                          </td>
                          <td className="py-4 px-4 font-semibold">
                            {tx.amount === 0 ? 'Free' : `CFA ${tx.amount.toLocaleString()}`}
                          </td>
                          <td className="py-4 px-4">{tx.merchant}</td>
                          <td className="py-4 px-4">{getBillingStatusBadge(tx.status === 'completed' ? 'paid' : tx.status)}</td>
                          <td className="py-4 px-4">
                            {tx.amount > 0 && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => downloadInvoice(tx.id)}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Invoice
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-between items-center">
                <p className="text-sm text-gray-600">Total spent: CFA {totalPaid.toLocaleString()}</p>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export All Invoices
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SubscriptionsSection;