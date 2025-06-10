import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '../lib/queryClient';

export interface DatabaseSettings {
  id: number;
  userId: number;
  startTime: string;
  endTime: string;
  breakDuration: number;
  createdAt: string;
  updatedAt: string;
}

export const useSettings = (userId: number | null) => {
  return useQuery({
    queryKey: ['settings', userId],
    queryFn: () => userId ? apiRequest(`/api/settings/${userId}`) : Promise.resolve(null),
    enabled: !!userId,
  });
};

export const useUpdateSettings = () => {
  return useMutation({
    mutationFn: async ({ 
      userId, 
      startTime, 
      endTime, 
      breakDuration 
    }: { 
      userId: number; 
      startTime: string; 
      endTime: string; 
      breakDuration: number; 
    }) => {
      return apiRequest('/api/settings', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          startTime,
          endTime,
          breakDuration,
        }),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['settings', variables.userId] });
    },
  });
};