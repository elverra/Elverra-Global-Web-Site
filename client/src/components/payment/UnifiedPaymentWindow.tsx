import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

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
  const [selectedGateway, setSelectedGateway] = useState<string>('orange_money');
  const { user } = useAuth();

  const paymentGateways = [
    { id: 'orange_money', name: '🍊 Orange Money', color: 'orange' },
    { id: 'sama_money', name: '💰 SAMA Money', color: 'green' }
  ];

  const handlePayment = async () => {
    if (!user) {
      toast.error('Please log in to complete payment');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const amount = plan === 'premium' ? 12000 : plan === 'elite' ? 15000 : 11000; // plan price + monthly
      const paymentData = {
        amount,
        currency: 'XOF',
        phone: user.phone || '+2237701100100',
        email: user.email,
        name: user.fullName || user.email.split('@')[0],
        reference: `MEMBERSHIP_${plan.toUpperCase()}_${Date.now()}`
      };

      const endpoint = selectedGateway === 'sama_money' 
        ? '/api/payments/initiate-sama-money' 
        : '/api/payments/initiate-orange-money';
        
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });

      const data = await res.json();

      if (data.success && data.payment_url) {
        // Open payment window
        const gatewayName = paymentGateways.find(g => g.id === selectedGateway)?.name || 'Payment Gateway';
        const paymentWindow = window.open(data.payment_url, 'payment_window', 'width=600,height=700,scrollbars=yes,resizable=yes');
        
        if (data.demo) {
          toast.info(`Demo payment window opened for ${gatewayName}. Complete the simulation to proceed.`);
        } else {
          toast.info(`Complete payment in the opened ${gatewayName} window`);
        }
        
        // Listen for payment completion messages
        const handleMessage = (event: MessageEvent) => {
          if (event.data.type === 'payment-success') {
            toast.success('Payment completed successfully!');
            if (onSuccess) onSuccess();
            window.removeEventListener('message', handleMessage);
          } else if (event.data.type === 'payment-failed') {
            toast.error('Payment failed. Please try again.');
            setError('Payment was not completed');
          }
        };
        
        window.addEventListener('message', handleMessage);
        
        // Check if window is closed without completion
        const checkClosed = setInterval(() => {
          if (paymentWindow?.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', handleMessage);
            if (!document.hidden) {
              toast.info('Payment window was closed. Please try again if payment was not completed.');
            }
          }
        }, 1000);
        
      } else {
        setError(data.error || 'Payment initiation failed');
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="unified-payment-modal">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Mobile Money Payment</CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-payment">
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
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
              <SelectTrigger data-testid="select-payment-gateway">
                <SelectValue placeholder="Choose payment gateway" />
              </SelectTrigger>
              <SelectContent>
                {paymentGateways.map((gateway) => (
                  <SelectItem key={gateway.id} value={gateway.id}>
                    {gateway.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className={`border rounded-lg p-3 ${
            selectedGateway === 'orange_money' 
              ? 'bg-orange-50 border-orange-200' 
              : 'bg-green-50 border-green-200'
          }`}>
            <p className={`text-sm ${
              selectedGateway === 'orange_money' ? 'text-orange-700' : 'text-green-700'
            }`}>
              {selectedGateway === 'orange_money' ? '🍊' : '💰'} You will be redirected to {paymentGateways.find(g => g.id === selectedGateway)?.name} to complete your payment securely.
            </p>
          </div>

          <Button 
            onClick={handlePayment} 
            disabled={loading}
            className={`w-full ${
              selectedGateway === 'orange_money' 
                ? 'bg-orange-600 hover:bg-orange-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
            data-testid="button-pay-mobile-money"
          >
            {loading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </div>
            ) : (
              `Pay with ${paymentGateways.find(g => g.id === selectedGateway)?.name}`
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
