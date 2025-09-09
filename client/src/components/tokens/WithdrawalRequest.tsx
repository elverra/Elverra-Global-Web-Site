import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { TOKEN_TYPES } from '@/shared/types/secours';
import TokenService, { ApiResponse } from '@/services/tokenService';

interface WithdrawalRequestProps {
  onWithdrawalSuccess?: () => void;
  userBalances?: { tokenId: string; balance: number }[];
}

const WithdrawalRequest: React.FC<WithdrawalRequestProps> = ({ 
  onWithdrawalSuccess,
  userBalances = []
}) => {
  const [selectedTokenId, setSelectedTokenId] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableBalance, setAvailableBalance] = useState(0);
  const { toast } = useToast();

  const selectedToken = TOKEN_TYPES.find(token => token.id === selectedTokenId);
  const totalValue = selectedToken ? parseInt(amount) * selectedToken.price : 0;

  useEffect(() => {
    if (selectedTokenId) {
      const tokenBalance = userBalances.find(b => b.tokenId === selectedTokenId);
      setAvailableBalance(tokenBalance?.balance || 0);
    } else {
      setAvailableBalance(0);
    }
  }, [selectedTokenId, userBalances]);

  const handleWithdrawal = async () => {
    if (!selectedTokenId || !amount) {
      toast({
        title: 'Error',
        description: 'Please select a token type and amount',
        variant: 'destructive',
      });
      return;
    }

    const amountNum = parseInt(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    if (amountNum > availableBalance) {
      toast({
        title: 'Insufficient Balance',
        description: `You only have ${availableBalance} tokens available for withdrawal`,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response: ApiResponse<any> = await TokenService.requestWithdrawal(
        selectedTokenId,
        amountNum
      );

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Withdrawal request submitted successfully',
        });
        setAmount('');
        setSelectedTokenId('');
        onWithdrawalSuccess?.();
      } else {
        throw new Error(response.error || 'Failed to process withdrawal request');
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process withdrawal request',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Withdrawal</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="withdraw-token">Token Type</Label>
          <Select 
            value={selectedTokenId} 
            onValueChange={setSelectedTokenId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a token type" />
            </SelectTrigger>
            <SelectContent>
              {TOKEN_TYPES
                .filter(token => {
                  const balance = userBalances.find(b => b.tokenId === token.id);
                  return balance && balance.balance > 0;
                })
                .map((token) => (
                  <SelectItem key={token.id} value={token.id}>
                    <div className="flex items-center">
                      <span className="mr-2">{token.icon}</span>
                      {token.name}
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {selectedToken && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="withdraw-amount">Amount</Label>
              <span className="text-sm text-muted-foreground">
                Available: {availableBalance}
              </span>
            </div>
            <Input
              id="withdraw-amount"
              type="number"
              min={1}
              max={availableBalance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
            {amount && !isNaN(parseInt(amount)) && (
              <div className="text-sm text-muted-foreground">
                Value: {totalValue} FCFA
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleWithdrawal}
          disabled={!selectedToken || !amount || isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Request Withdrawal'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WithdrawalRequest;
