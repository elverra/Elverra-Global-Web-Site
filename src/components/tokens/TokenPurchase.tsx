import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TOKEN_TYPES, MIN_PURCHASE_PER_SERVICE, MAX_MONTHLY_PURCHASE_PER_SERVICE, ServiceType, PaymentMethod } from '@/shared/types/secours';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface TokenPurchaseProps {
  onPurchaseSuccess?: () => void;
  userBalances?: { serviceType: ServiceType; usedThisMonth: number }[];
   selectedToken: string; // <-- AJOUTE CETTE LIGNE
}   

interface Service {
  id: string;
  name: string;
  value: number; // prix du token
}

const TokenPurchase: React.FC<TokenPurchaseProps> = ({ 
  onPurchaseSuccess,
  userBalances = [],
  selectedToken, // ICI JE DOIS FAIRE EN SORTE QUE selectedToken SOIT CHOISI PAR LE SELCTMENUE
  

  
}) => {
  console.log("selectedToken", selectedToken)
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceType, setSelectedServiceType] = useState<string | ''>('');
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
const [paymentInitiated, setPaymentInitiated] = useState(false);
  const { user } = useAuth();
useEffect(() => {
  if (selectedToken) {
    setSelectedServiceType(selectedToken);
  }
}, [selectedToken]);
  // const selectedToken = selectedServiceType ? TOKEN_TYPES[selectedServiceType] : null;
  // const totalPrice = selectedToken ? parseInt(amount) * selectedToken.value : 0;
useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from('osecours_services')
        .select('id, name, value');
        console.log({data, error})
      if (!error && data) setServices(data);
    };
    fetchServices();
  }, []); 
const selectedService = services.find(s => s.id === selectedServiceType) || null;

const totalPrice = selectedService ? parseInt(amount) * selectedService.value : 0;
 const usedThisMonth = userBalances.find(b => b.serviceType === selectedServiceType)?.usedThisMonth || 0;
  const minPurchase = MIN_PURCHASE_PER_SERVICE[selectedServiceType as ServiceType] || 10;
  const maxMonthlyPurchase = MAX_MONTHLY_PURCHASE_PER_SERVICE[selectedServiceType as ServiceType] || 60;
  const isFirstPurchase = usedThisMonth === 0;
  const maxCanBuy = Math.max(0, maxMonthlyPurchase - usedThisMonth);

  useEffect(() => {
    if (selectedServiceType) {
      setAmount(isFirstPurchase ? minPurchase.toString() : '1');
    } else {
      setAmount('');
    }
  }, [selectedServiceType, isFirstPurchase, minPurchase]);
//  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     let val = parseInt(e.target.value, 10);
//     if (isNaN(val)) val = isFirstPurchase ? minPurchase : 1;
//     if (val < (isFirstPurchase ? minPurchase : 1)) val = isFirstPurchase ? minPurchase : 1;
//     if (val > maxCanBuy) val = maxCanBuy;
//     setAmount(val.toString());
//   };
const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  let val = parseInt(e.target.value, 10);
  // Permet la saisie libre, mais corrige à la soumission
  if (isNaN(val)) {
    setAmount('');
    return;
  }
  setAmount(val.toString());
};
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
  function getTotalBoughtThisMonth(userBalances: { usedThisMonth: number }[]) {
  return userBalances.reduce((sum, b) => sum + (b.usedThisMonth || 0), 0);
}const MAX_TOKENS_PER_MONTH = 60;
const MIN_FIRST_PURCHASE = 10;

const totalBoughtThisMonth = getTotalBoughtThisMonth(userBalances);
const isFirstPurchaseThisMonth = totalBoughtThisMonth === 0;
const maxPurchasable = Math.max(0, MAX_TOKENS_PER_MONTH - totalBoughtThisMonth);

  const handlePurchase = async () => {
    if (!selectedService || !amount || !user) {
      toast.error('Please select a token type and amount');
      return;
    }

  const amountNum = parseInt(amount, 10);

   if (isNaN(amountNum) || amountNum <= 0) {
  toast.error('Please enter a valid amount');
  return;
}

  if (isNaN(amountNum) || amountNum <= 0) {
    toast.error('Veuillez entrer un montant valide');
    return;
  }

  if (isFirstPurchase && amountNum < minPurchase) {
    toast.error(`Le premier achat du mois doit être d'au moins ${minPurchase} tokens`);
    return;
  }
 if (usedThisMonth >= maxMonthlyPurchase) {
      toast.error(`Vous avez atteint la limite mensuelle de ${maxMonthlyPurchase} tokens pour ce service`);
      return;
    }
  if (amountNum > maxCanBuy) {
    toast.error(`Vous ne pouvez pas acheter plus de ${maxCanBuy} tokens ce mois-ci`);
    return;
  }

  
if (amountNum > maxPurchasable) {
  toast.error(`Vous ne pouvez pas acheter plus de ${maxPurchasable} tokens ce mois-ci`);
  return;
}
if (isFirstPurchaseThisMonth && amountNum < MIN_FIRST_PURCHASE) {
  toast.error(`Votre premier achat du mois doit être d'au moins ${MIN_FIRST_PURCHASE} tokens`);
  return;
}

    // if (amountNum > remainingTokens) {
    //   toast.error(`Cannot purchase more than ${remainingTokens} tokens this month`);
    //   return;
    // }

    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to purchase tokens');
      return;
    }

    setIsPurchasing(true);
    try {
      const tokenValue = selectedService?.value || 0;
      const amountFcfa = amountNum * tokenValue;
      const reference = `TOKENS_${selectedServiceType.toUpperCase()}_${Date.now()}`;

      // Backend API base URL
      const withBase = (path: string) => {
        // In production, use relative API paths for Vercel functions
        if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
          return `http://localhost:3001${path.startsWith('/') ? path : `/${path}`}`;
        }
        return path.startsWith('/') ? path : `/${path}`;
      };

      if (paymentMethod === 'orange_money') {
        const response = await fetch(withBase('/api/payments/initiate-orange-money'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            amount: amountFcfa,
            currency: 'XOF',
            phone: phone || user.phone || '',
            email: user.email,
            name: user.fullName || user.email?.split('@')[0] || 'User',
            reference: reference,
            metadata: {
              type: 'secours_tokens',
              serviceType: selectedServiceType,
              tokens: amountNum,
              paymentMethod: 'orange_money'
            }
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to initiate Orange Money payment');
        }

        const data = await response.json();
        
        if (data.success && data.paymentUrl) {
          window.open(data.paymentUrl, '_blank');
          toast.success('Redirecting to Orange Money payment page...');
          onPurchaseSuccess?.();
        } else {
          throw new Error(data.message || 'Orange Money payment initiation failed');
        }
        
      } else if (paymentMethod === 'sama_money') {
        if (!phone && !user.phone) {
          toast.error('Please provide a phone number for SAMA Money');
          return;
        }
        
        const response = await fetch(withBase('/api/payments/initiate-sama-money'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            amount: amountFcfa,
            currency: 'XOF',
            phone: phone || user.phone || '',
            email: user.email,
            name: user.fullName || user.email?.split('@')[0] || 'User',
            reference: reference,
            description: `Ô Secours token purchase - ${selectedService?.name || 'Service'}`,
            url: 'https://elverraglobalml.com',
            metadata: {
              type: 'secours_tokens',
              serviceType: selectedServiceType,
              tokens: amountNum,
              paymentMethod: 'sama_money'
            }
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.log('[DEBUG] SAMA Money error response:', errorData);
          throw new Error(errorData.message || 'Échec du paiement SAMA Money');
        }

        const data = await response.json();
        
        if (data.success && data.initiated) {
          toast.success('Payment confirmation sent to your phone. Please confirm to complete the purchase.');
          onPurchaseSuccess?.();
        } else {
          throw new Error(data.message || 'SAMA Money payment initiation failed');
        }
        
      } else if (paymentMethod === 'cinetpay') {
        // Validate minimal customer fields for CinetPay
        if (!cpName || !cpSurname || !(cpEmail || user.email) || !(cpPhone || user.phone) || !cpCity || !cpCountry) {
          toast.error('Please fill in CinetPay customer details (name, surname, email, phone, city, country).');
          return;
        }
        
        // Direct API integration instead of SDK
        const apikey = import.meta.env.VITE_CINETPAY_API_KEY;
        const siteId = import.meta.env.VITE_CINETPAY_SITE_ID;
        
        if (!apikey || !siteId) {
          toast.error('CinetPay configuration missing. Please set VITE_CINETPAY_API_KEY and VITE_CINETPAY_SITE_ID');
          return;
        }
        
        const txId = `TOKENS_${selectedServiceType.toUpperCase()}_${user.id || 'ANON'}_${Date.now()}`;
        const notifyUrl = (import.meta as any)?.env?.VITE_CINETPAY_NOTIFY_URL || 'https://elverraglobalml.com/api/payments/cinetpay-webhook';
        const returnUrl = 'https://elverraglobalml.com/payment/success';
        
        const paymentData = {
          apikey,
          site_id: siteId,
          transaction_id: txId,
          amount: amountFcfa,
          currency: 'XOF',
          description: `Ô Secours token purchase - ${selectedService?.name || 'Service'}`,
          return_url: returnUrl,
          notify_url: notifyUrl,
          channels: 'ALL',
          metadata: JSON.stringify({
            type: 'secours_tokens',
            serviceType: selectedServiceType,
            tokens: amountNum,
            userId: user.id
          }),
          customer_id: user.id || 'ANON',
          customer_name: cpName || user.fullName?.split(' ')[0] || 'Client',
          customer_surname: cpSurname || user.fullName?.split(' ').slice(1).join(' ') || 'Elverra',
          customer_email: cpEmail || user.email || '',
          customer_phone_number: cpPhone || user.phone || '',
          customer_address: cpAddress || 'N/A',
          customer_city: cpCity || 'Dakar',
          customer_country: cpCountry?.toUpperCase() || 'SN',
          customer_state: cpState?.toUpperCase() || 'DK',
          customer_zip_code: cpZip || '00000',
          lang: 'FR',
          invoice_data: {
            'Service': selectedService?.name || 'Tokens',
            'Quantité': amountNum.toString(),
            'Prix unitaire': `${selectedService?.value || 0} FCFA`
          }
        };
        
        try {
          const response = await fetch('https://api-checkout.cinetpay.com/v2/payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentData)
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const result = await response.json();
          
          if (result.code === '201') {
            // Success - redirect to payment page
            window.open(result.data.payment_url, '_blank');
            toast.success('Redirecting to CinetPay payment page...');
            onPurchaseSuccess?.();
          } else {
            throw new Error(result.message || result.description || 'CinetPay payment failed');
          }
        } catch (error: any) {
          console.error('CinetPay API error:', error);
          toast.error(`CinetPay error: ${error.message || 'Payment initialization failed'}`);
        }
        
        return; // Exit early for CinetPay
      } else if (paymentMethod === 'code_marchant') {
 

  // Enregistrer la demande dans la table osecours_token_balances_attempts
  console.log(user.id, selectedServiceType, amountNum)
  const { error } = await supabase
    .from('osecours_token_balances_attempts')
    .insert([
      {
        user_id: user.id,
        service_id: selectedServiceType,
        requested_amount: amountNum,
        status: 'pending',
      },
    ]);
  if (error) {
    console.log("error saving osecours_token_balances_attempts",error)
    toast.error("Erreur lors de l'enregistrement de la demande : " + error.message);
    setIsPurchasing(false);
    return;
  }

  setPaymentInitiated(true);
  return;
}
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error(error.message || 'Failed to process purchase');
    } finally {
      setIsPurchasing(false);
    }
  };
if (paymentInitiated) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center space-y-4 py-8">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto" />
        <h3 className="text-lg font-semibold">
          Achat de tokens Ô Secours
        </h3>
        <p className="text-2xl font-bold text-purple-600">
          CFA {totalPrice.toLocaleString()}
        </p>
        <p className="text-sm text-gray-600">
          Veuillez effectuer votre paiement via :<br />
          <span className="font-mono font-semibold text-black">
            #144#8*718285*{totalPrice}*VotreCodeSecret# OK
          </span>
        </p>
        <p className="text-sm text-gray-600">
          Après confirmation du paiement, merci de contacter le support :
        </p>
        <h3 className="text-md font-semibold">
          +223 44 94 38 44 / 78 81 01 91
        </h3>
        <p className="text-sm text-gray-600">
          Vos tokens seront crédités après vérification.
        </p>
        <Button
          variant="outline"
          onClick={() => setPaymentInitiated(false)}
        >
          Annuler et fermer
        </Button>
      </CardContent>
    </Card>
  );
}
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
  {services.map(service => (
    <SelectItem key={service.id} value={service.id}>
      <div className="flex items-center">
        {service.name} ({service.value} FCFA/token)
      </div>
    </SelectItem>
  ))}
</SelectContent>
          </Select>
        </div>

        {selectedService && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="amount">Amount (Min: {selectedServiceType ? MIN_PURCHASE_PER_SERVICE[selectedServiceType as ServiceType] : 0})</Label>
              <span className="text-sm text-muted-foreground">
                Remaining: {remainingTokens}
              </span>
            </div>
                <Input
              id="amount"
              type="number"
              // min={isFirstPurchase ? minPurchase : 1}
              // max={maxCanBuy}
              value={amount}
              onChange={handleAmountChange}
              placeholder={`Entrer une quantité (${isFirstPurchase ? minPurchase : 1}+)`}
              disabled={usedThisMonth >= maxMonthlyPurchase}
            />
            <div className="text-xs text-muted-foreground">
              Déjà acheté ce mois : <b>{usedThisMonth}</b> tokens<br />
              Restant possible : <b>{maxCanBuy}</b> tokens
            </div>
            <div className="text-sm text-muted-foreground">
              Prix total : {totalPrice} FCFA
            </div>
            {isFirstPurchase && (
              <div className="text-xs text-orange-600">
                Premier achat du mois : minimum {minPurchase} tokens
              </div>
            )}
            {usedThisMonth >= maxMonthlyPurchase && (
              <div className="text-xs text-red-600">
                Limite mensuelle atteinte pour ce service.
              </div>
            )}
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
              <SelectItem value="code_marchant">Code marchant Orange Money</SelectItem>
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
          disabled={!selectedService || isPurchasing}
        >
          {isPurchasing ? 'Processing...' : 'Purchase Tokens'}
        </Button>
       
      </CardFooter>
    </Card>
  );
};

export default TokenPurchase;
