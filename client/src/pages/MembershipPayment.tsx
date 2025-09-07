import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/layout/Layout';
import MembershipTiers from '@/components/membership/MembershipTiers';
import UnifiedPaymentWindow from '@/components/payment/UnifiedPaymentWindow';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useMembership } from '@/hooks/useMembership';

const MembershipPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const planFromUrl = searchParams.get('plan');
  const paymentStatus = searchParams.get('payment');
  const { user } = useAuth();
  const { membership, loading: membershipLoading, refetch: refetchMembership } = useMembership();
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const plans = {
    essential: { name: 'Essential', price: '11,000', monthly: '1,000' },
    premium: { name: 'Premium', price: '12,000', monthly: '2,000' },
    elite: { name: 'Elite', price: '15,000', monthly: '5,000' },
  };

  useEffect(() => {
    if (user && !membershipLoading && membership?.is_active) {
      navigate('/dashboard');
    }
  }, [user, membership, membershipLoading, navigate]);

  useEffect(() => {
    if (paymentStatus === 'success') {
      setPaymentComplete(true);
      toast.success('Payment successful! Your membership is being activated.');
      refetchMembership();
    } else if (paymentStatus === 'cancelled') {
      toast.error('Payment was cancelled. Please try again.');
    }

    const isNewRegistration = searchParams.get('new') === 'true';
    if (isNewRegistration) {
      toast.success('Please complete your membership payment to activate your account');
    }
  }, [searchParams, paymentStatus, refetchMembership]);

  useEffect(() => {
    if (planFromUrl && plans[planFromUrl as keyof typeof plans]) {
      setSelectedTier(planFromUrl);
      setShowPayment(true);
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('new');
      navigate({ search: newSearchParams.toString() }, { replace: true });
    }
  }, [planFromUrl, searchParams, navigate]);

  const handleSelectTier = (tier: string) => setSelectedTier(tier);
  const handleProceedToPayment = () => setShowPayment(true);
  const handlePaymentComplete = () => {
    setPaymentComplete(true);
    refetchMembership();
  };

  if (paymentComplete) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center py-16">
          <div className="text-center space-y-6">
            <CheckCircle className="h-24 w-24 text-green-500 mx-auto" />
            <h1 className="text-4xl font-bold text-gray-900">Payment Successful!</h1>
            <p className="text-lg text-gray-600">
              Welcome to Elverra Global {plans[selectedTier as keyof typeof plans]?.name} membership!
            </p>
            <p className="text-gray-600">You will receive your digital membership card via email within 24 hours.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-purple-600 hover:bg-purple-700">
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/">Return Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (membershipLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking membership status...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Button asChild variant="ghost" className="mb-4">
              <Link to="/" className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <h1 className="text-4xl font-bold mb-4">Choose Your Client Plan</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Select the perfect client tier for your lifestyle and unlock exclusive benefits.
            </p>
            {user && (
              <p className="text-sm text-purple-600 mt-2">
                Welcome back! Complete your membership to access all features.
              </p>
            )}
          </div>

          {!showPayment ? (
            <div className="space-y-8">
              <MembershipTiers selectedTier={selectedTier} onSelectTier={handleSelectTier} />
              {selectedTier && (
                <div className="text-center">
                  <Button
                    onClick={handleProceedToPayment}
                    size="lg"
                    className="bg-club66-purple hover:bg-club66-darkpurple"
                  >
                    Proceed to Payment
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-center">
              <UnifiedPaymentWindow plan={selectedTier} onSuccess={handlePaymentComplete} onClose={() => setShowPayment(false)} />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MembershipPayment;