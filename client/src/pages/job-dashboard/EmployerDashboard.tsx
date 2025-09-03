
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import PremiumBanner from '@/components/layout/PremiumBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Briefcase, 
  Users, 
  Eye, 
  Edit3, 
  Trash2,
  MapPin,
  Calendar,
  DollarSign,
  Building,
  Search,
  Filter
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useJobs, useJobApplications } from '@/hooks/useJobs';
import { toast } from 'sonner';

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { jobs, loading } = useJobs();
  const { getJobApplications } = useJobApplications();
  const [activeTab, setActiveTab] = useState('overview');
  const [employerJobs, setEmployerJobs] = useState<any[]>([]);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [jobStats, setJobStats] = useState({
    active: 0,
    draft: 0,
    applications: 0,
    interviews: 0
  });

  useEffect(() => {
    if (user) {
      fetchEmployerData();
    }
  }, [user, jobs]);

  const fetchEmployerData = async () => {
    if (!user) return;

    try {
      // Fetch jobs posted by this employer
      const response = await fetch(`/api/employers/${user.id}/jobs`);
      
      let jobsData = [];
      if (response.ok) {
        jobsData = await response.json();
      } else if (response.status !== 404) {
        throw new Error('Failed to fetch jobs');
      }

      const activeJobs = jobsData?.filter((job: any) => job.is_active) || [];
      const totalApplications = activeJobs.reduce((sum: number, job: any) => sum + (job.application_count || 0), 0);

      setEmployerJobs(jobsData || []);
      setJobStats({
        active: activeJobs.length,
        draft: 0, // We don't have draft status yet
        applications: totalApplications,
        interviews: 0 // We don't track this yet
      });

      // Fetch recent applications for employer's jobs
      if (activeJobs.length > 0) {
        const jobIds = activeJobs.map((job: any) => job.id);
        const appsResponse = await fetch(`/api/employers/${user.id}/applications?limit=10`);
        
        if (appsResponse.ok) {
          const applicationsData = await appsResponse.json();
          setRecentApplications(applicationsData || []);
        } else if (appsResponse.status !== 404) {
          throw new Error('Failed to fetch applications');
        }
      }
    } catch (error) {
      console.error('Error fetching employer data:', error);
      toast.error('Failed to load dashboard data');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'draft':
        return <Badge className="bg-gray-500">Draft</Badge>;
      case 'closed':
        return <Badge variant="destructive">Closed</Badge>;
      case 'pending':
        return <Badge className="bg-blue-500">New</Badge>;
      case 'reviewed':
        return <Badge className="bg-yellow-500">Reviewed</Badge>;
      case 'interview':
        return <Badge className="bg-purple-500">Interview</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatSalary = (min: number, max: number, currency: string = 'CFA') => {
    return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h1>
          <p className="text-gray-600 mb-8">Please login to access the employer dashboard.</p>
          <Button onClick={() => navigate('/login')}>
            Login
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PremiumBanner
        title="Employer Dashboard"
        description="Manage your job postings, review applications, and find the best talent for your organization."
        backgroundImage="https://images.unsplash.com/photo-1560472355-536de3962603?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
      >
        <div className="flex flex-wrap gap-4 justify-center mt-6">
          <Button 
            size="lg" 
            className="bg-white text-purple-600 hover:bg-gray-100"
            onClick={() => navigate('/post-job')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Button>
          <Button 
            asChild 
            size="lg" 
            variant="outline" 
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <button onClick={() => navigate('/job-center')}>
              <Building className="h-4 w-4 mr-2" />
              Job Center
            </button>
          </Button>
        </div>
      </PremiumBanner>

      <div className="py-16 bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="jobs">My Jobs</TabsTrigger>
                <TabsTrigger value="applications">Applications</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Briefcase className="h-8 w-8 text-green-600" />
                      </div>
                      <div className="text-3xl font-bold text-green-600 mb-1">{jobStats.active}</div>
                      <div className="text-gray-600">Active Jobs</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="bg-gray-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Edit3 className="h-8 w-8 text-gray-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-600 mb-1">{jobStats.draft}</div>
                      <div className="text-gray-600">Drafts</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Users className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="text-3xl font-bold text-blue-600 mb-1">{jobStats.applications}</div>
                      <div className="text-gray-600">Applications</div>
                      <div className="mt-2">
                        <Button size="sm" variant="outline" className="text-xs">
                          Pay 2,000 FCFA/day for premium listing
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="bg-purple-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Calendar className="h-8 w-8 text-purple-600" />
                      </div>
                      <div className="text-3xl font-bold text-purple-600 mb-1">{jobStats.interviews}</div>
                      <div className="text-gray-600">Interviews</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Applications */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentApplications.length > 0 ? (
                      <div className="space-y-4">
                        {recentApplications.map((application) => (
                          <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <h3 className="font-semibold">{application.full_name || 'Anonymous'}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                <span className="flex items-center">
                                  <Briefcase className="h-4 w-4 mr-1" />
                                  {application.jobs?.title}
                                </span>
                                {application.experience_years && (
                                  <span>{application.experience_years} years experience</span>
                                )}
                                <span className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  Applied {formatDate(application.applied_at)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(application.status)}
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No applications yet</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="jobs" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">My Job Postings</h2>
                  <Button onClick={() => navigate('/post-job')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Post New Job
                  </Button>
                </div>

                <Card>
                  <CardContent className="p-6">
                    {employerJobs.length > 0 ? (
                      <div className="space-y-4">
                        {employerJobs.map((job) => (
                          <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <h3 className="font-semibold">{job.title}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                <span className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  {job.location}
                                </span>
                                <span>{job.employment_type}</span>
                                {job.salary_min && job.salary_max && (
                                  <span className="flex items-center">
                                    <DollarSign className="h-4 w-4 mr-1" />
                                    {formatSalary(job.salary_min, job.salary_max, job.currency)}
                                  </span>
                                )}
                                <span className="flex items-center">
                                  <Users className="h-4 w-4 mr-1" />
                                  {job.application_count || 0} applications
                                </span>
                                <span className="flex items-center">
                                  <Eye className="h-4 w-4 mr-1" />
                                  {job.views || 0} views
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(job.is_active ? 'active' : 'inactive')}
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/job/${job.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit3 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">You haven't posted any jobs yet</p>
                        <Button onClick={() => navigate('/post-job')}>
                          <Plus className="h-4 w-4 mr-2" />
                          Post Your First Job
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="applications" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Job Applications</h2>
                </div>

                <Card>
                  <CardContent className="p-6">
                    {recentApplications.length > 0 ? (
                      <div className="space-y-4">
                        {recentApplications.map((application) => (
                          <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <h3 className="font-semibold">{application.full_name || 'Anonymous'}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                <span className="flex items-center">
                                  <Briefcase className="h-4 w-4 mr-1" />
                                  {application.jobs?.title}
                                </span>
                                {application.experience_years && (
                                  <span>{application.experience_years} years experience</span>
                                )}
                                <span className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  Applied {formatDate(application.applied_at)}
                                </span>
                                {application.email && (
                                  <span>{application.email}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(application.status)}
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm">Review</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No applications received yet</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmployerDashboard;
