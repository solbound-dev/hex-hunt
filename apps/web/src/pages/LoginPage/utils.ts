import type { WalletName, WalletReadyState } from '@solana/wallet-adapter-base';

interface ISolanaWallet {
  adapter: {
    name: string;
  };
  readyState: WalletReadyState;
}

const isSolanaWalletInstalled = (
  wallets: ISolanaWallet[],
  adapterName: string,
) =>
  wallets.find((wallet) => wallet.adapter.name === adapterName)?.readyState ===
  'Installed';

export type WalletOption = {
  name: string;
  adapterName: WalletName;
  isDisabled: (wallets: ISolanaWallet[]) => boolean;
} & ({ isMobile: false } | { isMobile: true; deepLinkBase: string });

export const walletOptions: WalletOption[] = [
  {
    name: 'Phantom',
    adapterName: 'Phantom' as WalletName<'Phantom'>,
    isMobile: false,
    isDisabled: (w) => !isSolanaWalletInstalled(w, 'Phantom'),
  },
  {
    name: 'Solflare',
    adapterName: 'Solflare' as WalletName<'Solflare'>,
    isMobile: false,
    isDisabled: (w) => !isSolanaWalletInstalled(w, 'Solflare'),
  },
];
