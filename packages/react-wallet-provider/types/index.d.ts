import { DAppClient, NetworkType, DAppClientOptions, AccountInfo } from '@airgap/beacon-sdk';
declare type Network = keyof typeof NetworkType;
export interface WalletProviderProps extends Omit<DAppClientOptions, 'preferredNetwork'> {
  network?: Network;
}
interface WalletResult {
  client: DAppClient;
  activeAccount?: AccountInfo | null;
  connected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}
export declare const useDappClient: () => DAppClient;
export declare const useWallet: (
  network?: Network,
  rpcUrl?: string,
  networkName?: string,
) => WalletResult;
export declare const WalletProvider: React.FC<WalletProviderProps>;
