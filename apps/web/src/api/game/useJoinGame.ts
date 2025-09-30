import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '..';

const getAvailableGameIds = async () => {
  const response = await api.get<string[]>('games');

  return response.data;
};

export const useJoinGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: getAvailableGameIds,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
};
