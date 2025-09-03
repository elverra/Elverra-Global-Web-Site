import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
}

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkUserRole = async () => {
    if (!user) {
      setUserRole(null);
      setIsAdmin(false);
      return;
    }

    try {
      // First check if this is the admin email
      if (user.email === 'admin@elverra.com' || user.email === 'madymadhu6@gmail.com') {
        setUserRole('admin');
        setIsAdmin(true);
        return;
      }

      // Use our server API to check roles
      const response = await fetch(`/api/users/${user.id}`);
      if (response.ok) {
        const userData = await response.json();
        const roles = userData.roles || [];
        
        // Check if user has admin role
        const hasAdminRole = roles.includes('admin');
        
        if (hasAdminRole) {
          setUserRole('admin');
          setIsAdmin(true);
          return;
        }
        
        // Set the highest priority role
        const priorityOrder = ['admin', 'agent', 'merchant', 'user'];
        
        for (const role of priorityOrder) {
          if (roles.includes(role)) {
            setUserRole(role);
            setIsAdmin(role === 'admin');
            return;
          }
        }
      }
      
      // Default to user role
      setUserRole('user');
      setIsAdmin(false);
    } catch (error) {
      console.error('Error checking user role:', error);
      setUserRole('user');
      setIsAdmin(false);
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