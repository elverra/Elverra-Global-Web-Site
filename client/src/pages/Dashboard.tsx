import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useMembership } from '@/hooks/useMembership';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import MembershipStatusWidget from '@/components/membership/MembershipStatus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// Composant de vérification d'adhésion temporaire
const MembershipCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Vérification basique de l'adhésion
  const { membership } = useMembership();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Rediriger vers la page de paiement si pas d'adhésion active
    if (membership && !membership.is_active) {
      navigate('/membership-payment');
      return;
    }
  }, [membership, navigate]);
  
  return <>{children}</>;
};

// Lazy load dashboard components for better performance
const ModernDashboard = React.lazy(() => import('@/components/dashboard/ModernDashboard'));
const DashboardStats = React.lazy(() => import('@/components/dashboard/DashboardStats'));
const MemberDigitalCard = React.lazy(() => import('@/components/dashboard/MemberDigitalCard'));
const QuickLinks = React.lazy(() => import('@/components/dashboard/QuickLinks'));
const JobCenter = React.lazy(() => import('@/components/dashboard/JobCenter'));
const ProjectsAndScholarships = React.lazy(() => import('@/components/dashboard/ProjectsAndScholarships'));
const DiscountUsage = React.lazy(() => import('@/components/dashboard/DiscountUsage'));
const PaymentHistory = React.lazy(() => import('@/components/dashboard/PaymentHistory'));

// Error boundary for dashboard components
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Une erreur est survenue lors du chargement du tableau de bord. Veuillez réessayer.
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

interface DashboardProps {}

const Dashboard: React.FC<DashboardProps> = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const { 
    membership, 
    loading: membershipLoading, 
    error: membershipError,
    getMembershipAccess 
  } = useMembership();
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [userRole, setUserRole] = useState<string>('user');
  
  // Check membership access
  const access = getMembershipAccess();
  
  // Redirect to membership payment if no active membership
  useEffect(() => {
    if (!authLoading && !membershipLoading && !access.hasActiveMembership) {
      navigate('/membership-payment', { replace: true });
    }
  }, [access.hasActiveMembership, authLoading, membershipLoading, navigate]);

  // Handle errors
  useEffect(() => {
    if (membershipError) {
      setError('Erreur lors du chargement de votre adhésion. Veuillez réessayer plus tard.');
    } else {
      setError(null);
    }
  }, [membershipError]);

  // Show loading state
  if (authLoading || profileLoading || membershipLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <Loader2 className="h-12 w-12 text-purple-600 animate-spin" />
              <p className="text-purple-800 font-medium">Chargement de votre tableau de bord...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show error state
  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>
              {error}
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="mr-2"
                >
                  Réessayer
                </Button>
                <Button onClick={() => navigate('/')}>
                  Retour à l'accueil
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  // Show dashboard content
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 py-8">
        <div className="container mx-auto px-4">
          <ErrorBoundary>
            <React.Suspense 
              fallback={
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                </div>
              }
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Bienvenue, {profile?.full_name || 'Membre'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ModernDashboard />
                    </CardContent>
                  </Card>
                  
                  <DashboardStats stats={{
                    totalApplications: 0,
                    pendingApplications: 0,
                    interviewsScheduled: 0,
                    savedJobs: 0
                  }} />
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Centre d'emploi</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <JobCenter applications={[]} />
                    </CardContent>
                  </Card>
                </div>
                
                {/* Right Column */}
                <div className="space-y-6">
                  <MembershipStatusWidget />
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Liens rapides</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <QuickLinks />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Historique des paiements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <PaymentHistory payments={[]} />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </React.Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;