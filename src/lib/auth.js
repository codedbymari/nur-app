// lib/auth.js
import { supabase, getCurrentUser, getUserProfile } from './supabase';

// Get just the profile data
export const getProfile = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;
    
    const profile = await getUserProfile(user.id);
    return profile;
  } catch (error) {
    console.error('Error getting profile:', error);
    return null;
  }
};

// Get user with profile data combined
export const getUser = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;
    
    // Get user profile data
    const profile = await getUserProfile(user.id);
    return {
      ...user,
      profile
    };
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

// Sign out user
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Sign in user
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

// Sign up user and create profile
export const signUp = async (email, password, userData) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    
    if (error) throw error;
    
    // If user is created, create profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          ...userData
        });
      
      if (profileError) throw profileError;
    }
    
    return data;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

// Update user profile
export const updateProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// Update user password
export const updatePassword = async (newPassword) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw error;
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

// Check if user is authenticated
export const isAuthenticated = async () => {
  try {
    const user = await getCurrentUser();
    return !!user;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

// Get current session
export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

// Listen to auth state changes
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback);
};