import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import PremiumBanner from "@/components/layout/PremiumBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Clock,
  DollarSign,
  Search,
  Briefcase,
  Building,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import MembershipGuard from "@/components/membership/MembershipGuard";
import { useMembership } from "@/hooks/useMembership";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  employment_type: string;
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  description: string;
  skills?: string[];
  created_at: string;
  featured?: boolean;
  urgent?: boolean;
}

const Jobs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { user } = useAuth();
  const { getMembershipAccess } = useMembership();

  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/jobs");

      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const data = await response.json();
      setJobs(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch jobs");
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    let filtered = jobs || [];

    if (searchTerm) {
      filtered = filtered.filter(
        (job) =>
          job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (locationFilter) {
      filtered = filtered.filter((job) =>
        job.location?.toLowerCase().includes(locationFilter.toLowerCase()),
      );
    }

    if (typeFilter && typeFilter !== "all") {
      filtered = filtered.filter((job) => job.employment_type === typeFilter);
    }

    setFilteredJobs(filtered);
  }, [searchTerm, locationFilter, typeFilter, jobs]);

  const handleJobClick = (job: Job) => {
    navigate(`/jobs/${job.id}`);
  };

  const handleApplyClick = (e: React.MouseEvent, job: Job) => {
    e.stopPropagation();

    if (!user) {
      toast.error("Please log in to apply for jobs");
      navigate("/login");
      return;
    }

    const access = getMembershipAccess();
    if (!access.hasActiveMembership) {
      toast.error("Membership required to apply for jobs");
      navigate("/membership-payment");
      return;
    }

    // Check application limits for non-elite members
    if (access.membershipTier !== "elite" && access.maxJobApplications > 0) {
      // In a real app, you'd check current application count
      // For now, we'll allow the application to proceed
    }

    // Navigate to job detail page for application
    navigate(`/jobs/${job.id}`);
  };

  if (loading) {
    return (
      <Layout>
        <PremiumBanner
          title="Find Your Dream Job"
          description="Discover exclusive job opportunities with Elverra Global's premium job portal"
          backgroundImage="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
        />
        <div className="py-16 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading jobs...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <PremiumBanner
          title="Find Your Dream Job"
          description="Discover exclusive job opportunities with Elverra Global's premium job portal"
          backgroundImage="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
        />
        <div className="py-16 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <p className="text-red-600 mb-4">Error loading jobs: {error}</p>
              <Button onClick={() => fetchJobs()}>Retry</Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PremiumBanner
        title="Find Your Dream Job"
        description="Discover exclusive job opportunities with Elverra Global's premium job portal"
        backgroundImage="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
      />

      <div className="py-16 bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Search and Filters */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search jobs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Location..."
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Job Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Remote">Remote</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="w-full">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Job Results */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">
                {filteredJobs.length} Job{filteredJobs.length !== 1 ? "s" : ""}{" "}
                Found
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {filteredJobs.map((job) => (
                <Card
                  key={job.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleJobClick(job)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant={
                              job.employment_type === "Full-time"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {job.employment_type}
                          </Badge>
                          {job.featured && (
                            <Badge className="bg-orange-500">Featured</Badge>
                          )}
                          {job.urgent && (
                            <Badge className="bg-red-500">Urgent</Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl mb-2">
                          {job.title}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-1" />
                            {user
                              ? job.company || "Elverra Global"
                              : "Login to view company"}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {job.location}
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {job.salary_min && job.salary_max
                              ? `${job.salary_min}-${job.salary_max} ${job.currency || "CFA"}`
                              : `${job.salary_min || job.salary_max || "Negotiable"}`}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            Posted{" "}
                            {new Date(job.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4 line-clamp-2">
                      {job.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="flex flex-wrap gap-2">
                        {job.skills?.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      <Button onClick={(e) => handleApplyClick(e, job)}>
                        <Briefcase className="h-4 w-4 mr-2" />
                        Apply Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredJobs.length === 0 && (
              <div className="text-center py-12">
                <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No jobs found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search criteria
                </p>
              </div>
            )}

            {/* Job Centre Features */}
            <div className="mt-16">
              <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <CardContent className="p-12 text-center">
                  <h2 className="text-3xl font-bold mb-4">
                    Find Your Dream Job Today!
                  </h2>
                  <p className="text-xl mb-6 opacity-90">
                    Your Career, Our Priority!
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div className="text-center">
                      <Briefcase className="h-12 w-12 mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">
                        Where Talent Meets Opportunity!
                      </h3>
                      <p className="opacity-80">
                        Discover career opportunities tailored to your skills
                      </p>
                    </div>
                    <div className="text-center">
                      <Building className="h-12 w-12 mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">
                        Transform Your Career
                      </h3>
                      <p className="opacity-80">
                        Connect with top employers across the world
                      </p>
                    </div>
                    <div className="text-center">
                      <Search className="h-12 w-12 mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">
                        Your Gateway to Employment
                      </h3>
                      <p className="opacity-80">
                        Advanced search and matching technology
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Jobs;
