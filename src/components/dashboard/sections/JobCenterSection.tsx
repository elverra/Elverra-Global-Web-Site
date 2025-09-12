import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Briefcase, 
  Building, 
  MapPin, 
  Clock 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';

const JobCenterSection = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [jobs, setJobs] = useState<any[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // Create Job form state
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [companyLogoUrl, setCompanyLogoUrl] = useState('');
  const [companyLogoFile, setCompanyLogoFile] = useState<File | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [jobCategory, setJobCategory] = useState('Technology');
  const [salary, setSalary] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  // Manage jobs state
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [myJobsLoading, setMyJobsLoading] = useState(false);
  // Applicants state
  const [applicants, setApplicants] = useState<any[]>([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editCompanyLogoUrl, setEditCompanyLogoUrl] = useState('');
  const [editCompanyLogoFile, setEditCompanyLogoFile] = useState<File | null>(null);
  const [uploadingEditLogo, setUploadingEditLogo] = useState(false);
  const [editLocation, setEditLocation] = useState('');
  const [editEmploymentType, setEditEmploymentType] = useState('Full-time');
  const [editCategory, setEditCategory] = useState('Technology');
  const [editSalary, setEditSalary] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [confirmDelOpen, setConfirmDelOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchAppliedJobs();
    fetchMyJobs();
    fetchApplicants();
    setLoading(false);
  }, [user?.id]);

  // Dashboard is only for management; jobs are displayed on the public page.
  const fetchMyJobs = async () => {
    if (!user?.id) { setMyJobs([]); return; }
    try {
      setMyJobsLoading(true);
      const { data, error } = await supabase
        .from('jobs')
        .select('id, title, company, company_logo_url, location, employment_type, category, salary, description, is_active, created_at')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setMyJobs(data || []);
    } catch (e) {
      console.error('Error fetching my jobs:', e);
      toast({ title: 'Error', description: 'Failed to load your jobs', variant: 'destructive' });
    } finally {
      setMyJobsLoading(false);
    }
  };

  const uploadCompanyLogo = async (file: File): Promise<string> => {
    const ext = (file.name.split('.').pop() || 'png').toLowerCase();
    const path = `companies/${user!.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from('company-logos')
      .upload(path, file, { upsert: false, contentType: file.type || undefined });
    if (error) throw error;
    const { data } = supabase.storage.from('company-logos').getPublicUrl(path);
    return data.publicUrl;
  };

  const fetchApplicants = async () => {
    if (!user?.id) { setApplicants([]); return; }
    try {
      setApplicantsLoading(true);
      // Load all applications for jobs owned by the current user
      const { data, error } = await supabase
        .from('job_applications')
        .select('id, status, created_at, applicant_name, applicant_email, applicant_phone, cover_letter, resume_url, user_id, job_id, jobs!inner(id, title, owner_id)')
        .eq('jobs.owner_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const mapped = (data || []).map((row: any) => ({
        id: row.id,
        job_id: row.job_id,
        job_title: row.jobs?.title || 'Job',
        status: row.status || 'pending',
        date: new Date(row.created_at).toLocaleDateString(),
        name: row.applicant_name || '',
        email: row.applicant_email || '',
        phone: row.applicant_phone || '',
        cover_letter: row.cover_letter || '',
        resume_url: row.resume_url || '',
      }));
      setApplicants(mapped);
    } catch (e) {
      console.error('Error fetching applicants:', e);
      toast({ title: 'Error', description: 'Failed to load applicants', variant: 'destructive' });
    } finally {
      setApplicantsLoading(false);
    }
  };

  const updateApplicationStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
      toast({ title: 'Updated', description: 'Application status updated' });
      await fetchApplicants();
    } catch (e: any) {
      console.error('Update application error:', e);
      toast({ title: 'Error', description: e?.message || 'Failed to update application', variant: 'destructive' });
    }
  };

  const fetchAppliedJobs = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select('id, job_id, status, created_at, jobs(title, company, location)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const mapped = (data || []).map((row: any) => ({
        id: row.id,
        title: row.jobs?.title || 'Job',
        company: row.jobs?.company || '',
        location: row.jobs?.location || '',
        status: row.status || 'pending',
        appliedDate: new Date(row.created_at).toLocaleDateString(),
        nextStep: ''
      }));
      setAppliedJobs(mapped);
    } catch (error) {
      console.error('Error fetching applied jobs:', error);
    }
  };

  const handleCreateJob = async () => {
    if (!user?.id) { toast({ title: 'Login required', description: 'Please sign in', variant: 'destructive' }); return; }
    if (!title.trim() || !company.trim() || !location.trim() || !description.trim()) {
      toast({ title: 'Validation', description: 'Title, company, location and description are required', variant: 'destructive' });
      return;
    }
    try {
      setCreating(true);
      // If user selected a logo file but did not click Upload yet, auto-upload now
      let finalLogoUrl = companyLogoUrl?.trim() || '';
      if (companyLogoFile && !finalLogoUrl) {
        try {
          const url = await uploadCompanyLogo(companyLogoFile);
          finalLogoUrl = url;
          setCompanyLogoUrl(url);
        } catch (e: any) {
          console.error('Auto upload logo failed:', e);
          toast({ title: 'Logo upload failed', description: e?.message || 'Could not upload company logo', variant: 'destructive' });
        }
      }
      const payload: any = {
        title: title.trim(),
        company: company.trim(),
        company_logo_url: finalLogoUrl || null,
        location: location.trim(),
        employment_type: employmentType,
        category: jobCategory,
        salary: salary.trim() || null,
        description: description.trim(),
        owner_id: user.id,
        is_active: true,
      };
      const { error } = await supabase.from('jobs').insert([payload]);
      if (error) throw error;
      toast({ title: 'Created', description: 'Job posted successfully' });
      setTitle(''); setCompany(''); setCompanyLogoUrl(''); setLocation(''); setEmploymentType('Full-time'); setJobCategory('Technology'); setSalary(''); setDescription('');
      await fetchMyJobs();
    } catch (e: any) {
      console.error('Create job error:', e);
      toast({ title: 'Error', description: e?.message || 'Failed to create job', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (job: any) => {
    setEditId(job.id);
    setEditTitle(job.title || '');
    setEditCompany(job.company || '');
    setEditCompanyLogoUrl(job.company_logo_url || '');
    setEditLocation(job.location || '');
    setEditEmploymentType(job.employment_type || 'Full-time');
    setEditCategory(job.category || 'Technology');
    setEditSalary(job.salary || '');
    setEditDescription(job.description || '');
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!user?.id || !editId) return;
    if (!editTitle.trim() || !editCompany.trim() || !editLocation.trim() || !editDescription.trim()) {
      toast({ title: 'Validation', description: 'Title, company, location and description are required', variant: 'destructive' });
      return;
    }
    try {
      setSavingEdit(true);
      // If a new logo file is selected, auto-upload before saving
      let finalEditLogoUrl = editCompanyLogoUrl?.trim() || '';
      if (editCompanyLogoFile) {
        try {
          const url = await uploadCompanyLogo(editCompanyLogoFile);
          finalEditLogoUrl = url;
          setEditCompanyLogoUrl(url);
        } catch (e: any) {
          console.error('Auto upload edit logo failed:', e);
          toast({ title: 'Logo upload failed', description: e?.message || 'Could not upload company logo', variant: 'destructive' });
        }
      }
      const payload: any = {
        title: editTitle.trim(),
        company: editCompany.trim(),
        company_logo_url: finalEditLogoUrl || null,
        location: editLocation.trim(),
        employment_type: editEmploymentType,
        category: editCategory,
        salary: editSalary.trim() || null,
        description: editDescription.trim(),
      };
      const { error } = await supabase
        .from('jobs')
        .update(payload)
        .eq('id', editId)
        .eq('owner_id', user.id);
      if (error) throw error;
      toast({ title: 'Saved', description: 'Job updated successfully' });
      setEditOpen(false);
      await fetchMyJobs();
    } catch (e: any) {
      console.error('Update job error:', e);
      toast({ title: 'Error', description: e?.message || 'Failed to update job', variant: 'destructive' });
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteJob = async () => {
    if (!user?.id || !deleteId) return;
    try {
      setDeleting(true);
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', deleteId)
        .eq('owner_id', user.id);
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Job removed' });
      setConfirmDelOpen(false);
      setDeleteId(null);
      await fetchMyJobs();
    } catch (e: any) {
      console.error('Delete job error:', e);
      toast({ title: 'Error', description: e?.message || 'Failed to delete job', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };



  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'interview':
        return <Badge className="bg-blue-500">Interview Scheduled</Badge>;
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Job Center</h2>
        {/* Dashboard: management only */}
      </div>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="create">Create Job</TabsTrigger>
          <TabsTrigger value="manage">My Jobs</TabsTrigger>
          <TabsTrigger value="applied">My Applications</TabsTrigger>
          <TabsTrigger value="applicants">Applicants</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create a Job</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Job Title</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Software Engineer" />
                </div>
                <div>
                  <label className="text-sm font-medium">Company</label>
                  <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company name" />
                </div>
                <div>
                  <label className="text-sm font-medium">Company Logo URL (optional)</label>
                  <Input value={companyLogoUrl} onChange={(e) => setCompanyLogoUrl(e.target.value)} placeholder="https://.../logo.png" />
                </div>
                <div>
                  <label className="text-sm font-medium">Upload Company Logo</label>
                  <div className="flex items-center gap-2">
                    <Input type="file" accept="image/*" onChange={(e) => setCompanyLogoFile((e.target.files && e.target.files[0]) || null)} />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!companyLogoFile || uploadingLogo}
                      onClick={async () => {
                        if (!companyLogoFile) return;
                        try {
                          setUploadingLogo(true);
                          const url = await uploadCompanyLogo(companyLogoFile);
                          setCompanyLogoUrl(url);
                          toast({ title: 'Logo uploaded', description: 'Company logo is set' });
                        } catch (e: any) {
                          console.error('Upload logo failed:', e);
                          toast({ title: 'Error', description: e?.message || 'Failed to upload logo', variant: 'destructive' });
                        } finally {
                          setUploadingLogo(false);
                        }
                      }}
                    >{uploadingLogo ? 'Uploading…' : 'Upload'}</Button>
                  </div>
                  {companyLogoUrl && (
                    <div className="mt-2">
                      <img src={companyLogoUrl} alt="logo preview" className="h-10 w-10 rounded object-contain bg-white border" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" />
                </div>
                <div>
                  <label className="text-sm font-medium">Employment Type</label>
                  <Select value={employmentType} onValueChange={setEmploymentType}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select value={jobCategory} onValueChange={setJobCategory}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {['Technology','Marketing','Sales','Finance','Healthcare','Education'].map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Salary (optional)</label>
                  <Input value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="e.g., 300,000 CFA" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe responsibilities and requirements" rows={5} />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleCreateJob} disabled={creating} className="bg-blue-600 hover:bg-blue-700">
                  {creating ? 'Creating...' : 'Create Job'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applicants" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Applicants ({applicants.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {applicantsLoading ? (
                <div className="py-8 text-center text-gray-600">Loading…</div>
              ) : applicants.length === 0 ? (
                <div className="py-8 text-center text-gray-600">No applications yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold">Candidate</th>
                        <th className="text-left py-3 px-4 font-semibold">Contact</th>
                        <th className="text-left py-3 px-4 font-semibold">Job</th>
                        <th className="text-left py-3 px-4 font-semibold">Submitted</th>
                        <th className="text-left py-3 px-4 font-semibold">Resume</th>
                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                        <th className="text-left py-3 px-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applicants.map((a) => (
                        <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="font-medium">{a.name || '—'}</div>
                            <div className="text-xs text-gray-500">{a.cover_letter || ''}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm">{a.email || '—'}</div>
                            <div className="text-xs text-gray-500">{a.phone || ''}</div>
                          </td>
                          <td className="py-3 px-4">{a.job_title}</td>
                          <td className="py-3 px-4">{a.date}</td>
                          <td className="py-3 px-4">
                            {a.resume_url ? (
                              <a className="text-blue-600 hover:underline" href={a.resume_url} target="_blank" rel="noreferrer">Open</a>
                            ) : '—'}
                          </td>
                          <td className="py-3 px-4 capitalize">{a.status}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" onClick={() => updateApplicationStatus(a.id, 'accepted')}>Accept</Button>
                              <Button size="sm" variant="outline" onClick={() => updateApplicationStatus(a.id, 'rejected')}>Reject</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Jobs ({myJobs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {myJobsLoading ? (
                <div className="py-8 text-center text-gray-600">Loading…</div>
              ) : myJobs.length === 0 ? (
                <div className="py-8 text-center text-gray-600">No jobs yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold">Title</th>
                        <th className="text-left py-3 px-4 font-semibold">Company</th>
                        <th className="text-left py-3 px-4 font-semibold">Location</th>
                        <th className="text-left py-3 px-4 font-semibold">Type</th>
                        <th className="text-left py-3 px-4 font-semibold">Category</th>
                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                        <th className="text-left py-3 px-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myJobs.map((job) => (
                        <tr key={job.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">{job.title}</td>
                          <td className="py-3 px-4">{job.company}</td>
                          <td className="py-3 px-4">{job.location}</td>
                          <td className="py-3 px-4">{job.employment_type}</td>
                          <td className="py-3 px-4">{job.category}</td>
                          <td className="py-3 px-4">{job.is_active ? 'active' : 'inactive'}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => openEdit(job)}>Edit</Button>
                              <Button size="sm" variant="destructive" onClick={() => { setDeleteId(job.id); setConfirmDelOpen(true); }}>Delete</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applied" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Job Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appliedJobs.map((job) => (
                  <div key={job.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{job.title}</h4>
                      {getStatusBadge(job.status)}
                    </div>
                    <p className="text-gray-600 mb-2">{job.company}</p>
                    <p className="text-sm text-gray-500 mb-2">Applied: {job.appliedDate}</p>
                    <p className="text-sm text-blue-600">{job.nextStep}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        
      </Tabs>

      {/* Edit Job Modal */}
      <Tabs>
        <TabsContent value="edit-modal">
          {/* placeholder to satisfy structure */}
        </TabsContent>
      </Tabs>
      {/* Using simple inline dialog substitute */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow max-w-xl w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Edit Job</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Job Title</label>
                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Company</label>
                <Input value={editCompany} onChange={(e) => setEditCompany(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Company Logo URL (optional)</label>
                <Input value={editCompanyLogoUrl} onChange={(e) => setEditCompanyLogoUrl(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Upload Company Logo</label>
                <div className="flex items-center gap-2">
                  <Input type="file" accept="image/*" onChange={(e) => setEditCompanyLogoFile((e.target.files && e.target.files[0]) || null)} />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!editCompanyLogoFile || uploadingEditLogo}
                    onClick={async () => {
                      if (!editCompanyLogoFile) return;
                      try {
                        setUploadingEditLogo(true);
                        const url = await uploadCompanyLogo(editCompanyLogoFile);
                        setEditCompanyLogoUrl(url);
                        toast({ title: 'Logo uploaded', description: 'Company logo is set' });
                      } catch (e: any) {
                        console.error('Upload logo failed:', e);
                        toast({ title: 'Error', description: e?.message || 'Failed to upload logo', variant: 'destructive' });
                      } finally {
                        setUploadingEditLogo(false);
                      }
                    }}
                  >{uploadingEditLogo ? 'Uploading…' : 'Upload'}</Button>
                </div>
                {editCompanyLogoUrl && (
                  <div className="mt-2">
                    <img src={editCompanyLogoUrl} alt="logo preview" className="h-10 w-10 rounded object-contain bg-white border" />
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Location</label>
                <Input value={editLocation} onChange={(e) => setEditLocation(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Employment Type</label>
                <Select value={editEmploymentType} onValueChange={setEditEmploymentType}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={editCategory} onValueChange={setEditCategory}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {['Technology','Marketing','Sales','Finance','Healthcare','Education'].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Salary (optional)</label>
                <Input value={editSalary} onChange={(e) => setEditSalary(e.target.value)} />
              </div>
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium">Description</label>
              <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={5} />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditOpen(false)} disabled={savingEdit}>Cancel</Button>
              <Button onClick={saveEdit} disabled={savingEdit} className="bg-blue-600 hover:bg-blue-700">{savingEdit ? 'Saving…' : 'Save'}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-2">Delete job</h3>
            <p className="text-gray-600 mb-6">This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmDelOpen(false)} disabled={deleting}>Cancel</Button>
              <Button variant="destructive" onClick={deleteJob} disabled={deleting}>{deleting ? 'Deleting…' : 'Delete'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobCenterSection;