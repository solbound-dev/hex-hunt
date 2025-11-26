import { useQuery } from '@tanstack/react-query';
import { api } from '..';
import type { AxiosError } from 'axios';
import type { GameData } from '../../utils/GameData';

const getResolvedTurn = async (gameId: string, turn: number) => {
    const response = await api.get<GameData>(`history/${gameId}/turns/${turn}`);
    return response.data;
};

export const useGetResolvedTurn = (gameId: string, turn: number) => {
    const result = useQuery<
        GameData,
        AxiosError<{ message: string; statusCode: number }>
    >({
        queryKey: ['history', gameId, 'turns', turn],
        queryFn: () => getResolvedTurn(gameId, turn),
        retry: false,
        enabled: !!gameId,
    });

    return result;
};
