import { useQuery } from '@tanstack/react-query';
import { api } from '..';

const getMaxTurnNumber = async (gameId: string) => {
    const response = await api.get(`history/${gameId}/max-turn-number`);
    return response.data;
};

export const useGetMaxTurnNumber = (gameId: string) => {
    return useQuery({
        queryKey: ['history', gameId, 'max-turn-number'],
        queryFn: () => getMaxTurnNumber(gameId),
    });
};
