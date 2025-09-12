import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface User {
  id: string;
  email?: string;
  phone?: string;
  fullName?: string | null;
}

// Global cache for user role data
const userRoleCache = new Map<string, { role: string; isAdmin: boolean; timestamp: number }>();
const userRolePromises = new Map<string, Promise<{ role: string; isAdmin: boolean }>>();
const CACHE_DURATION = 30 * 1000; // 30 seconds to reflect role updates faster

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userRole: string | null;
  isAdmin: boolean;
  signUp: (
    email: string,
    password: string,
    metadata?: { full_name?: string; phone?: string; referral_code?: string; physical_card_requested?: boolean }
  ) => Promise<{ data: any; error: string | null }>;
  signInWithPassword: (identifier: string, password: string) => Promise<{ data: any; error: string | null; meta?: { resolvedEmail?: string; triedPhoneDirect: boolean } }>;
  sendOtpSms: (phone: string) => Promise<{ data: any; error: string | null }>;
  verifyOtpSms: (phone: string, token: string) => Promise<{ data: any; error: string | null }>;
  sendOtpEmail: (email: string) => Promise<{ data: any; error: string | null }>;
  verifyOtpEmail: (email: string, token: string) => Promise<{ data: any; error: string | null }>;
  sendMagicLink: (email: string, redirectPath?: string) => Promise<{ data: any; error: string | null }>;
  signOut: () => Promise<void>;
  checkUserRole: (force?: boolean) => Promise<void>;
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

  // Normalize a phone number to E.164 for Mali by default if no country code provided
  const normalizeE164 = (raw: string): string | null => {
    if (!raw) return null;
    let p = raw.replace(/\s|-/g, '');
    // Already E.164
    if (p.startsWith('+')) return p;
    // Starts with country code without plus
    if (p.startsWith('223')) return `+${p}`;
    // Local 8-digit number -> assume Mali +223
    if (/^\d{8}$/.test(p)) return `+223${p}`;
    // Fallback: if digits and length between 9-15, try to prepend '+'
    if (/^\d{9,15}$/.test(p)) return `+${p}`;
    return null;
  };

  const sendMagicLink = async (email: string, redirectPath = '/dashboard') => {
    try {
      const appUrl = (import.meta as any)?.env?.VITE_APP_URL || window.location.origin;
      const emailRedirectTo = `${appUrl}${redirectPath}`;

      // Attempt 1: Should create user + explicit redirect
      let resp = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo,
        },
      });
      if (!resp.error) return { data: resp.data, error: null };

      console.warn('sendMagicLink attempt1 failed:', resp.error?.message || resp.error);

      // Attempt 2: Existing users only (common when project disallows creation via magic link)
      resp = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo,
        },
      });
      if (!resp.error) return { data: resp.data, error: null };

      console.warn('sendMagicLink attempt2 failed, retrying without emailRedirectTo (use Site URL):', resp.error?.message || resp.error);

      // Attempt 3: Let Supabase use configured Site URL (helps when redirect not whitelisted)
      resp = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      });
      if (!resp.error) return { data: resp.data, error: null };

      console.error('sendMagicLink final error:', resp.error);
      return { data: null, error: resp.error.message };
    } catch (err: any) {
      return { data: null, error: err?.message || 'Failed to send magic link' };
    }
  };

  const fetchUserRoleFromAPI = async (): Promise<{ role: string; isAdmin: boolean }> => {
    try {
      if (!user?.id) return { role: 'USER', isAdmin: false };

      // Attempt 1: Use RPC with SECURITY DEFINER (recommended to avoid RLS 403)
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_user_role');
        if (!rpcError && rpcData) {
          const role = (String(rpcData) || 'USER').toUpperCase();
          const isAdmin = role === 'SUPERADMIN' || role === 'SUPPORT';
          return { role, isAdmin };
        }
        if (rpcError) {
          console.warn('get_user_role RPC failed, falling back to table select:', rpcError.message || rpcError);
        }
      } catch (e) {
        console.warn('RPC get_user_role threw, falling back to table select', e);
      }

      // Attempt 2: Direct table select (requires RLS policy allowing user_id = auth.uid())
      const { data, error, status } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error checking user role (table select):', { error, status });
        return { role: 'USER', isAdmin: false };
      }

      const role = ((data?.role as string) || 'USER').toUpperCase();
      const isAdmin = role === 'SUPERADMIN' || role === 'SUPPORT';
      return { role, isAdmin };
    } catch (error) {
      console.error('Error checking user role:', error);
      return { role: 'USER', isAdmin: false };
    }
  };

  const sendOtpEmail = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
      if (error) return { data: null, error: error.message };
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err?.message || 'Failed to send Email OTP' };
    }
  };

  const verifyOtpEmail = async (email: string, token: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' as any });
      if (error) return { data: null, error: error.message };
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err?.message || 'Failed to verify Email OTP' };
    }
  };

  const checkUserRole = async (force: boolean = false) => {
    if (!user) {
      setUserRole(null);
      setIsAdmin(false);
      return;
    }

    // Real role verification only via database

    const cacheKey = user.id;
    const now = Date.now();

    // Check cache first (unless force refresh)
    if (!force) {
      const cached = userRoleCache.get(cacheKey);
      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        setUserRole(cached.role);
        setIsAdmin(cached.isAdmin);
        return;
      }
    }

    // Check if there's already a pending request
    let rolePromise = userRolePromises.get(cacheKey);
    if (!rolePromise) {
      rolePromise = fetchUserRoleFromAPI();
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
    // Initialize session from Supabase and subscribe to changes
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const s = data.session;
      if (s?.user) {
        setUser({ id: s.user.id, email: s.user.email ?? undefined, phone: s.user.phone ?? undefined, fullName: (s.user.user_metadata as any)?.full_name ?? null });
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email ?? undefined, phone: session.user.phone ?? undefined, fullName: (session.user.user_metadata as any)?.full_name ?? null });
      } else {
        setUser(null);
      }
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      checkUserRole();
    }
  }, [user]);

  const signUp = async (
    email: string,
    password: string,
    metadata?: { full_name?: string; phone?: string; referral_code?: string; physical_card_requested?: boolean }
  ) => {
    try {
      const phone = metadata?.phone?.trim();
      let data: any;
      let error: any;

      // Support email optional: if email provided use email path; else use phone path
      if (email && email.trim().length > 0) {
        ({ data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: metadata?.full_name ?? '',
              referral_code: metadata?.referral_code ?? '',
              physical_card_requested: !!metadata?.physical_card_requested,
              phone: phone ?? '',
              country: (metadata as any)?.country ?? '',
              city: (metadata as any)?.city ?? '',
            },
            emailRedirectTo: window.location.origin + '/login',
          },
        }));
      } else {
        // Phone-only signup (no email)
        ({ data, error } = await supabase.auth.signUp({
          phone: phone as string,
          password,
          options: {
            data: {
              full_name: metadata?.full_name ?? '',
              referral_code: metadata?.referral_code ?? '',
              physical_card_requested: !!metadata?.physical_card_requested,
              country: (metadata as any)?.country ?? '',
              city: (metadata as any)?.city ?? '',
            },
          },
        }));
      }
      if (error) return { data: null, error: error.message };
      // No OTP auto-sent at signup (as requested). OTP will be used at login flow only.
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err?.message || 'Registration failed' };
    }
  };

  // Generate common variants of a phone for matching DB records
  const phoneVariants = (normalized: string): string[] => {
    const v: string[] = [];
    const noPlus = normalized.startsWith('+') ? normalized.slice(1) : normalized;
    v.push(normalized); // +2237340...
    v.push(noPlus);     // 2237340...
    if (noPlus.startsWith('223')) v.push(noPlus.slice(3)); // 7340...
    return Array.from(new Set(v));
  };

  const signInWithPassword = async (identifier: string, password: string) => {
    try {
      const isEmail = identifier.includes('@');
      if (isEmail) {
        const { data, error } = await supabase.auth.signInWithPassword({ email: identifier, password });
        if (error) return { data: null, error: error.message, meta: { resolvedEmail: identifier, triedPhoneDirect: false } };
        return { data, error: null, meta: { resolvedEmail: identifier, triedPhoneDirect: false } };
      } else {
        const normalized = normalizeE164(identifier);
        if (!normalized) return { data: null, error: 'Invalid phone format. Use +223XXXXXXXX' };
        // 1) Try direct phone+password (works only if enabled in Supabase project)
        let resp = await supabase.auth.signInWithPassword({ phone: normalized, password } as any);
        if (!resp.error) return { data: resp.data, error: null, meta: { triedPhoneDirect: true } };
        const firstError = resp.error;
        // 2) Fallback: map phone -> email then email+password
        try {
          // 2a) Preferred path: call an RPC that returns the email for this phone (requires the SQL function to be created)
          //    If not available, we will fallback to direct table scans below.
          let emailFromProfile: string | undefined;
          try {
            const { data: rpcEmail, error: rpcError } = await supabase.rpc('get_email_by_phone_e164', { p_phone: identifier });
            if (!rpcError && rpcEmail) {
              emailFromProfile = rpcEmail as string;
            }
          } catch {}

          if (!emailFromProfile) {
            // 2b) Fallback: Try multiple common phone formats and common table/column names
            const variants = phoneVariants(normalized);
            const tables = ['profiles', 'users', 'user_profiles'];
            const phoneCols = ['phone', 'msisdn', 'telephone', 'tel'];
            const emailCols = ['email', 'user_email'];
            outer: for (const table of tables) {
              for (const pcol of phoneCols) {
                for (const ecol of emailCols) {
                  for (const variant of variants) {
                    const sel = `${ecol}, ${pcol}`;
                    const q = supabase.from(table).select(sel).eq(pcol, variant).maybeSingle();
                    const { data: row, error: qError, status } = await q;
                    if (qError && status === 400) {
                      // likely wrong column/table type -> try next combination
                      continue;
                    }
                    if (qError) {
                      // If RLS forbids or table missing, stop trying this table; try next table
                      continue;
                    }
                    emailFromProfile = (row as any)?.[ecol] as string | undefined;
                    if (emailFromProfile) break outer;
                  }
                }
              }
            }
          }

          if (!emailFromProfile) {
            return { data: null, error: 'No account found for this phone. Please use your email.' };
          }

          resp = await supabase.auth.signInWithPassword({ email: emailFromProfile, password });
          if (resp.error) return { data: null, error: resp.error.message, meta: { resolvedEmail: emailFromProfile, triedPhoneDirect: true } };
          return { data: resp.data, error: null, meta: { resolvedEmail: emailFromProfile, triedPhoneDirect: true } };
        } catch {
          return { data: null, error: firstError.message, meta: { triedPhoneDirect: true } };
        }
      }
    } catch (err: any) {
      return { data: null, error: err?.message || 'Login failed', meta: { triedPhoneDirect: false } };
    }
  };

  const sendOtpSms = async (phone: string) => {
    try {
      const normalized = normalizeE164(phone);
      if (!normalized) return { data: null, error: 'Invalid phone format. Use +223XXXXXXXX' };
      const { data, error } = await supabase.auth.signInWithOtp({ phone: normalized });
      if (error) return { data: null, error: error.message };
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err?.message || 'Failed to send OTP' };
    }
  };

  const verifyOtpSms = async (phone: string, token: string) => {
    try {
      const normalized = normalizeE164(phone);
      if (!normalized) return { data: null, error: 'Invalid phone format. Use +223XXXXXXXX' };
      const { data, error } = await supabase.auth.verifyOtp({ phone: normalized, token, type: 'sms' });
      if (error) return { data: null, error: error.message };
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err?.message || 'Failed to verify OTP' };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      if (user?.id) userRoleCache.delete(user.id);
      setUser(null);
      setUserRole(null);
      setIsAdmin(false);
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
    signInWithPassword,
    sendOtpSms,
    verifyOtpSms,
    sendOtpEmail,
    verifyOtpEmail,
    sendMagicLink,
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