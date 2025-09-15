import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import MembershipStatusWidget from '@/components/membership/MembershipStatus';
import MembershipGuard from '@/components/auth/MembershipGuard';

// Lazy load dashboard components for better performance
const ModernDashboard = React.lazy(() => import('@/components/dashboard/ModernDashboard'));
const DashboardStats = React.lazy(() => import('@/components/dashboard/DashboardStats'));
const QuickLinks = React.lazy(() => import('@/components/dashboard/QuickLinks'));
const JobCenter = React.lazy(() => import('@/components/dashboard/JobCenter'));
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
  
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Show loading state
  if (authLoading || profileLoading) {
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
    );
  }

  // Show dashboard content with membership guard
  return (
    <MembershipGuard requiredFeature="dashboard">
      <ErrorBoundary>
        <React.Suspense
          fallback={
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          }
        >
          {/* ModernDashboard gère déjà sa propre mise en page (sidebar + contenu) */}
          <ModernDashboard />
        </React.Suspense>
      </ErrorBoundary>
    </MembershipGuard>
  );
};

export default Dashboard;