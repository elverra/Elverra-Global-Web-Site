import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  membershipTier?: 'essential' | 'premium' | 'elite' | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  state?: string | null;
  zipCode?: string | null;
}

// Global cache for user role data
const userRoleCache = new Map<string, { role: string; isAdmin: boolean; timestamp: number }>();
const userRolePromises = new Map<string, Promise<{ role: string; isAdmin: boolean }>>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userRole: string | null;
  isAdmin: boolean;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ data: any; error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: string | null }>;
  signOut: () => Promise<void>;
  checkUserRole: () => Promise<void>;
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

  const fetchUserRoleFromAPI = async (userId: string): Promise<{ role: string; isAdmin: boolean }> => {
    try {
      // Use our server API to check roles
      const response = await fetch(`/api/users/${userId}`);
      if (response.ok) {
        const userData = await response.json();
        const roles = userData.roles || [];
        
        // Check if user has admin role
        const hasAdminRole = roles.includes('admin');
        
        if (hasAdminRole) {
          return { role: 'admin', isAdmin: true };
        }
        
        // Set the highest priority role
        const priorityOrder = ['admin', 'agent', 'merchant', 'user'];
        
        for (const role of priorityOrder) {
          if (roles.includes(role)) {
            return { role, isAdmin: role === 'admin' };
          }
        }
      }
      
      // Default to user role
      return { role: 'user', isAdmin: false };
    } catch (error) {
      console.error('Error checking user role:', error);
      return { role: 'user', isAdmin: false };
    }
  };

  const checkUserRole = async () => {
    if (!user) {
      setUserRole(null);
      setIsAdmin(false);
      return;
    }

    // First check if this is the admin email
    if (user.email === 'admin@elverra.com' || user.email === 'oladokunefi123@gmail.com') {
      setUserRole('admin');
      setIsAdmin(true);
      return;
    }

    const cacheKey = user.id;
    const now = Date.now();

    // Check cache first
    const cached = userRoleCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      setUserRole(cached.role);
      setIsAdmin(cached.isAdmin);
      return;
    }

    // Check if there's already a pending request
    let rolePromise = userRolePromises.get(cacheKey);
    if (!rolePromise) {
      rolePromise = fetchUserRoleFromAPI(user.id);
      userRolePromises.set(cacheKey, rolePromise);
    }

    try {
      const result = await rolePromise;
      
      // Cache the result
      userRoleCache.set(cacheKey, {
        role: result.role,
        isAdmin: result.isAdmin,
        timestamp: now
      });

      setUserRole(result.role);
      setIsAdmin(result.isAdmin);
    } finally {
      // Clean up the promise
      userRolePromises.delete(cacheKey);
    }
  };

  useEffect(() => {
    // Check for stored auth token/user
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      checkUserRole();
    }
  }, [user]);

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, ...metadata }),
      });

      if (response.ok) {
        const data = await response.json();
        const newUser = data.user;
        setUser(newUser);
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        return { data: { user: newUser }, error: null };
      } else {
        const error = await response.json();
        return { data: null, error: error.error || 'Registration failed' };
      }
    } catch (error) {
      return { data: null, error: 'Network error during registration' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const loggedInUser = data.user;
        setUser(loggedInUser);
        localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
        // Store JWT token if provided
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        return { data: { user: loggedInUser }, error: null };
      } else {
        const error = await response.json();
        return { data: null, error: error.error || 'Login failed' };
      }
    } catch (error) {
      return { data: null, error: 'Network error during login' };
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      setUserRole(null);
      setIsAdmin(false);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  const value = {
    user,
    loading,
    userRole,
    isAdmin,
    signUp,
    signIn,
    signOut,
    checkUserRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};