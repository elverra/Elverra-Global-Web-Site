import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Calendar,
  Briefcase,
  Star,
  Eye,
  ArrowLeft,
  Send,
  FileText,
  User,
  Mail,
  Phone,
  Globe,
  GraduationCap,
  Award
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

const CareerJobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<ElverraJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationForm, setApplicationForm] = useState<ApplicationForm>({
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
  });

  const fetchJob = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('elverra_jobs')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setJob(data);

      // Increment view count
      await incrementJobViews(id);

      // Check if user has already applied
      if (user) {
        const { data: applicationData } = await supabase
          .from('elverra_job_applications')
          .select('id')
          .eq('job_id', id)
          .eq('user_id', user.id)
          .single();
        
        setHasApplied(!!applicationData);
      }
    } catch (error) {
      console.error('Error fetching job:', error);
      toast.error('Erreur lors du chargement de l\'offre d\'emploi');
    } finally {
      setLoading(false);
    }
  };

  const incrementJobViews = async (jobId: string) => {
    try {
      const { data: currentJob, error: fetchError } = await supabase
        .from('elverra_jobs')
        .select('views')
        .eq('id', jobId)
        .single();

      if (fetchError) return;

      const newViews = (currentJob?.views || 0) + 1;
      
      await supabase
        .from('elverra_jobs')
        .update({ views: newViews })
        .eq('id', jobId);
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const handleInputChange = (field: keyof ApplicationForm, value: string) => {
    setApplicationForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitApplication = async () => {
    if (!user || !job) {
      toast.error('Vous devez être connecté pour postuler');
      return;
    }

    if (!applicationForm.full_name || !applicationForm.email || !applicationForm.phone) {
      toast.error('Veuillez remplir tous les champs obligatoires');
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
        skills: applicationForm.skills ? applicationForm.skills.split(',').map(s => s.trim()) : null,
        portfolio_url: applicationForm.portfolio_url || null,
        linkedin_url: applicationForm.linkedin_url || null,
        expected_salary: applicationForm.expected_salary ? parseInt(applicationForm.expected_salary) : null,
        available_from: applicationForm.available_from || null,
      };

      const { error } = await supabase
        .from('elverra_job_applications')
        .insert([applicationData]);

      if (error) throw error;

      toast.success('Candidature soumise avec succès!');
      setHasApplied(true);
      
      // Reset form
      setApplicationForm({
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
      });

    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Erreur lors de la soumission de la candidature');
    } finally {
      setApplying(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [id, user]);

  const formatSalary = (min?: number, max?: number, currency: string = 'FCFA') => {
    if (!min && !max) return 'Salaire à négocier';
    if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`;
    if (min) return `À partir de ${min.toLocaleString()} ${currency}`;
    return `Jusqu'à ${max?.toLocaleString()} ${currency}`;
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de l'offre d'emploi...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">
            Offre d'emploi introuvable
          </h2>
          <p className="text-gray-500 mb-4">
            Cette offre d'emploi n'existe pas ou n'est plus disponible.
          </p>
          <Button onClick={() => navigate('/career')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux offres
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/career')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux offres
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
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
                          Mis en avant
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
                    {job.views} vues
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {job.application_count} candidatures
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Description du poste</h3>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
                  </div>
                </div>

                {/* Responsibilities */}
                {job.responsibilities && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Responsabilités</h3>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-line">{job.responsibilities}</p>
                    </div>
                  </div>
                )}

                {/* Requirements */}
                {job.requirements && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Exigences</h3>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-line">{job.requirements}</p>
                    </div>
                  </div>
                )}

                {/* Benefits */}
                {job.benefits && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Avantages</h3>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-line">{job.benefits}</p>
                    </div>
                  </div>
                )}

                {/* Skills */}
                {job.skills && job.skills.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Compétences requises</h3>
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
            {/* Job Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Informations sur le poste</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Niveau d'expérience</Label>
                  <p className="text-gray-900">{getExperienceLevelLabel(job.experience_level)}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Date de publication</Label>
                  <p className="text-gray-900">{new Date(job.created_at).toLocaleDateString('fr-FR')}</p>
                </div>

                {job.application_deadline && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Date limite de candidature</Label>
                    <p className="text-gray-900">{new Date(job.application_deadline).toLocaleDateString('fr-FR')}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Application Card */}
            <Card>
              <CardHeader>
                <CardTitle>Postuler à cette offre</CardTitle>
              </CardHeader>
              <CardContent>
                {!user ? (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      Vous devez être connecté pour postuler à cette offre.
                    </p>
                    <Button asChild className="w-full">
                      <a href="/login">Se connecter</a>
                    </Button>
                  </div>
                ) : hasApplied ? (
                  <div className="text-center">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <p className="text-green-800 font-medium">
                        ✓ Candidature déjà soumise
                      </p>
                      <p className="text-green-600 text-sm mt-1">
                        Nous examinerons votre candidature et vous contacterons bientôt.
                      </p>
                    </div>
                  </div>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        <Send className="h-4 w-4 mr-2" />
                        Postuler maintenant
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Postuler pour {job.title}</DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="full_name">Nom complet *</Label>
                            <Input
                              id="full_name"
                              value={applicationForm.full_name}
                              onChange={(e) => handleInputChange('full_name', e.target.value)}
                              placeholder="Votre nom complet"
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email *</Label>
                            <Input
                              id="email"
                              type="email"
                              value={applicationForm.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              placeholder="votre@email.com"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="phone">Téléphone *</Label>
                            <Input
                              id="phone"
                              value={applicationForm.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              placeholder="+223 XX XX XX XX"
                            />
                          </div>
                          <div>
                            <Label htmlFor="expected_salary">Salaire souhaité (FCFA)</Label>
                            <Input
                              id="expected_salary"
                              type="number"
                              value={applicationForm.expected_salary}
                              onChange={(e) => handleInputChange('expected_salary', e.target.value)}
                              placeholder="500000"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="cover_letter">Lettre de motivation</Label>
                          <Textarea
                            id="cover_letter"
                            value={applicationForm.cover_letter}
                            onChange={(e) => handleInputChange('cover_letter', e.target.value)}
                            placeholder="Expliquez pourquoi vous êtes le candidat idéal pour ce poste..."
                            rows={4}
                          />
                        </div>

                        <div>
                          <Label htmlFor="work_experience">Expérience professionnelle</Label>
                          <Textarea
                            id="work_experience"
                            value={applicationForm.work_experience}
                            onChange={(e) => handleInputChange('work_experience', e.target.value)}
                            placeholder="Décrivez votre expérience professionnelle pertinente..."
                            rows={3}
                          />
                        </div>

                        <div>
                          <Label htmlFor="education">Formation</Label>
                          <Textarea
                            id="education"
                            value={applicationForm.education}
                            onChange={(e) => handleInputChange('education', e.target.value)}
                            placeholder="Votre parcours éducatif..."
                            rows={2}
                          />
                        </div>

                        <div>
                          <Label htmlFor="skills">Compétences (séparées par des virgules)</Label>
                          <Input
                            id="skills"
                            value={applicationForm.skills}
                            onChange={(e) => handleInputChange('skills', e.target.value)}
                            placeholder="JavaScript, React, Node.js, etc."
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="portfolio_url">Portfolio (URL)</Label>
                            <Input
                              id="portfolio_url"
                              type="url"
                              value={applicationForm.portfolio_url}
                              onChange={(e) => handleInputChange('portfolio_url', e.target.value)}
                              placeholder="https://monportfolio.com"
                            />
                          </div>
                          <div>
                            <Label htmlFor="linkedin_url">LinkedIn (URL)</Label>
                            <Input
                              id="linkedin_url"
                              type="url"
                              value={applicationForm.linkedin_url}
                              onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                              placeholder="https://linkedin.com/in/monprofil"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="available_from">Disponible à partir du</Label>
                          <Input
                            id="available_from"
                            type="date"
                            value={applicationForm.available_from}
                            onChange={(e) => handleInputChange('available_from', e.target.value)}
                          />
                        </div>

                        <Button 
                          onClick={handleSubmitApplication}
                          disabled={applying}
                          className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                          {applying ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Envoi en cours...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Envoyer ma candidature
                            </>
                          )}
                        </Button>
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
