
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';

// Global cache for applications data
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

  const fetchJobs = async (filters?: {
    search?: string;
    location?: string;
    employmentType?: string;
    experienceLevel?: string;
  }) => {
    try {
      setLoading(true);
      
      let supabaseQuery = supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true);

      // Apply filters
      if (filters?.search) {
        supabaseQuery = supabaseQuery.or(
          `title.ilike.%${filters.search}%,company.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      if (filters?.location) {
        supabaseQuery = supabaseQuery.ilike('location', `%${filters.location}%`);
      }

      if (filters?.employmentType) {
        supabaseQuery = supabaseQuery.eq('employment_type', filters.employmentType);
      }

      if (filters?.experienceLevel) {
        supabaseQuery = supabaseQuery.eq('experience_level', filters.experienceLevel);
      }

      const { data, error } = await supabaseQuery.order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        setJobs([]);
        return;
      }

      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
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
      const { data, error } = await supabase
        .from('jobs')
        .insert([jobData])
        .select();

      if (error) throw error;
      
      toast.success('Emploi publié avec succès!');
      await fetchJobs(); // Refresh jobs list
      return { data: data?.[0], error: null };
    } catch (error) {
      console.error('Error posting job:', error);
      toast.error('Échec de la publication de l\'emploi');
      return { data: null, error };
    }
  };

  const incrementJobViews = async (jobId: string) => {
    try {
      // First get the current views count
      const { data: currentJob, error: fetchError } = await supabase
        .from('jobs')
        .select('views')
        .eq('id', jobId)
        .single();

      if (fetchError) {
        console.error('Error fetching current views:', fetchError);
        return;
      }

      // Increment the views count
      const newViews = (currentJob?.views || 0) + 1;
      
      const { error } = await supabase
        .from('jobs')
        .update({ views: newViews })
        .eq('id', jobId);
        
      if (error) {
        console.error('Error incrementing job views:', error);
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
        
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', jobId)
          .single();
          
        if (error) throw error;
        
        setJob(data);
        
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

export const useJobBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const { user } = useAuth();
  
  const toggleBookmark = async (jobId: string) => {
    if (!user) {
      toast.error('Vous devez être connecté pour sauvegarder des emplois');
      return;
    }

    try {
      const isBookmarked = bookmarks.includes(jobId);
      
      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('job_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('job_id', jobId);
          
        if (error) throw error;
        setBookmarks(prev => prev.filter(id => id !== jobId));
        toast.success('Emploi retiré des favoris');
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('job_bookmarks')
          .insert({ user_id: user.id, job_id: jobId });
          
        if (error) throw error;
        setBookmarks(prev => [...prev, jobId]);
        toast.success('Emploi ajouté aux favoris');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const refetchBookmarks = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('job_bookmarks')
        .select('job_id')
        .eq('user_id', user.id);
        
      if (error) throw error;
      setBookmarks(data?.map(item => item.job_id) || []);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  useEffect(() => {
    refetchBookmarks();
  }, [user]);
  
  return { 
    bookmarks, 
    toggleBookmark, 
    refetchBookmarks
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
      const { error } = await supabase
        .from('job_applications')
        .insert([{
          job_id: jobId,
          user_id: user?.id,
          ...applicationData,
          applied_at: new Date().toISOString()
        }]);
      
      if (error) throw error;
      
      // Clear applications cache after successful submission
      if (user?.id) {
        applicationsCache.delete(user.id);
      }
      
      toast.success('Candidature soumise avec succès!');
      return { success: true };
    } catch (err) {
      console.error('Error applying to job:', err);
      toast.error('Échec de la soumission de candidature');
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
          const { data, error } = await supabase
            .from('job_applications')
            .select(`
              *,
              jobs:job_id (
                title,
                company,
                location
              )
            `)
            .eq('user_id', user.id)
            .order('applied_at', { ascending: false });
            
          if (error) throw error;
          return data || [];
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
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('job_id', jobId)
        .order('applied_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching job applications:', err);
      return [];
    }
  };

  return { applyToJob, getUserApplications, getJobApplications };
};
