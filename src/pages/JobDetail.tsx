
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Eye, 
  Bookmark,
  BookmarkCheck,
  Calendar,
  Building,
  Briefcase,
  GraduationCap,
  Award,
  Share2
} from 'lucide-react';
import JobApplicationForm from '@/components/jobs/JobApplicationForm';
import { toast } from 'sonner';
import MembershipGuard from '@/components/membership/MembershipGuard';

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getMembershipAccess } = useMembership();
  const { job, loading, error } = useJobDetails(id || '');
  // EMERGENCY FIX: Removed useJobBookmarks to stop infinite calls
  const bookmarks: string[] = [];
  const toggleBookmark = () => {
    toast.error('Bookmark functionality is temporarily disabled for maintenance');
  };
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  const isBookmarked = id ? bookmarks.includes(id) : false;

  const handleApply = () => {
    const access = getMembershipAccess();
    if (!access.hasActiveMembership) {
      toast.error('Membership required to apply for jobs');
      navigate('/membership-payment');
      return;
    }
    setShowApplicationForm(true);
  };

  const handleBookmark = () => {
    const access = getMembershipAccess();
    if (!access.hasActiveMembership) {
      toast.error('Membership required to bookmark jobs');
      navigate('/membership-payment');
      return;
    }
    toggleBookmark();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: job?.title,
          text: `Check out this job: ${job?.title} at ${job?.company}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Job link copied to clipboard!');
    }
  };

  const formatSalary = (min?: number, max?: number, currency: string = 'CFA') => {
    if (!min || !max) return 'Salary not specified';
    return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}/month`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getExperienceLabel = (level: string) => {
    switch (level) {
      case 'entry':
        return 'Entry Level (0-2 years)';
      case 'mid':
        return 'Mid Level (2-5 years)';
      case 'senior':
        return 'Senior Level (5+ years)';
      default:
        return level;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !job) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
          <p className="text-gray-600 mb-8">The job you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/jobs')}>
            Browse All Jobs
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <MembershipGuard requiredFeature="canAccessJobs">
      <Layout>
      <div className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="mb-8">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {job.featured && (
                        <Badge className="bg-yellow-500">Featured</Badge>
                      )}
                      {job.urgent && (
                        <Badge className="bg-red-500">Urgent</Badge>
                      )}
                    </div>
                    <CardTitle className="text-3xl mb-2">{job.title}</CardTitle>
                    <div className="flex items-center gap-4 text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        <span className="font-medium">{job.company}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{job.views || 0} views</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="capitalize">
                        {job.employment_type}
                      </Badge>
                      <Badge variant="outline">
                        {getExperienceLabel(job.experience_level)}
                      </Badge>
                      {job.remote_allowed && (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Remote OK
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBookmark}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="h-4 w-4" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShare}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Salary</div>
                      <div className="font-medium">{formatSalary(job.salary_min, job.salary_max, job.currency)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Applications</div>
                      <div className="font-medium">{job.application_count || 0}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <Calendar className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Posted</div>
                      <div className="font-medium">{formatDate(job.created_at)}</div>
                    </div>
                  </div>
                </div>

                {job.application_deadline && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium text-yellow-800">
                        Application deadline: {formatDate(job.application_deadline)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button 
                    size="lg" 
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={handleApply}
                  >
                    Apply Now
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={handleBookmark}
                  >
                    {isBookmarked ? (
                      <>
                        <BookmarkCheck className="h-4 w-4 mr-2" />
                        Bookmarked
                      </>
                    ) : (
                      <>
                        <Bookmark className="h-4 w-4 mr-2" />
                        Save Job
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Job Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <p className="whitespace-pre-line">{job.description}</p>
                    </div>
                  </CardContent>
                </Card>

                {job.requirements && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Requirements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none">
                        <p className="whitespace-pre-line">{job.requirements}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {job.benefits && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Benefits
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none">
                        <p className="whitespace-pre-line">{job.benefits}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Job Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Employment Type</div>
                      <div className="font-medium capitalize">{job.employment_type}</div>
                    </div>
                    <Separator />
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Experience Level</div>
                      <div className="font-medium">{getExperienceLabel(job.experience_level)}</div>
                    </div>
                    <Separator />
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Remote Work</div>
                      <div className="font-medium">{job.remote_allowed ? 'Allowed' : 'Not Allowed'}</div>
                    </div>
                    {job.application_deadline && (
                      <>
                        <Separator />
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Deadline</div>
                          <div className="font-medium">{formatDate(job.application_deadline)}</div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {job.skills && job.skills.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Required Skills</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Company Info</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="font-medium">{job.company}</div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
        </div>

        {showApplicationForm && (
          <JobApplicationForm
            jobId={job.id}
            jobTitle={job.title}
            onClose={() => setShowApplicationForm(false)}
            onSuccess={() => {
              toast.success('Application submitted successfully!');
              setShowApplicationForm(false);
            }}
          />
        )}
      </Layout>
    </MembershipGuard>
  );
};

export default JobDetail;
