import { useMembership } from '@/hooks/useMembership';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MembershipStatus = () => {
  const { membership, getMembershipAccess, getMembershipTierName, isExpiringSoon } = useMembership();
  const navigate = useNavigate();
  const access = getMembershipAccess();

  if (!access.hasActiveMembership) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center text-orange-800">
            <AlertTriangle className="h-5 w-5 mr-2" />
            No Active Client Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-orange-700 mb-4">
            You don't have an active client status. Upgrade now to access all features.
          </p>
          <Button 
            onClick={() => navigate('/membership-payment')}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            <Crown className="h-4 w-4 mr-2" />
            Become a Client
          </Button>
        </CardContent>
      </Card>
    );
  }

  const tierColors = {
    essential: 'bg-gray-100 text-gray-800',
    premium: 'bg-blue-100 text-blue-800',
    elite: 'bg-yellow-100 text-yellow-800'
  };

  const tierColor = membership ? tierColors[membership.tier] : 'bg-gray-100 text-gray-800';

  return (
    <Card className={isExpiringSoon() ? 'border-yellow-200 bg-yellow-50' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Crown className="h-5 w-5 mr-2" />
            Client Status
          </span>
          <Badge className={tierColor}>
            {getMembershipTierName()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {membership && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Client ID:</span>
              <span className="font-medium">{membership.member_id || 'Pending'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Expires:</span>
              <span className="font-medium">
                {new Date(membership.expiry_date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Discount Level:</span>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                {access.discountLevel}% OFF
              </Badge>
            </div>
          </>
        )}

        {isExpiringSoon() && (
          <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Membership Expiring Soon</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Your membership expires in less than 30 days. Renew now to continue enjoying benefits.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Access Level:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center">
              <CheckCircle className={`h-4 w-4 mr-2 ${access.canAccessDiscounts ? 'text-green-500' : 'text-gray-400'}`} />
              <span className={access.canAccessDiscounts ? 'text-green-700' : 'text-gray-500'}>
                Discounts
              </span>
            </div>
            <div className="flex items-center">
              <CheckCircle className={`h-4 w-4 mr-2 ${access.canAccessJobs ? 'text-green-500' : 'text-gray-400'}`} />
              <span className={access.canAccessJobs ? 'text-green-700' : 'text-gray-500'}>
                Jobs
              </span>
            </div>
            <div className="flex items-center">
              <CheckCircle className={`h-4 w-4 mr-2 ${access.canAccessAffiliates ? 'text-green-500' : 'text-gray-400'}`} />
              <span className={access.canAccessAffiliates ? 'text-green-700' : 'text-gray-500'}>
                Affiliates
              </span>
            </div>
            <div className="flex items-center">
              <CheckCircle className={`h-4 w-4 mr-2 ${access.canAccessOSecours ? 'text-green-500' : 'text-gray-400'}`} />
              <span className={access.canAccessOSecours ? 'text-green-700' : 'text-gray-500'}>
                Ô Secours
              </span>
            </div>
          </div>
        </div>

        <Button 
          variant="outline" 
          onClick={() => navigate('/membership-payment')}
          className="w-full"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Manage Membership
        </Button>
      </CardContent>
    </Card>
  );
};

export default MembershipStatus;