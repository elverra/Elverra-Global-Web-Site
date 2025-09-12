
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

// Global cache for user profile data
const profileCache = new Map<string, { 
  profile: UserProfile | null; 
  skills: UserSkill[]; 
  experience: UserExperience[]; 
  education: UserEducation[]; 
  timestamp: number 
}>();
const profilePromises = new Map<string, Promise<any>>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export interface UserProfile {
  id: string;
  full_name: string;
  phone?: string;
  address?: string;
  city?: string;
  country: string;
  profile_image_url?: string;
}

export interface UserSkill {
  id: string;
  skill_name: string;
  experience_level: string;
}

export interface UserExperience {
  id: string;
  company_name: string;
  position: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
}

export interface UserEducation {
  id: string;
  institution: string;
  degree: string;
  field_of_study?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  grade?: string;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [experience, setExperience] = useState<UserExperience[]>([]);
  const [education, setEducation] = useState<UserEducation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfileFromAPI = async (userId: string) => {
    // Mock profile fetch - will be replaced with Supabase
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      profile: null,
      skills: [],
      experience: [],
      education: []
    };
  };

  const fetchProfile = async () => {
    if (!user) return;

    const cacheKey = user.id;
    const now = Date.now();

    // Check cache first
    const cached = profileCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      setProfile(cached.profile);
      setSkills(cached.skills);
      setExperience(cached.experience);
      setEducation(cached.education);
      setLoading(false);
      return;
    }

    // Check if there's already a pending request
    let profilePromise = profilePromises.get(cacheKey);
    if (!profilePromise) {
      profilePromise = fetchProfileFromAPI(user.id);
      profilePromises.set(cacheKey, profilePromise);
    }

    try {
      setLoading(true);
      const result = await profilePromise;
      
      // Cache the result
      profileCache.set(cacheKey, {
        profile: result.profile,
        skills: result.skills,
        experience: result.experience,
        education: result.education,
        timestamp: now
      });

      setProfile(result.profile);
      setSkills(result.skills);
      setExperience(result.experience);
      setEducation(result.education);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
      // Clean up the promise
      profilePromises.delete(cacheKey);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    try {
      // Ensure full_name is provided when creating new profile
      const profileData = {
        id: user.id,
        full_name: updates.full_name || profile?.full_name || user.email?.split('@')[0] || 'User',
        ...updates
      };

      // Mock profile update - will be replaced with Supabase
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Update local state
      setProfile(prev => ({ ...prev, ...profileData } as UserProfile));
      
      // Clear cache before refetching
      profileCache.delete(user.id);
      await fetchProfile();
      return { success: true };
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    }
  };

  const addSkill = async (skillName: string, experienceLevel: string) => {
    if (!user) return;

    try {
      // Mock skill addition - will be replaced with Supabase
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const newSkill: UserSkill = {
        id: `skill_${Date.now()}`,
        skill_name: skillName,
        experience_level: experienceLevel
      };
      
      setSkills(prev => [...prev, newSkill]);
      
      // Clear cache before refetching
      profileCache.delete(user.id);
      await fetchProfile();
    } catch (err) {
      console.error('Error adding skill:', err);
      throw err;
    }
  };

  const addExperience = async (experienceData: Omit<UserExperience, 'id'>) => {
    if (!user) return;

    try {
      // Mock experience addition - will be replaced with Supabase
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newExperience: UserExperience = {
        ...experienceData,
        id: `exp_${Date.now()}`
      };
      
      setExperience(prev => [...prev, newExperience]);
      
      // Clear cache before refetching
      profileCache.delete(user.id);
      await fetchProfile();
    } catch (err) {
      console.error('Error adding experience:', err);
      throw err;
    }
  };

  const addEducation = async (educationData: Omit<UserEducation, 'id'>) => {
    if (!user) return;

    try {
      // Mock education addition - will be replaced with Supabase
      await new Promise(resolve => setTimeout(resolve, 450));
      
      const newEducation: UserEducation = {
        ...educationData,
        id: `edu_${Date.now()}`
      };
      
      setEducation(prev => [...prev, newEducation]);
      
      // Clear cache before refetching
      profileCache.delete(user.id);
      await fetchProfile();
    } catch (err) {
      console.error('Error adding education:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    skills,
    experience,
    education,
    loading,
    updateProfile,
    addSkill,
    addExperience,
    addEducation,
    fetchProfile
  };
};
