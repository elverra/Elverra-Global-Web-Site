import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Users, 
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabaseClient';
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
  is_active: boolean;
  is_featured: boolean;
  views: number;
  application_count: number;
  created_at: string;
}

interface JobForm {
  title: string;
  department: string;
  location: string;
  employment_type: string;
  experience_level: string;
  salary_min: string;
  salary_max: string;
  currency: string;
  description: string;
  requirements: string;
  responsibilities: string;
  benefits: string;
  skills: string;
  application_deadline: string;
  is_featured: boolean;
}

const CareerJobsManagement = () => {
  const [jobs, setJobs] = useState<ElverraJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingJob, setEditingJob] = useState<ElverraJob | null>(null);
  const [viewingApplications, setViewingApplications] = useState<ElverraJob | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [jobForm, setJobForm] = useState<JobForm>({
    title: '',
    department: '',
    location: '',
    employment_type: '',
    experience_level: '',
    salary_min: '',
    salary_max: '',
    currency: 'FCFA',
    description: '',
    requirements: '',
    responsibilities: '',
    benefits: '',
    skills: '',
    application_deadline: '',
    is_featured: false
  });

  const fetchJobs = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('elverra_jobs')
        .select('*');

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,department.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Erreur lors du chargement des emplois');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof JobForm, value: string | boolean) => {
    setJobForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setJobForm({
      title: '',
      department: '',
      location: '',
      employment_type: '',
      experience_level: '',
      salary_min: '',
      salary_max: '',
      currency: 'FCFA',
      description: '',
      requirements: '',
      responsibilities: '',
      benefits: '',
      skills: '',
      application_deadline: '',
      is_featured: false
    });
    setEditingJob(null);
  };

  const handleCreateJob = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEditJob = (job: ElverraJob) => {
    setEditingJob(job);
    setJobForm({
      title: job.title,
      department: job.department,
      location: job.location,
      employment_type: job.employment_type,
      experience_level: job.experience_level,
      salary_min: job.salary_min?.toString() || '',
      salary_max: job.salary_max?.toString() || '',
      currency: job.currency,
      description: job.description,
      requirements: job.requirements || '',
      responsibilities: job.responsibilities || '',
      benefits: job.benefits || '',
      skills: job.skills?.join(', ') || '',
      application_deadline: job.application_deadline ? new Date(job.application_deadline).toISOString().split('T')[0] : '',
      is_featured: job.is_featured
    });
    setIsDialogOpen(true);
  };

  const handleSaveJob = async () => {
    if (!jobForm.title || !jobForm.department || !jobForm.location || !jobForm.description) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setSaving(true);

      const jobData = {
        title: jobForm.title,
        department: jobForm.department,
        location: jobForm.location,
        employment_type: jobForm.employment_type,
        experience_level: jobForm.experience_level,
        salary_min: jobForm.salary_min ? parseInt(jobForm.salary_min) : null,
        salary_max: jobForm.salary_max ? parseInt(jobForm.salary_max) : null,
        currency: jobForm.currency,
        description: jobForm.description,
        requirements: jobForm.requirements || null,
        responsibilities: jobForm.responsibilities || null,
        benefits: jobForm.benefits || null,
        skills: jobForm.skills ? jobForm.skills.split(',').map(s => s.trim()).filter(s => s) : null,
        application_deadline: jobForm.application_deadline || null,
        is_featured: jobForm.is_featured,
        is_active: true
      };

      if (editingJob) {
        const { error } = await supabase
          .from('elverra_jobs')
          .update(jobData)
          .eq('id', editingJob.id);

        if (error) throw error;
        toast.success('Emploi mis à jour avec succès');
      } else {
        const { error } = await supabase
          .from('elverra_jobs')
          .insert([jobData]);

        if (error) throw error;
        toast.success('Emploi créé avec succès');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchJobs();
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (job: ElverraJob) => {
    try {
      const { error } = await supabase
        .from('elverra_jobs')
        .update({ is_active: !job.is_active })
        .eq('id', job.id);

      if (error) throw error;
      
      toast.success(`Emploi ${!job.is_active ? 'activé' : 'désactivé'} avec succès`);
      fetchJobs();
    } catch (error) {
      console.error('Error toggling job status:', error);
      toast.error('Erreur lors de la modification du statut');
    }
  };

  const handleDeleteJob = async (job: ElverraJob) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet emploi ?')) return;

    try {
      const { error } = await supabase
        .from('elverra_jobs')
        .delete()
        .eq('id', job.id);

      if (error) throw error;
      
      toast.success('Emploi supprimé avec succès');
      fetchJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const fetchApplications = async (jobId: string) => {
    try {
      const { data, error } = await supabase
        .from('elverra_job_applications')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Erreur lors du chargement des candidatures');
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('elverra_job_applications')
        .update({ status })
        .eq('id', applicationId);

      if (error) throw error;
      
      toast.success('Statut mis à jour avec succès');
      if (viewingApplications) {
        fetchApplications(viewingApplications.id);
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [searchTerm]);

  const getEmploymentTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'full-time': 'Temps plein',
      'part-time': 'Temps partiel',
      'contract': 'Contrat',
      'internship': 'Stage'
    };
    return types[type] || type;
  };

  const getExperienceLevelLabel = (level: string) => {
    const levels: { [key: string]: string } = {
      'entry': 'Débutant',
      'mid': 'Intermédiaire',
      'senior': 'Senior',
      'executive': 'Cadre supérieur'
    };
    return levels[level] || level;
  };

  const formatSalary = (min?: number, max?: number, currency: string = 'FCFA') => {
    if (!min && !max) return 'Non spécifié';
    if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`;
    if (min) return `À partir de ${min.toLocaleString()} ${currency}`;
    return `Jusqu'à ${max?.toLocaleString()} ${currency}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Emplois Elverra</h1>
          <p className="text-gray-600">Gérez les offres d'emploi de carrière chez Elverra Global</p>
        </div>
        <Button onClick={handleCreateJob} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Nouvel Emploi
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Briefcase className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Emplois</p>
                <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Vues</p>
                <p className="text-2xl font-bold text-gray-900">
                  {jobs.reduce((sum, job) => sum + job.views, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Candidatures</p>
                <p className="text-2xl font-bold text-gray-900">
                  {jobs.reduce((sum, job) => sum + job.application_count, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Emplois Mis en Avant</p>
                <p className="text-2xl font-bold text-gray-900">
                  {jobs.filter(job => job.is_featured).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher des emplois..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Emplois</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Chargement...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucun emploi trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Titre</th>
                    <th className="text-left p-2">Département</th>
                    <th className="text-left p-2">Localisation</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Salaire</th>
                    <th className="text-left p-2">Vues</th>
                    <th className="text-left p-2">Candidatures</th>
                    <th className="text-left p-2">Statut</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div>
                          <p className="font-medium">{job.title}</p>
                          {job.is_featured && (
                            <Badge className="mt-1 bg-purple-100 text-purple-800">
                              <Star className="h-3 w-3 mr-1" />
                              Mis en avant
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-2">{job.department}</td>
                      <td className="p-2">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                          {job.location}
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge variant="outline">
                          {getEmploymentTypeLabel(job.employment_type)}
                        </Badge>
                      </td>
                      <td className="p-2 text-sm">
                        {formatSalary(job.salary_min, job.salary_max, job.currency)}
                      </td>
                      <td className="p-2">
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-1 text-gray-400" />
                          {job.views}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1 text-gray-400" />
                          {job.application_count}
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge variant={job.is_active ? "default" : "secondary"}>
                          {job.is_active ? 'Actif' : 'Inactif'}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setViewingApplications(job);
                              fetchApplications(job.id);
                            }}
                            disabled={job.application_count === 0}
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditJob(job)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleActive(job)}
                          >
                            {job.is_active ? 'Désactiver' : 'Activer'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteJob(job)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

      {/* Job Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" aria-describedby="job-form-description">
          <DialogHeader>
            <DialogTitle>
              {editingJob ? 'Modifier l\'Emploi' : 'Créer un Nouvel Emploi'}
            </DialogTitle>
          </DialogHeader>
          <div id="job-form-description" className="sr-only">
            Formulaire pour créer ou modifier un emploi avec tous les détails requis
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={jobForm.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Développeur Full Stack"
                />
              </div>
              <div>
                <Label htmlFor="department">Département *</Label>
                <Input
                  id="department"
                  value={jobForm.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  placeholder="Technologie"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Localisation *</Label>
                <Input
                  id="location"
                  value={jobForm.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Bamako, Mali"
                />
              </div>
              <div>
                <Label htmlFor="employment_type">Type d'emploi *</Label>
                <Select value={jobForm.employment_type} onValueChange={(value) => handleInputChange('employment_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Temps plein</SelectItem>
                    <SelectItem value="part-time">Temps partiel</SelectItem>
                    <SelectItem value="contract">Contrat</SelectItem>
                    <SelectItem value="internship">Stage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="experience_level">Niveau d'expérience *</Label>
                <Select value={jobForm.experience_level} onValueChange={(value) => handleInputChange('experience_level', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez le niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Débutant</SelectItem>
                    <SelectItem value="mid">Intermédiaire</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="executive">Cadre supérieur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="salary_min">Salaire min (FCFA)</Label>
                <Input
                  id="salary_min"
                  type="number"
                  value={jobForm.salary_min}
                  onChange={(e) => handleInputChange('salary_min', e.target.value)}
                  placeholder="500000"
                />
              </div>
              <div>
                <Label htmlFor="salary_max">Salaire max (FCFA)</Label>
                <Input
                  id="salary_max"
                  type="number"
                  value={jobForm.salary_max}
                  onChange={(e) => handleInputChange('salary_max', e.target.value)}
                  placeholder="800000"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={jobForm.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Description détaillée du poste..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="responsibilities">Responsabilités</Label>
              <Textarea
                id="responsibilities"
                value={jobForm.responsibilities}
                onChange={(e) => handleInputChange('responsibilities', e.target.value)}
                placeholder="Liste des responsabilités..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="requirements">Exigences</Label>
              <Textarea
                id="requirements"
                value={jobForm.requirements}
                onChange={(e) => handleInputChange('requirements', e.target.value)}
                placeholder="Exigences et qualifications requises..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="benefits">Avantages</Label>
              <Textarea
                id="benefits"
                value={jobForm.benefits}
                onChange={(e) => handleInputChange('benefits', e.target.value)}
                placeholder="Avantages offerts..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="skills">Compétences (séparées par des virgules)</Label>
                <Input
                  id="skills"
                  value={jobForm.skills}
                  onChange={(e) => handleInputChange('skills', e.target.value)}
                  placeholder="JavaScript, React, Node.js"
                />
              </div>
              <div>
                <Label htmlFor="application_deadline">Date limite de candidature</Label>
                <Input
                  id="application_deadline"
                  type="date"
                  value={jobForm.application_deadline}
                  onChange={(e) => handleInputChange('application_deadline', e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_featured"
                checked={jobForm.is_featured}
                onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
              />
              <Label htmlFor="is_featured">Mettre en avant cet emploi</Label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleSaveJob}
                disabled={saving}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sauvegarde...
                  </>
                ) : (
                  editingJob ? 'Mettre à jour' : 'Créer'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Applications Dialog */}
      <Dialog open={!!viewingApplications} onOpenChange={() => setViewingApplications(null)}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto" aria-describedby="applications-description">
          <DialogHeader>
            <DialogTitle>
              Candidatures pour: {viewingApplications?.title}
            </DialogTitle>
          </DialogHeader>
          <div id="applications-description" className="sr-only">
            Liste des candidatures pour ce poste avec possibilité de modifier les statuts
          </div>
          <div className="space-y-4">
            {applications.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Aucune candidature pour ce poste</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Candidat</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Téléphone</th>
                      <th className="text-left p-2">Expérience</th>
                      <th className="text-left p-2">Statut</th>
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((application) => (
                      <tr key={application.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <div>
                            <p className="font-medium">{application.full_name}</p>
                            {application.cover_letter && (
                              <p className="text-sm text-gray-600 mt-1 truncate max-w-xs">
                                {application.cover_letter}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-2">{application.email}</td>
                        <td className="p-2">{application.phone}</td>
                        <td className="p-2">{application.years_experience} ans</td>
                        <td className="p-2">
                          <Select
                            value={application.status}
                            onValueChange={(value) => updateApplicationStatus(application.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">En attente</SelectItem>
                              <SelectItem value="reviewing">En cours</SelectItem>
                              <SelectItem value="accepted">Accepté</SelectItem>
                              <SelectItem value="rejected">Rejeté</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-2 text-sm text-gray-600">
                          {new Date(application.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="p-2">
                          <div className="flex items-center space-x-2">
                            {application.resume_url && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(application.resume_url, '_blank')}
                              >
                                CV
                              </Button>
                            )}
                            {application.portfolio_url && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(application.portfolio_url, '_blank')}
                              >
                                Portfolio
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CareerJobsManagement;
