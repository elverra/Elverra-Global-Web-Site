import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  CreditCard, 
  Eye, 
  EyeOff, 
  Copy, 
  QrCode, 
  Shield,
  Crown,
  Heart,
  TrendingUp,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw
} from 'lucide-react';

// Types pour TypeScript
interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  category: string;
  merchant: string;
  status: 'completed' | 'pending';
}

interface CardData {
  cardNumber: string;
  expiryDate: string;
  cardType: 'essential' | 'premium' | 'elite' | 'child';
  status: 'Active' | 'Inactive';
  issueDate: string;
  lastTransactionDate: string;
  holderName: string;
  address: string;
  qrCodeData: string;
}

interface BillingData {
  cards: CardData[]; // Changed from single cardData to array of cards
  transactions: Transaction[];
  billing: {
    totalPaid: number;
    nextBillingDate: string | null;
    isExpiringSoon: boolean;
    activeSubscriptions: number;
    subscriptions: any[];
  } | {
    totalPaid: number;
    nextBillingDate: null;
    isExpiringSoon: false;
    currentPlan: 'essential' | 'premium' | 'elite';
    activeSubscriptions: number;
  };
}

import { useAuth } from '@/hooks/useAuth';
import { useMembership } from '@/hooks/useMembership';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useEffect } from 'react';

const MyCardSection = () => {
  const { user } = useAuth();
  const { membership } = useMembership();
  const { profile } = useUserProfile();
  const [showCardNumber, setShowCardNumber] = useState(false);

  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch real billing data
  useEffect(() => {
    const fetchBillingData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/client/billing?userId=${user.id}`);
        const result = await response.json();
        
        if (result.success) {
          setBillingData(result.data);
        } else {
          console.error('Failed to fetch billing data:', result.error);
        }
      } catch (error) {
        console.error('Error fetching billing data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, [user?.id]);

  // Use real data or fallback to defaults with real user information
  const cards = billingData?.cards || [{
    cardNumber: user?.id ? `**** **** **** ${user.id.slice(-4)}` : '**** **** **** ****',
    expiryDate: membership?.expiry_date ? new Date(membership.expiry_date).toLocaleDateString('en-GB', { month: '2-digit', year: '2-digit' }).replace('/', '/') : '12/25',
    cardType: (membership?.tier || 'essential') as 'essential' | 'premium' | 'elite' | 'child',
    status: membership?.is_active ? 'Active' : 'Inactive' as 'Active' | 'Inactive',
    issueDate: membership?.start_date || new Date().toISOString().split('T')[0],
    lastTransactionDate: new Date().toISOString().split('T')[0],
    holderName: profile?.full_name || user?.email?.split('@')[0] || 'Client',
    address: profile?.address || 'Bamako, Mali',
    qrCodeData: JSON.stringify({
      clientId: user?.id,
      plan: membership?.tier || 'essential',
      status: membership?.is_active ? 'active' : 'inactive',
      expiryDate: membership?.expiry_date
    })
  }];

  const transactions = billingData?.transactions || [];
  const billing = billingData?.billing || {
    totalPaid: 0,
    nextBillingDate: null,
    isExpiringSoon: false,
    currentPlan: membership?.tier || 'essential'
  };


  const getCardTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'essential':
        return 'from-gray-400 to-gray-600';
      case 'premium':
        return 'from-blue-500 to-blue-700';
      case 'elite':
        return 'from-purple-500 to-purple-700';
      case 'child':
        return 'from-pink-400 to-pink-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const getCardTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'elite':
        return <Crown className="h-6 w-6" />;
      case 'premium':
        return <Shield className="h-6 w-6" />;
      case 'child':
        return <Heart className="h-6 w-6" />;
      default:
        return <CreditCard className="h-6 w-6" />;
    }
  };

  const copyCardNumber = (cardNumber: string) => {
    navigator.clipboard.writeText(cardNumber.replace(/\s/g, ''));
    alert('Card number copied to clipboard!');
  };

  const handleTopUp = () => {
    alert('Redirecting to top-up page...');
  };

  const handleWithdraw = () => {
    alert('Withdraw request initiated. You will receive a confirmation shortly.');
  };

  const requestUpgrade = () => {
    alert('Upgrade request submitted! Our team will contact you shortly.');
  };

  const freezeCard = () => {
    alert('Card freeze request submitted. Your card will be temporarily disabled.');
  };

  const getTransactionIcon = (type: string) => {
    return type === 'credit' ? (
      <ArrowUpCircle className="h-5 w-5 text-green-600" />
    ) : (
      <ArrowDownCircle className="h-5 w-5 text-red-600" />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Mes Cartes</h2>
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-100 text-blue-800">
            {cards.length} carte{cards.length > 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="manage">Manage Card</TabsTrigger>
          <TabsTrigger value="upgrade">Upgrade</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Cards Display */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {cards.map((card, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  {/* Show locked card if payment not completed */}
                  {card.status === 'Inactive' ? (
                    <div className="bg-gray-200 rounded-xl p-8 text-center">
                      <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <span className="text-gray-500 text-2xl">🔒</span>
                      </div>
                      <h3 className="text-lg font-medium text-gray-600 mb-2">Carte {card.cardType === 'child' ? 'Enfant' : 'Adulte'} Verrouillée</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Votre carte sera disponible après le paiement
                      </p>
                      <Button onClick={() => window.location.href = '/client-subscription'} className="bg-blue-600 hover:bg-blue-700">
                        Compléter le Paiement
                      </Button>
                    </div>
                  ) : (
                    <div className={`bg-gradient-to-r ${getCardTypeColor(card.cardType)} rounded-xl p-6 text-white relative overflow-hidden`}>
                      {/* Card Background Pattern */}
                      <div className="absolute top-0 right-0 opacity-10">
                        <div className="w-32 h-32 rounded-full bg-white transform translate-x-8 -translate-y-8"></div>
                      </div>
                      
                      {/* Card Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          {getCardTypeIcon(card.cardType)}
                          <span className="font-bold">ELVERRA</span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs opacity-80">VALID THRU</p>
                          <p className="font-semibold">{card.expiryDate}</p>
                        </div>
                      </div>

                      {/* Card Number */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs opacity-80">CARD NUMBER</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowCardNumber(!showCardNumber)}
                            className="text-white hover:bg-white/20 p-1 h-auto"
                          >
                            {showCardNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        <p className="text-lg tracking-wider font-mono">
                          {showCardNumber ? card.cardNumber : '•••• •••• •••• 3456'}
                        </p>
                      </div>

                      {/* Card Holder and Address */}
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xs opacity-80">CLIENT</p>
                          <p className="font-semibold uppercase">{card.holderName}</p>
                          <p className="text-xs opacity-70">{card.address}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs opacity-80 capitalize">
                            {card.cardType === 'child' ? 'Carte Enfant' : `${card.cardType} Client`}
                          </p>
                          <div className="w-12 h-8 bg-white/20 rounded flex items-center justify-center">
                          <QrCode className="h-6 w-6 text-white/60" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Card Actions - only show if payment is complete */}
                {card.status === 'Active' && (
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" onClick={() => copyCardNumber(card.cardNumber)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Number
                    </Button>
                    <Button size="sm" variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Regenerate
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            ))}
          </div>

            {/* Balance and Limits */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Statut des Abonnements</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${('activeSubscriptions' in billing && billing.activeSubscriptions > 0) ? 'bg-green-400' : 'bg-red-400'}`} />
                      <span className="text-sm text-gray-900">{'activeSubscriptions' in billing ? billing.activeSubscriptions : cards.filter(card => card.status === 'Active').length} active{('activeSubscriptions' in billing && billing.activeSubscriptions > 1) || cards.filter(card => card.status === 'Active').length > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Payé</span>
                      <span className="text-gray-900">{billing.totalPaid?.toLocaleString()} FCFA</span>
                    </div>
                    {billing.nextBillingDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Prochaine Facturation</span>
                        <span className={`text-gray-900 ${billing.isExpiringSoon ? 'text-yellow-600' : ''}`}>
                          {new Date(billing.nextBillingDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {billing.isExpiringSoon && (
                    <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-yellow-700 text-sm">
                        <RefreshCw size={16} />
                        <span>Renouvellement requis bientôt</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>{transaction.merchant}</span>
                          <span>•</span>
                          <span>{new Date(transaction.date).toLocaleDateString()}</span>
                          <Badge variant="outline" className="text-xs">
                            {transaction.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}CFA {transaction.amount.toLocaleString()}
                      </p>
                      <Badge className={transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <Button variant="outline">
                  View All Transactions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Card Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Monthly Spending Limit</label>
                  <Select defaultValue="50000">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50000">CFA 50,000</SelectItem>
                      <SelectItem value="100000">CFA 100,000</SelectItem>
                      <SelectItem value="200000">CFA 200,000</SelectItem>
                      <SelectItem value="500000">CFA 500,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Daily Transaction Limit</label>
                  <Input placeholder="Enter daily limit" defaultValue="25000" />
                </div>

                <Button className="w-full">
                  Update Limits
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full" onClick={freezeCard}>
                  <Shield className="h-4 w-4 mr-2" />
                  Freeze Card
                </Button>

                <Button variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Request New PIN
                </Button>

                <Button variant="outline" className="w-full">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Report Lost/Stolen
                </Button>

                <Button variant="outline" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  View Card Details
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Transaction History Export</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select defaultValue="last-month">
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last-week">Last Week</SelectItem>
                    <SelectItem value="last-month">Last Month</SelectItem>
                    <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                    <SelectItem value="last-year">Last Year</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="pdf">
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                  </SelectContent>
                </Select>

                <Button>
                  Export Transactions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upgrade" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upgrade Your Card</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Essential Card */}
                <div className={`border rounded-lg p-6 ${cards.some(card => card.cardType === 'essential') ? 'border-blue-500 bg-blue-50' : ''}`}>
                  <div className="text-center">
                    <CreditCard className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">Essential</h3>
                    <p className="text-2xl font-bold mb-4">Free</p>
                    <ul className="text-sm space-y-2 mb-6">
                      <li>• Basic card features</li>
                      <li>• Monthly limit: CFA 50,000</li>
                      <li>• Standard support</li>
                      <li>• Basic rewards</li>
                    </ul>
                    {cards.some(card => card.cardType === 'essential') ? (
                      <Badge className="w-full py-2">Current Plan</Badge>
                    ) : (
                      <Button variant="outline" className="w-full">
                        Downgrade
                      </Button>
                    )}
                  </div>
                </div>

                {/* Premium Card */}
                <div className={`border rounded-lg p-6 ${cards.some(card => card.cardType === 'premium') ? 'border-blue-500 bg-blue-50' : ''}`}>
                  <div className="text-center">
                    <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">Premium</h3>
                    <p className="text-2xl font-bold mb-4">CFA 2,000/mo</p>
                    <ul className="text-sm space-y-2 mb-6">
                      <li>• Enhanced security features</li>
                      <li>• Monthly limit: CFA 200,000</li>
                      <li>• Priority support</li>
                      <li>• 2% cashback rewards</li>
                      <li>• Contactless payments</li>
                    </ul>
                    {cards.some(card => card.cardType === 'premium') ? (
                      <Badge className="w-full py-2">Current Plan</Badge>
                    ) : (
                      <Button className="w-full" onClick={requestUpgrade}>
                        Upgrade to Premium
                      </Button>
                    )}
                  </div>
                </div>

                {/* Elite Card */}
                <div className={`border rounded-lg p-6 ${cards.some(card => card.cardType === 'elite') ? 'border-purple-500 bg-purple-50' : ''}`}>
                  <div className="text-center">
                    <Crown className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">Elite</h3>
                    <p className="text-2xl font-bold mb-4">CFA 5,000/mo</p>
                    <ul className="text-sm space-y-2 mb-6">
                      <li>• All Premium features</li>
                      <li>• Monthly limit: CFA 500,000</li>
                      <li>• 24/7 concierge support</li>
                      <li>• 5% cashback rewards</li>
                      <li>• Airport lounge access</li>
                      <li>• Travel insurance</li>
                    </ul>
                    {cards.some(card => card.cardType === 'elite') ? (
                      <Badge className="w-full py-2 bg-purple-600">Current Plan</Badge>
                    ) : (
                      <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={requestUpgrade}>
                        Upgrade to Elite
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyCardSection;