import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PaymentTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [gateway, setGateway] = useState('orange_money');
  const [amount, setAmount] = useState('5000');
  const [currency, setCurrency] = useState('CFA');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('test@example.com');
  const [name, setName] = useState('Test User');
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const testPayment = async () => {
    if (!phone || !amount) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const reference = `TEST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const endpoint = gateway === 'orange_money' 
        ? '/api/payments/initiate-orange-money'
        : '/api/payments/initiate-sama-money';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          currency,
          phone,
          email,
          name,
          reference
        })
      });

      const data = await response.json();
      setResult({
        status: response.ok ? 'success' : 'error',
        data,
        timestamp: new Date().toISOString()
      });

      if (response.ok && data.success) {
        toast({
          title: "Payment Initiated",
          description: `${gateway === 'orange_money' ? 'Orange' : 'SAMA'} Money payment initiated successfully`,
        });

        // Open payment URL if available
        if (data.payment_url) {
          window.open(data.payment_url, '_blank');
        }
      } else {
        toast({
          title: "Payment Failed",
          description: data.error || 'Payment initiation failed',
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Payment test error:', error);
      setResult({
        status: 'error',
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date().toISOString()
      });
      toast({
        title: "Connection Error",
        description: "Failed to connect to payment service",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Gateway Test</h1>
        <p className="text-gray-600">Test Orange Money and SAMA Money payment integrations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Test Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="gateway">Payment Gateway</Label>
              <Select value={gateway} onValueChange={setGateway}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="orange_money">🍊 Orange Money</SelectItem>
                  <SelectItem value="sama_money">💰 SAMA Money</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="5000"
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CFA">CFA</SelectItem>
                    <SelectItem value="OUV">OUV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+223 XX XX XX XX"
                className="font-mono"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>

            <div>
              <Label htmlFor="name">Customer Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Test User"
              />
            </div>

            {gateway === 'sama_money' && (
              <Alert>
                <Smartphone className="h-4 w-4" />
                <AlertDescription>
                  SAMA Money is currently unavailable. Please provide credentials to enable this gateway.
                </AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={testPayment} 
              disabled={isLoading || (gateway === 'sama_money')}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Test ${gateway === 'orange_money' ? 'Orange' : 'SAMA'} Money Payment`
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${
                  result.status === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${
                      result.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="font-semibold">
                      {result.status === 'success' ? 'Success' : 'Error'}
                    </span>
                    <span className="text-sm text-gray-500 ml-auto">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Response Data:</h4>
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No test results yet. Run a payment test to see the results here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gateway Status */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Gateway Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🍊</span>
                <div>
                  <h4 className="font-semibold">Orange Money</h4>
                  <p className="text-sm text-gray-600">Production Ready</p>
                </div>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💰</span>
                <div>
                  <h4 className="font-semibold">SAMA Money</h4>
                  <p className="text-sm text-gray-600">Credentials Required</p>
                </div>
              </div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentTest;