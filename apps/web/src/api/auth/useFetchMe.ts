import { api } from '..';

type Wallet = {
  id: string;
  loginNonce: string;
};

export const fetchMe = async () => {
  const response = await api.get<Wallet>('auth/me');

  return response.data;
};
