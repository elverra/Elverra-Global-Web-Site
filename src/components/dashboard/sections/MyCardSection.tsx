import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  CreditCard,
  TrendingUp,
  ArrowUpCircle,
  ArrowDownCircle,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Crown,
  Shield,
  Copy,
  RefreshCw
} from 'lucide-react';

const MyCardSection = () => {
  const { user } = useAuth();
  const { membership } = useMembership();
  const { profile } = useUserProfile();
  const { t } = useLanguage();
  const [showBalance, setShowBalance] = useState(true);
  const [showCardNumber, setShowCardNumber] = useState(false);

  // Mock card data
  const cardData = {
    cardNumber: '1234 5678 9012 3456',
    expiryDate: '04/28',
    cvv: '123',
    balance: 10000,
    availableCredit: 50000,
    monthlyLimit: 100000,
    usedThisMonth: 35000,
    cardType: membership?.tier || 'Essential',
    status: 'Active',
    issueDate: '2024-01-01',
    lastTransactionDate: '2024-01-22'
  };

  // Mock transaction history
  const [transactions] = useState([
    {
      id: 'TXN001',
      type: 'debit',
      amount: 15000,
      description: 'Online Purchase - TechStore',
      date: '2024-01-22',
      category: 'Shopping',
      merchant: 'TechStore Mali',
      status: 'completed'
    },
    {
      id: 'TXN002',
      type: 'credit',
      amount: 25000,
      description: 'Top-up via Orange Money',
      date: '2024-01-20',
      category: 'Top-up',
      merchant: 'Orange Money',
      status: 'completed'
    },
    {
      id: 'TXN003',
      type: 'debit',
      amount: 5000,
      description: 'Coffee Shop Payment',
      date: '2024-01-19',
      category: 'Food & Drinks',
      merchant: 'Café Bamako',
      status: 'completed'
    },
    {
      id: 'TXN004',
      type: 'debit',
      amount: 3500,
      description: 'Transport - Bus Ticket',
      date: '2024-01-18',
      category: 'Transport',
      merchant: 'SOTRAMA',
      status: 'completed'
    },
    {
      id: 'TXN005',
      type: 'credit',
      amount: 50000,
      description: 'Salary Credit',
      date: '2024-01-15',
      category: 'Income',
      merchant: 'Employer Direct Deposit',
      status: 'completed'
    }
  ]);

  const memberName = profile?.full_name || user?.email?.split('@')[0] || 'Card Holder';
  const progressPercentage = (cardData.usedThisMonth / cardData.monthlyLimit) * 100;

  const getCardTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'essential':
        return 'from-gray-400 to-gray-600';
      case 'premium':
        return 'from-blue-500 to-blue-700';
      case 'elite':
        return 'from-purple-500 to-purple-700';
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
      default:
        return <CreditCard className="h-6 w-6" />;
    }
  };

  const copyCardNumber = () => {
    navigator.clipboard.writeText(cardData.cardNumber.replace(/\s/g, ''));
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
        <h2 className="text-2xl font-bold text-gray-900">My Card</h2>
        <div className="flex items-center gap-2">
          <Badge className={`${cardData.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {cardData.status}
          </Badge>
          <Badge className="bg-blue-100 text-blue-800 capitalize">
            {cardData.cardType}
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
          {/* Card Display */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                {/* Show locked card if payment not completed */}
                {!membership?.is_active ? (
                  <div className="bg-gray-200 rounded-xl p-8 text-center">
                    <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-gray-500 text-2xl">🔒</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-600 mb-2">Card Locked</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Your membership card will be available after payment completion
                    </p>
                    <Button onClick={() => window.location.href = '/membership-payment'} className="bg-blue-600 hover:bg-blue-700">
                      Complete Payment
                    </Button>
                  </div>
                ) : (
                  <div className={`bg-gradient-to-r ${getCardTypeColor(cardData.cardType)} rounded-xl p-6 text-white relative overflow-hidden`}>
                    {/* Card Background Pattern */}
                  <div className="absolute top-0 right-0 opacity-10">
                    <div className="w-32 h-32 rounded-full bg-white transform translate-x-8 -translate-y-8"></div>
                  </div>
                  
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      {getCardTypeIcon(cardData.cardType)}
                      <span className="font-bold">ELVERRA</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs opacity-80">VALID THRU</p>
                      <p className="font-semibold">{cardData.expiryDate}</p>
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
                      {showCardNumber ? cardData.cardNumber : '•••• •••• •••• 3456'}
                    </p>
                  </div>

                  {/* Card Holder */}
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs opacity-80">CARD HOLDER</p>
                      <p className="font-semibold uppercase">{memberName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs opacity-80 capitalize">{cardData.cardType} Member</p>
                      <div className="w-12 h-8 bg-white/20 rounded flex items-center justify-center">
                        <div className="w-8 h-5 bg-white/40 rounded"></div>
                      </div>
                    </div>
                    </div>
                  </div>
                )}

                {/* Card Actions - only show if payment is complete */}
                {membership?.is_active && (
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" onClick={copyCardNumber}>
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

            {/* Balance and Limits */}
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Current Balance</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowBalance(!showBalance)}
                    >
                      {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-3xl font-bold text-blue-600 mb-4">
                    {showBalance ? `CFA ${cardData.balance.toLocaleString()}` : 'CFA ••••••'}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" onClick={handleTopUp}>
                      <Plus className="h-4 w-4 mr-2" />
                      Top Up
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={handleWithdraw}>
                      <Minus className="h-4 w-4 mr-2" />
                      Withdraw
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Monthly Spending</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Used this month</span>
                      <span>CFA {cardData.usedThisMonth.toLocaleString()}</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{Math.round(progressPercentage)}% used</span>
                      <span>Limit: CFA {cardData.monthlyLimit.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Available Credit</h3>
                  <p className="text-2xl font-bold text-green-600 mb-2">
                    CFA {cardData.availableCredit.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Credit line available for emergency use
                  </p>
                </CardContent>
              </Card>
            </div>
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
                  <Select defaultValue={cardData.monthlyLimit.toString()}>
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
                <div className={`border rounded-lg p-6 ${cardData.cardType === 'Essential' ? 'border-blue-500 bg-blue-50' : ''}`}>
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
                    {cardData.cardType === 'Essential' ? (
                      <Badge className="w-full py-2">Current Plan</Badge>
                    ) : (
                      <Button variant="outline" className="w-full">
                        Downgrade
                      </Button>
                    )}
                  </div>
                </div>

                {/* Premium Card */}
                <div className={`border rounded-lg p-6 ${cardData.cardType === 'Premium' ? 'border-blue-500 bg-blue-50' : ''}`}>
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
                    {cardData.cardType === 'Premium' ? (
                      <Badge className="w-full py-2">Current Plan</Badge>
                    ) : (
                      <Button className="w-full" onClick={requestUpgrade}>
                        Upgrade to Premium
                      </Button>
                    )}
                  </div>
                </div>

                {/* Elite Card */}
                <div className={`border rounded-lg p-6 ${cardData.cardType === 'Elite' ? 'border-purple-500 bg-purple-50' : ''}`}>
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
                    {cardData.cardType === 'Elite' ? (
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