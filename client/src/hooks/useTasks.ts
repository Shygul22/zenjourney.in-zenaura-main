import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '../lib/queryClient';

export interface DatabaseTask {
  id: number;
  userId: number;
  name: string;
  priority: number;
  effort: number;
  completed: boolean;
  priorityScore: string;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  createdAt: string;
  updatedAt: string;
}

export const calculatePriorityScore = (priority: number, effort: number, createdAt: Date): number => {
  const urgencyScore = priority * 20;
  const timeDecay = Math.max(0, (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
  const effortPenalty = Math.max(0, (effort - 1) * 5);
  return Math.max(0, urgencyScore + timeDecay * 2 - effortPenalty);
};

export const useTasks = (userId: number | null) => {
  return useQuery({
    queryKey: ['tasks', userId],
    queryFn: () => userId ? apiRequest(`/api/tasks/${userId}`) : Promise.resolve([]),
    enabled: !!userId,
  });
};

export const useCreateTask = () => {
  return useMutation({
    mutationFn: async ({ name, priority, effort, userId }: { 
      name: string; 
      priority: number; 
      effort: number; 
      userId: number; 
    }) => {
      const createdAt = new Date();
      const priorityScore = calculatePriorityScore(priority, effort, createdAt);
      
      return apiRequest('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          name,
          priority,
          effort,
          priorityScore: priorityScore.toString(),
        }),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.userId] });
    },
  });
};

export const useUpdateTask = () => {
  return useMutation({
    mutationFn: async ({ id, updates, userId }: { 
      id: number; 
      updates: Partial<DatabaseTask>; 
      userId: number; 
    }) => {
      return apiRequest(`/api/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.userId] });
    },
  });
};

export const useDeleteTask = () => {
  return useMutation({
    mutationFn: async ({ id, userId }: { id: number; userId: number }) => {
      return apiRequest(`/api/tasks/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.userId] });
    },
  });
};

export const useClearAllTasks = () => {
  return useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest(`/api/tasks/user/${userId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', userId] });
    },
  });
};