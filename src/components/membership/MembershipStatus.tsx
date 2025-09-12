import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Simplified component without membership verification (temporary)
const MembershipStatus = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-700">
          Votre statut client sera affiché ici. Pour l'instant, aucune vérification n'est requise.
        </p>
        <Button onClick={() => navigate('/membership-payment')} variant="outline" className="w-full">
          <Crown className="h-4 w-4 mr-2" />
          Gérer mon abonnement
        </Button>
      </CardContent>
    </Card>
  );
};

export default MembershipStatus;