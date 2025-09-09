import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { TOKEN_TYPES, MIN_PURCHASE_PER_SERVICE, MAX_MONTHLY_PURCHASE_PER_SERVICE } from '@/shared/types/secours';
import TokenService, { ApiResponse } from '@/services/tokenService';

interface TokenPurchaseProps {
  onPurchaseSuccess?: () => void;
  userBalances?: { tokenId: string; usedThisMonth: number }[];
}

const TokenPurchase: React.FC<TokenPurchaseProps> = ({ 
  onPurchaseSuccess,
  userBalances = []
}) => {
  const [selectedTokenId, setSelectedTokenId] = useState('');
  const [amount, setAmount] = useState(MIN_PURCHASE_PER_SERVICE.toString());
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [remainingTokens, setRemainingTokens] = useState(MAX_MONTHLY_PURCHASE_PER_SERVICE);
  const { toast } = useToast();

  const selectedToken = TOKEN_TYPES.find(token => token.id === selectedTokenId);
  const totalPrice = selectedToken ? parseInt(amount) * selectedToken.price : 0;

  useEffect(() => {
    if (selectedTokenId) {
      const tokenBalance = userBalances.find(b => b.tokenId === selectedTokenId);
      const used = tokenBalance?.usedThisMonth || 0;
      setRemainingTokens(Math.max(0, MAX_MONTHLY_PURCHASE_PER_SERVICE - used));
    } else {
      setRemainingTokens(MAX_MONTHLY_PURCHASE_PER_SERVICE);
    }
  }, [selectedTokenId, userBalances]);

  const handlePurchase = async () => {
    if (!selectedTokenId || !amount) {
      toast({
        title: 'Error',
        description: 'Please select a token type and amount',
        variant: 'destructive',
      });
      return;
    }

    const amountNum = parseInt(amount);
    if (isNaN(amountNum) || amountNum < MIN_PURCHASE_PER_SERVICE) {
      toast({
        title: 'Error',
        description: `Minimum purchase amount is ${MIN_PURCHASE_PER_SERVICE} tokens`,
        variant: 'destructive',
      });
      return;
    }

    if (amountNum > remainingTokens) {
      toast({
        title: 'Error',
        description: `You can only purchase up to ${remainingTokens} more tokens this month`,
        variant: 'destructive',
      });
      return;
    }

    setIsPurchasing(true);
    try {
      const response: ApiResponse<any> = await TokenService.purchaseTokens(
        selectedTokenId,
        amountNum
      );

      if (response.success) {
        toast({
          title: 'Success',
          description: `Successfully purchased ${amount} ${selectedToken?.name} tokens`,
        });
        onPurchaseSuccess?.();
      } else {
        throw new Error(response.error || 'Failed to process purchase');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process purchase',
        variant: 'destructive',
      });
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
            value={selectedTokenId} 
            onValueChange={setSelectedTokenId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a token type" />
            </SelectTrigger>
            <SelectContent>
              {TOKEN_TYPES.map((token) => (
                <SelectItem key={token.id} value={token.id}>
                  <div className="flex items-center">
                    <span className="mr-2">{token.icon}</span>
                    {token.name} ({token.price} FCFA/token)
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedToken && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="amount">Amount (Min: {MIN_PURCHASE_PER_SERVICE})</Label>
              <span className="text-sm text-muted-foreground">
                Remaining: {remainingTokens}
              </span>
            </div>
            <Input
              id="amount"
              type="number"
              min={MIN_PURCHASE_PER_SERVICE}
              max={remainingTokens}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Enter amount (${MIN_PURCHASE_PER_SERVICE}+)`}
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
