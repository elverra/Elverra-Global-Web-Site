import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Upload, ArrowLeft, Send } from 'lucide-react';

const projectSubmissionSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  category: z.string().min(1, 'Please select a category'),
  targetAmount: z.number().min(1000, 'Minimum funding goal is CFA 1,000'),
  location: z.string().min(3, 'Location is required'),
  duration: z.number().min(1, 'Campaign duration must be at least 1 month').max(12, 'Maximum duration is 12 months'),
  contactEmail: z.string().email('Please enter a valid email'),
  contactPhone: z.string().min(8, 'Please enter a valid phone number'),
  beneficiaries: z.string().min(10, 'Please describe who will benefit from this project'),
  expectedImpact: z.string().min(20, 'Please describe the expected impact'),
  projectPlan: z.string().min(50, 'Please provide a detailed project plan')
});

type ProjectSubmissionForm = z.infer<typeof projectSubmissionSchema>;

const ProjectSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const form = useForm<ProjectSubmissionForm>({
    resolver: zodResolver(projectSubmissionSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      targetAmount: 0,
      location: '',
      duration: 3,
      contactEmail: user?.email || '',
      contactPhone: '',
      beneficiaries: '',
      expectedImpact: '',
      projectPlan: ''
    }
  });

  const onSubmit = async (values: ProjectSubmissionForm) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a project",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      const projectData = {
        ...values,
        submitterId: user.id,
        submitterName: user.username || user.email,
        status: 'pending_review',
        createdAt: new Date().toISOString(),
        currentAmount: 0,
        supporters: 0
      };

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit project');
      }

      toast({
        title: "Project Submitted Successfully!",
        description: "Your project has been submitted for review. We'll notify you once it's approved.",
      });

      // Reset form and navigate back
      form.reset();
      navigate('/project-requests');

    } catch (error) {
      console.error('Error submitting project:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    'Education',
    'Healthcare',
    'Technology',
    'Environment',
    'Community Development',
    'Arts & Culture',
    'Sports & Recreation',
    'Business & Entrepreneurship',
    'Infrastructure',
    'Agriculture'
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Button 
                variant="outline" 
                onClick={() => navigate('/project-requests')}
                className="mb-4"
                data-testid="button-back"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
              </Button>
              <h1 className="text-3xl font-bold text-foreground mb-2">Submit Your Project</h1>
              <p className="text-muted-foreground">
                Share your vision and get community funding for your project
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>
                  Fill out the form below to submit your project for community funding consideration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Title *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter project title" {...field} data-testid="input-project-title" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-category">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Description *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your project in detail..."
                              className="min-h-[120px]"
                              {...field}
                              data-testid="textarea-description"
                            />
                          </FormControl>
                          <FormDescription>
                            Minimum 50 characters. Be clear and compelling about what you're trying to achieve.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Funding & Location */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={form.control}
                        name="targetAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Funding Goal (CFA) *</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="50000"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                data-testid="input-target-amount"
                              />
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
                              <Input placeholder="City, Country" {...field} data-testid="input-location" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Campaign Duration (months) *</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1" 
                                max="12"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 3)}
                                data-testid="input-duration"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="contactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Email *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="your@email.com" {...field} data-testid="input-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="contactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Phone *</FormLabel>
                            <FormControl>
                              <Input placeholder="+223 XX XX XX XX" {...field} data-testid="input-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Project Details */}
                    <FormField
                      control={form.control}
                      name="beneficiaries"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Who will benefit from this project? *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the target beneficiaries..."
                              className="min-h-[80px]"
                              {...field}
                              data-testid="textarea-beneficiaries"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expectedImpact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expected Impact *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="What positive change will this project create?"
                              className="min-h-[80px]"
                              {...field}
                              data-testid="textarea-impact"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="projectPlan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Implementation Plan *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe how you will implement this project step by step..."
                              className="min-h-[120px]"
                              {...field}
                              data-testid="textarea-plan"
                            />
                          </FormControl>
                          <FormDescription>
                            Include timeline, resources needed, and key milestones.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Submit Button */}
                    <div className="pt-6">
                      <Button 
                        type="submit" 
                        className="w-full md:w-auto" 
                        disabled={isSubmitting}
                        data-testid="button-submit-form"
                      >
                        {isSubmitting ? (
                          <>
                            <Upload className="h-4 w-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Submit Project for Review
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProjectSubmission;