import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMembership } from '@/hooks/useMembership';
import { useLanguage } from '@/contexts/LanguageContext';
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

const SubscriptionsSection = () => {
  const { user } = useAuth();
  const { membership } = useMembership();
  const { t } = useLanguage();

  // Mock subscription data
  const currentSubscription = {
    plan: membership?.tier || 'Essential',
    status: 'active',
    billingCycle: 'monthly',
    nextBillingDate: '2024-02-15',
    price: membership?.tier === 'elite' ? 5000 : membership?.tier === 'premium' ? 2000 : 0,
    startDate: '2024-01-15',
    autoRenew: true,
    daysUntilRenewal: 12
  };

  // Mock billing history
  const [billingHistory] = useState([
    {
      id: 'INV001',
      date: '2024-01-15',
      plan: 'Premium',
      amount: 2000,
      status: 'paid',
      method: 'Orange Money',
      downloadUrl: '#'
    },
    {
      id: 'INV002',
      date: '2023-12-15',
      plan: 'Premium',
      amount: 2000,
      status: 'paid',
      method: 'SAMA Money',
      downloadUrl: '#'
    },
    {
      id: 'INV003',
      date: '2023-11-15',
      plan: 'Essential',
      amount: 0,
      status: 'paid',
      method: 'Free',
      downloadUrl: '#'
    }
  ]);

  // Subscription plans
  const plans = [
    {
      id: 'essential',
      name: 'Essential',
      price: 0,
      monthlyPrice: 0,
      yearlyPrice: 0,
      yearlyDiscount: 0,
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
      price: 2000,
      monthlyPrice: 2000,
      yearlyPrice: 20000,
      yearlyDiscount: 17,
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
      price: 5000,
      monthlyPrice: 5000,
      yearlyPrice: 50000,
      yearlyDiscount: 17,
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
    if (planId === currentSubscription.plan.toLowerCase()) {
      alert('You are already on this plan.');
      return;
    }
    alert(`Plan change to ${planId} initiated. You will be redirected to payment.`);
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
        <h2 className="text-2xl font-bold text-gray-900">Subscriptions</h2>
        <div className="flex items-center gap-2">
          {getStatusBadge(currentSubscription.status)}
          <Badge className="bg-blue-100 text-blue-800 capitalize">
            {currentSubscription.plan}
          </Badge>
        </div>
      </div>

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
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Current Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Plan</p>
                  <p className="text-2xl font-bold text-blue-600 capitalize">{currentSubscription.plan}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Monthly Cost</p>
                  <p className="text-2xl font-bold text-green-600">
                    CFA {currentSubscription.price.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Next Billing</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {currentSubscription.daysUntilRenewal} days
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Subscription Details</h4>
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Start Date:</span>
                    <span className="font-medium ml-2">{currentSubscription.startDate}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Billing Cycle:</span>
                    <span className="font-medium ml-2 capitalize">{currentSubscription.billingCycle}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Next Billing:</span>
                    <span className="font-medium ml-2">{currentSubscription.nextBillingDate}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Auto Renewal:</span>
                    <span className="font-medium ml-2">{currentSubscription.autoRenew ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-4">
                <Button onClick={toggleAutoRenew}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {currentSubscription.autoRenew ? 'Disable Auto-Renewal' : 'Enable Auto-Renewal'}
                </Button>
                
                <Button variant="outline">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Update Payment Method
                </Button>
                
                {currentSubscription.plan !== 'Essential' && (
                  <Button variant="outline" onClick={handleCancelSubscription}>
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Cancel Subscription
                  </Button>
                )}
              </div>
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

          {/* Plans Grid */}
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
                    {currentSubscription.plan.toLowerCase() === plan.id ? (
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
                        {plan.id === 'essential' ? 'Downgrade' : 'Upgrade'} to {plan.name}
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
                    <li>• New members get 50% off their first month on Premium or Elite plans</li>
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
                      <th className="text-left py-3 px-4 font-semibold">Invoice ID</th>
                      <th className="text-left py-3 px-4 font-semibold">Date</th>
                      <th className="text-left py-3 px-4 font-semibold">Plan</th>
                      <th className="text-left py-3 px-4 font-semibold">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold">Payment Method</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billingHistory.map((bill) => (
                      <tr key={bill.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium">{bill.id}</td>
                        <td className="py-4 px-4">{new Date(bill.date).toLocaleDateString()}</td>
                        <td className="py-4 px-4">
                          <Badge variant="outline">{bill.plan}</Badge>
                        </td>
                        <td className="py-4 px-4 font-semibold">
                          {bill.amount === 0 ? 'Free' : `CFA ${bill.amount.toLocaleString()}`}
                        </td>
                        <td className="py-4 px-4">{bill.method}</td>
                        <td className="py-4 px-4">{getBillingStatusBadge(bill.status)}</td>
                        <td className="py-4 px-4">
                          {bill.amount > 0 && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => downloadInvoice(bill.id)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Invoice
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Total spent: CFA {billingHistory.reduce((sum, bill) => sum + bill.amount, 0).toLocaleString()}
                </p>
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