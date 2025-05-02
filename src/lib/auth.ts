import { supabase } from './supabase';

export type UserSession = {
  user: {
    id: string;
    email: string;
  } | null;
  isLoading: boolean;
};

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }
  
  return null;
} 