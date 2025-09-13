import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TOKEN_TYPES, MIN_PURCHASE_PER_SERVICE, MAX_MONTHLY_PURCHASE_PER_SERVICE, ServiceType, PaymentMethod } from '@/shared/types/secours';
import { toast } from 'sonner';
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
  // CinetPay customer fields
  const [cpName, setCpName] = useState('');
  const [cpSurname, setCpSurname] = useState('');
  const [cpEmail, setCpEmail] = useState('');
  const [cpPhone, setCpPhone] = useState('');
  const [cpAddress, setCpAddress] = useState('');
  const [cpCity, setCpCity] = useState('');
  const [cpCountry, setCpCountry] = useState('ML');
  const [cpState, setCpState] = useState('ML');
  const [cpZip, setCpZip] = useState('');

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

  // Dynamically load CinetPay SDK
  const loadCinetPay = () => {
    return new Promise<void>((resolve, reject) => {
      if ((window as any).CinetPay) return resolve();
      const script = document.createElement('script');
      script.src = 'https://cdn.cinetpay.com/seamless/main.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load CinetPay SDK'));
      document.body.appendChild(script);
    });
  };

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

    if ((paymentMethod === 'sama_money') && !phone) {
      toast.error('Please provide your Mobile Money phone number');
      return;
    }

    if (!user?.id) {
      toast.error('You must be logged in to purchase tokens');
      return;
    }

    setIsPurchasing(true);
    try {
      // Build request depending on gateway
      const tokenValue = selectedToken?.value || 0;
      const amountFcfa = amountNum * tokenValue;

      const functionsBase = (import.meta as any)?.env?.VITE_FUNCTIONS_BASE || '';
      const withBase = (path: string) => functionsBase ? `${functionsBase}${path.startsWith('/') ? path : `/${path}`}` : path;

      let endpoint = '';
      let payload: any = {};

      if (paymentMethod === 'sama_money') {
        endpoint = withBase('/api/payments/initiate-sama-money');
        payload = {
          userId: user.id,
          amount: amountFcfa,
          currency: 'XOF',
          phone: phone || user.phone || '',
          email: user.email,
          name: user.fullName || user.email?.split('@')[0] || 'User',
          reference: `TOKENS_${selectedServiceType.toUpperCase()}_${Date.now()}`,
          metadata: {
            type: 'secours_tokens',
            serviceType: selectedServiceType,
            tokens: amountNum,
            paymentMethod: 'sama_money'
          }
        };
      } else if (paymentMethod === 'orange_money') {
        endpoint = withBase('/api/payments/initiate-orange-money');
        payload = {
          userId: user.id,
          amount: amountFcfa,
          currency: 'XOF',
          phone: user.phone || '',
          email: user.email,
          name: user.fullName || user.email?.split('@')[0] || 'User',
          reference: `TOKENS_${selectedServiceType.toUpperCase()}_${Date.now()}`,
          metadata: {
            type: 'secours_tokens',
            serviceType: selectedServiceType,
            tokens: amountNum,
            paymentMethod: 'orange_money'
          }
        };
      } else if (paymentMethod === 'cinetpay') {
        // Validate minimal customer fields for CinetPay
        if (!cpName || !cpSurname || !(cpEmail || user.email) || !(cpPhone || user.phone) || !cpCity || !cpCountry) {
          toast.error('Please fill in CinetPay customer details (name, surname, email, phone, city, country).');
          return;
        }
        // Client-side seamless integration
        await loadCinetPay();
        const CinetPay = (window as any).CinetPay;
        const apikey = import.meta.env.VITE_CINETPAY_API_KEY;
        const siteId = import.meta.env.VITE_CINETPAY_SITE_ID;
        if (!apikey || !siteId) {
          toast.error('CinetPay configuration missing. Please set VITE_CINETPAY_API_KEY and VITE_CINETPAY_SITE_ID');
          return;
        }
        const txId = `TOKENS_${selectedServiceType.toUpperCase()}_${user.id || 'ANON'}_${Date.now()}`;
        const notifyUrl = (import.meta as any)?.env?.VITE_CINETPAY_NOTIFY_URL || '/api/payments/cinetpay-webhook';
        CinetPay.setConfig({
          apikey,
          site_id: siteId,
          notify_url: notifyUrl,
          mode: 'PRODUCTION'
        });
        CinetPay.getCheckout({
          transaction_id: txId,
          amount: amountFcfa,
          currency: 'XOF',
          channels: 'ALL',
          description: `Ô Secours token purchase - ${TOKEN_TYPES[selectedServiceType].name}`,
          customer_name: (cpName || user.fullName?.split(' ')[0] || 'Client'),
          customer_surname: (cpSurname || user.fullName?.split(' ').slice(1).join(' ') || 'Elverra'),
          customer_email: (cpEmail || user.email || ''),
          customer_phone_number: (cpPhone || user.phone || ''),
          customer_address: cpAddress,
          customer_city: cpCity,
          customer_country: cpCountry,
          customer_state: cpState,
          customer_zip_code: cpZip,
        });
        CinetPay.waitResponse((data: any) => {
          if (data.status === 'ACCEPTED') {
            toast.success('Payment successful! Tokens will be credited shortly.');
            onPurchaseSuccess?.();
          } else if (data.status === 'REFUSED') {
            toast.error('Payment refused');
          }
        });
        CinetPay.onError((err: any) => {
          console.error('CinetPay error', err);
          toast.error('CinetPay error');
        });
        // After initiating CinetPay, we return to avoid calling backend initiation
        return;
      }

      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to initiate payment');
      }

      const data = await res.json();
      const paymentUrl = data.payment_url || data.paymentUrl;
      if (paymentUrl) {
        window.open(paymentUrl, '_blank');
        toast.success('Payment initiated! Please complete it in the new tab.');
        // Leave it to the webhook/callback to credit tokens, then refresh balances on success callback elsewhere
        return;
      }

      // Fallback success without URL
      toast.success(`Payment initiated successfully`);
      onPurchaseSuccess?.();
      setPaymentMethod('');
      setPhone('');
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error(error?.message || 'Failed to process purchase');
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
              <SelectItem value="cinetpay">CinetPay</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(paymentMethod === 'sama_money') && (
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

        {paymentMethod === 'cinetpay' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input value={cpName} onChange={(e) => setCpName(e.target.value)} placeholder={user?.fullName?.split(' ')[0] || 'John'} />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input value={cpSurname} onChange={(e) => setCpSurname(e.target.value)} placeholder={user?.fullName?.split(' ').slice(1).join(' ') || 'Doe'} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={cpEmail} onChange={(e) => setCpEmail(e.target.value)} placeholder={user?.email || 'client@example.com'} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input type="tel" value={cpPhone} onChange={(e) => setCpPhone(e.target.value)} placeholder={user?.phone || '+223XXXXXXXX'} />
              </div>
              <div className="md:col-span-2">
                <Label>Address</Label>
                <Input value={cpAddress} onChange={(e) => setCpAddress(e.target.value)} placeholder="Street, number" />
              </div>
              <div>
                <Label>City</Label>
                <Input value={cpCity} onChange={(e) => setCpCity(e.target.value)} placeholder="Bamako" />
              </div>
              <div>
                <Label>Country (ISO)</Label>
                <Input value={cpCountry} onChange={(e) => setCpCountry(e.target.value)} placeholder="ML" />
              </div>
              <div>
                <Label>State</Label>
                <Input value={cpState} onChange={(e) => setCpState(e.target.value)} placeholder="ML" />
              </div>
              <div>
                <Label>Zip Code</Label>
                <Input value={cpZip} onChange={(e) => setCpZip(e.target.value)} placeholder="BP 0000" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">These details are required by CinetPay for card/mobile payments.</p>
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
