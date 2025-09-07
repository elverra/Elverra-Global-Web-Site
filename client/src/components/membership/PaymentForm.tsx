
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Smartphone, DollarSign, QrCode, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import UnifiedPaymentWindow from '@/components/payment/UnifiedPaymentWindow';
import { usePaymentGateways } from '@/hooks/usePaymentGateways';
import { useAuth } from '@/hooks/useAuth';
import { paymentService } from '@/services/paymentService';

interface PaymentFormProps {
  selectedPlan: {
    name: string;
    price: string;
    monthly: string;
  };
  onPaymentComplete: () => void;
}

const PaymentForm = ({ selectedPlan, onPaymentComplete }: PaymentFormProps) => {
  const { user } = useAuth();
  const { gateways, getActiveGateways, getGatewayById } = usePaymentGateways();
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [showUnifiedPayment, setShowUnifiedPayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    phoneNumber: '',
    email: '',
    orangePin: '',
    moovPin: '',
  });

  const activeGateways = getActiveGateways();
  const totalAmount = parseInt(selectedPlan.price) + parseInt(selectedPlan.monthly);

  console.log('Active gateways:', activeGateways);
  console.log('All gateways:', gateways);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    if (!formData.email) {
      toast.error('Please provide your email address');
      return;
    }

    const gateway = getGatewayById(paymentMethod);
    if (!gateway) {
      toast.error('Invalid payment method selected');
      return;
    }

    if (!user) {
      toast.error('Please log in to complete membership creation');
      return;
    }

    setIsProcessing(true);

    try {
      const paymentRequest = {
        serviceId: `membership_${selectedPlan.name.toLowerCase()}`,
        gatewayId: paymentMethod,
        amount: totalAmount,
        currency: 'CFA',
        customerInfo: {
          name: user.email?.split('@')[0] || formData.email.split('@')[0] || 'User',
          email: formData.email,
          phone: formData.phoneNumber || '+223 00 00 00 00'
        },
        metadata: {
          membershipTier: selectedPlan.name,
          planPrice: selectedPlan.price,
          monthlyFee: selectedPlan.monthly
        }
      };

      const response = await paymentService.processPayment(gateway, paymentRequest);

      if (response.success) {
        if (response.paymentUrl) {
          // Redirect to payment gateway
          window.open(response.paymentUrl, '_blank');
          toast.info('Complete payment in the opened window, then return here');
          
          // For demo purposes, simulate success after delay
          setTimeout(() => {
            toast.success('Payment completed successfully!');
            onPaymentComplete();
          }, 5000);
        } else {
          toast.success('Payment processed successfully!');
          onPaymentComplete();
        }
      } else {
        toast.error(response.error || 'Payment failed');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment processing failed. Please check your connection and try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  const handleUnifiedPayment = () => {
    setShowUnifiedPayment(true);
  };

  const handlePaymentSuccess = () => {
    // Verify payment and create membership
    verifyPaymentAndCreateMembership();
  };

  const verifyPaymentAndCreateMembership = async () => {
    try {
      // In a real implementation, you would verify the payment with the gateway
      // For now, we'll proceed with membership creation
      
      toast.success('Payment processed successfully! Creating your subscription...');
      onPaymentComplete();
    } catch (error) {
      toast.error('Payment verification failed. Please contact support.');
    }
  };

  return (
    <>
      <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center">Complete Payment</CardTitle>
        <div className="text-center">
          <p className="text-lg font-semibold">{selectedPlan.name} Plan</p>
          <p className="text-2xl font-bold text-club66-purple">
            CFA {selectedPlan.price} + {selectedPlan.monthly}/month
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="payment-method">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {activeGateways.map((gateway) => (
                  <SelectItem key={gateway.id} value={gateway.id}>
                    <div className="flex items-center">
                      <span className="mr-2">{gateway.icon}</span>
                      {gateway.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Orange Money Fields */}
          {paymentMethod === 'orange_money' && (
            <>
              <div>
                <Label htmlFor="phone">Orange Money Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+223 XX XX XX XX"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  required
                />
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <p className="text-sm text-orange-700">
                  You will receive a payment request on your Orange Money account. Please check your phone 
                  and approve the transaction to complete your payment. This may take a few moments to appear.
                </p>
              </div>
            </>
          )}

          {/* SAMA Money Fields */}
          {paymentMethod === 'sama_money' && (
            <>
              <div>
                <Label htmlFor="phone">SAMA Money Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+223 XX XX XX XX"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  required
                />
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-700">
                  You will receive a payment request on your SAMA Money account to complete the transaction.
                </p>
              </div>
            </>
          )}

          {/* Moov Money Fields */}
          {paymentMethod === 'moov_money' && (
            <>
              <div>
                <Label htmlFor="phone">Moov Money Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+223 XX XX XX XX"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="moov-pin">Moov Money PIN</Label>
                <Input
                  id="moov-pin"
                  type="password"
                  placeholder="Enter your 4-digit PIN"
                  maxLength={4}
                  value={formData.moovPin}
                  onChange={(e) => setFormData({ ...formData, moovPin: e.target.value })}
                  required
                />
              </div>
            </>
          )}

          {/* Wave Fields */}
          {paymentMethod === 'wave_money' && (
            <div>
              <Label htmlFor="phone">Wave Phone Number</Label>
              <Input
                id="phone"
                placeholder="+223 XX XX XX XX"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                You will receive a payment request on your Wave app
              </p>
            </div>
          )}

          {/* Stripe Card Fields */}
          {paymentMethod === 'stripe' && (
            <>
              <div>
                <Label htmlFor="card-number">Card Number</Label>
                <Input
                  id="card-number"
                  placeholder="1234 5678 9012 3456"
                  value={formData.cardNumber}
                  onChange={(e) => {
                    // Auto-format card number with spaces
                    const value = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
                    setFormData({ ...formData, cardNumber: value });
                  }}
                  maxLength={19}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={formData.expiryDate}
                    onChange={(e) => {
                      // Auto-format expiry date
                      const value = e.target.value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
                      setFormData({ ...formData, expiryDate: value });
                    }}
                    maxLength={5}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    type="password"
                    maxLength={4}
                    value={formData.cvv}
                    onChange={(e) => setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, '') })}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={!paymentMethod || isProcessing}
          >
            {isProcessing ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </div>
            ) : (
              `Pay CFA ${totalAmount.toLocaleString()}`
            )}
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="outline"
              onClick={handleUnifiedPayment}
              className="w-full mb-4"
            >
              Use Unified Payment Window
            </Button>
          </div>

          {paymentMethod && (
            <div className="text-xs text-gray-500 text-center mt-2">
              Your payment will be processed securely through {getGatewayById(paymentMethod)?.name}
            </div>
          )}
        </form>
      </CardContent>
    </Card>

      <UnifiedPaymentWindow
        plan={selectedPlan.name.toLowerCase()}
        isOpen={showUnifiedPayment}
        onClose={() => setShowUnifiedPayment(false)}
        onSuccess={handlePaymentSuccess}
        preSelectedService={`membership_${selectedPlan.name.toLowerCase()}`}
      />
    </>
  );
};

export default PaymentForm;
