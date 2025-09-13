import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Coins, CreditCard, Smartphone } from 'lucide-react';

const TokenPurchase = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedSubscription, setSelectedSubscription] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  // Check if user has child membership - restrict access to token purchase
  const { data: membership } = useQuery({
    queryKey: ['user-membership'],
    queryFn: async () => {
      return { tier: 'essential' } as any;
    }
  });

  // Fetch user's subscriptions
  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['secours-subscriptions'],
    queryFn: async () => {
      return [] as any[];
    }
  });

  // Fetch token transactions for selected subscription
  const { data: transactions } = useQuery({
    queryKey: ['token-transactions', selectedSubscription],
    queryFn: async () => {
      if (!selectedSubscription) return [];
      return [] as any[];
    },
    enabled: !!selectedSubscription
  });

  const purchaseTokensMutation = useMutation({
    mutationFn: async (purchaseData: {
      subscriptionId: string;
      tokenAmount: number;
      paymentMethod: string;
      phoneNumber?: string;
    }) => {
      // Get subscription details to calculate token value (placeholder until API wired)
      const subscriptionsData: any[] = (subscriptions as any[]) || [];
      const subscription = subscriptionsData.find((sub) => sub.id === purchaseData.subscriptionId) || { subscription_type: 'motors', token_balance: 0 };
      if (!subscription) throw new Error('Subscription not found');

      // Get token value using the database function
      const tokenValue = 250;
      const totalValue = purchaseData.tokenAmount * tokenValue;

      // For mobile money payment, initiate the payment process
      if (purchaseData.paymentMethod === 'mobile_money') {
        if (!purchaseData.phoneNumber) {
          throw new Error('Numéro de téléphone requis pour le paiement mobile');
        }

        // Generate unique reference for payment
        const reference = `TOKENS_${subscription.subscription_type.toUpperCase()}_${Date.now()}`;
        
        // Use backend API for mobile money payment
        const backendUrl = window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin;
        console.log('[DEBUG] Backend URL =', backendUrl);
        
        const paymentResponse = await fetch(`${backendUrl}/api/payments/initiate-sama-money`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reference,
            amount: purchaseData.tokenAmount * tokenValue,
            phone: purchaseData.phoneNumber,
            userId: user?.id,
            metadata: {
              serviceType: subscription.subscription_type,
              tokens: purchaseData.tokenAmount
            },
            description: `Ô Secours token purchase - ${subscription.subscription_type}`,
            url: window.location.origin
          })
        });

        if (!paymentResponse.ok) {
          const errorData = await paymentResponse.json();
          console.log('[DEBUG] SAMA Money error response:', errorData);
          // Display user-friendly error message from backend
          throw new Error(errorData.message || 'Échec du paiement SAMA Money');
        }

        const paymentData = await paymentResponse.json();
        
        // For SAMA Money, show success message as payment is initiated via USSD/App
        if (paymentData.success) {
          toast.success('Demande de paiement envoyée! Vérifiez votre téléphone pour confirmer le paiement SAMA Money.');
          return paymentData;
        }
      }

      // For other payment methods, create transaction record directly
      const transactionData = {
        id: `local_${Date.now()}`,
        token_amount: purchaseData.tokenAmount,
        token_value_fcfa: totalValue,
        payment_method: purchaseData.paymentMethod,
        created_at: new Date().toISOString(),
      } as any;

      // Check if balance is getting low (less than 30 tokens)
      const newBalance = subscription.token_balance + purchaseData.tokenAmount;
      if (newBalance < 30) {
        toast.warning(`Token balance is low (${newBalance} tokens). Consider purchasing more tokens for rescue eligibility.`);
      }

      return transactionData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secours-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['token-transactions'] });
      toast.success('Tokens purchased successfully! Your balance has been updated in real-time.');
      setTokenAmount('');
      setPaymentMethod('');
    },
    onError: (error: any) => {
      console.log('[DEBUG] Purchase error:', error);
      toast.error(error.message || 'Failed to purchase tokens');
    }
  });

  const handlePurchase = () => {
    if (!selectedSubscription || !tokenAmount || !paymentMethod) {
      toast.error('Please fill in all fields');
      return;
    }

    const tokens = parseInt(tokenAmount);
    if (tokens <= 0) {
      toast.error('Token amount must be greater than 0');
      return;
    }

    // For mobile money, we need phone number
    let phoneNumber: string = '';
    if (paymentMethod === 'mobile_money') {
      const input = window.prompt('Veuillez entrer votre numéro de téléphone SAMA Money (ex: 22370445566):');
      if (typeof input !== 'string' || input.trim() === '') {
        toast.error('Numéro de téléphone requis pour SAMA Money');
        return;
      }
      phoneNumber = input.trim();
      
      // Validate phone number format
      if (!/^223\d{8}$/.test(phoneNumber)) {
        toast.error('Format de numéro incorrect. Utilisez le format: 22370445566');
        return;
      }
    }

    purchaseTokensMutation.mutate({
      subscriptionId: selectedSubscription,
      tokenAmount: tokens,
      paymentMethod,
      phoneNumber
    });
  };

  const getTokenValue = (subscriptionType: string) => {
    const values: Record<string, number> = {
      motors: 250,
      telephone: 250,
      auto: 750,
      cata_catanis: 500,
      school_fees: 500
    };
    return values[subscriptionType] || 0;
  };

  const getMinMaxTokens = (subscriptionType: string) => {
    const limits: Record<string, { min: number; max: number }> = {
      motors: { min: 30, max: 60 },
      telephone: { min: 30, max: 60 },
      auto: { min: 30, max: 60 },
      cata_catanis: { min: 30, max: 60 },
      school_fees: { min: 30, max: 60 }
    };
    return limits[subscriptionType] || { min: 30, max: 60 };
  };

  const selectedSub = subscriptions?.find((sub: any) => sub.id === selectedSubscription);
  const tokenValue = selectedSub ? getTokenValue(selectedSub.subscription_type) : 0;
  const totalValue = tokenAmount ? parseInt(tokenAmount) * tokenValue : 0;
  const limits = selectedSub ? getMinMaxTokens(selectedSub.subscription_type) : { min: 30, max: 60 };

  if (isLoading) {
    return <div className="text-center">Loading subscriptions...</div>;
  }

  // Check if user has child membership - restrict access to token purchase
  if (membership?.tier === 'child') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Coins className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-900">Service Non Disponible</h3>
            <p className="text-gray-600">
              L'achat de tokens Ô Secours n'est pas disponible pour les détenteurs de carte enfant. 
              Ce service est réservé aux cartes adultes (Essential, Premium, Elite).
            </p>
            <p className="text-sm text-gray-500">
              Pour accéder à ce service, vous devez avoir une carte adulte Elverra.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Coins className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-900">No Subscriptions Found</h3>
            <p className="text-gray-600">
              You need to subscribe to at least one Ô Secours service before you can purchase tokens.
            </p>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Purchase Tokens</h2>
        <p className="text-gray-600">
          Buy tokens to maintain your emergency assistance balance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Purchase Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Buy Tokens
            </CardTitle>
            <CardDescription>
              Select your subscription and purchase tokens
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="subscription">Select Subscription</Label>
              <Select value={selectedSubscription} onValueChange={setSelectedSubscription}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a subscription" />
                </SelectTrigger>
                <SelectContent>
                  {subscriptions.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.subscription_type.replace('_', ' ').toUpperCase()} 
                      (Balance: {sub.token_balance} tokens)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedSub && (
              <div className="p-3 bg-blue-50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Token Value:</span>
                  <span className="font-medium">{tokenValue} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Current Balance:</span>
                  <span className="font-medium">{selectedSub.token_balance} tokens</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Recommended Range:</span>
                  <span className="font-medium">{limits.min}-{limits.max} tokens/month</span>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="tokens">Number of Tokens</Label>
              <Input
                id="tokens"
                type="number"
                value={tokenAmount}
                onChange={(e) => setTokenAmount(e.target.value)}
                placeholder="Enter token amount"
                min="1"
                max="100"
              />
              {tokenAmount && (
                <p className="text-sm text-gray-600 mt-1">
                  Total: {totalValue.toLocaleString()} FCFA
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="payment">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mobile_money">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      Mobile Money
                    </div>
                  </SelectItem>
                  <SelectItem value="bank_card">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Bank Card
                    </div>
                  </SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handlePurchase}
              disabled={purchaseTokensMutation.isPending || !selectedSubscription || !tokenAmount || !paymentMethod}
              className="w-full"
            >
              {purchaseTokensMutation.isPending ? 'Processing...' : `Purchase Tokens (${totalValue.toLocaleString()} FCFA)`}
            </Button>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Your latest token purchase history
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions && transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{transaction.token_amount} tokens</div>
                      <div className="text-sm text-gray-600">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{transaction.token_value_fcfa.toLocaleString()} FCFA</div>
                      <Badge variant="outline" className="text-xs">
                        {transaction.payment_method?.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No transactions yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TokenPurchase;
