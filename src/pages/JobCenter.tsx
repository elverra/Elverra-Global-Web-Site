import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import PremiumBanner from '@/components/layout/PremiumBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Briefcase, Users, Building, Search, MapPin, Award, Clock, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';

const JobCenter = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [locations, setLocations] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [topCompanies, setTopCompanies] = useState<any[]>([]);
  const [stats, setStats] = useState<{ active: number; companies: number; placements: number }>({ active: 0, companies: 0, placements: 0 });
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyJob, setApplyJob] = useState<any | null>(null);
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [applying, setApplying] = useState(false);
  const jobStats = [
    { label: 'Active Jobs', value: String(stats.active), icon: Briefcase, color: 'blue' },
    { label: 'Companies', value: String(stats.companies), icon: Building, color: 'green' },
    { label: 'Placements', value: String(stats.placements), icon: Award, color: 'orange' }
  ];

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('jobs')
          .select('id, title, company, company_logo_url, location, employment_type, category, description, created_at, salary, is_active')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setJobs(data || []);
        const locs = Array.from(new Set((data || []).map((j: any) => j.location).filter(Boolean)));
        const cats = Array.from(new Set((data || []).map((j: any) => j.category).filter(Boolean)));
        setLocations(locs);
        setCategories(cats);

        // Derive top companies and stats from jobs
        const companyMap: Record<string, { name: string; jobs: number; logo?: string }> = {};
        (data || []).forEach((j: any) => {
          const key = (j.company || '').trim();
          if (!key) return;
          if (!companyMap[key]) companyMap[key] = { name: key, jobs: 0, logo: j.company_logo_url || undefined };
          companyMap[key].jobs += 1;
          if (!companyMap[key].logo && j.company_logo_url) companyMap[key].logo = j.company_logo_url;
        });
        const list = Object.values(companyMap).sort((a, b) => b.jobs - a.jobs).slice(0, 8).map(c => ({ name: c.name, jobs: c.jobs, logo: c.logo || '/placeholder.svg' }));
        setTopCompanies(list);

        setStats({ active: (data || []).length, companies: Object.keys(companyMap).length, placements: 0 });

        // Fetch placements count (accepted applications)
        const { count: placementsCount, error: plcErr } = await supabase
          .from('job_applications')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'accepted');
        if (!plcErr && typeof placementsCount === 'number') {
          setStats(prev => ({ ...prev, placements: placementsCount }));
        }
      } catch (e) {
        console.error('Error loading jobs:', e);
        toast.error('Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openApply = (job: any) => {
    if (!user?.id) { toast.info('Please login to apply'); navigate('/login'); return; }
    setApplyJob(job);
    setApplicantName('');
    setApplicantEmail('');
    setApplicantPhone('');
    setCoverLetter('');
    setResumeFile(null);
    setApplyOpen(true);
  };

  const uploadResume = async (jobId: string, file: File): Promise<string> => {
    const ext = file.name.split('.').pop() || 'pdf';
    const path = `jobs/${jobId}/applications/${user!.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('jobs-pdf').upload(path, file, { upsert: false, contentType: file.type || undefined });
    if (error) throw error;
    const { data } = supabase.storage.from('jobs-pdf').getPublicUrl(path);
    return data.publicUrl;
  };

  const submitApplication = async () => {
    if (!user?.id || !applyJob) return;
    try {
      setApplying(true);
      // Basic validation
      if (!applicantName.trim() || !applicantEmail.trim() || !applicantPhone.trim()) {
        toast.error('Please fill name, email and phone');
        setApplying(false);
        return;
      }
      if (!resumeFile) {
        toast.error('Please attach your resume');
        setApplying(false);
        return;
      }
      // Prevent duplicate application
      const { data: existing, error: exErr } = await supabase
        .from('job_applications')
        .select('id')
        .eq('user_id', user.id)
        .eq('job_id', applyJob.id)
        .maybeSingle();
      if (exErr && exErr.code !== 'PGRST116') throw exErr;
      if (existing) { toast.info('You already applied to this job'); setApplyOpen(false); return; }

      let resumeUrl: string | null = null;
      try {
        resumeUrl = await uploadResume(applyJob.id, resumeFile);
      } catch (upErr: any) {
        console.error('Resume upload failed:', upErr);
        toast.error(upErr?.message || 'Resume upload failed. Please check storage bucket policies (job-resumes).');
        setApplying(false);
        return;
      }

      // Optional dynamic schema answers (if we add jobs.application_schema later)
      const answers: any = null;

      const { error } = await supabase
        .from('job_applications')
        .insert([{ 
          user_id: user.id,
          job_id: applyJob.id,
          status: 'pending',
          applicant_name: applicantName || null,
          applicant_email: applicantEmail || null,
          applicant_phone: applicantPhone || null,
          cover_letter: coverLetter || null,
          resume_url: resumeUrl,
          answers
        }]);
      if (error) throw error;
      toast.success('Application submitted');
      setApplyOpen(false);
    } catch (e: any) {
      console.error('Apply failed:', e);
      toast.error(e?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const filtered = jobs.filter((j: any) => {
    const matchesSearch = j.title.toLowerCase().includes(searchQuery.toLowerCase()) || (j.company || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLoc = locationFilter === 'all' || j.location === locationFilter;
    const matchesCat = categoryFilter === 'all' || j.category === categoryFilter;
    return matchesSearch && matchesLoc && matchesCat;
  });

  return (
      <Layout>
      <PremiumBanner
        title="Job Center"
        description="Your gateway to career opportunities across the world. Connect with top employers and advance your professional journey."
      >
        {/* Public read-only job board: no portal buttons */}
      </PremiumBanner>

      <div className="py-16 bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Search & Filters */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Search & Filter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by title or company" />
                  </div>
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {locations.map((l) => (<SelectItem key={l} value={l}>{l}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Job List */}
            {loading ? (
              <div className="text-center text-gray-600 py-10">Loading jobs…</div>
            ) : filtered.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-gray-600">No jobs found</CardContent></Card>
            ) : (
              <div className="space-y-4 mb-16">
                {filtered.map((job: any) => (
                  <Card key={job.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-xl font-semibold">{job.title}</h3>
                            <Badge variant="outline">{job.employment_type}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-gray-600 mb-3">
                            <div className="flex items-center gap-2">
                              {job.company_logo_url ? (
                                <img src={job.company_logo_url} alt={job.company} className="h-6 w-6 rounded object-contain bg-white" />
                              ) : (
                                <Building className="h-4 w-4" />
                              )}
                              <span className="font-medium">{job.company}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <p className="text-gray-700 mb-3">{job.description}</p>
                          <div className="flex items-center gap-4 mb-4">
                            <Badge variant="outline">{job.category}</Badge>
                            <div className="flex items-center gap-1 text-green-600">
                              
                              <span className="font-medium">{job.salary || 'Salary negotiable'}</span>
                              FCFA
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <Button onClick={() => openApply(job)}>Apply</Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
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

            {/* Keep marketing sections if you want below the list */}
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
                      onClick={() => navigate('/job-center')}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Search Jobs
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
                    <div className="text-sm text-gray-600">Create and manage jobs from your dashboard.</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mb-16">
              <h2 className="text-3xl font-bold mb-8 text-center">Top Hiring Companies</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {topCompanies.map((company, index) => (
                  <Card key={index} className="text-center hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <img
                        src={company.logo || '/placeholder.svg'}
                        alt={company.name}
                        className="w-16 h-16 mx-auto mb-4 object-contain bg-white rounded border"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }}
                        loading="lazy"
                      />
                      <h3 className="font-semibold mb-2">{company.name}</h3>
                      <div className="text-sm text-gray-600">{company.jobs} open positions</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

          
          </div>
          </div>
        </div>
        {/* Apply Modal */}
        <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Apply to {applyJob?.title || 'Job'}</DialogTitle>
              <DialogDescription>Provide your contact info and upload your CV/Resume.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <Input value={applicantName} onChange={(e) => setApplicantName(e.target.value)} placeholder="Your name" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" value={applicantEmail} onChange={(e) => setApplicantEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input value={applicantPhone} onChange={(e) => setApplicantPhone(e.target.value)} placeholder="+223..." />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Cover Letter (optional)</label>
                <Input value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Short message" />
              </div>
              <div>
                <label className="text-sm font-medium">Resume/CV (PDF, DOC, DOCX)</label>
                <Input type="file" accept=".pdf,.doc,.docx,.rtf,.txt" onChange={(e) => setResumeFile((e.target.files && e.target.files[0]) || null)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setApplyOpen(false)} disabled={applying}>Cancel</Button>
              <Button onClick={submitApplication} disabled={applying}>{applying ? 'Submitting…' : 'Submit Application'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Layout>
  );
};

export default JobCenter;