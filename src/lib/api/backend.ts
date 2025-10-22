import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

/**
 * Backend API client for fitness app
 * Wraps all edge function calls with proper error handling
 */

export interface ProgressData {
  workout_id?: string;
  date?: string;
  weight?: number;
  body_measurements?: Record<string, number>;
  energy_level?: number;
  menstrual_phase?: string;
  notes?: string;
  exercises_completed?: Array<{
    exercise_id: string;
    sets?: number;
    reps?: number;
    duration_minutes?: number;
    weight_used?: number;
  }>;
}

export interface RoutineResponse {
  routine: any;
  profile?: any;
  message?: string;
}

export interface ProgressResponse {
  progress: any[];
  count: number;
}

export interface StatsResponse {
  stats: {
    total_workouts: number;
    weight_change: number;
    average_energy_level: number;
    workout_streak: number;
    weight_trend: Array<{ date: string; weight: number }>;
    energy_trend: Array<{ date: string; energy: number }>;
  };
  period_days: number;
  calculated_at: string;
}

/**
 * Assign a routine automatically to the current user based on their profile
 */
export async function assignRoutine(): Promise<RoutineResponse> {
  const { data, error } = await supabase.functions.invoke('assign-routine', {
    method: 'POST'
  });

  if (error) throw error;
  return data;
}

/**
 * Get the assigned routine for the current user
 */
export async function getUserRoutine(): Promise<RoutineResponse> {
  const { data, error } = await supabase.functions.invoke('get-user-routine', {
    method: 'GET'
  });

  if (error) throw error;
  return data;
}

/**
 * Get today's workouts
 */
export async function getTodaysWorkouts(): Promise<{ workouts: any[]; date: string; count: number }> {
  const { data, error } = await supabase.functions.invoke('get-todays-workouts', {
    method: 'GET'
  });

  if (error) throw error;
  return data;
}

/**
 * Get workouts by date or date range
 */
export async function getWorkoutsByDate(params?: {
  date?: string;
  start_date?: string;
  end_date?: string;
}): Promise<{ workouts: any[]; count: number }> {
  const queryParams = new URLSearchParams();
  if (params?.date) queryParams.append('date', params.date);
  if (params?.start_date) queryParams.append('start_date', params.start_date);
  if (params?.end_date) queryParams.append('end_date', params.end_date);

  const url = `${SUPABASE_URL}/functions/v1/get-workouts-by-date${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No session');

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch workouts: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Record progress for a workout
 */
export async function recordProgress(progressData: ProgressData): Promise<{ success: boolean; progress: any; message: string }> {
  const { data, error } = await supabase.functions.invoke('record-progress', {
    body: progressData
  });

  if (error) throw error;
  return data;
}

/**
 * Get progress history for the current user
 */
export async function getProgress(options?: {
  limit?: number;
  start_date?: string;
  end_date?: string;
}): Promise<ProgressResponse> {
  const params = new URLSearchParams();
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.start_date) params.append('start_date', options.start_date);
  if (options?.end_date) params.append('end_date', options.end_date);

  const url = `${SUPABASE_URL}/functions/v1/get-progress${params.toString() ? '?' + params.toString() : ''}`;
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No session');

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch progress: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get progress statistics for the current user
 */
export async function getProgressStats(days: number = 30): Promise<StatsResponse> {
  const params = new URLSearchParams({ days: days.toString() });
  const url = `${SUPABASE_URL}/functions/v1/get-progress-stats?${params.toString()}`;
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No session');

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch stats: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get all available routines
 */
export async function getRoutines(options?: {
  location?: string;
  limit?: number;
}): Promise<{ routines: any[]; count: number }> {
  const params = new URLSearchParams();
  if (options?.location) params.append('location', options.location);
  if (options?.limit) params.append('limit', options.limit.toString());

  const url = `${SUPABASE_URL}/functions/v1/get-routines${params.toString() ? '?' + params.toString() : ''}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch routines: ${response.statusText}`);
  }

  return response.json();
}