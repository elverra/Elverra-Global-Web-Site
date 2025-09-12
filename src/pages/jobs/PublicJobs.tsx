import { useState, useEffect } from 'react';
import { Job } from '@/services/mockServices';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Clock, Users, Briefcase } from "lucide-react";

export default function PublicJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, [currentPage, selectedLocation, selectedType, searchQuery]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      // Mock jobs with proper structure
      const mockJobs: Job[] = [
        {
          id: '1',
          title: 'Software Developer',
          company: 'Tech Mali',
          location: 'Bamako',
          description: 'Looking for a skilled software developer to join our team.',
          requirements: ['JavaScript', 'React', 'Node.js'],
          salary: '500,000 - 800,000 CFA',
          type: 'full-time',
          employment_type: 'full-time',
          salary_min: 500000,
          salary_max: 800000,
          currency: 'CFA',
          experience_level: 'Mid-level',
          remote_allowed: true,
          application_count: 15,
          created_at: new Date().toISOString(),
          application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ];
      
      let filteredJobs = mockJobs;
      
      // Apply filters
      if (selectedLocation !== 'all') {
        filteredJobs = filteredJobs.filter(j => 
          j.location.toLowerCase().includes(selectedLocation.toLowerCase())
        );
      }
      
      if (selectedType !== 'all') {
        filteredJobs = filteredJobs.filter(j => j.employment_type === selectedType);
      }
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredJobs = filteredJobs.filter(j => 
          j.title.toLowerCase().includes(query) ||
          j.company.toLowerCase().includes(query) ||
          j.description.toLowerCase().includes(query)
        );
      }
      
      // Apply pagination
      const startIndex = (currentPage - 1) * 20;
      const endIndex = startIndex + 20;
      const paginatedJobs = filteredJobs.slice(startIndex, endIndex);
      
      setJobs(paginatedJobs);
      setHasMore(endIndex < filteredJobs.length);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchJobs();
  };

  const formatSalary = (min?: number, max?: number, currency = 'CFA') => {
    if (!min && !max) return 'Salary not specified';
    if (min && max) {
      return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`;
    }
    if (min) return `From ${min.toLocaleString()} ${currency}`;
    if (max) return `Up to ${max.toLocaleString()} ${currency}`;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading && currentPage === 1) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Center</h1>
          <p className="text-gray-600">Find your next opportunity in Mali</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search jobs, companies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>
              
              <div className="w-full md:w-48">
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="bamako">Bamako</SelectItem>
                    <SelectItem value="sikasso">Sikasso</SelectItem>
                    <SelectItem value="mopti">Mopti</SelectItem>
                    <SelectItem value="kayes">Kayes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full md:w-48">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="full-time">Full Time</SelectItem>
                    <SelectItem value="part-time">Part Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={handleSearch}>
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Jobs List */}
        {jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          <span>{job.company}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{getTimeAgo(job.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge>{job.employment_type}</Badge>
                        <Badge>{job.experience_level}</Badge>
                        {job.remote_allowed && <Badge>Remote OK</Badge>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-primary mb-1">
                        {formatSalary(job.salary_min, job.salary_max, job.currency)}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Users className="w-3 h-3" />
                        <span>{job.application_count} applicants</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {job.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      {job.application_deadline && (
                        <span>Apply before: {new Date(job.application_deadline).toLocaleDateString()}</span>
                      )}
                    </div>
                    <Button>
                      Apply Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Jobs Found</h3>
              <p className="text-gray-500">
                {searchQuery || selectedLocation !== 'all' || selectedType !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No jobs are currently available'
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {hasMore && (
          <div className="flex justify-center mt-8">
            <Button 
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More Jobs'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
