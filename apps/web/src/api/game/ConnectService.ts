import type { PublicKey } from '@solana/web3.js';
import { api } from '..';
import bs58 from 'bs58';
import { sign } from 'tweetnacl';

interface GetAuthWithMessageRequest {
  walletAddress: string;
  signature: string;
}

interface GetMessageRequest {
  walletAddress: string;
}

interface GetMessageResponse {
  message: string;
}

export const authorizeWalletWithMessage = async (
  request: GetAuthWithMessageRequest,
): Promise<void> => {
  const { walletAddress, signature } = request;
  console.log('authorizeWalletWithMessage');
  await api.get(`auth/message-login/${walletAddress}/${signature}`);
};

export const createMessageSignature = async (
  publicKey: PublicKey,
  signMessage: (message: Uint8Array) => Promise<Uint8Array>,
  message: string | undefined,
): Promise<string> => {
  if (!message) throw new Error('Authentication message does not exist!');

  const encodedMessage = new TextEncoder().encode(message);
  const signature = await signMessage(encodedMessage);
  if (!sign.detached.verify(encodedMessage, signature, publicKey.toBytes()))
    throw new Error('Invalid signature!');
  const signedB58Signature = bs58.encode(signature);

  return signedB58Signature;
};

export const requestMessage = async (
  request: GetMessageRequest,
): Promise<GetMessageResponse> => {
  const response = await api.get<GetMessageResponse>(
    `auth/request-message/${request.walletAddress}`,
  );
  return response.data;
};
