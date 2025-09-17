import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    // Check payment status from URL parameters or API
    const checkPaymentStatus = async () => {
      try {
        const transactionId = searchParams.get('transaction_id') || searchParams.get('reference');
        const paymentStatus = searchParams.get('status');
        const paymentMethod = searchParams.get('payment_method');

        // Only show success if we have explicit success indicators
        if (paymentStatus === 'success' || paymentStatus === 'completed' || paymentStatus === 'ACCEPTED') {
          setStatus('success');
        } else if (transactionId) {
          // Verify with backend to trigger subscription activation + affiliate commission
          try {
            const response = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId: transactionId, gateway: paymentMethod })
            });
            if (response.ok) {
              const data = await response.json();
              setStatus(data.status === 'completed' || data.success ? 'success' : 'error');
            } else {
              setStatus('error');
            }
          } catch (verifyError) {
            console.error('Error verifying payment:', verifyError);
            setStatus('error');
          }
        } else {
          // No clear success indicators
          setStatus('error');
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        setStatus('error');
      }
    };

    checkPaymentStatus();
  }, [searchParams]);

  const handleContinue = () => {
    navigate('/dashboard');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Vérification du paiement
            </h2>
            <p className="text-gray-600 text-center">
              Nous vérifions le statut de votre paiement...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                <div className="h-8 w-8 text-red-600">❌</div>
              </div>
            </div>
            <CardTitle className="text-2xl text-red-700">
              Paiement échoué
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Votre paiement n'a pas pu être traité. Veuillez réessayer.
            </p>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-800">
                ❌ Paiement non confirmé<br />
                ❌ Abonnement non activé<br />
                💡 Veuillez réessayer le paiement
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => navigate('/client-payment')} className="flex-1 bg-purple-600 hover:bg-purple-700">
                Réessayer le paiement
              </Button>
              <Button onClick={() => navigate('/')} variant="outline" className="flex-1">
                Retour à l'accueil
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-700">
            Paiement réussi !
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Votre paiement a été traité avec succès. Votre abonnement a été activé.
          </p>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-800">
              ✅ Carte d'adhésion activée<br />
              ✅ Accès à tous les services<br />
              ✅ Confirmation envoyée par email
            </p>
          </div>
          <Button onClick={handleContinue} className="w-full">
            Continuer vers le tableau de bord
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
