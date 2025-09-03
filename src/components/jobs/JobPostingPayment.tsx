import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Calendar, DollarSign, Check } from 'lucide-react';
import { toast } from 'sonner';
import UnifiedPaymentWindow from '@/components/payment/UnifiedPaymentWindow';

interface JobPostingPaymentProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentData: any) => void;
  jobTitle: string;
  duration: number; // Duration in days
}

const JobPostingPayment = ({ isOpen, onClose, onSuccess, jobTitle, duration }: JobPostingPaymentProps) => {
  const [paymentMethod, setPaymentMethod] = useState('mobile_money');
  const [processing, setProcessing] = useState(false);
  const [showUnifiedPayment, setShowUnifiedPayment] = useState(false);

  const COST_PER_DAY = 2000; // CFA per day
  const totalCost = duration * COST_PER_DAY;

  const paymentMethods = [
    {
      id: 'mobile_money',
      name: 'Mobile Money',
      description: 'Orange Money, Moov Money, Wave',
      icon: '📱'
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      description: 'Direct bank transfer',
      icon: '🏦'
    },
    {
      id: 'cash',
      name: 'Cash Payment',
      description: 'Pay at our office locations',
      icon: '💵'
    }
  ];

  const handlePayment = async () => {
    setProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const paymentData = {
        amount: totalCost,
        duration,
        paymentMethod,
        jobTitle,
        transactionId: `JOB_${Date.now()}`,
        status: 'completed',
        paidAt: new Date().toISOString()
      };
      
      onSuccess(paymentData);
      toast.success('Payment successful! Your job posting is now active.');
      onClose();
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleUnifiedPayment = () => {
    setShowUnifiedPayment(true);
  };

  const handlePaymentSuccess = (transactionId: string) => {
    const paymentData = {
      amount: totalCost,
      duration,
      paymentMethod: 'unified_payment',
      jobTitle,
      transactionId,
      status: 'completed',
      paidAt: new Date().toISOString()
    };
    
    onSuccess(paymentData);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Job Posting Payment</DialogTitle>
          <DialogDescription>
            Complete payment to activate your job posting
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Job Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Posting Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Job Title:</span>
                <span className="font-medium text-sm">{jobTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Duration:</span>
                <span className="font-medium text-sm">{duration} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Rate:</span>
                <span className="font-medium text-sm">CFA {COST_PER_DAY.toLocaleString()}/day</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-medium">Total:</span>
                <span className="font-bold text-lg">CFA {totalCost.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <div>
            <Label className="text-base font-medium mb-3 block">Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <Label
                    key={method.id}
                    htmlFor={method.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <RadioGroupItem value={method.id} id={method.id} />
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="text-2xl">{method.icon}</span>
                      <div>
                        <div className="font-medium">{method.name}</div>
                        <div className="text-sm text-gray-500">{method.description}</div>
                      </div>
                    </div>
                  </Label>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Payment Terms */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start space-x-2">
              <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Payment Terms</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Job expires after {duration} days</li>
                  <li>• 72-hour grace period for renewal</li>
                  <li>• Automatic deletion if not renewed</li>
                  <li>• No refunds after posting goes live</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center mb-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleUnifiedPayment}
              className="w-full"
            >
              Use Unified Payment Window
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handlePayment} 
              disabled={processing}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {processing ? (
                'Processing...'
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay CFA {totalCost.toLocaleString()}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

      <UnifiedPaymentWindow
        isOpen={showUnifiedPayment}
        onClose={() => setShowUnifiedPayment(false)}
        onSuccess={handlePaymentSuccess}
        preSelectedService="job_posting"
      />
    </>
  );
};

export default JobPostingPayment;