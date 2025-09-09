import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import ModernDashboard from '@/components/dashboard/ModernDashboard';
import DashboardStats from '@/components/dashboard/DashboardStats';
import MembershipStatus from '@/components/dashboard/MembershipStatus';
import MemberDigitalCard from '@/components/dashboard/MemberDigitalCard';
import QuickLinks from '@/components/dashboard/QuickLinks';
import JobCenter from '@/components/dashboard/JobCenter';
import ProjectsAndScholarships from '@/components/dashboard/ProjectsAndScholarships';
import CompetitionParticipation from '@/components/dashboard/CompetitionParticipation';
import DiscountUsage from '@/components/dashboard/DiscountUsage';
import PaymentHistory from '@/components/dashboard/PaymentHistory';
import CurrencyConverterWidget from '@/components/dashboard/CurrencyConverterWidget';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Star, TrendingUp, Briefcase, Crown } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useJobApplications } from '@/hooks/useJobs';
import { useMembership } from '@/hooks/useMembership';
import { useNavigate } from 'react-router-dom';
import MembershipStatusWidget from '@/components/membership/MembershipStatus';

// Global cache for agent data to prevent repeated API calls and 404 errors
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const agentCache = new Map<string, { data: any | null; timestamp: number }>();
const agentPromises = new Map<string, Promise<any | null>>();

interface MembershipCheckProps {
  children: React.ReactNode;
}

const MembershipCheck = ({ children }: MembershipCheckProps) => {
  const { user } = useAuth();
  const { membership, loading, getMembershipAccess } = useMembership();

  if (loading) {
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

  // Check if user has active membership
  const access = getMembershipAccess();
  if (!access.hasActiveMembership) {
    return <Navigate to="/membership-payment" replace />;
  }

  return <>{children}</>;
};

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const { membership, getMembershipAccess } = useMembership();
  const { getUserApplications } = useJobApplications();
  // EMERGENCY FIX: Removed useJobBookmarks to stop infinite calls
  const bookmarks: string[] = [];
  const [userRole, setUserRole] = useState<'user' | 'agent' | 'admin'>('user');
  const navigate = useNavigate();
  
  const [applications, setApplications] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    interviewsScheduled: 0,
    savedJobs: 0
  });

  useEffect(() => {
    if (user) {
      fetchUserData();
      determineUserRole();
    }
  }, [user]);

  const determineUserRole = async () => {
    if (!user) return;

    try {
      // Check cache first
      const cached = agentCache.get(user.id);
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        if (cached.data) {
          setUserRole('agent');
        }
        return;
      }

      // Check if there's already a promise in flight
      let promise = agentPromises.get(user.id);
      if (!promise) {
        promise = (async () => {
          const response = await fetch(`/api/agents/${user.id}`);
          
          if (response.ok) {
            const agentData = await response.json();
            return agentData;
          } else if (response.status === 404) {
            // User is not an agent, cache null to prevent repeated 404s
            return null;
          } else {
            throw new Error('Failed to fetch agent data');
          }
        })();
        agentPromises.set(user.id, promise);
      }

      const agentData = await promise;
      
      // Cache the result (including null for non-agents)
      agentCache.set(user.id, { data: agentData, timestamp: Date.now() });
      agentPromises.delete(user.id);
      
      if (agentData) {
        setUserRole('agent');
        return;
      }
    } catch (error) {
      console.error('Error checking agent status:', error);
      agentPromises.delete(user.id);
      // Cache null to prevent repeated failed requests
      agentCache.set(user.id, { data: null, timestamp: Date.now() });
    }

    // Check if user is admin (you can add admin role logic here)
    // For now, checking if user email contains 'admin'
    if (user.email?.includes('admin')) {
      setUserRole('admin');
      return;
    }

    setUserRole('user');
  };

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Fetch applications
      const applicationsData = await getUserApplications();
      setApplications(applicationsData.slice(0, 5)); // Show only recent 5

      // Calculate stats
      const pending = applicationsData.filter((app: any) => app.status === 'pending').length;
      const interviews = applicationsData.filter((app: any) => app.status === 'interview').length;
      
      // Get saved jobs count from bookmarks hook
      const savedJobsCount = bookmarks?.length || 0;

      setStats({
        totalApplications: applicationsData.length,
        pendingApplications: pending,
        interviewsScheduled: interviews,
        savedJobs: savedJobsCount
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Mock data for components that need props
  const mockCompetitions = [
    { id: '1', name: 'Tech Innovation Challenge', date: '2024-01-15', status: 'Participated' },
    { id: '2', name: 'Business Plan Competition', date: '2024-02-20', status: 'Voted' }
  ];

  const mockDiscountUsage = [
    { id: '1', date: '2024-01-10', merchant: 'Tech Store', discount: '10%', saved: 'CFA 2,500' },
    { id: '2', date: '2024-01-05', merchant: 'Restaurant Mali', discount: '15%', saved: 'CFA 1,800' }
  ];

  const mockPayments = [
    { id: 'PAY001', date: '2024-01-01', description: 'Monthly Membership', amount: 'CFA 5,000', status: 'Paid' as const },
    { id: 'PAY002', date: '2023-12-01', description: 'Monthly Membership', amount: 'CFA 5,000', status: 'Paid' as const }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'interview':
        return <Badge className="bg-blue-500">Interview</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'accepted':
        return <Badge className="bg-green-500">Accepted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? 's' : ''} ago`;
  };

  if (authLoading || profileLoading) {
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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to appropriate dashboard based on role
  if (userRole === 'agent') {
    return <Navigate to="/affiliate-dashboard" replace />;
  }

  if (userRole === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <MembershipCheck>
      <ModernDashboard />
    </MembershipCheck>
  );
};

export default Dashboard;