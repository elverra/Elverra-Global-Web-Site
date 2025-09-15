import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { createPendingSubscription, activateSubscription } from '@/utils/subscriptionService';

interface User {
  id: string;
  email?: string | null;
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  state?: string;
  zipCode?: string;
}

interface UserFormData {
  name: string;
  surname: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  state: string;
  zipCode: string;
}

interface PaymentProps {
  plan: string;
  cardType?: string | null;
  onSuccess?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  preSelectedService?: string;
  amount: number;
}

export default function UnifiedPaymentWindow({ plan, cardType, onSuccess, isOpen = true, onClose, preSelectedService, amount }: PaymentProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGateway, setSelectedGateway] = useState<string>(preSelectedService || 'orange_money');
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const [pendingSubscriptionId, setPendingSubscriptionId] = useState<string | null>(null);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [showUserForm, setShowUserForm] = useState(false);
  const [userFormData, setUserFormData] = useState<UserFormData>({
    name: '',
    surname: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'ML',
    state: 'ML',
    zipCode: ''
  });
  const { user: authUser } = useAuth();
  const user = authUser as User | null;

  const paymentGateways = [
    { id: 'orange_money', name: '🍊 Orange Money' },
    { id: 'sama_money', name: '💰 SAMA Money' },
    { id: 'cinetpay', name: '📱 CinetPay Mobile Money' },
  ];

  // Show appropriate form based on selected gateway
  useEffect(() => {
    if (selectedGateway === 'sama_money') {
      setShowPhoneInput(true);
      setShowUserForm(false);
    } else if (selectedGateway === 'cinetpay') {
      setShowPhoneInput(false);
      setShowUserForm(true);
      setUserFormData({
        name: user?.fullName?.split(' ')[0] || '',
        surname: user?.fullName?.split(' ').slice(1).join(' ') || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        city: user?.city || '',
        country: user?.country || 'ML',
        state: user?.state || 'ML',
        zipCode: user?.zipCode || ''
      });
    } else {
      setShowPhoneInput(false);
      setShowUserForm(false);
    }
    setPhoneError('');
  }, [selectedGateway, user]);

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^(?:(?:\+223|00223|223)?[67]\d{7}|(?:\+221|00221|221)?[76]\d{7})$/;
    return phoneRegex.test(phone);
  };

  const validateUserForm = (): boolean => {
    if (selectedGateway === 'cinetpay') {
      return !!(
        userFormData.name &&
        userFormData.surname &&
        userFormData.email &&
        userFormData.phone &&
        userFormData.address &&
        userFormData.city &&
        userFormData.country &&
        userFormData.state
      );
    }
    if (selectedGateway === 'sama_money') {
      return validatePhoneNumber(phoneNumber);
    }
    return true;
  };

  const handlePayment = async () => {
    if (!user) {
      toast.error('You must be logged in to make a payment');
      return;
    }

    if (!selectedGateway) {
      toast.error('Please select a payment method');
      return;
    }

    if (!validateUserForm()) {
      if (selectedGateway === 'sama_money') {
        setPhoneError('Veuillez entrer un numéro de téléphone valide');
        toast.error('Numéro de téléphone requis pour SAMA Money');
      } else if (selectedGateway === 'cinetpay') {
        toast.error('Veuillez remplir tous les champs requis pour CinetPay (nom, prénom, email, téléphone, adresse, ville, pays, état)');
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Starting payment process...');

      if (!user?.id) {
        throw new Error('Veuillez vous connecter pour effectuer un paiement');
      }

      if (showPhoneInput && !validatePhoneNumber(phoneNumber)) {
        setPhoneError('Numéro de téléphone invalide');
        throw new Error('Numéro de téléphone invalide');
      }

      if (showUserForm && !validateUserForm()) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      const holderName = user?.fullName?.trim();
      if (!holderName) {
        throw new Error('Impossible de récupérer votre nom depuis votre profil. Veuillez vérifier vos informations de profil.');
      }

      const getProductId = () => {
        if (cardType === 'child' || cardType === 'kiddies') {
          return 4;
        }
        switch (plan.toLowerCase()) {
          case 'essential': return 1;
          case 'premium': return 2;
          case 'elite': return 3;
          default: return 1;
        }
      };

      const productId = getProductId();
      console.log('Using product ID:', productId, 'for plan:', plan, 'cardType:', cardType);

      const subscriptionData = {
        userId: user.id,
        productId,
        cycleMonths: 12,
        isChild: cardType === 'child',
        holderFullName: holderName,
        metadata: {
          paymentAmount: amount,
          planType: plan,
          paymentMethod: selectedGateway,
          holderCity: user.city || ''
        }
      };

      console.log('Creating subscription with data:', JSON.stringify(subscriptionData, null, 2));

      const pendingSubscription = await createPendingSubscription(subscriptionData);
      console.log('Subscription created successfully:', pendingSubscription);

      if (!pendingSubscription?.id) {
        throw new Error('Échec de la création de l\'abonnement: ID manquant');
      }

      setPendingSubscriptionId(pendingSubscription.id);

      const withBase = (path: string) => {
        if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
          return `http://localhost:3001${path.startsWith('/') ? path : `/${path}`}`;
        }
        return path.startsWith('/') ? path : `/${path}`;
      };

      const reference = `ELV${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      let response: Response;

      if (selectedGateway === 'orange_money' || selectedGateway === 'sama_money') {
        const endpoint = selectedGateway === 'orange_money'
          ? withBase('/api/payments/initiate-orange-money')
          : withBase('/api/payments/initiate-sama-money');

        const requestBody = {
          amount,
          description: `Paiement pour abonnement ${plan}`,
          phone: showPhoneInput ? phoneNumber : (userFormData.phone || ''),
          email: user?.email || '',
          name: holderName,
          reference,
          metadata: {
            userId: user.id,
            subscriptionId: pendingSubscription.id,
            planType: plan,
            cardType: cardType || 'adult'
          }
        };

        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
            // Removed 'Authorization' header to match TokenPurchase.tsx
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const errorData = await response.json();
          let errorMessage = 'Échec de l\'initiation du paiement';
          if (selectedGateway === 'sama_money') {
            errorMessage = errorData?.msg || 'Échec du paiement SAMA Money';
          } else if (selectedGateway === 'orange_money') {
            errorMessage = errorData?.message || errorData?.description || 'Échec du paiement Orange Money';
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        if (data.success && (data.payment_url || data.paymentUrl)) {
          const paymentUrl = data.payment_url || data.paymentUrl;
          console.log('Opening payment in new tab:', paymentUrl);
          console.log('Payment response data:', data);
          window.open(paymentUrl, '_blank');
          setPaymentInitiated(true);
          const pollId = data.paymentId || data.transactionId || data.reference || data.paymentAttemptId;
          console.log('Using payment ID for polling:', pollId);
          setPaymentReference(pollId);
          toast.success('Payment initiated! Please complete the payment in the new tab.');
        } else {
          throw new Error(data.message || 'Échec de l\'initiation du paiement');
        }
      } else if (selectedGateway === 'cinetpay') {
        const apikey = import.meta.env.VITE_CINETPAY_API_KEY;
        const siteId = import.meta.env.VITE_CINETPAY_SITE_ID;

        if (!apikey || !siteId) {
          throw new Error('CinetPay configuration missing. Please set VITE_CINETPAY_API_KEY and VITE_CINETPAY_SITE_ID');
        }

        const txId = `SUB_${plan.toUpperCase()}_${user.id}_${Date.now()}`;
        const notifyUrl = import.meta.env.VITE_CINETPAY_NOTIFY_URL || 'https://elverraglobalml.com/api/payments/cinetpay-webhook';
        const returnUrl = 'https://elverraglobalml.com/payment/success';

        const paymentData = {
          apikey,
          site_id: siteId,
          transaction_id: txId,
          amount,
          currency: 'XOF',
          description: `Paiement pour abonnement ${plan}`,
          return_url: returnUrl,
          notify_url: notifyUrl,
          channels: 'ALL',
          metadata: JSON.stringify({
            type: 'subscription',
            subscriptionId: pendingSubscription.id,
            userId: user.id,
            planType: plan,
            cardType: cardType || 'adult'
          }),
          customer_id: user.id,
          customer_name: userFormData.name || 'Client',
          customer_surname: userFormData.surname || 'Elverra',
          customer_email: userFormData.email || user.email || '',
          customer_phone_number: userFormData.phone || '',
          customer_address: userFormData.address || 'N/A',
          customer_city: userFormData.city || 'Bamako',
          customer_country: userFormData.country?.toUpperCase() || 'ML',
          customer_state: userFormData.state?.toUpperCase() || 'ML',
          customer_zip_code: userFormData.zipCode || '00000',
          lang: 'FR',
          invoice_data: {
            'Plan': plan,
            'Type': cardType || 'adult',
            'Montant': `${amount} FCFA`
          }
        };

        response = await fetch('https://api-checkout.cinetpay.com/v2/payment', {
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
          window.open(result.data.payment_url, '_blank');
          setPaymentInitiated(true);
          setPaymentReference(txId);
          toast.success('Redirecting to CinetPay payment page...');
        } else {
          throw new Error(result.message || result.description || 'CinetPay payment failed');
        }
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
      return;
    }

    console.log('Starting payment status polling for:', paymentReference);
    const interval = setInterval(async () => {
      try {
        console.log('Polling payment status for ID:', paymentReference);
        const token = localStorage.getItem('token');
        if (!token) {
          console.warn('Authentication token is missing during polling');
          setPaymentInitiated(false);
          setError('Session expired. Please log in again.');
          toast.error('Session expired. Please log in again.');
          clearInterval(interval);
          onClose?.();
          return;
        }
        const response = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            paymentId: paymentReference,
            gateway: selectedGateway
          }),
        });
        const data = await response.json();
        console.log('Payment verification response:', data);

        if (data.success && data.status === 'completed') {
          console.log('Payment completed successfully!');
          setPaymentInitiated(false);
          clearInterval(interval);

          try {
            if (pendingSubscriptionId && user?.id) {
              await activateSubscription(pendingSubscriptionId, user.id);
              toast.success('Payment verified! Your membership is active.');
              onSuccess?.();
              onClose?.();
            } else if (!user?.id) {
              toast.error('User session expired. Please log in again.');
            } else {
              toast.error('No pending subscription found. Please contact support.');
            }
          } catch (error) {
            console.error('Error activating subscription:', error);
            toast.error('Payment successful but failed to activate membership. Please contact support.');
          }
        } else if (data.success && (data.status === 'failed' || data.status === 'cancelled')) {
          console.log('Payment failed or cancelled:', data.status);
          setPaymentInitiated(false);
          setError('Payment failed or was cancelled.');
          toast.error('Payment failed or was cancelled.');
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [paymentInitiated, paymentReference, pendingSubscriptionId, user, selectedGateway, onSuccess, onClose]);

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
                  {cardType === 'child' ? 'Child membership plan' : `${plan} membership plan`}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Select Payment Method</Label>
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
                    <Label className="text-sm font-medium">Phone Number (for SAMA Money)</Label>
                    <Input
                      type="tel"
                      placeholder="+221 XX XXX XX XX"
                      value={phoneNumber}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setPhoneNumber(e.target.value);
                        setPhoneError('');
                      }}
                      className={phoneError ? 'border-red-500' : ''}
                    />
                    {phoneError && (
                      <p className="text-sm text-red-500">{phoneError}</p>
                    )}
                  </div>
                )}

                {showUserForm && (
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="text-sm font-medium">Complete Your Information (Required for CinetPay)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">First Name</Label>
                        <Input
                          type="text"
                          placeholder="Your first name"
                          value={userFormData.name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserFormData({ ...userFormData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Last Name</Label>
                        <Input
                          type="text"
                          placeholder="Your last name"
                          value={userFormData.surname}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserFormData({ ...userFormData, surname: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Email</Label>
                        <Input
                          type="email"
                          placeholder="Your email"
                          value={userFormData.email}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserFormData({ ...userFormData, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Phone Number</Label>
                        <Input
                          type="tel"
                          placeholder="+223 XX XX XX XX"
                          value={userFormData.phone}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserFormData({ ...userFormData, phone: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <Label className="text-xs text-muted-foreground">Address</Label>
                        <Input
                          type="text"
                          placeholder="Your address"
                          value={userFormData.address}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserFormData({ ...userFormData, address: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">City</Label>
                        <Input
                          type="text"
                          placeholder="City"
                          value={userFormData.city}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserFormData({ ...userFormData, city: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Country (ISO)</Label>
                        <Input
                          type="text"
                          placeholder="Country"
                          value={userFormData.country}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserFormData({ ...userFormData, country: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">State</Label>
                        <Input
                          type="text"
                          placeholder="State"
                          value={userFormData.state}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserFormData({ ...userFormData, state: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Zip Code</Label>
                        <Input
                          type="text"
                          placeholder="Zip Code"
                          value={userFormData.zipCode}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserFormData({ ...userFormData, zipCode: e.target.value })}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">These details are required by CinetPay for card/mobile payments.</p>
                  </div>
                )}

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
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay CFA ${amount.toLocaleString()} with ${paymentGateways.find(g => g.id === selectedGateway)?.name}`
                  )}
                </Button>
              </div>

              {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700">{error}</div>}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}