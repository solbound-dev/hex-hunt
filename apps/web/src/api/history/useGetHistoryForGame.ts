import { useQuery } from '@tanstack/react-query';
import { api } from '..';

const getHistoryForGame = async (gameId: string) => {
  const response = await api.get(`history/${gameId}`);
  return response.data;
};

export const useGetHistoryForGame = (gameId: string) => {
  return useQuery({
    queryKey: ['history', gameId],
    queryFn: () => getHistoryForGame(gameId),
  });
};
