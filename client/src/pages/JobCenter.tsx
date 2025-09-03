import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import PremiumBanner from '@/components/layout/PremiumBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Users, Building, TrendingUp, Search, MapPin, Award, Clock, DollarSign } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import MembershipGuard from '@/components/membership/MembershipGuard';
import { useMembership } from '@/hooks/useMembership';

const JobCenter = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getMembershipAccess } = useMembership();
  const [featuredJobs, setFeaturedJobs] = useState<any[]>([]);
  const topCompanies = [
    { name: 'Elverra Global', jobs: 12, logo: '/placeholder.svg' },
    { name: 'TechCorp across the world', jobs: 8, logo: '/placeholder.svg' },
    { name: 'Innovation Hub', jobs: 6, logo: '/placeholder.svg' },
    { name: 'Digital Solutions', jobs: 5, logo: '/placeholder.svg' }
  ];

  const jobStats = [
    { label: 'Active Jobs', value: '250+', icon: Briefcase, color: 'blue' },
    { label: 'Companies', value: '100+', icon: Building, color: 'green' },
    { label: 'Job Seekers', value: '5K+', icon: Users, color: 'purple' },
    { label: 'Placements', value: '500+', icon: Award, color: 'orange' }
  ];

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        const response = await fetch('/api/jobs');
        
        if (response.ok) {
          const data = await response.json();
          // For featured jobs, limit to 6 and prioritize featured ones
          const featuredJobs = data.filter((job: any) => job.featured).slice(0, 6);
          const regularJobs = data.filter((job: any) => !job.featured).slice(0, 6 - featuredJobs.length);
          setFeaturedJobs([...featuredJobs, ...regularJobs]);
        } else {
          throw new Error('Failed to fetch featured jobs');
        }
      } catch (err) {
        console.error('Error fetching featured jobs:', err);
        setFeaturedJobs([]);
      }
    };

    fetchFeaturedJobs();
  }, []);

  // Handle protected navigation
  const handleProtectedNavigation = (path: string) => {
    const access = getMembershipAccess();
    if (!access.hasActiveMembership) {
      toast.error('Membership required to access this feature');
      navigate('/membership-payment');
      return;
    }

    navigate(path);
  };

  // Handle job detail view
  const handleJobDetailView = (jobId: string) => {
    const access = getMembershipAccess();
    if (!access.hasActiveMembership) {
      toast.error('Membership required to view job details');
      navigate('/membership-payment');
      return;
    }

    navigate(`/jobs/${jobId}`);
  };

  return (
      <Layout>
      <PremiumBanner
        title="Job Center"
        description="Your gateway to career opportunities across the world. Connect with top employers and advance your professional journey."
      >
        <div className="flex flex-wrap gap-4 justify-center mt-6">
          <Button 
            size="lg" 
            className="bg-white text-purple-600 hover:bg-gray-100"
            onClick={() => navigate('/jobs')}
          >
            <Search className="h-4 w-4 mr-2" />
            Browse Jobs
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            onClick={() => handleProtectedNavigation('/job-dashboard/employee')}
          >
            <Users className="h-4 w-4 mr-2" />
            Job Seeker Portal
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            onClick={() => handleProtectedNavigation('/job-dashboard/employer')}
          >
            <Building className="h-4 w-4 mr-2" />
            Employer Portal
          </Button>
        </div>
      </PremiumBanner>

      <div className="py-16 bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              {jobStats.map((stat, index) => {
                const IconComponent = stat.icon;
                const colorClasses = {
                  blue: 'from-blue-500 to-blue-600',
                  green: 'from-green-500 to-green-600',
                  purple: 'from-purple-500 to-purple-600',
                  orange: 'from-orange-500 to-orange-600'
                };

                return (
                  <Card key={index} className="text-center">
                    <CardContent className="p-6">
                      <div className={`bg-gradient-to-br ${colorClasses[stat.color as keyof typeof colorClasses]} p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center`}>
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                      <div className="text-gray-600">{stat.label}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-700">
                    <Users className="h-6 w-6 mr-2" />
                    For Job Seekers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-6">
                    Find your dream job with our comprehensive job search platform. Access exclusive opportunities and career resources.
                  </p>
                  <div className="space-y-3">
                    <Button 
                      className="w-full justify-start"
                      onClick={() => navigate('/jobs')}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Search Jobs
                    </Button>
                     <Button 
                       variant="outline" 
                       className="w-full justify-start"
                       onClick={() => handleProtectedNavigation('/job-dashboard/employee')}
                     >
                       <Briefcase className="h-4 w-4 mr-2" />
                       My Dashboard
                     </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-700">
                    <Building className="h-6 w-6 mr-2" />
                    For Employers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-6">
                    Post jobs and find talented candidates from our premium network of professionals across the world.
                  </p>
                  <div className="space-y-3">
                     <Button 
                       className="w-full justify-start bg-green-600 hover:bg-green-700"
                       onClick={() => handleProtectedNavigation('/job-dashboard/employer')}
                     >
                       <Building className="h-4 w-4 mr-2" />
                       Employer Dashboard
                     </Button>
                     <Button 
                       variant="outline" 
                       className="w-full justify-start"
                       onClick={() => handleProtectedNavigation('/job-dashboard/employer')}
                     >
                       <Award className="h-4 w-4 mr-2" />
                       Post a Job
                     </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mb-16">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold">Featured Jobs</h2>
                <Button variant="outline" onClick={() => navigate('/jobs')}>
                  View All Jobs
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {featuredJobs.map((job) => (
                   <Card key={job.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleJobDetailView(job.id)}>
                     <CardHeader>
                       <div className="flex justify-between items-start">
                         <Badge variant={job.employment_type === 'Full-time' ? 'default' : 'secondary'}>
                           {job.employment_type}
                         </Badge>
                         {job.featured && (
                           <Badge className="bg-orange-500">Featured</Badge>
                         )}
                       </div>
                       <CardTitle className="text-lg">{job.title}</CardTitle>
                       <div className="text-sm text-gray-600">
                         {user && getMembershipAccess().hasActiveMembership ? job.company : 'Membership required to view company'}
                       </div>
                     </CardHeader>
                     <CardContent>
                       <div className="space-y-2 text-sm text-gray-600 mb-4">
                         <div className="flex items-center">
                           <MapPin className="h-4 w-4 mr-2" />
                           {job.location}
                         </div>
                         <div className="flex items-center">
                           <DollarSign className="h-4 w-4 mr-2" />
                           {job.salary_min && job.salary_max 
                             ? `${job.salary_min}-${job.salary_max} ${job.currency || 'CFA'}`
                             : 'Salary Negotiable'
                           }
                         </div>
                         <div className="flex items-center">
                           <Clock className="h-4 w-4 mr-2" />
                           Posted {new Date(job.created_at).toLocaleDateString()}
                         </div>
                       </div>
                       <p className="text-gray-700 text-sm mb-4 line-clamp-2">{job.description}</p>
                       <Button className="w-full" onClick={(e) => {
                         e.stopPropagation();
                         handleJobDetailView(job.id);
                       }}>
                         View Details
                       </Button>
                     </CardContent>
                   </Card>
                 ))}
              </div>
            </div>

            <div className="mb-16">
              <h2 className="text-3xl font-bold mb-8 text-center">Top Hiring Companies</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {topCompanies.map((company, index) => (
                  <Card key={index} className="text-center hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <img 
                        src={company.logo} 
                        alt={company.name}
                        className="w-16 h-16 mx-auto mb-4 object-contain"
                      />
                      <h3 className="font-semibold mb-2">{company.name}</h3>
                      <div className="text-sm text-gray-600">{company.jobs} open positions</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="text-center">
              <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <CardContent className="p-12">
                  <TrendingUp className="h-16 w-16 mx-auto mb-6 opacity-90" />
                  <h2 className="text-3xl font-bold mb-4">Ready to Take the Next Step?</h2>
                  <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                    Join millions of professionals who have found their dream jobs through Elverra Global's Job Center.
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center">
                    <Button 
                      size="lg" 
                      className="bg-white text-purple-600 hover:bg-gray-100"
                      onClick={() => navigate('/register')}
                    >
                      Create Account
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="border-white text-white hover:bg-white/10"
                      onClick={() => navigate('/jobs')}
                    >
                      Browse Jobs Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          </div>
        </div>
      </Layout>
  );
};

export default JobCenter;