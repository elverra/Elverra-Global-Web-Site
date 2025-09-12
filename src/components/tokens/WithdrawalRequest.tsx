import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TOKEN_TYPES, ServiceType } from '@/shared/types/secours';
import { toast } from 'sonner';

interface WithdrawalRequestProps {
  onWithdrawalSuccess?: () => void;
  userBalances?: { serviceType: ServiceType; balance: number }[];
}

const WithdrawalRequest: React.FC<WithdrawalRequestProps> = ({ 
  onWithdrawalSuccess,
  userBalances = []
}) => {
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType | ''>('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableBalance, setAvailableBalance] = useState(0);

  const selectedToken = selectedServiceType ? TOKEN_TYPES[selectedServiceType] : null;
  const totalValue = selectedToken ? parseInt(amount) * selectedToken.value : 0;

  useEffect(() => {
    if (selectedServiceType) {
      const tokenBalance = userBalances.find(b => b.serviceType === selectedServiceType);
      setAvailableBalance(tokenBalance?.balance || 0);
    } else {
      setAvailableBalance(0);
    }
  }, [selectedServiceType, userBalances]);

  const handleWithdrawal = async () => {
    if (!selectedServiceType || !amount) {
      toast.error('Please select a token type and amount');
      return;
    }

    const amountNum = parseInt(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amountNum > availableBalance) {
      toast.error(`You only have ${availableBalance} tokens available for withdrawal`);
      return;
    }

    setIsSubmitting(true);
    try {
      // Mock withdrawal request - in real app this would call API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Withdrawal request submitted successfully');
      setAmount('');
      setSelectedServiceType('');
      onWithdrawalSuccess?.();
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast.error('Failed to process withdrawal request');
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
            value={selectedServiceType} 
            onValueChange={(value) => setSelectedServiceType(value as ServiceType)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a token type" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TOKEN_TYPES)
                .filter(([serviceType]) => {
                  const balance = userBalances.find(b => b.serviceType === serviceType as ServiceType);
                  return balance && balance.balance > 0;
                })
                .map(([serviceType, tokenInfo]) => (
                  <SelectItem key={serviceType} value={serviceType}>
                    <div className="flex items-center">
                      {tokenInfo.name} ({tokenInfo.value} FCFA/token)
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
