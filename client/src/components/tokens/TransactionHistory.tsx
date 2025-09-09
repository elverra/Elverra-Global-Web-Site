import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { TokenPurchase } from '@/shared/types/secours';
import TokenService from '@/services/tokenService';

const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<TokenPurchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const response = await TokenService.getPurchaseHistory();
        
        if (response.success && response.data) {
          setTransactions(response.data);
        } else {
          setError(response.error || 'Failed to load transaction history');
        }
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('An error occurred while loading transactions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (isLoading) {
    return <div className="text-center py-4">Loading transaction history...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-4 text-destructive">
        Error: {error}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No transaction history found
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {transactions.map((transaction) => {
          const token = TokenService.getTokenById(transaction.tokenType);
          const statusColors = {
            completed: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            failed: 'bg-red-100 text-red-800',
          };

          return (
            <div 
              key={transaction.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="text-2xl">{token?.icon || '💳'}</div>
                <div>
                  <div className="font-medium">
                    {token?.name || 'Unknown Token'} x{transaction.amount}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(transaction.date), 'MMM d, yyyy')}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{transaction.totalPrice} FCFA</div>
                <span 
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    statusColors[transaction.status] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </span>
                {transaction.bonusPercentage && (
                  <div className="text-xs text-green-600">
                    +{transaction.bonusPercentage}% bonus
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
