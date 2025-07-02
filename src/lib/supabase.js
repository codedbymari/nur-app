// lib/supabase.js
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Fetch all users from 'brukere' table
export const fetchUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('brukere')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw error;
  }
};

// Get the currently authenticated user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting user:', error);
    throw error;
  }
  return user;
};

// Get user profile from 'brukere' table by user ID
export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('brukere')
    .select(`
      *,
      bruker_status!bruker_status_user_id_fkey(*),
      match_preferanser(*)
    `)
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
  return data;
};


// Sign out the current user
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Re-export createClient for custom usage
export { createClient };
