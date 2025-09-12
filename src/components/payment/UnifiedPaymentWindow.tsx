import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface PaymentProps {
  plan: string;
  cardType?: string | null;
  onSuccess?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  preSelectedService?: string;
  subscriptionPlan?: string;
  amount: number;
}

export default function UnifiedPaymentWindow({ plan, cardType, onSuccess, isOpen = true, onClose, preSelectedService, subscriptionPlan = 'monthly', amount }: PaymentProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGateway, setSelectedGateway] = useState<string>(preSelectedService || 'orange_money');
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const paymentGateways = [
    { id: 'orange_money', name: '🍊 Orange Money' },
    { id: 'sama_money', name: '💰 SAMA Money' },
    { id: 'cinetpay', name: '📱 CinetPay Mobile Money' },
  ];

  // Show phone input when Sama Money is selected
  useEffect(() => {
    setShowPhoneInput(selectedGateway === 'sama_money');
    setPhoneError('');
  }, [selectedGateway]);

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^(?:(?:\+221|00221|221)?[76]\d{7}|(?:\+225|00225|225)?[0-9]{10})$/;
    return phoneRegex.test(phone);
  };

  const handlePayment = async () => {
    if (!user) {
      toast.error('Please log in to complete payment');
      navigate('/login');
      return;
    }

    // Validate phone number for Sama Money
    if (selectedGateway === 'sama_money' && !validatePhoneNumber(phoneNumber)) {
      setPhoneError('Please enter a valid phone number (e.g., 7XXXXXXXX for Senegal or 0XXXXXXXXX for Côte d\'Ivoire)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create subscription
      const subscriptionRes = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, plan: subscriptionPlan, status: 'pending' }),
      });
      if (!subscriptionRes.ok) throw new Error('Failed to create subscription');
      const subscriptionData = await subscriptionRes.json();

      const reference = `MEMBERSHIP_${plan.toUpperCase()}_${Date.now()}`;
      
      let endpoint;
      let paymentData;
      
      if (selectedGateway === 'cinetpay') {
        endpoint = '/api/payments/initiate-cinetpay';
        paymentData = {
          amount,
          membershipTier: plan,
          description: `Abonnement ${plan} - Elverra Global`,
          metadata: {
            name: user.fullName?.split(' ')[0] || 'Client',
            surname: user.fullName?.split(' ').slice(1).join(' ') || 'Elverra',
            email: user.email,
            phone: user.phone || '+22300000000',
            address: user.address || '',
            city: user.city || '',
            country: user.country || 'ML',
            state: user.state || 'ML',
            zipCode: user.zipCode || '',
            subscriptionId: subscriptionData.id,
            plan,
            userId: user.id
          }
        };
      } else {
        // Pour Orange Money et SAMA Money
        endpoint = selectedGateway === 'sama_money'
          ? '/api/payments/initiate-sama-money'
          : '/api/payments/initiate-orange-money';
        
        paymentData = {
          userId: user.id,
          amount,
          currency: 'OUV',
          phone: selectedGateway === 'sama_money' ? phoneNumber : (user.phone || '+2237701100100'),
          email: user.email,
          name: user.fullName || user.email?.split('@')[0] || 'User',
          reference,
          subscriptionId: subscriptionData.id,
          metadata: { 
            plan, 
            userId: user.id,
            paymentMethod: selectedGateway,
            phoneNumber: selectedGateway === 'sama_money' ? phoneNumber : (user.phone || '')
          },
        };
      }

    // In handlePayment
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(paymentData),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Échec de l\'initiation du paiement');
    }

    const data = await res.json();
    if (data.success && (data.payment_url || data.paymentUrl)) {
      const paymentUrl = data.payment_url || data.paymentUrl;
      console.log("Opening payment in new tab:", paymentUrl);
      console.log("Payment response data:", data);
      window.open(paymentUrl, "_blank");
      setPaymentInitiated(true);
      // Use paymentId first, then fallback to reference or transactionId
      const pollId = data.paymentId || data.transactionId || data.reference || data.paymentAttemptId;
      console.log("Using payment ID for polling:", pollId);
      setPaymentReference(pollId);
      toast.success("Payment initiated! Please complete the payment in the new tab.");
      return;
    } else {
      throw new Error(data.message || 'Échec de l\'initiation du paiement');
    }
    } catch (err: any) {
      setError(err.message || 'Unexpected error occurred');
      toast.error(err.message || 'Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Poll payment status
  useEffect(() => {
    if (!paymentInitiated || !paymentReference) {
      console.log('Polling conditions not met:', { paymentInitiated, paymentReference });
      return;
    }

    console.log('Starting payment status polling for:', paymentReference);
    const interval = setInterval(async () => {
      try {
        console.log('Polling payment status for ID:', paymentReference);
        const response = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            paymentId: paymentReference,
            gateway: selectedGateway // Ajout du gateway pour identifier CinetPay
          }),
        });
        const data = await response.json();
        console.log('Payment verification response:', data);

        if (data.success && data.status === 'completed') {
          console.log('Payment completed successfully!');
          setPaymentInitiated(false);
          clearInterval(interval);
          toast.success('Payment verified! Your membership is active.');
          // Close the payment window and trigger success callback
          onClose?.();
          onSuccess?.();
        } else if (data.status === 'failed' || data.status === 'cancelled') {
          console.log('Payment failed or cancelled:', data.status);
          setPaymentInitiated(false);
          setError('Payment failed or was cancelled.');
          toast.error('Payment failed or was cancelled.');
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [paymentInitiated, paymentReference, onSuccess, selectedGateway]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-xl">Mobile Money Payment</CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={() => {
              setPaymentInitiated(false);
              onClose();
            }}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentInitiated ? (
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto" />
              <p className="text-lg font-semibold">Waiting for payment confirmation...</p>
              <p className="text-sm text-gray-600">Please complete the payment in the new tab. This window will update automatically.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setPaymentInitiated(false);
                  onClose?.();
                }}
              >
                Cancel and Close
              </Button>
            </div>
          ) : (
            <>
              <div className="text-center">
                <h3 className="text-lg font-semibold">
                  {cardType === 'child' ? 'Child Plan' : `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`}
                </h3>
                <p className="text-2xl font-bold text-purple-600">
                  CFA {amount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  {cardType === 'child' 
                    ? 'Child membership plan'
                    : `${plan} membership plan`
                  }
                </p>
              </div>


              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Payment Method</label>
                  <Select value={selectedGateway} onValueChange={setSelectedGateway}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose payment gateway" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentGateways.map(g => (
                        <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {showPhoneInput && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="phoneNumber">
                      Phone Number for Sama Money
                    </label>
                    <input
                      id="phoneNumber"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value);
                        if (phoneError) setPhoneError('');
                      }}
                      placeholder="e.g., 7XXXXXXXX (Senegal) or 0XXXXXXXXX (Côte d'Ivoire)"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    {phoneError && (
                      <p className="text-sm text-red-600">{phoneError}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Enter your phone number in international format (e.g., 7XXXXXXXX for Senegal or 0XXXXXXXXX for Côte d'Ivoire)
                    </p>
                  </div>
                )}
              </div>

              {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700">{error}</div>}

              <Button
                onClick={handlePayment}
                disabled={loading}
                className={`w-full ${
                  selectedGateway === 'orange_money' 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : selectedGateway === 'cinetpay'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : `Pay with ${paymentGateways.find(g => g.id === selectedGateway)?.name}`}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}