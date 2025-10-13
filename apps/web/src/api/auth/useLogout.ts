import { useMutation } from '@tanstack/react-query';
import { api } from '..';

export const logout = async (): Promise<void> => {
  try {
    await api.post<void>('auth/logout');
  } catch (error) {
    console.log(error);
  }
};

export const useLogout = () => {
  return useMutation({
    mutationFn: logout,
    mutationKey: ['auth', 'me'],
  });
};
