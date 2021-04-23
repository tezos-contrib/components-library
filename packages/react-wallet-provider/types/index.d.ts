import { DAppClient, NetworkType, DAppClientOptions, AccountInfo } from '@airgap/beacon-sdk';
import { BeaconWallet } from '@taquito/beacon-wallet';
declare type Network = keyof typeof NetworkType;
declare type ClientType = 'beacon' | 'taquito';
export interface WalletProviderProps extends Omit<DAppClientOptions, 'preferredNetwork'> {
  network?: Network;
  clientType?: ClientType;
}
interface WalletResult {
  client: DAppClient;
  activeAccount?: AccountInfo | null;
  connected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}
export declare const useDappClient: () => DAppClient;
export declare const useBeaconWallet: () => BeaconWallet;
export declare const useWallet: (
  network?: Network,
  rpcUrl?: string,
  networkName?: string,
) => WalletResult;
export declare const WalletProvider: React.FC<WalletProviderProps>;
