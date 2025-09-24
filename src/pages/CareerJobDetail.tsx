import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, Clock, DollarSign, Users, Briefcase, 
  Star, Eye, ArrowLeft, Send 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ElverraJob {
  id: string;
  title: string;
  department: string;
  location: string;
  employment_type: string;
  experience_level: string;
  salary_min?: number;
  salary_max?: number;
  currency: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  benefits?: string;
  skills?: string[];
  application_deadline?: string;
  is_featured: boolean;
  views: number;
  application_count: number;
  created_at: string;
}

interface ApplicationForm {
  full_name: string;
  email: string;
  phone: string;
  cover_letter: string;
  work_experience: string;
  education: string;
  skills: string;
  portfolio_url: string;
  linkedin_url: string;
  expected_salary: string;
  available_from: string;
}

const initialApplicationForm: ApplicationForm = {
  full_name: '',
  email: '',
  phone: '',
  cover_letter: '',
  work_experience: '',
  education: '',
  skills: '',
  portfolio_url: '',
  linkedin_url: '',
  expected_salary: '',
  available_from: ''
};

const CareerJobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState<ElverraJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationForm, setApplicationForm] = useState<ApplicationForm>(initialApplicationForm);

  /** 🔹 Fetch job */
  const fetchJob = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
      .from('elverra_jobs')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single<ElverraJob>();  // Move the type parameter here
      if (error) throw error;
      if (!data) return;

      setJob(data);

      // Increment views (assuming RPC exists in Supabase)
      await supabase.rpc('increment_job_views', { job_id: id });

    } catch (error: any) {
      console.error('Error loading job:', error.message);
      toast.error('Unable to load this job offer.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  /** 🔹 Check if already applied */
  const checkIfApplied = useCallback(async () => {
    if (!id || !user) return;
    try {
      const { data } = await supabase
        .from('elverra_job_applications')
        .select('id')
        .eq('job_id', id)
        .eq('user_id', user.id)
        .single();

      setHasApplied(!!data);
    } catch {
      // ignore if no application found
    }
  }, [id, user]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  useEffect(() => {
    checkIfApplied();
  }, [checkIfApplied]);

  /** 🔹 Form handling */
  const handleInputChange = (field: keyof ApplicationForm, value: string) => {
    setApplicationForm(prev => ({ ...prev, [field]: value }));
  };

  /** 🔹 Submit application */
  const handleSubmitApplication = async () => {
    if (!user || !job) {
      toast.error('You must be logged in to apply.');
      return;
    }

    if (!applicationForm.full_name || !applicationForm.email || !applicationForm.phone) {
      toast.error('Please fill in the required fields.');
      return;
    }

    try {
      setApplying(true);

      const applicationData = {
        job_id: job.id,
        user_id: user.id,
        full_name: applicationForm.full_name,
        email: applicationForm.email,
        phone: applicationForm.phone,
        cover_letter: applicationForm.cover_letter || null,
        work_experience: applicationForm.work_experience || null,
        education: applicationForm.education || null,
        skills: applicationForm.skills
          ? applicationForm.skills.split(',').map(s => s.trim())
          : null,
        portfolio_url: applicationForm.portfolio_url || null,
        linkedin_url: applicationForm.linkedin_url || null,
        expected_salary: applicationForm.expected_salary
          ? parseInt(applicationForm.expected_salary)
          : null,
        available_from: applicationForm.available_from || null,
      };

      const { error } = await supabase
        .from('elverra_job_applications')
        .insert([applicationData]);

      if (error) throw error;

      toast.success('Your application has been submitted successfully ✅');
      setHasApplied(true);
      setApplicationForm(initialApplicationForm);

    } catch (error: any) {
      console.error('Error submitting application:', error.message);
      toast.error('Unable to submit your application.');
    } finally {
      setApplying(false);
    }
  };

  /** 🔹 Helpers */
  const formatSalary = (min?: number, max?: number, currency: string = 'USD') => {
    if (!min && !max) return 'Salary to be discussed';
    if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`;
    if (min) return `From ${min.toLocaleString()} ${currency}`;
    return `Up to ${max?.toLocaleString()} ${currency}`;
  };

  const getEmploymentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'full-time': 'Full-time',
      'part-time': 'Part-time',
      'contract': 'Contract',
      'internship': 'Internship'
    };
    return types[type] || type;
  };

  const getExperienceLevelLabel = (level: string) => {
    const levels: Record<string, string> = {
      'entry': 'Entry level',
      'mid': 'Mid level',
      'senior': 'Senior',
      'executive': 'Executive'
    };
    return levels[level] || level;
  };

  /** 🔹 Loader */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job offer...</p>
        </div>
      </div>
    );
  }

  /** 🔹 Not found */
  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">
            Job not found
          </h2>
          <p className="text-gray-500 mb-4">
            This job offer does not exist or is no longer available.
          </p>
          <Button onClick={() => navigate('/career')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to jobs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/career')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to jobs
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">
                      {job.title}
                      {job.is_featured && (
                        <Badge className="ml-2 bg-purple-100 text-purple-800">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-purple-600 font-medium text-lg">{job.department}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {job.location}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {getEmploymentTypeLabel(job.employment_type)}
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {formatSalary(job.salary_min, job.salary_max, job.currency)}
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {job.views} views
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {job.application_count} applications
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Job Description</h3>
                  <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
                </div>

                {job.responsibilities && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Responsibilities</h3>
                    <p className="text-gray-700 whitespace-pre-line">{job.responsibilities}</p>
                  </div>
                )}

                {job.requirements && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                    <p className="text-gray-700 whitespace-pre-line">{job.requirements}</p>
                  </div>
                )}

                {job.benefits && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Benefits</h3>
                    <p className="text-gray-700 whitespace-pre-line">{job.benefits}</p>
                  </div>
                )}

                {job.skills && job.skills.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Skills required</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job info */}
            <Card>
              <CardHeader>
                <CardTitle>Job information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Level</Label>
                  <p className="text-gray-900">{getExperienceLevelLabel(job.experience_level)}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Posted on</Label>
                  <p className="text-gray-900">{new Date(job.created_at).toLocaleDateString('en-US')}</p>
                </div>

                {job.application_deadline && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Deadline</Label>
                    <p className="text-gray-900">{new Date(job.application_deadline).toLocaleDateString('en-US')}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Apply */}
            <Card>
              <CardHeader>
                <CardTitle>Apply for this job</CardTitle>
              </CardHeader>
              <CardContent>
                {!user ? (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      You must be logged in to apply.
                    </p>
                    <Button asChild className="w-full">
                      <a href="/login">Login</a>
                    </Button>
                  </div>
                ) : hasApplied ? (
                  <div className="text-center">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <p className="text-green-800 font-medium">
                        ✓ Application already submitted
                      </p>
                      <p className="text-green-600 text-sm mt-1">
                        We will review your application and get back to you.
                      </p>
                    </div>
                  </div>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        <Send className="h-4 w-4 mr-2" />
                        Apply now
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Apply for {job.title}</DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        {/* Name + Email */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="full_name">Full name *</Label>
                            <Input
                              id="full_name"
                              required
                              value={applicationForm.full_name}
                              onChange={(e) => handleInputChange('full_name', e.target.value)}
                              placeholder="Your full name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email *</Label>
                            <Input
                              id="email"
                              type="email"
                              required
                              value={applicationForm.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              placeholder="example@mail.com"
                            />
                          </div>
                        </div>

                        {/* Phone + Salary */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="phone">Phone *</Label>
                            <Input
                              id="phone"
                              required
                              value={applicationForm.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              placeholder="+1 234 567 890"
                            />
                          </div>
                          <div>
                            <Label htmlFor="expected_salary">Expected salary (USD)</Label>
                            <Input
                              id="expected_salary"
                              type="number"
                              value={applicationForm.expected_salary}
                              onChange={(e) => handleInputChange('expected_salary', e.target.value)}
                              placeholder="50000"
                            />
                          </div>
                        </div>

                        {/* Cover letter */}
                        <div>
                          <Label htmlFor="cover_letter">Cover letter</Label>
                          <Textarea
                            id="cover_letter"
                            value={applicationForm.cover_letter}
                            onChange={(e) => handleInputChange('cover_letter', e.target.value)}
                            placeholder="Tell us why you are the right candidate..."
                            rows={4}
                          />
                        </div>

                        {/* Experience */}
                        <div>
                          <Label htmlFor="work_experience">Work experience</Label>
                          <Textarea
                            id="work_experience"
                            value={applicationForm.work_experience}
                            onChange={(e) => handleInputChange('work_experience', e.target.value)}
                            placeholder="Describe your professional background..."
                            rows={3}
                          />
                        </div>

                        {/* Education */}
                        <div>
                          <Label htmlFor="education">Education</Label>
                          <Textarea
                            id="education"
                            value={applicationForm.education}
                            onChange={(e) => handleInputChange('education', e.target.value)}
                            placeholder="Your academic background..."
                            rows={2}
                          />
                        </div>

                        {/* Skills */}
                        <div>
                          <Label htmlFor="skills">Skills (comma separated)</Label>
                          <Input
                            id="skills"
                            value={applicationForm.skills}
                            onChange={(e) => handleInputChange('skills', e.target.value)}
                            placeholder="JavaScript, React, Node.js..."
                          />
                        </div>

                        {/* Portfolio + LinkedIn */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="portfolio_url">Portfolio (URL)</Label>
                            <Input
                              id="portfolio_url"
                              type="url"
                              value={applicationForm.portfolio_url}
                              onChange={(e) => handleInputChange('portfolio_url', e.target.value)}
                              placeholder="https://portfolio.com"
                            />
                          </div>
                          <div>
                            <Label htmlFor="linkedin_url">LinkedIn (URL)</Label>
                            <Input
                              id="linkedin_url"
                              type="url"
                              value={applicationForm.linkedin_url}
                              onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                              placeholder="https://linkedin.com/in/yourprofile"
                            />
                          </div>
                        </div>

                        {/* Availability */}
                        <div>
                          <Label htmlFor="available_from">Available from</Label>
                          <Input
                            id="available_from"
                            type="date"
                            value={applicationForm.available_from}
                            onChange={(e) => handleInputChange('available_from', e.target.value)}
                          />
                        </div>

                        {/* Submit */}
                        <div className="pt-4">
                          <Button
                            className="w-full bg-purple-600 hover:bg-purple-700"
                            onClick={handleSubmitApplication}
                            disabled={applying}
                          >
                            {applying ? 'Submitting...' : 'Submit application'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerJobDetail;
