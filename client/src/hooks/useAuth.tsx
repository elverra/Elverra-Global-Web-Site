import { createContext, useContext, useEffect, useState, ReactNode } from "react";

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

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  membershipTier?: "essential" | "premium" | "elite" | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  state?: string | null;
  zipCode?: string | null;
  profileImageUrl?: string;

  skills?: UserSkill[];
  experience?: UserExperience[];
  education?: UserEducation[];
}

// Cache global
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const userRoleCache = new Map<string, { role: string; isAdmin: boolean; timestamp: number }>();
const userRolePromises = new Map<string, Promise<{ role: string; isAdmin: boolean }>>();

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userRole: string | null;
  isAdmin: boolean;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ data: any; error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: string | null }>;
  signOut: () => Promise<void>;
  checkUserRole: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  addSkill: (skillName: string, experienceLevel: string) => Promise<void>;
  addExperience: (experienceData: Omit<UserExperience, "id">) => Promise<void>;
  addEducation: (educationData: Omit<UserEducation, "id">) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Récupérer rôle depuis API
  const fetchUserRoleFromAPI = async (userId: string): Promise<{ role: string; isAdmin: boolean }> => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (response.ok) {
        const userData = await response.json();
        const roles = userData.roles || [];
        const hasAdminRole = roles.includes("admin");
        if (hasAdminRole) return { role: "admin", isAdmin: true };
        const priorityOrder = ["admin", "agent", "merchant", "user"];
        for (const role of priorityOrder) if (roles.includes(role)) return { role, isAdmin: role === "admin" };
      }
      return { role: "user", isAdmin: false };
    } catch {
      return { role: "user", isAdmin: false };
    }
  };

  const checkUserRole = async () => {
    if (!user) {
      setUserRole(null);
      setIsAdmin(false);
      return;
    }

    if (user.email === "admin@elverra.com" || user.email === "oladokunefi123@gmail.com") {
      setUserRole("admin");
      setIsAdmin(true);
      return;
    }

    const cacheKey = user.id;
    const now = Date.now();
    const cached = userRoleCache.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      setUserRole(cached.role);
      setIsAdmin(cached.isAdmin);
      return;
    }

    let rolePromise = userRolePromises.get(cacheKey);
    if (!rolePromise) {
      rolePromise = fetchUserRoleFromAPI(user.id);
      userRolePromises.set(cacheKey, rolePromise);
    }

    try {
      const result = await rolePromise;
      userRoleCache.set(cacheKey, { role: result.role, isAdmin: result.isAdmin, timestamp: now });
      setUserRole(result.role);
      setIsAdmin(result.isAdmin);
    } finally {
      userRolePromises.delete(cacheKey);
    }
  };

  // Fetch profile + skills/experience/education
  const fetchUserData = async (userId: string) => {
    const response = await fetch(`/api/users/${userId}/profile`);
    if (!response.ok) return;
    const data = await response.json();
    setUser((prev) => ({
      ...(prev || {}),
      ...data.profile,
      skills: data.skills,
      experience: data.experience,
      education: data.education,
    }));
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch {
        localStorage.removeItem("currentUser");
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      checkUserRole();
      fetchUserData(user.id);
    }
  }, [user]);

  // Auth functions
  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, ...metadata }),
      });
      if (!response.ok) {
        const error = await response.json();
        return { data: null, error: error.error || "Registration failed" };
      }
      const data = await response.json();
      setUser(data.user);
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      return { data: data.user, error: null };
    } catch {
      return { data: null, error: "Network error during registration" };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const error = await response.json();
        return { data: null, error: error.error || "Login failed" };
      }
      const data = await response.json();
      setUser(data.user);
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      if (data.token) localStorage.setItem("token", data.token);
      return { data: data.user, error: null };
    } catch {
      return { data: null, error: "Network error during login" };
    }
  };

  const signOut = async () => {
    setUser(null);
    setUserRole(null);
    setIsAdmin(false);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
  };

  // Profile management
  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    const profileData = { id: user.id, fullName: user.fullName, ...updates };
    const response = await fetch(`/api/users/${user.id}/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileData),
    });
    if (!response.ok) throw new Error("Failed to update profile");
    await fetchUserData(user.id);
  };

  const addSkill = async (skillName: string, experienceLevel: string) => {
    if (!user) return;
    const response = await fetch("/api/users/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id, skill_name: skillName, experience_level: experienceLevel }),
    });
    if (!response.ok) throw new Error("Failed to add skill");
    await fetchUserData(user.id);
  };

  const addExperience = async (experienceData: Omit<UserExperience, "id">) => {
    if (!user) return;
    const response = await fetch("/api/users/experience", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id, ...experienceData }),
    });
    if (!response.ok) throw new Error("Failed to add experience");
    await fetchUserData(user.id);
  };

  const addEducation = async (educationData: Omit<UserEducation, "id">) => {
    if (!user) return;
    const response = await fetch("/api/users/education", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id, ...educationData }),
    });
    if (!response.ok) throw new Error("Failed to add education");
    await fetchUserData(user.id);
  };

  const value: AuthContextType = {
    user,
    loading,
    userRole,
    isAdmin,
    signUp,
    signIn,
    signOut,
    checkUserRole,
    updateProfile,
    addSkill,
    addExperience,
    addEducation,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
