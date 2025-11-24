import { useQuery } from '@tanstack/react-query';
import { api } from '..';

const getResolvedTurn = async (gameId: string, turn: number) => {
    const response = await api.get(`history/${gameId}/turns/${turn}`);
    return response.data;
};

export const useGetResolvedTurn = (gameId: string, turn: number) => {
    return useQuery({
        queryKey: ['history', gameId, 'turns', turn],
        queryFn: () => getResolvedTurn(gameId, turn),
    });
};
