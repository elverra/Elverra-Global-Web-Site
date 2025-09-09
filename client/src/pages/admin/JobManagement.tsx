import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, Search, Users, Briefcase, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/components/layout/ProtectedRoute";

interface Job {
  id: string;
  title: string;
  company: { name: string } | null;
  location: string;
  job_type: string;
  is_active: boolean;
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  created_at: string;
  view_count: number;
  applications?: { id: string }[];
}

interface JobStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  totalCompanies: number;
}

const JobManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<JobStats>({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    totalCompanies: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/jobs');
      if (response.ok) {
        const data = await response.json();
        setJobs(data || []);
        
        // Calculate stats
        const totalJobs = data?.length || 0;
        const activeJobs = data?.filter((job: Job) => job.is_active).length || 0;
        const totalApplications = data?.reduce((sum: number, job: Job) => sum + (job.applications?.length || 0), 0) || 0;
        const uniqueCompanies = new Set(data?.map((job: Job) => job.company?.name).filter(Boolean)).size || 0;
        
        setStats({
          totalJobs,
          activeJobs,
          totalApplications,
          totalCompanies: uniqueCompanies
        });
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleJobStatus = async (jobId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      
      if (response.ok) {
        toast.success('Job status updated successfully');
        fetchJobs();
      } else {
        throw new Error('Failed to update job status');
      }
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error('Failed to update job status');
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    
    try {
      const response = await fetch(`/api/admin/jobs/${jobId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast.success('Job deleted successfully');
        fetchJobs();
      } else {
        throw new Error('Failed to delete job');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (job.company?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatSalary = (job: Job) => {
    if (job.salary_min && job.salary_max) {
      return `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} ${job.currency || 'CFA'}`;
    } else if (job.salary_min || job.salary_max) {
      return `${(job.salary_min || job.salary_max)?.toLocaleString()} ${job.currency || 'CFA'}`;
    }
    return 'Negotiable';
  };

  if (loading) {
    return (
      <ProtectedRoute requireAdmin={true}>
        <Layout>
          <div className="container mx-auto p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-lg">Loading jobs...</div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAdmin={true}>
      <Layout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Job Management</h1>
              <p className="text-muted-foreground">Manage job postings and applications</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <Button className="flex items-center gap-2" onClick={() => navigate('/post-job')}>
                <Plus className="h-4 w-4" />
                New Job Posting
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalJobs}</div>
                <p className="text-xs text-muted-foreground">All job postings</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeJobs}</div>
                <p className="text-xs text-muted-foreground">Currently open</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Applications</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalApplications}</div>
                <p className="text-xs text-muted-foreground">Total applications</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Companies</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCompanies}</div>
                <p className="text-xs text-muted-foreground">Active employers</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <Card>
            <CardHeader>
              <CardTitle>Job Listings</CardTitle>
              <CardDescription>Manage job postings and monitor applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search jobs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Jobs Table */}
              <div className="space-y-4">
                {filteredJobs.length === 0 ? (
                  <div className="text-center py-8">
                    <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      No jobs found
                    </h3>
                    <p className="text-gray-500">
                      {searchTerm ? 'Try adjusting your search criteria' : 'No job postings available yet'}
                    </p>
                  </div>
                ) : (
                  filteredJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{job.title}</h3>
                          <Badge variant={job.is_active ? 'default' : 'secondary'}>
                            {job.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline">{job.job_type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {job.company?.name || 'Elverra Global'} • {job.location}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatSalary(job)} • {job.applications?.length || 0} applications • {job.view_count} views
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Posted: {new Date(job.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/jobs/${job.id}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/jobs/${job.id}/edit`)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive"
                          onClick={() => handleDeleteJob(job.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default JobManagement;