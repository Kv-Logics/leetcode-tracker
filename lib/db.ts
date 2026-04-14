import { supabase } from './supabase';
import { hashPassword, verifyPassword } from './auth';

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'user';
}

export interface UserProgress {
  user_id: string;
  problem_id: string;
  completed: boolean;
}

export const initDB = async () => {
  // Check if admin exists
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('username', 'admin')
    .single();
  
  if (!data) {
    const adminPass = await hashPassword('admin123');
    await supabase.from('users').insert({
      username: 'admin',
      password: adminPass,
      role: 'admin'
    });
  }
};

export const createUser = async (username: string, password: string, role: 'admin' | 'user' = 'user') => {
  const hashedPassword = await hashPassword(password);
  const { data, error } = await supabase
    .from('users')
    .insert({ username, password: hashedPassword, role })
    .select()
    .single();
  
  return { data, error };
};

export const getUserByUsername = async (username: string) => {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();
  
  return data;
};

export const getUserProgress = async (userId: string) => {
  const { data } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId);
  
  return data || [];
};

export const updateProgress = async (userId: string, problemId: string, completed: boolean) => {
  const { data: existing } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('problem_id', problemId)
    .single();
  
  if (existing) {
    await supabase
      .from('user_progress')
      .update({ completed })
      .eq('user_id', userId)
      .eq('problem_id', problemId);
  } else {
    await supabase
      .from('user_progress')
      .insert({ user_id: userId, problem_id: problemId, completed });
  }
};
