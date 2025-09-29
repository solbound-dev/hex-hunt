import { useQuery } from '@tanstack/react-query';
import { api } from '..';

const getGames = async () => {
  const response = await api.get<string[]>('games');

  return response.data;
};

export const useGetAllGames = () => {
  return useQuery({
    queryKey: ['games'],
    queryFn: getGames,
    staleTime: Infinity,
  });
};
