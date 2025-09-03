
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

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

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch profile data from API
      const response = await fetch(`/api/users/${user.id}/profile`);
      
      if (response.ok) {
        const profileData = await response.json();
        setProfile(profileData.profile || null);
        setSkills(profileData.skills || []);
        setExperience(profileData.experience || []);
        setEducation(profileData.education || []);
      } else if (response.status !== 404) {
        throw new Error('Failed to fetch profile data');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
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

      const response = await fetch(`/api/users/${user.id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
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
      const response = await fetch('/api/users/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          skill_name: skillName,
          experience_level: experienceLevel
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add skill');
      }
      await fetchProfile();
    } catch (err) {
      console.error('Error adding skill:', err);
      throw err;
    }
  };

  const addExperience = async (experienceData: Omit<UserExperience, 'id'>) => {
    if (!user) return;

    try {
      const response = await fetch('/api/users/experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          ...experienceData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add experience');
      }
      await fetchProfile();
    } catch (err) {
      console.error('Error adding experience:', err);
      throw err;
    }
  };

  const addEducation = async (educationData: Omit<UserEducation, 'id'>) => {
    if (!user) return;

    try {
      const response = await fetch('/api/users/education', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          ...educationData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add education');
      }
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
