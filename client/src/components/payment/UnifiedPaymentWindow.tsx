import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface PaymentProps {
  plan: string;
  onSuccess?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  preSelectedService?: string;
}

export default function UnifiedPaymentWindow({ plan, onSuccess, isOpen = true, onClose, preSelectedService }: PaymentProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGateway, setSelectedGateway] = useState<string>(preSelectedService || 'orange_money');
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const paymentGateways = [
    { id: 'orange_money', name: '🍊 Orange Money' },
    { id: 'sama_money', name: '💰 SAMA Money' },
  ];

  const handlePayment = async () => {
    if (!user) {
      toast.error('Please log in to complete payment');
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create subscription
      const subscriptionRes = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, plan: 'monthly', status: 'pending' }),
      });
      if (!subscriptionRes.ok) throw new Error('Failed to create subscription');
      const subscriptionData = await subscriptionRes.json();

      const amount = plan === 'premium' ? 12000 : plan === 'elite' ? 15000 : 11000;
      const reference = `MEMBERSHIP_${plan.toUpperCase()}_${Date.now()}`;
      const paymentData = {
        userId: user.id,
        amount,
        currency: 'OUV',
        phone: user.phone || '+2237701100100',
        email: user.email,
        name: user.fullName || user.email?.split('@')[0] || 'User',
        reference,
        subscriptionId: subscriptionData.id,
        metadata: { plan, userId: user.id },
      };

      const endpoint = selectedGateway === 'sama_money'
        ? '/api/payments/initiate-sama-money'
        : '/api/payments/initiate-orange-money';

    // In handlePayment
const res = await fetch(endpoint, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(paymentData),
});

const data = await res.json();
if (data.success && data.payment_url) {
  console.log("Opening payment in new tab:", data.payment_url);
  window.open(data.payment_url, "_blank");
  setPaymentInitiated(true);
  setPaymentReference(data.paymentId || data.reference); // Use paymentId or fallback to reference
  toast.success("Payment initiated! Please complete the payment in the new tab.");
  return;
}

      throw new Error(data.message || 'Payment initiation failed');
    } catch (err: any) {
      setError(err.message || 'Unexpected error occurred');
      toast.error(err.message || 'Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Poll payment status
  useEffect(() => {
    if (!paymentInitiated || !paymentReference) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId: paymentReference }),
        });
        const data = await response.json();

        if (data.success && data.status === 'completed') {
          setPaymentInitiated(false);
          onSuccess?.();
          toast.success('Payment verified! Your membership is active.');
          clearInterval(interval);
        } else if (data.status === 'failed' || data.status === 'cancelled') {
          setError('Payment failed or was cancelled.');
          toast.error('Payment failed or was cancelled.');
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [paymentInitiated, paymentReference, onSuccess]);

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
                <h3 className="text-lg font-semibold">{plan.charAt(0).toUpperCase() + plan.slice(1)} Plan</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {plan === 'premium' ? 'CFA 12,000' : plan === 'elite' ? 'CFA 15,000' : 'CFA 11,000'}
                </p>
                <p className="text-sm text-gray-600">One-time payment + monthly fee</p>
              </div>

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

              {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700">{error}</div>}

              <Button
                onClick={handlePayment}
                disabled={loading}
                className={`w-full ${selectedGateway === 'orange_money' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'}`}
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