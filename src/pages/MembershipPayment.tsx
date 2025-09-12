import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import MembershipTiers from '@/components/membership/MembershipTiers';
import UnifiedPaymentWindow from '@/components/payment/UnifiedPaymentWindow';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useMembership } from '@/hooks/useMembership';

const MembershipPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const planFromUrl = searchParams.get('plan');
  const paymentStatus = searchParams.get('payment');
  const cardType = searchParams.get('type'); // 'child' or 'adult'
  const tier = searchParams.get('tier'); // 'essential', 'premium', 'elite'
  const duration = searchParams.get('duration'); // '1', '3', '6', '12'
  const { user } = useAuth();
  const { membership, loading: membershipLoading, refetch: refetchMembership } = useMembership();
  const [selectedTier, setSelectedTier] = useState<string>(tier || planFromUrl || 'essential');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<string>(duration || '1');
  const [selectedSubscriptionPlan, setSelectedSubscriptionPlan] = useState<string>('one_time');
  const [showSubscriptionSelection, setShowSubscriptionSelection] = useState(false);

  const childCard = {
    name: 'Carte Enfant ELVERRA',
    registration: 5000,
    monthly: 500,
    description: 'Carte unique pour les enfants de 6 à 17 ans'
  };

  const adultPlans = {
    essential: { name: 'Essential', registration: 10000, monthly: 1000, description: 'Plan Essential pour adultes' },
    premium: { name: 'Premium', registration: 10000, monthly: 2000, description: 'Plan Premium pour adultes' },
    elite: { name: 'Elite', registration: 10000, monthly: 5000, description: 'Plan Elite pour adultes' },
  };

  // Structure unifiée pour tous les plans
  const allPlans = {
    child: childCard,
    ...adultPlans
  };

  const durationOptions = {
    "1": { label: "1 mois", discount: 0 },
    "3": { label: "3 mois", discount: 0 },
    "6": { label: "6 mois", discount: 0 },
    "12": { label: "12 mois", discount: 0}
  };

  const calculatePrice = (duration?: string) => {
    const durationToUse = duration || selectedDuration;
    const durationNum = parseInt(durationToUse);
    
    // Utiliser la structure unifiée
    const planKey = cardType === 'child' ? 'child' : selectedTier;
    const plan = allPlans[planKey as keyof typeof allPlans];
    
    if (plan) {
      const durationDiscount = durationOptions[durationToUse as keyof typeof durationOptions]?.discount || 0;
      const monthlyPrice = plan.monthly * (1 - durationDiscount / 100);
      const totalMonthly = monthlyPrice * durationNum;
      
      return plan.registration + totalMonthly;
    }
    
    return 0;
  };

  useEffect(() => {
    if (user && !membershipLoading && membership?.is_active) {
      navigate('/dashboard');
    }
  }, [user, membership, membershipLoading, navigate]);

  useEffect(() => {
    if (paymentStatus === 'success') {
      setPaymentComplete(true);
      toast.success('Payment successful! Your subscription is being activated.');
      refetchMembership();
    } else if (paymentStatus === 'cancelled') {
      toast.error('Payment was cancelled. Please try again.');
    }

    const isNewRegistration = searchParams.get('new') === 'true';
    if (isNewRegistration) {
      toast.success('Please complete your card purchase payment to activate your account');
    }
  }, [searchParams, paymentStatus, refetchMembership]);

  useEffect(() => {
    if (planFromUrl && adultPlans[planFromUrl as keyof typeof adultPlans]) {
      setSelectedTier(planFromUrl);
      setShowPayment(true);
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('new');
      navigate({ search: newSearchParams.toString() }, { replace: true });
    }
  }, [planFromUrl, searchParams, navigate]);

  const handleSelectTier = (tier: string) => {
    setSelectedTier(tier);
    setShowSubscriptionSelection(true);
  };
  const handleSelectChildCard = () => {
    setShowSubscriptionSelection(true);
  };
  const handleProceedToPayment = () => {
    setShowSubscriptionSelection(false);
    setShowPayment(true);
  };
  const handlePaymentComplete = () => {
    setPaymentComplete(true);
    refetchMembership();
  };

  const getAvailablePaymentFrequencies = () => {
    const duration = parseInt(selectedDuration);
    const frequencies = [];
    
    // Paiement unique (toujours disponible)
    frequencies.push({
      value: 'one_time',
      label: 'Paiement unique',
      description: `Payez tout maintenant (${duration} mois)`,
      installments: 1,
      firstPayment: false
    });
    
    // Paiement mensuel (si durée > 1 mois)
    if (duration > 1) {
      frequencies.push({
        value: 'monthly',
        label: 'Paiement mensuel',
        description: '1er paiement maintenant + paiements mensuels',
        installments: duration,
        firstPayment: true
      });
    }
    
    // Paiement trimestriel (seulement si durée est exactement divisible par 3 ou >= 6)
    if (duration >= 6 && duration % 3 === 0) {
      const installments = duration / 3;
      frequencies.push({
        value: 'quarterly',
        label: 'Paiement trimestriel',
        description: '1er paiement maintenant + paiements trimestriels',
        installments: installments,
        firstPayment: true
      });
    }
    
    return frequencies;
  };

  const calculateFirstPayment = () => {
    if (selectedSubscriptionPlan === 'one_time') {
      return calculatePrice();
    }
    
    // Utiliser la structure unifiée
    const planKey = cardType === 'child' ? 'child' : selectedTier;
    const plan = allPlans[planKey as keyof typeof allPlans];
    
    if (plan) {
      // Pour tous les plans: inscription + 1 mois avec remise
      const durationDiscount = durationOptions[selectedDuration as keyof typeof durationOptions]?.discount || 0;
      const monthlyPrice = plan.monthly * (1 - durationDiscount / 100);
      return plan.registration + monthlyPrice;
    }
    
    return 0;
  };

  if (paymentComplete) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center py-16">
          <div className="text-center space-y-6">
            <CheckCircle className="h-24 w-24 text-green-500 mx-auto" />
            <h1 className="text-4xl font-bold text-gray-900">Payment Successful!</h1>
            <p className="text-lg text-gray-600">
              Welcome to Elverra Global {cardType === 'child' ? childCard.name : allPlans[selectedTier as keyof typeof allPlans]?.name} subscription!
            </p>
            <p className="text-gray-600">You will receive your digital subscription card via email within 24 hours.</p>
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
            <p className="text-gray-600">Checking subscription status...</p>
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
                Welcome back! Complete your card purchase to access all features.
              </p>
            )}
          </div>

          {!showPayment && !showSubscriptionSelection ? (
            <div className="space-y-8">
              {cardType === 'child' ? (
                <div className="max-w-md mx-auto">
                  <div 
                    className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow border-2 border-transparent hover:border-pink-300"
                    onClick={handleSelectChildCard}
                  >
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-pink-600 mb-2">{childCard.name}</h3>
                      <p className="text-gray-600 mb-4">{childCard.description}</p>
                      <div className="space-y-2">
                        <div className="text-lg">
                          <span className="text-gray-600">Frais d'inscription: </span>
                          <span className="font-bold text-pink-600">CFA {childCard.registration.toLocaleString()}</span>
                        </div>
                        <div className="text-lg">
                          <span className="text-gray-600">Frais mensuels: </span>
                          <span className="font-bold text-green-600">CFA {childCard.monthly.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="mt-4 bg-pink-100 text-pink-800 px-4 py-2 rounded-lg font-medium">
                        Cliquez pour sélectionner
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <MembershipTiers selectedTier={selectedTier} onSelectTier={handleSelectTier} />
                </>
              )}
            </div>
          ) : showSubscriptionSelection ? (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-4">Choisissez votre plan d'abonnement</h2>
                <p className="text-gray-600">Sélectionnez la durée de votre abonnement {cardType === 'child' ? childCard.name : allPlans[selectedTier as keyof typeof allPlans]?.name}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {Object.entries(durationOptions).map(([key, option]) => (
                  <div 
                    key={key}
                    className={`border rounded-lg p-6 cursor-pointer transition-all ${
                      selectedDuration === key 
                        ? 'ring-2 ring-purple-600 border-purple-600 bg-purple-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedDuration(key)}
                  >
                    <div className="text-center">
                      <h3 className="text-xl font-bold mb-2">{option.label}</h3>
                      {option.discount > 0 && (
                        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-3">
                          -{option.discount}% de réduction
                        </div>
                      )}
                      <div className="text-2xl font-bold text-purple-600 mb-2">
                        CFA {calculatePrice(key).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {cardType === 'child' 
                          ? `Inscription + ${key} mois`
                          : `Inscription + ${key} mois d'abonnement`
                        }
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-lg font-bold mb-4">Fréquence de paiement</h3>
                <p className="text-sm text-gray-600 mb-4">Comment voulez-vous payer votre abonnement de {selectedDuration} mois ?</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {getAvailablePaymentFrequencies().map((plan) => (
                    <div 
                      key={plan.value}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedSubscriptionPlan === plan.value 
                          ? 'ring-2 ring-blue-600 border-blue-600 bg-blue-50' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedSubscriptionPlan(plan.value)}
                    >
                      <div className="text-center">
                        <h4 className="font-semibold">{plan.label}</h4>
                        <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                        {plan.installments > 1 && (
                          <p className="text-xs text-blue-600 mt-1">{plan.installments} paiements</p>
                        )}
                        {plan.firstPayment && (
                          <div className="mt-2 p-2 bg-yellow-50 rounded text-xs">
                            <p className="text-yellow-800 font-medium">1er paiement: CFA {calculateFirstPayment().toLocaleString()}</p>
                            <p className="text-yellow-600">Pour recevoir votre carte immédiatement</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-center gap-4">
                
                <Button
                  onClick={handleProceedToPayment}
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {selectedSubscriptionPlan === 'one_time' 
                    ? `Procéder au Paiement - CFA ${calculatePrice().toLocaleString()}`
                    : `Payer Maintenant - CFA ${calculateFirstPayment().toLocaleString()}`
                  }
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <UnifiedPaymentWindow 
                plan={cardType === 'child' ? 'child' : selectedTier} 
                cardType={cardType}
                subscriptionPlan={selectedSubscriptionPlan}
                amount={selectedSubscriptionPlan === 'one_time' ? calculatePrice() : calculateFirstPayment()}
                onSuccess={handlePaymentComplete} 
                onClose={() => setShowPayment(false)}
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MembershipPayment;