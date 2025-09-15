import { useNavigate } from 'react-router-dom';
import { XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentCancel() {
  const navigate = useNavigate();

  const handleRetry = () => {
    navigate('/client-payment');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-700">
            Paiement annulé
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Votre paiement a été annulé ou n'a pas pu être traité.
          </p>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-red-800">
              ❌ Paiement non effectué<br />
              ❌ Aucun débit sur votre compte<br />
              ❌ Vous pouvez réessayer à tout moment
            </p>
          </div>
          <div className="space-y-2">
            <Button onClick={handleRetry} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer le paiement
            </Button>
            <Button onClick={handleGoHome} variant="outline" className="w-full">
              Retour à l'accueil
            </Button>
          </div>
          <div className="text-xs text-gray-500 mt-4">
            <p>Si vous rencontrez des problèmes, contactez notre support.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
