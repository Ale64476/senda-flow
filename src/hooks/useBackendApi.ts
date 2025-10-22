import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  assignRoutine,
  getUserRoutine,
  recordProgress,
  getProgress,
  getProgressStats,
  getRoutines,
  type ProgressData
} from '@/lib/api/backend';

/**
 * Hook to get the user's assigned routine
 */
export const useUserRoutine = () => {
  return useQuery({
    queryKey: ['user-routine'],
    queryFn: getUserRoutine,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });
};

/**
 * Hook to assign a routine to the current user
 */
export const useAssignRoutine = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: assignRoutine,
    onSuccess: () => {
      // Invalidate user routine query to refetch
      queryClient.invalidateQueries({ queryKey: ['user-routine'] });
    },
  });
};

/**
 * Hook to record workout progress
 */
export const useRecordProgress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ProgressData) => recordProgress(data),
    onSuccess: () => {
      // Invalidate progress queries to refetch
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['progress-stats'] });
    },
  });
};

/**
 * Hook to get progress history
 */
export const useProgress = (options?: {
  limit?: number;
  start_date?: string;
  end_date?: string;
}) => {
  return useQuery({
    queryKey: ['progress', options],
    queryFn: () => getProgress(options),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to get progress statistics
 */
export const useProgressStats = (days: number = 30) => {
  return useQuery({
    queryKey: ['progress-stats', days],
    queryFn: () => getProgressStats(days),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to get all available routines
 */
export const useRoutines = (options?: {
  location?: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['routines', options],
    queryFn: () => getRoutines(options),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};