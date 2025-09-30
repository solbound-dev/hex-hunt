import { useQuery } from '@tanstack/react-query';
import { api } from '..';

const getAvailableGameIds = async () => {
  const response = await api.get<string[]>('games');

  return response.data;
};

export const useGetAvailableGameIds = () => {
  return useQuery({
    queryKey: ['games'],
    queryFn: getAvailableGameIds,
    refetchInterval: 5000,
  });
};
