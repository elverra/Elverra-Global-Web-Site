import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TOKEN_TYPES, MIN_PURCHASE_PER_SERVICE, MAX_MONTHLY_PURCHASE_PER_SERVICE, ServiceType, PaymentMethod } from '@/shared/types/secours';
import { toast } from 'sonner';
import { tokenService } from '@/services/mockServices';
import { useAuth } from '@/hooks/useAuth';

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [phone, setPhone] = useState('');

  const { user } = useAuth();

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

    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    if ((paymentMethod === 'orange_money' || paymentMethod === 'sama_money') && !phone) {
      toast.error('Please provide your Mobile Money phone number');
      return;
    }

    if (!user?.id) {
      toast.error('You must be logged in to purchase tokens');
      return;
    }

    setIsPurchasing(true);
    try {
      const resp = await tokenService.purchaseTokens(
        user.id,
        selectedServiceType,
        amountNum,
        paymentMethod as PaymentMethod,
        { phone: phone.trim() || undefined }
      );

      if (!resp.success) {
        toast.error(resp.error || 'Payment failed');
        return;
      }

      if (resp.paymentUrl) {
        // Redirect to mock payment page (simulating Orange/SAMA Money gateway)
        window.location.href = resp.paymentUrl;
        return;
      }

      toast.success(`Successfully purchased ${amountNum} ${selectedToken?.name} tokens for ${totalPrice} FCFA`);
      onPurchaseSuccess?.();
      // Reset fields
      setPaymentMethod('');
      setPhone('');
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

        {/* Payment method */}
        <div className="space-y-2">
          <Label htmlFor="payment-method">Payment Method</Label>
          <Select 
            value={paymentMethod} 
            onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="orange_money">Orange Money</SelectItem>
              <SelectItem value="sama_money">SAMA Money</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(paymentMethod === 'orange_money' || paymentMethod === 'sama_money') && (
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile Money Phone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="e.g. +223XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
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
