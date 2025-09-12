
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileUp, CheckCircle, Upload, Briefcase, GraduationCap, Calendar, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from 'zod';

interface JobApplicationFormProps {
  jobId: string;
  jobTitle: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const formSchema = z.object({
  full_name: z.string().min(2, { message: "Full name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().min(6, { message: "Valid phone number is required" }),
  cover_letter: z.string().optional(),
  work_experience: z.string().optional(),
  education: z.string().optional(),
  expected_salary: z.number().optional(),
  experience_years: z.number().optional(),
  portfolio_url: z.string().url().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

const JobApplicationForm = ({ jobId, jobTitle, onClose, onSuccess }: JobApplicationFormProps) => {
  const { applyToJob } = useJobApplications();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isResumeUploaded, setIsResumeUploaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      cover_letter: "",
      work_experience: "",
      education: "",
      expected_salary: undefined,
      experience_years: undefined,
      portfolio_url: "",
    },
  });

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size should be less than 5MB');
        return;
      }
      setResumeFile(file);
      setIsResumeUploaded(true);
      toast.success('Resume uploaded successfully');
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const onSubmit = async (data: FormValues) => {
    if (!isResumeUploaded) {
      toast.error('Please upload your resume');
      return;
    }

    // Ensure required fields are present
    if (!data.full_name || !data.email || !data.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await applyToJob(jobId, {
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        cover_letter: data.cover_letter,
        work_experience: data.work_experience,
        education: data.education,
        skills,
        expected_salary: data.expected_salary,
        experience_years: data.experience_years,
        portfolio_url: data.portfolio_url || undefined,
      });
      
      setShowSuccessDialog(true);
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessDialog(false);
    onSuccess?.();
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <Card className="border-0 shadow-2xl">
            <CardHeader className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="absolute right-4 top-4 p-2"
              >
                <X className="h-4 w-4" />
              </Button>
              <CardTitle className="text-xl pr-10">Apply for: {jobTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-6">
                  <div className={`p-2 rounded-full ${isResumeUploaded ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <FileUp className={`h-5 w-5 ${isResumeUploaded ? 'text-green-600' : 'text-gray-500'}`} />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="resume" className="text-sm font-medium block mb-1">Upload your resume *</Label>
                    <div className="flex items-center w-full">
                      <Button
                        type="button"
                        variant="outline"
                        className="mr-2"
                        onClick={() => document.getElementById('resume')?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {isResumeUploaded ? 'Change File' : 'Select File'}
                      </Button>
                      <span className="text-sm text-gray-500">
                        {resumeFile ? resumeFile.name : "PDF, DOCX or TXT, max 5MB"}
                      </span>
                    </div>
                    <Input
                      id="resume"
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      className="hidden"
                      onChange={handleResumeChange}
                    />
                    {isResumeUploaded && (
                      <div className="mt-2 text-sm text-green-600 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Resume uploaded successfully
                      </div>
                    )}
                  </div>
                </div>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="full_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Your email address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="Your phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="expected_salary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expected Salary (CFA)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="e.g. 500000"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="experience_years"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Years of Experience</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="e.g. 3"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="portfolio_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Portfolio URL</FormLabel>
                            <FormControl>
                              <Input 
                                type="url" 
                                placeholder="https://your-portfolio.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Briefcase className="h-5 w-5 text-gray-500 mr-2" />
                        <Label className="font-medium text-gray-700">Work Experience</Label>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="work_experience"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe your relevant work experience" 
                                className="min-h-[100px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <GraduationCap className="h-5 w-5 text-gray-500 mr-2" />
                        <Label className="font-medium text-gray-700">Education</Label>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="education"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea 
                                placeholder="List your educational background" 
                                className="min-h-[100px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Skills */}
                    <div className="space-y-4">
                      <Label className="font-medium text-gray-700">Skills</Label>
                      <div className="flex gap-2 mb-3">
                        <Input
                          placeholder="Add a skill"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        />
                        <Button type="button" onClick={addSkill} variant="outline">
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
                          <span key={skill} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm flex items-center gap-1">
                            {skill}
                            <X 
                              className="h-3 w-3 cursor-pointer" 
                              onClick={() => removeSkill(skill)}
                            />
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <Label className="font-medium text-gray-700">Cover Letter (Optional)</Label>
                      
                      <FormField
                        control={form.control}
                        name="cover_letter"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea 
                                placeholder="Write a brief cover letter or message" 
                                className="min-h-[150px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting || !isResumeUploaded}>
                        {isSubmitting ? "Submitting..." : "Submit Application"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              Application Submitted
            </DialogTitle>
            <DialogDescription>
              Your application for <span className="font-semibold">{jobTitle}</span> has been successfully submitted.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-gray-50 p-4 rounded-md mt-4">
            <div className="flex items-center text-sm mb-3">
              <Calendar className="h-4 w-4 text-gray-500 mr-2" />
              <span>Application ID: APP-{jobId.slice(-6)}-{Date.now().toString().slice(-6)}</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              We've sent a confirmation email to your inbox. The hiring team will review your application and contact you if there's a match.
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSuccessClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default JobApplicationForm;
