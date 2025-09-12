import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TOKEN_TYPES, MIN_PURCHASE_PER_SERVICE, MAX_MONTHLY_PURCHASE_PER_SERVICE, ServiceType } from '@/shared/types/secours';
import { toast } from 'sonner';

interface TokenPurchaseProps {
  onPurchaseSuccess?: () => void;
  userBalances?: { serviceType: ServiceType; usedThisMonth: number }[];
}

const TokenPurchase: React.FC<TokenPurchaseProps> = ({ 
  onPurchaseSuccess,
  userBalances = []
}) => {
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType | ''>('');
  const [amount, setAmount] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [remainingTokens, setRemainingTokens] = useState(0);

  const selectedToken = selectedServiceType ? TOKEN_TYPES[selectedServiceType] : null;
  const totalPrice = selectedToken ? parseInt(amount) * selectedToken.value : 0;

  useEffect(() => {
    if (selectedServiceType) {
      const tokenBalance = userBalances.find(b => b.serviceType === selectedServiceType);
      const used = tokenBalance?.usedThisMonth || 0;
      const maxForService = MAX_MONTHLY_PURCHASE_PER_SERVICE[selectedServiceType];
      setRemainingTokens(Math.max(0, maxForService - used));
      
      // Set default amount to minimum for this service
      const minForService = MIN_PURCHASE_PER_SERVICE[selectedServiceType];
      setAmount(minForService.toString());
    } else {
      setRemainingTokens(0);
      setAmount('');
    }
  }, [selectedServiceType, userBalances]);

  const handlePurchase = async () => {
    if (!selectedServiceType || !amount) {
      toast.error('Please select a token type and amount');
      return;
    }

    const amountNum = parseInt(amount);
    const minForService = selectedServiceType ? MIN_PURCHASE_PER_SERVICE[selectedServiceType] : 0;
    
    if (isNaN(amountNum) || amountNum < minForService) {
      toast.error(`Minimum purchase amount is ${minForService} tokens`);
      return;
    }

    if (amountNum > remainingTokens) {
      toast.error(`You can only purchase up to ${remainingTokens} more tokens this month`);
      return;
    }

    setIsPurchasing(true);
    try {
      // Mock purchase - in real app this would call API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Successfully purchased ${amountNum} ${selectedToken?.name} tokens for ${totalPrice} FCFA`);
      onPurchaseSuccess?.();
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Failed to process purchase');
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase Tokens</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="token-type">Token Type</Label>
          <Select 
            value={selectedServiceType} 
            onValueChange={(value) => setSelectedServiceType(value as ServiceType)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a token type" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TOKEN_TYPES).map(([serviceType, tokenInfo]) => (
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
              <Label htmlFor="amount">Amount (Min: {selectedServiceType ? MIN_PURCHASE_PER_SERVICE[selectedServiceType] : 0})</Label>
              <span className="text-sm text-muted-foreground">
                Remaining: {remainingTokens}
              </span>
            </div>
            <Input
              id="amount"
              type="number"
              min={selectedServiceType ? MIN_PURCHASE_PER_SERVICE[selectedServiceType] : 0}
              max={remainingTokens}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Enter amount (${selectedServiceType ? MIN_PURCHASE_PER_SERVICE[selectedServiceType] : 0}+)`}
            />
            <div className="text-sm text-muted-foreground">
              Price: {totalPrice} FCFA
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handlePurchase}
          disabled={!selectedToken || isPurchasing}
        >
          {isPurchasing ? 'Processing...' : 'Purchase Tokens'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TokenPurchase;
