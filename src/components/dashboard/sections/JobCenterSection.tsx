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
  Clock, 
  DollarSign, 
  Search,
  Star,
  Download,
  Eye,
  FileText,
  PlusCircle,
  Heart,
  Bell
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const JobCenterSection = () => {
  // Simplified: remove dependencies on custom hooks for now
  const user: any = { id: 'me' };
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [jobs, setJobs] = useState<any[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
    fetchAppliedJobs();
    fetchCompanies();
  }, [user]);

  const fetchJobs = async () => {
    try {
      // Mock jobs list to avoid runtime errors until API is wired
      const data = [
        {
          id: 'job-1',
          title: 'Frontend Developer',
          company: 'Elverra Global',
          location: 'Bamako',
          posted: 'Today',
          description: 'Build delightful UIs with React and TypeScript.',
          type: 'Full-time',
          category: 'Technology',
          salary: '300,000 CFA',
          requirements: ['React', 'TypeScript', 'TailwindCSS'],
          saved: false,
          applied: false,
          status: 'pending'
        }
      ];
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Error",
        description: "Failed to load jobs",
        variant: "destructive"
      });
    }
  };

  const fetchAppliedJobs = async () => {
    if (!user?.id) return;
    try {
      const applications = [
        // { id: 'job-1', title: 'Frontend Developer', company: 'Elverra Global', status: 'pending', appliedDate: '2025-09-01', nextStep: 'HR review' }
      ];
      setAppliedJobs(applications);
    } catch (error) {
      console.error('Error fetching applied jobs:', error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const data = [
        { id: 'comp-1', name: 'Elverra Global', rating: 4.7, description: 'Empowering Lives', industry: 'Tech', size: '51-200', location: 'Bamako', openJobs: 3 },
      ];
      setCompanies(data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', 'Technology', 'Marketing', 'Sales', 'Finance', 'Healthcare', 'Education'];
  const locations = ['all', 'Bamako', 'Sikasso', 'Mopti', 'Segou', 'Gao'];

  // Temporarily allow posting CTA without membership check
  const isEmployer = true;

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = selectedLocation === 'all' || job.location.includes(selectedLocation);
    const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory;
    return matchesSearch && matchesLocation && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'interview':
        return <Badge className="bg-blue-500">Interview Scheduled</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Under Review</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Not Selected</Badge>;
      case 'accepted':
        return <Badge className="bg-green-500">Offer Received</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Job Center</h2>
        {isEmployer && (
          <Button className="bg-blue-600 hover:bg-blue-700">
            <PlusCircle className="h-4 w-4 mr-2" />
            Post New Job
          </Button>
        )}
      </div>

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="browse">Browse Jobs</TabsTrigger>
          <TabsTrigger value="applied">My Applications</TabsTrigger>
          <TabsTrigger value="saved">Saved Jobs</TabsTrigger>
          <TabsTrigger value="companies">Companies</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search jobs by title or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(location => (
                        <SelectItem key={location} value={location}>
                          {location === 'all' ? 'All Locations' : location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" onClick={() => {
                    setSearchTerm('');
                    setSelectedLocation('all');
                    setSelectedCategory('all');
                  }}>
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Listings */}
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-semibold">{job.title}</h3>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Heart className={`h-4 w-4 ${job.saved ? 'fill-current text-red-500' : ''}`} />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Bell className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          <span>{job.company}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{job.posted}</span>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-3">{job.description}</p>

                      <div className="flex items-center gap-4 mb-4">
                        <Badge variant="outline">{job.type}</Badge>
                        <Badge variant="outline">{job.category}</Badge>
                        <div className="flex items-center gap-1 text-green-600">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-medium">{job.salary}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {job.requirements?.slice(0, 3).map((req: string, index: number) => (
                            <Badge key={index} variant="secondary">{req}</Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          <Button 
                            size="sm" 
                            disabled={job.applied}
                            className={job.applied ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}
                          >
                            {job.applied ? 'Applied' : 'Apply Now'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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

        <TabsContent value="saved" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Saved Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jobs.filter(job => job.saved).map((job) => (
                  <div key={job.id} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-1">{job.title}</h4>
                    <p className="text-gray-600 mb-2">{job.company} • {job.location}</p>
                    <p className="text-sm text-gray-700 mb-3">{job.description}</p>
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">{job.type}</Badge>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Remove</Button>
                        <Button size="sm">Apply Now</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="companies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Featured Companies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {companies.map((company) => (
                  <div key={company.id} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold">{company.name}</h4>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(company.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-1 text-sm text-gray-600">{company.rating}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-2">{company.description}</p>
                    <div className="space-y-1 text-sm text-gray-500 mb-4">
                      <p>Industry: {company.industry}</p>
                      <p>Size: {company.size}</p>
                      <p>Location: {company.location}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-blue-100 text-blue-800">
                        {company.openJobs} Open Positions
                      </Badge>
                      <Button variant="outline" size="sm">
                        View Company
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JobCenterSection;