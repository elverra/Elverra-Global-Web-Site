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
  await setAuthHeader(session);
  return session;
};

// Function to set auth header with current session
export const setAuthHeader = async (session: any = null) => {
  const currentSession = session || (await supabase.auth.getSession()).data.session;
  if (currentSession?.access_token) {
    // Mettre à jour les en-têtes d'authentification pour les requêtes en temps réel
    supabase.realtime.setAuth(currentSession.access_token);
    
    // Mettre à jour les en-têtes pour les requêtes REST
    supabase.functions.setAuth(currentSession.access_token);
  }
  return currentSession;
};

// Initialize auth header
setAuthHeader();

// Listen for auth state changes
supabase.auth.onAuthStateChange(async (event, session) => {
  if (session?.access_token) {
    await setAuthHeader(session);
  } else {
    // Réinitialiser les en-têtes si l'utilisateur se déconnecte
    supabase.realtime.setAuth('');
    if (supabase.functions) {
      supabase.functions.setAuth('');
    }
  }
});
