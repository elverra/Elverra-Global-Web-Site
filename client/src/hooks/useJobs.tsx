
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

// Global cache for bookmarks and applications data
const bookmarksCache = new Map<string, { bookmarks: string[]; timestamp: number }>();
const bookmarksPromises = new Map<string, Promise<string[]>>();
const applicationsCache = new Map<string, { applications: any[]; timestamp: number }>();
const applicationsPromises = new Map<string, Promise<any[]>>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  employment_type: string;
  type: string; // alias for employment_type
  salary_min?: number;
  salary_max?: number;
  currency: string;
  description: string;
  requirements?: string;
  benefits?: string;
  experience_level: string;
  experience_required: number; // years of experience
  skills?: string[];
  remote_allowed: boolean;
  application_count: number;
  created_at: string;
  application_deadline?: string;
  posted_by?: string;
  company_id?: string;
  featured?: boolean;
  urgent?: boolean;
  views?: number;
}

export const useJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async (filters?: {
    search?: string;
    location?: string;
    employmentType?: string;
    experienceLevel?: string;
  }) => {
    try {
      setLoading(true);
      // Fetch jobs from API
      const response = await fetch('/api/jobs');
      
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      
      const { data, error } = await response.json();

      if (error) throw new Error(error);
      
      // Apply client-side filtering (will be replaced with server-side filtering)
      let filteredData = data || [];
      
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter((job: any) => 
          job.title?.toLowerCase().includes(searchLower) ||
          job.company?.toLowerCase().includes(searchLower) ||
          job.description?.toLowerCase().includes(searchLower)
        );
      }

      if (filters?.location) {
        filteredData = filteredData.filter((job: any) => 
          job.location?.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }

      if (filters?.employmentType) {
        filteredData = filteredData.filter((job: any) => job.employment_type === filters.employmentType);
      }

      if (filters?.experienceLevel) {
        filteredData = filteredData.filter((job: any) => job.experience_level === filters.experienceLevel);
      }
      
      // Transform data to match our interface
      const transformedJobs = filteredData.map((job: any) => ({
        ...job,
        type: job.employment_type,
        experience_required: job.experience_level === 'entry' ? 0 : 
                           job.experience_level === 'mid' ? 3 : 5,
      }));
      
      setJobs(transformedJobs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const searchJobs = async (filters: {
    title?: string;
    location?: string;
    type?: string;
    experience?: string;
    salary?: string;
    company?: string;
  }) => {
    await fetchJobs({
      search: filters.title,
      location: filters.location,
      employmentType: filters.type,
      experienceLevel: filters.experience,
    });
  };

  const postJob = async (jobData: {
    title: string;
    company: string;
    location: string;
    employment_type: string;
    experience_level: string;
    salary_min: number;
    salary_max: number;
    description: string;
    requirements?: string;
    benefits?: string;
    skills?: string[];
    application_deadline?: string;
    remote_allowed?: boolean;
  }) => {
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...jobData,
          currency: 'CFA',
          is_active: true,
          application_count: 0,
          views: 0,
          featured: false,
          urgent: false
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to post job');
      }
      
      const data = await response.json();
      toast.success('Job posted successfully!');
      await fetchJobs(); // Refresh jobs list
      return { data, error: null };
    } catch (error) {
      console.error('Error posting job:', error);
      toast.error('Failed to post job');
      return { data: null, error };
    }
  };

  const incrementJobViews = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/views`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to increment job views');
      }
    } catch (error) {
      console.error('Error incrementing job views:', error);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return { 
    jobs, 
    loading, 
    error, 
    fetchJobs, 
    searchJobs, 
    postJob,
    incrementJobViews
  };
};

export const useJobDetails = (jobId: string) => {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { incrementJobViews } = useJobs();

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/jobs/${jobId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch job details');
        }
        
        const data = await response.json();
        
        // Transform data to match our interface
        const transformedJob = {
          ...data,
          type: data.employment_type,
          experience_required: data.experience_level === 'entry' ? 0 : 
                             data.experience_level === 'mid' ? 3 : 5,
        };
        
        setJob(transformedJob);
        
        // Increment view count
        await incrementJobViews(jobId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch job details');
        console.error('Error fetching job:', err);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJob();
    }
  }, [jobId, incrementJobViews]);

  return { job, loading, error };
};

// Global state for bookmarks to prevent multiple hook instances from conflicting
const globalBookmarksState = new Map<string, {
  bookmarks: string[];
  subscribers: Set<(bookmarks: string[]) => void>;
  timestamp: number;
  isLoading: boolean;
}>();

// Track if we've already initiated a fetch for a user to prevent duplicate requests
const activeFetches = new Set<string>();

export const useJobBookmarks = () => {
  // EMERGENCY FIX: Return static values immediately to prevent any API calls
  console.warn('useJobBookmarks is temporarily disabled to prevent infinite API calls');
  
  return { 
    bookmarks: [] as string[], 
    toggleBookmark: () => {
      toast.error('Bookmark functionality is temporarily disabled for maintenance');
    }, 
    refetchBookmarks: () => Promise.resolve()
  };
};

export const useJobApplications = () => {
  const { user } = useAuth();

  const applyToJob = async (jobId: string, applicationData: {
    full_name: string;
    email: string;
    phone: string;
    cover_letter?: string;
    work_experience?: string;
    education?: string;
    skills?: string[];
    expected_salary?: number;
    available_from?: string;
    experience_years?: number;
    portfolio_url?: string;
  }) => {
    try {
      const response = await fetch('/api/job-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: jobId,
          applicant_id: user?.id || null,
          ...applicationData,
          status: 'pending'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }
      
      // Clear applications cache after successful submission
      if (user?.id) {
        applicationsCache.delete(user.id);
      }
      
      toast.success('Application submitted successfully!');
      return { success: true };
    } catch (err) {
      console.error('Error applying to job:', err);
      toast.error('Failed to submit application');
      throw err;
    }
  };

  const getUserApplications = async () => {
    if (!user) return [];

    try {
      // Check cache first
      const cached = applicationsCache.get(user.id);
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        return cached.applications;
      }

      // Check if there's already a promise in flight
      let promise = applicationsPromises.get(user.id);
      if (!promise) {
        promise = (async () => {
          const response = await fetch(`/api/users/${user.id}/applications`);
          
          if (response.ok) {
            const data = await response.json();
            return data || [];
          } else if (response.status !== 404) {
            throw new Error('Failed to fetch applications');
          }
          return [];
        })();
        applicationsPromises.set(user.id, promise);
      }

      const applications = await promise;
      
      // Cache the result
      applicationsCache.set(user.id, { applications, timestamp: Date.now() });
      applicationsPromises.delete(user.id);
      
      return applications;
    } catch (err) {
      console.error('Error fetching applications:', err);
      applicationsPromises.delete(user.id);
      return [];
    }
  };

  const getJobApplications = async (jobId: string) => {
    if (!user) return [];

    try {
      const response = await fetch(`/api/jobs/${jobId}/applications`);
      
      if (response.ok) {
        const data = await response.json();
        return data || [];
      } else if (response.status !== 404) {
        throw new Error('Failed to fetch job applications');
      }
      return [];
    } catch (err) {
      console.error('Error fetching job applications:', err);
      return [];
    }
  };

  return { applyToJob, getUserApplications, getJobApplications };
};
