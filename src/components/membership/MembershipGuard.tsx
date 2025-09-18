import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Crown, Lock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useMembership } from '@/hooks/useMembership';

interface MembershipGuardProps {
  children: ReactNode;
  requiredFeature?: 'canAccessDiscounts' | 'canAccessJobs' | 'canAccessAffiliates' | 'canAccessOSecours' | 'canAccessShop' | 'canPostJobs' | 'canPostProducts';
  requiredTier?: 'essential' | 'premium' | 'elite';
  fallbackComponent?: ReactNode;
  showUpgradePrompt?: boolean;
}

const MembershipGuard = ({ 
  children, 
  requiredFeature, 
  requiredTier,
  fallbackComponent,
  showUpgradePrompt = true
}: MembershipGuardProps) => {
  const { user } = useAuth();
  const { membership, loading, getMembershipAccess } = useMembership();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // If user is not logged in, redirect to login
  if (!user) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Login Required</h3>
          <p className="text-gray-600 mb-6">
            Please log in to access this feature.
          </p>
          <Button onClick={() => navigate('/login')} className="w-full">
            Log In
          </Button>
        </CardContent>
      </Card>
    );
  }

  const access = getMembershipAccess();

  // Check if user has active membership
  if (!access.hasActiveMembership) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <Shield className="h-16 w-16 text-orange-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Client Required</h3>
          <p className="text-gray-600 mb-6">
            This feature is only available to Elverra Global Client. 
            Please upgrade to a client plan to continue.
          </p>
          <Button 
            onClick={() => navigate('/client-payment')} 
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <Crown className="h-4 w-4 mr-2" />
            Become a Client
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Check specific feature access
  if (requiredFeature && !access[requiredFeature]) {
    const tierNames: { [key: string]: string } = {
      essential: 'Essential',
      premium: 'Premium', 
      elite: 'Elite'
    };

    const currentTier = access.membershipTier;
    const requiredTierName = requiredTier ? tierNames[requiredTier] : 'Premium';

    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <Crown className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Upgrade Required</h3>
          <div className="mb-4">
            <Badge variant="outline" className="mb-2">
              Current: {currentTier ? tierNames[currentTier] : 'Unknown'}
            </Badge>
          </div>
          <p className="text-gray-600 mb-6">
            This feature requires {requiredTierName} client or higher. 
            Please upgrade your subsciption to access this feature.
          </p>
          {showUpgradePrompt && (
            <Button 
              onClick={() => navigate('/client-payment')} 
              className="w-full bg-yellow-600 hover:bg-yellow-700"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Upgrade Client
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Check tier requirement
  if (requiredTier && access.membershipTier) {
    const tierHierarchy: { [key: string]: number } = { essential: 1, premium: 2, elite: 3 };
    const userTierLevel = tierHierarchy[access.membershipTier];
    const requiredTierLevel = tierHierarchy[requiredTier];

    if (userTierLevel < requiredTierLevel) {
      const tierNames: { [key: string]: string } = {
        essential: 'Essential',
        premium: 'Premium', 
        elite: 'Elite'
      };

      return (
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <Crown className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Higher Tier Required</h3>
            <div className="mb-4">
              <Badge variant="outline" className="mb-2">
                Current: {tierNames[access.membershipTier]}
              </Badge>
              <br />
              <Badge className="bg-yellow-500">
                Required: {tierNames[requiredTier]}
              </Badge>
            </div>
            <p className="text-gray-600 mb-6">
              This feature requires {tierNames[requiredTier]} client or higher.
            </p>
            {showUpgradePrompt && (
              <Button 
                onClick={() => navigate('/client-payment')} 
                className="w-full bg-yellow-600 hover:bg-yellow-700"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Upgrade to {tierNames[requiredTier]}
              </Button>
            )}
          </CardContent>
        </Card>
      );
    }
  }

  // If all checks pass, render children
  return <>{children}</>;
};

export default MembershipGuard;