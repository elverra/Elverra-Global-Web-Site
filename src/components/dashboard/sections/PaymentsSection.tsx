import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Filter, CreditCard, TrendingUp, DollarSign } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const PaymentsSection = () => {
  const { user } = useAuth();
  const [filterDate, setFilterDate] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAmount, setFilterAmount] = useState('');
  const [payments, setPayments] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    if (user?.id) {
      fetchPaymentData();
    }
  }, [user]);

  const fetchPaymentData = async () => {
    try {
      // Mock payment history (placeholder; replace with real API later)
      const paymentsData = [
        {
          id: 'TX-001',
          date: new Date().toISOString(),
          description: 'Membership payment',
          category: 'subscription',
          currency: 'CFA',
          amount: 5000,
          status: 'completed',
          method: 'card'
        }
      ];
      setPayments(paymentsData);

      // Mock loan history
      const loansData: any[] = [
        // { id: 'LN-001', date: new Date().toISOString(), amount: 20000, currency: 'CFA', term: '6 months', dueDate: new Date(Date.now()+ 86400000*30).toISOString(), status: 'active' }
      ];
      setLoans(loansData);

      // Mock stats
      const statsData = {
        monthlySpent: paymentsData.reduce((s, p) => s + p.amount, 0),
        activeLoans: loansData.filter(l => l.status === 'active').length,
      };
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching payment data:', error);
      toast({ title: 'Error', description: 'Failed to load payment data', variant: 'destructive' });
    } finally {
      // no-op
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
    const csvContent = [
      ['ID', 'Date', 'Description', 'Category', 'Amount', 'Status', 'Method'],
      ...payments.map(payment => [
        payment.id,
        payment.date,
        payment.description,
        payment.category,
        `${payment.currency} ${payment.amount.toLocaleString()}`,
        payment.status,
        payment.method
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payment-history.csv';
    a.click();
    window.URL.revokeObjectURL(url);
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
              <DollarSign className="h-8 w-8 text-blue-600" />
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
                  <th className="text-left py-3 px-4 font-semibold">Category</th>
                  <th className="text-left py-3 px-4 font-semibold">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold">Method</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 font-medium">{payment.id}</td>
                    <td className="py-4 px-4">{new Date(payment.date).toLocaleDateString()}</td>
                    <td className="py-4 px-4">{payment.description}</td>
                    <td className="py-4 px-4">
                      <Badge variant="outline">{payment.category}</Badge>
                    </td>
                    <td className="py-4 px-4 font-semibold">
                      {payment.currency} {payment.amount.toLocaleString()}
                    </td>
                    <td className="py-4 px-4">{payment.method}</td>
                    <td className="py-4 px-4">{getStatusBadge(payment.status)}</td>
                  </tr>
                ))}
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
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentsSection;