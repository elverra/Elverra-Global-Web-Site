import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, CreditCard, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

interface WithdrawalRequestProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  availableAmount: number;
}

const WithdrawalRequest = ({ open, onClose, onSuccess, availableAmount }: WithdrawalRequestProps) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [accountDetails, setAccountDetails] = useState({
    bankName: '',
    accountNumber: '',
    accountName: '',
    phoneNumber: '',
    operatorName: ''
  });
  const [loading, setLoading] = useState(false);
  const [agentId, setAgentId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAgent = async () => {
      if (!user) return;
      
      const mockAgentResult = { data: null, error: null }; // TODO: Replace with API call
      const { data: agentData, error } = mockAgentResult;
      
      if (agentData) {
        setAgentId(agentData.id);
      }
    };

    if (open) {
      fetchAgent();
    }
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to request withdrawal');
      return;
    }

    if (!agentId) {
      toast.error('Agent profile not found');
      return;
    }

    const withdrawalAmount = parseInt(amount);
    if (withdrawalAmount <= 0 || withdrawalAmount > availableAmount) {
      toast.error('Invalid withdrawal amount');
      return;
    }

    if (withdrawalAmount < 5000) {
      toast.error('Minimum withdrawal amount is 5,000 FCFA');
      return;
    }

    setLoading(true);

    try {
      let details = {};
      
      if (method === 'bank_transfer') {
        details = {
          type: 'bank_transfer',
          bankName: accountDetails.bankName,
          accountNumber: accountDetails.accountNumber,
          accountName: accountDetails.accountName
        };
      } else if (method === 'mobile_money') {
        details = {
          type: 'mobile_money',
          phoneNumber: accountDetails.phoneNumber,
          operator: accountDetails.operatorName
        };
      } else if (method === 'orange_money') {
        details = {
          type: 'orange_money',
          phoneNumber: accountDetails.phoneNumber
        };
      } else if (method === 'wave_money') {
        details = {
          type: 'wave_money',
          phoneNumber: accountDetails.phoneNumber
        };
      }

      const mockWithdrawalResult = { data: null, error: null }; // TODO: Replace with API call
      const { data, error } = mockWithdrawalResult;

      if (error) throw error;

      toast.success('Withdrawal request submitted successfully');
      
      // Reset form
      setAmount('');
      setMethod('');
      setAccountDetails({
        bankName: '',
        accountNumber: '',
        accountName: '',
        phoneNumber: '',
        operatorName: ''
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error submitting withdrawal request:', error);
      toast.error('Failed to submit withdrawal request');
    } finally {
      setLoading(false);
    }
  };

  const renderAccountFields = () => {
    switch (method) {
      case 'bank_transfer':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                value={accountDetails.bankName}
                onChange={(e) => setAccountDetails(prev => ({ ...prev, bankName: e.target.value }))}
                placeholder="e.g., Bank of Africa"
                required
              />
            </div>
            <div>
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                value={accountDetails.accountNumber}
                onChange={(e) => setAccountDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                placeholder="Your bank account number"
                required
              />
            </div>
            <div>
              <Label htmlFor="accountName">Account Name</Label>
              <Input
                id="accountName"
                value={accountDetails.accountName}
                onChange={(e) => setAccountDetails(prev => ({ ...prev, accountName: e.target.value }))}
                placeholder="Account holder name"
                required
              />
            </div>
          </div>
        );

      case 'mobile_money':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="operatorName">Mobile Money Operator</Label>
              <Select 
                value={accountDetails.operatorName} 
                onValueChange={(value) => setAccountDetails(prev => ({ ...prev, operatorName: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select operator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="orange_money">Orange Money</SelectItem>
                  <SelectItem value="moov_money">Moov Money</SelectItem>
                  <SelectItem value="malitel_money">Malitel Money</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={accountDetails.phoneNumber}
                onChange={(e) => setAccountDetails(prev => ({ ...prev, phoneNumber: e.target.value }))}
                placeholder="e.g., +223 XX XX XX XX"
                required
              />
            </div>
          </div>
        );

      case 'orange_money':
      case 'wave_money':
        return (
          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              value={accountDetails.phoneNumber}
              onChange={(e) => setAccountDetails(prev => ({ ...prev, phoneNumber: e.target.value }))}
              placeholder="e.g., +223 XX XX XX XX"
              required
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Request Withdrawal
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Available balance: <span className="font-semibold">{availableAmount.toLocaleString()} FCFA</span>
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="amount">Withdrawal Amount (FCFA)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Minimum 5,000 FCFA"
              min="5000"
              max={availableAmount}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum withdrawal: 5,000 FCFA
            </p>
          </div>

          <div>
            <Label htmlFor="method">Withdrawal Method</Label>
            <Select value={method} onValueChange={setMethod} required>
              <SelectTrigger>
                <SelectValue placeholder="Select withdrawal method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Bank Transfer
                  </div>
                </SelectItem>
                <SelectItem value="orange_money">
                  <div className="flex items-center">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Orange Money
                  </div>
                </SelectItem>
                <SelectItem value="wave_money">
                  <div className="flex items-center">
                    <Smartphone className="h-4 w-4 mr-2" />
                    WAVE Money
                  </div>
                </SelectItem>
                <SelectItem value="mobile_money">
                  <div className="flex items-center">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Other Mobile Money
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {method && renderAccountFields()}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !method || parseInt(amount) < 5000 || parseInt(amount) > availableAmount}
          >
            {loading ? 'Submitting...' : 'Submit Withdrawal Request'}
          </Button>

          <div className="text-xs text-gray-500 space-y-1">
            <p>• Withdrawal requests are processed within 2-3 business days</p>
            <p>• Processing fees may apply depending on the withdrawal method</p>
            <p>• Ensure your account details are correct to avoid delays</p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawalRequest;