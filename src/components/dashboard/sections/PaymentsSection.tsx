import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Filter, CreditCard, TrendingUp, DollarSign } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';

const PaymentsSection = () => {
  const { user } = useAuth();
  const [filterDate, setFilterDate] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAmount, setFilterAmount] = useState('');
  const [payments, setPayments] = useState<any[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    if (user?.id) {
      fetchPaymentData();
    }
  }, [user]);

  // Filter payments based on selected criteria
  useEffect(() => {
    let filtered = [...payments];

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(payment => payment.category === filterCategory);
    }

    // Filter by date range
    if (filterDate !== 'all') {
      const now = new Date();
      let startDate = new Date();

      switch (filterDate) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      if (filterDate !== 'all') {
        filtered = filtered.filter(payment => new Date(payment.date) >= startDate);
      }
    }

    // Filter by amount
    if (filterAmount) {
      const amount = parseFloat(filterAmount);
      if (!isNaN(amount)) {
        filtered = filtered.filter(payment => payment.amount >= amount);
      }
    }

    setFilteredPayments(filtered);
  }, [payments, filterDate, filterCategory, filterAmount]);

  const fetchPaymentData = async () => {
    try {
      if (!user?.id) return;

      let allTransactions: any[] = [];

      // 1. Get subscription payments
      try {
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (paymentsError) {
          console.warn('Subscription payments query failed:', paymentsError);
        } else if (paymentsData) {
          const subscriptionPayments = paymentsData.map(payment => ({
            id: payment.id,
            date: payment.created_at,
            description: `Souscription ${payment.metadata?.tier || 'carte'} - ${payment.payment_method?.replace('_', ' ')}`,
            category: 'subscription',
            currency: 'CFA',
            amount: payment.amount,
            status: payment.status,
            method: payment.payment_method === 'orange_money' ? 'Orange Money' : 
                    payment.payment_method === 'sama_money' ? 'SAMA Money' : 
                    payment.payment_method === 'cinetpay' ? 'CinetPay' : 'Paiement'
          }));
          allTransactions.push(...subscriptionPayments);
          console.log('Subscription payments loaded:', subscriptionPayments.length);
        }
      } catch (error) {
        console.warn('Subscription payments query failed:', error);
      }

      // Comment out or remove failing queries
      /*
      // 2. Get token purchases (Ô Secours)
      try {
        const { data: tokenTransactions, error: tokenError } = await supabase
          .from('secours_transactions')
          .select('*')
          .eq('user_id', user.id)
          // Remove invalid filter
          // .eq('transaction_type', 'purchase')
          .order('created_at', { ascending: false });

        if (tokenError) {
          console.warn('Token transactions query failed:', tokenError);
        } else if (tokenTransactions) {
          const tokenPayments = tokenTransactions.map(transaction => ({
            id: transaction.id,
            date: transaction.created_at,
            description: `Achat ${transaction.token_amount || ''} tokens - ${transaction.description || 'Ô Secours'}`,
            category: 'service',
            currency: 'CFA',
            amount: transaction.total_amount,
            status: 'completed',
            method: 'SAMA Money'
          }));
          allTransactions.push(...tokenPayments);
          console.log('Token transactions loaded:', tokenPayments.length);
        }
      } catch (error) {
        console.warn('Token transactions query failed:', error);
      }

      // 3. Get product posting payments
      try {
        const { data: productPayments, error: productError } = await supabase
          .from('products')
          .select('id, title, created_at')  // Remove invalid columns
          .eq('seller_id', user.id)
          // Remove invalid filter
          // .eq('posting_fee_paid', true)
          .order('created_at', { ascending: false });

        if (productError) {
          console.warn('Product posting payments query failed:', productError);
        } else if (productPayments) {
          const productFees = productPayments.map(product => ({
            id: product.id,
            date: product.created_at,
            description: `Frais publication - ${product.title}`,
            category: 'shopping',
            currency: 'CFA',
            amount: 500,  // Hardcode since column doesn't exist
            status: 'completed',
            method: 'SAMA Money'
          }));
          allTransactions.push(...productFees);
          console.log('Product posting payments loaded:', productFees.length);
        }
      } catch (error) {
        console.warn('Product posting payments query failed:', error);
      }
      */

    

      // Sort all transactions by date
      const sortedTransactions = allTransactions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setPayments(sortedTransactions);
      setFilteredPayments(sortedTransactions);

      // Calculate stats
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const monthlyTransactions = sortedTransactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear &&
               t.status === 'completed';
      });

      const monthlySpent = monthlyTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

      const statsData = {
        monthlySpent: monthlySpent,
        activeLoans: 0, // No loan system implemented yet
        totalTransactions: sortedTransactions.length
      };
      setStats(statsData);

      console.log('Total transactions loaded:', sortedTransactions.length, 'Monthly spent:', monthlySpent);

    } catch (error) {
      console.error('Error fetching payment data:', error);
      toast({ title: 'Erreur', description: 'Échec du chargement des données de paiement', variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'repaid':
        return <Badge className="bg-green-100 text-green-800">✓ Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">⏳ Pending</Badge>;
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800">🔄 Active</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">✗ Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const exportToCSV = () => {
    if (filteredPayments.length === 0) {
      toast({ title: 'Aucune donnée', description: 'Aucune transaction à exporter', variant: 'destructive' });
      return;
    }

    const headers = ['ID Transaction', 'Date', 'Description', 'Montant', 'Devise', 'Méthode', 'Statut', 'Catégorie'];
    const csvContent = [
      headers.join(','),
      ...filteredPayments.map(payment => [
        `"${payment.id.toString().slice(-8)}"`,
        `"${new Date(payment.date).toLocaleDateString('fr-FR')}"`,
        `"${payment.description}"`,
        payment.amount,
        `"${payment.currency}"`,
        `"${payment.method}"`,
        `"${payment.status}"`,
        `"${payment.category}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historique_paiements_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: 'Succès', description: `${filteredPayments.length} transactions exportées avec succès` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Payments History</h2>
        <Button onClick={exportToCSV} className="bg-blue-600 hover:bg-blue-700">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Spent This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  CFA {stats.monthlySpent?.toLocaleString() || '0'}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Loans</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeLoans || 0}</p>
              </div>
              <CreditCard className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{payments.length || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={filterDate} onValueChange={setFilterDate}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="subscription">Subscription</SelectItem>
                <SelectItem value="service">Service</SelectItem>
                <SelectItem value="top-up">Top-up</SelectItem>
                <SelectItem value="shopping">Shopping</SelectItem>
                <SelectItem value="loan">Loan</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="Min Amount (CFA)"
              value={filterAmount}
              onChange={(e) => setFilterAmount(e.target.value)}
            />

            <Button variant="outline" onClick={() => {
              setFilterDate('all');
              setFilterCategory('all');
              setFilterAmount('');
            }}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Transaction ID</th>
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 font-semibold">Description</th>
                  <th className="text-left py-3 px-4 font-semibold">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold">Method</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 text-sm font-mono">
                        {payment.id.toString().slice(-8)}
                      </td>
                      <td className="py-4 px-4">
                        {new Date(payment.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-4 px-4">{payment.description}</td>
                      <td className="py-4 px-4 font-semibold">
                        {payment.currency} {payment.amount.toLocaleString()}
                      </td>
                      <td className="py-4 px-4">{payment.method}</td>
                      <td className="py-4 px-4">{getStatusBadge(payment.status)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 px-4 text-center text-gray-500">
                      Aucune transaction trouvée
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Loan History */}
      <Card>
        <CardHeader>
          <CardTitle>Loan History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Loan ID</th>
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 font-semibold">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold">Term</th>
                  <th className="text-left py-3 px-4 font-semibold">Due Date</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 font-medium">{loan.id}</td>
                    <td className="py-4 px-4">{new Date(loan.date).toLocaleDateString()}</td>
                    <td className="py-4 px-4 font-semibold">
                      {loan.currency} {loan.amount.toLocaleString()}
                    </td>
                    <td className="py-4 px-4">{loan.term}</td>
                    <td className="py-4 px-4">{new Date(loan.dueDate).toLocaleDateString()}</td>
                    <td className="py-4 px-4">{getStatusBadge(loan.status)}</td>
                  </tr>
                ))}
                {loans.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 px-4 text-center text-gray-500">
                      No loans found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentsSection;