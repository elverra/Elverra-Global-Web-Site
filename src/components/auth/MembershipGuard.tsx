import React from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Lock, CreditCard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMembership } from '@/hooks/useMembership';

interface MembershipGuardProps {
  children: React.ReactNode;
  requiredFeature?: 'dashboard' | 'jobs' | 'shop' | 'discounts' | 'osecours' | 'affiliates' | 'ebooks';
}

const MembershipGuard: React.FC<MembershipGuardProps> = ({ 
  children, 
  requiredFeature = 'dashboard'
}) => {
  const { user, loading: authLoading } = useAuth();
  const { membership, loading: membershipLoading, getMembershipAccess } = useMembership();

  // Show loading state
  if (authLoading || membershipLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check membership access
  const access = getMembershipAccess();
  
  // Define feature access mapping
  const featureAccessMap = {
    dashboard: access.hasActiveMembership,
    jobs: access.canAccessJobs,
    shop: access.canAccessShop,
    discounts: access.canAccessDiscounts,
    osecours: access.canAccessOSecours,
    affiliates: access.canAccessAffiliates,
    ebooks: access.hasActiveMembership
  };

  const hasAccess = featureAccessMap[requiredFeature];

  // If user doesn't have access, show membership required page
  if (!hasAccess) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 py-8">
          <div className="container mx-auto px-4 max-w-2xl">
            <Card className="shadow-xl border-0">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Lock className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Client Subsciption Required
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <p className="text-gray-600 text-lg">
                  You need an active client Subsciption to access this feature. 
                  Please purchase a client card to continue.
                </p>
                
                <div className="bg-purple-50 rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-center space-x-2">
                    <Crown className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-purple-900">Client Subsciption Benefits</span>
                  </div>
                  <ul className="text-sm text-purple-800 space-y-2">
                    <li>• Access to exclusive discounts and offers</li>
                    <li>• Job center and career opportunities</li>
                    <li>• Ô Secours emergency assistance tokens</li>
                    <li>• Marketplace and shop features</li>
                    <li>• Affiliate program participation</li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => window.location.href = '/client-payment'}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center space-x-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Purchase Client</span>
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => window.history.back()}
                    className="px-8 py-3 rounded-lg font-semibold"
                  >
                    Go Back
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  // User has access, render children
  return <>{children}</>;
};

export default MembershipGuard;
