import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn('Supabase env not set: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'apikey': supabaseAnonKey,
    },
  },
  db: {
    schema: 'public',
  },
});

// Function to get the current session and update headers
export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// Function to set auth header with current session
export const setAuthHeader = async () => {
  const session = await getSession();
  if (session?.access_token) {
    supabase.realtime.setAuth(session.access_token);
  }
  return session;
};

// Initialize auth header
setAuthHeader();

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.access_token) {
    supabase.realtime.setAuth(session.access_token);
  }
});
