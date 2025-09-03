
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building, MapPin, DollarSign, Clock, Users, Plus, X } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import PremiumBanner from '@/components/layout/PremiumBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { useJobs } from '@/hooks/useJobs';
import { toast } from 'sonner';
import JobPostingPayment from '@/components/jobs/JobPostingPayment';
import MembershipGuard from '@/components/membership/MembershipGuard';
import { useMembership } from '@/hooks/useMembership';

const jobSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company name is required'),
  location: z.string().min(1, 'Location is required'),
  employment_type: z.string().min(1, 'Employment type is required'),
  experience_level: z.string().min(1, 'Experience level is required'),
  salary_min: z.number().min(0, 'Minimum salary must be positive'),
  salary_max: z.number().min(0, 'Maximum salary must be positive'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
  application_deadline: z.string().optional(),
  remote_allowed: z.boolean().default(false),
}).refine((data) => data.salary_max >= data.salary_min, {
  message: "Maximum salary must be greater than or equal to minimum salary",
  path: ["salary_max"],
});

type JobFormData = z.infer<typeof jobSchema>;

const PostJob = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getMembershipAccess } = useMembership();
  const { postJob } = useJobs();
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [jobDuration, setJobDuration] = useState(7); // Default 7 days
  const [formData, setFormData] = useState<JobFormData | null>(null);

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: '',
      company: '',
      location: '',
      employment_type: '',
      experience_level: '',
      salary_min: 0,
      salary_max: 0,
      description: '',
      requirements: '',
      benefits: '',
      application_deadline: '',
      remote_allowed: false,
    },
  });

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const onSubmit = async (data: JobFormData) => {
    const access = getMembershipAccess();
    if (!access.canPostJobs) {
      toast.error('Job posting requires Premium or Elite membership');
      navigate('/membership-payment');
      return;
    }

    // Save form data and show payment modal
    setFormData(data);
    setShowPayment(true);
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    if (!formData) return;

    setIsSubmitting(true);
    
    try {
      const { error } = await postJob({
        title: formData.title,
        company: formData.company,
        location: formData.location,
        employment_type: formData.employment_type,
        experience_level: formData.experience_level,
        salary_min: formData.salary_min,
        salary_max: formData.salary_max,
        description: formData.description,
        requirements: formData.requirements,
        benefits: formData.benefits,
        application_deadline: formData.application_deadline,
        remote_allowed: formData.remote_allowed,
        skills,
      });

      if (!error) {
        toast.success('Job posted successfully!');
        navigate('/job-dashboard/employer');
      }
    } catch (error) {
      toast.error('Failed to post job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <MembershipGuard requiredFeature="canPostJobs" requiredTier="premium">
        <Layout>
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h1>
            <p className="text-gray-600 mb-8">Please login to post a job.</p>
            <Button onClick={() => navigate('/login')}>
              Login
            </Button>
          </div>
        </Layout>
      </MembershipGuard>
    );
  }

  return (
    <MembershipGuard requiredFeature="canPostJobs" requiredTier="premium">
      <Layout>
        <PremiumBanner
          title="Post a Job"
          description="Find the perfect candidates for your open positions. Reach thousands of qualified professionals across our client network."
          variant="compact"
        />

        <div className="py-8 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="h-5 w-5 mr-2" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Senior Software Engineer" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Your company name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Bamako, Mali" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="employment_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employment Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select employment type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="full-time">Full Time</SelectItem>
                              <SelectItem value="part-time">Part Time</SelectItem>
                              <SelectItem value="contract">Contract</SelectItem>
                              <SelectItem value="freelance">Freelance</SelectItem>
                              <SelectItem value="internship">Internship</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="experience_level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experience Level *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select experience level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                              <SelectItem value="mid">Mid Level (2-5 years)</SelectItem>
                              <SelectItem value="senior">Senior Level (5+ years)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="application_deadline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Application Deadline</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="remote_allowed"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Remote Work Allowed</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Allow candidates to work remotely for this position
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Salary Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Salary Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="salary_min"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Salary (CFA) *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="e.g. 500000"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="salary_max"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Salary (CFA) *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="e.g. 800000"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Job Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Job Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the role, responsibilities, and what you're looking for..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="requirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requirements</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="List the required qualifications, experience, and skills..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="benefits"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Benefits</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="List the benefits and perks you offer..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Skills */}
                  <div>
                    <FormLabel>Required Skills</FormLabel>
                    <div className="mt-2">
                      <div className="flex gap-2 mb-3">
                        <Input
                          placeholder="Add a skill"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        />
                        <Button type="button" onClick={addSkill} variant="outline">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                            {skill}
                            <X 
                              className="h-3 w-3 cursor-pointer" 
                              onClick={() => removeSkill(skill)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Job Duration & Payment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Job Duration & Payment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <FormLabel>Job Posting Duration</FormLabel>
                      <Select value={jobDuration.toString()} onValueChange={(value) => setJobDuration(parseInt(value))}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">7 days - CFA 14,000</SelectItem>
                          <SelectItem value="14">14 days - CFA 28,000</SelectItem>
                          <SelectItem value="30">30 days - CFA 60,000</SelectItem>
                          <SelectItem value="60">60 days - CFA 120,000</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-5 w-5 text-yellow-600" />
                        <span className="font-medium text-yellow-800">Payment Information</span>
                      </div>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Job posting fee: CFA 2,000 per day</li>
                        <li>• Total cost: CFA {(jobDuration * 2000).toLocaleString()}</li>
                        <li>• Job expires after {jobDuration} days</li>
                        <li>• 72-hour grace period for renewal</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit */}
              <div className="flex justify-end gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/job-dashboard/employer')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700">
                  {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
                </Button>
              </div>
            </form>
          </Form>
          </div>
        </div>

        {/* Payment Modal */}
        {showPayment && formData && (
          <JobPostingPayment
            isOpen={showPayment}
            onClose={() => setShowPayment(false)}
            onSuccess={handlePaymentSuccess}
            jobTitle={formData.title}
            duration={jobDuration}
          />
        )}
      </Layout>
    </MembershipGuard>
  );
};

export default PostJob;
