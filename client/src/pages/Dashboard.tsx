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

interface MembershipCheckProps {
  children: React.ReactNode;
}

const MembershipCheck = ({ children }: MembershipCheckProps) => {
  const { user } = useAuth();
  const { membership, loading } = useMembership();

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

  // For testing purposes, allow dashboard access without membership
  // if (!membership || !membership.is_active) {
  //   return <Navigate to="/membership-payment" replace />;
  // }

  return <>{children}</>;
};

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const { membership, getMembershipAccess } = useMembership();
  const { getUserApplications } = useJobApplications();
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
      // Check if user is an agent
      try {
        const response = await fetch(`/api/agents/${user.id}`);
        
        if (response.ok) {
          const agentData = await response.json();
          if (agentData) {
            setUserRole('agent');
            return;
          }
        }
      } catch (error) {
        // User is not an agent, continue
      }

      // Check if user is admin (you can add admin role logic here)
      // For now, checking if user email contains 'admin'
      if (user.email?.includes('admin')) {
        setUserRole('admin');
        return;
      }

      setUserRole('user');
    } catch (error) {
      setUserRole('user');
    }
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
      
      // Fetch saved jobs count
      let savedJobsCount = 0;
      try {
        const response = await fetch(`/api/users/${user.id}/bookmarks`);
        if (response.ok) {
          const bookmarks = await response.json();
          savedJobsCount = bookmarks?.length || 0;
        }
      } catch (error) {
        // Use default count
      }

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