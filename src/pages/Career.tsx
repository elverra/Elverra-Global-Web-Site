import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Calendar,
  Briefcase,
  Star,
  Eye,
  Filter,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import Layout from '@/components/layout/Layout';

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

const Career = () => {
  const [jobs, setJobs] = useState<ElverraJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState('');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('elverra_jobs')
        .select('*')
        .eq('is_active', true);

      // Apply filters
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,department.ilike.%${searchTerm}%`);
      }
      
      if (departmentFilter && departmentFilter !== 'all') {
        query = query.eq('department', departmentFilter);
      }
      
      if (locationFilter && locationFilter !== 'all') {
        query = query.ilike('location', `%${locationFilter}%`);
      }
      
      if (employmentTypeFilter && employmentTypeFilter !== 'all') {
        query = query.eq('employment_type', employmentTypeFilter);
      }

      const { data, error } = await query.order('is_featured', { ascending: false })
                                        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Erreur lors du chargement des emplois');
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

  useEffect(() => {
    fetchJobs();
  }, [searchTerm, departmentFilter, locationFilter, employmentTypeFilter]);

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

  const uniqueDepartments = [...new Set(jobs.map(job => job.department))];
  const uniqueLocations = [...new Set(jobs.map(job => job.location))];

  return (
     <Layout>
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Carrière chez Elverra Global
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Rejoignez notre équipe dynamique et contribuez à transformer l'avenir financier de l'Afrique
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-lg">
              <div className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                {jobs.length} postes disponibles
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Équipe internationale
              </div>
              <div className="flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Opportunités de croissance
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtrer les emplois
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un emploi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Département" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les départements</SelectItem>
                  {uniqueDepartments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Localisation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les localisations</SelectItem>
                  {uniqueLocations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={employmentTypeFilter} onValueChange={setEmploymentTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Type d'emploi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="full-time">Temps plein</SelectItem>
                  <SelectItem value="part-time">Temps partiel</SelectItem>
                  <SelectItem value="contract">Contrat</SelectItem>
                  <SelectItem value="internship">Stage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Jobs List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des emplois...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Aucun emploi trouvé
            </h3>
            <p className="text-gray-500">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {jobs.map((job) => (
              <Card key={job.id} className={`hover:shadow-lg transition-shadow ${job.is_featured ? 'border-purple-200 bg-purple-50' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">
                            {job.title}
                            {job.is_featured && (
                              <Badge className="ml-2 bg-purple-100 text-purple-800">
                                <Star className="h-3 w-3 mr-1" />
                                Mis en avant
                              </Badge>
                            )}
                          </h3>
                          <p className="text-purple-600 font-medium">{job.department}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
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

                      <p className="text-gray-700 mb-4 line-clamp-2">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="secondary">
                          {getExperienceLevelLabel(job.experience_level)}
                        </Badge>
                        {job.skills?.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                        {job.skills && job.skills.length > 3 && (
                          <Badge variant="outline">
                            +{job.skills.length - 3} autres
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          <Calendar className="h-4 w-4 inline mr-1" />
                          Publié le {new Date(job.created_at).toLocaleDateString('fr-FR')}
                          {job.application_deadline && (
                            <span className="ml-4">
                              <Clock className="h-4 w-4 inline mr-1" />
                              Candidatures jusqu'au {new Date(job.application_deadline).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 lg:mt-0 lg:ml-6">
                      <Button 
                        asChild
                        className="w-full lg:w-auto bg-purple-600 hover:bg-purple-700"
                        onClick={() => incrementJobViews(job.id)}
                      >
                        <Link to={`/career/${job.id}`}>
                          Voir l'offre
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
    </Layout>
  );
};

export default Career;
