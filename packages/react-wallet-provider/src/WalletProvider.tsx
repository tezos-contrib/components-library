import React, { useState } from 'react';
import {
  DAppClient,
  NetworkType,
  DAppClientOptions,
  PermissionScope,
  AccountInfo,
} from '@airgap/beacon-sdk';
import { BeaconWallet } from '@taquito/beacon-wallet';

type Network = keyof typeof NetworkType;
type Client = DAppClient | BeaconWallet;
type ClientType = 'beacon' | 'taquito';
interface ContextType {
  client: Client;
  clientType: ClientType;
}

interface WalletProviderProps extends Omit<DAppClientOptions, 'preferredNetwork'> {
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

const DAppContext = React.createContext<ContextType | undefined>(undefined);

/**
 * React hook to get the instance of DAppClient (from @airgap/beacon-sdk)
 * @returns DAppClient
 */
const useDappClient = (): DAppClient => {
  const context = React.useContext(DAppContext);
  if (!context) {
    throw new Error('No DAppClient set, use WalletProvider to create and set one');
  }
  const { client, clientType } = context;
  const dappClient: DAppClient =
    clientType === 'taquito' ? (client as BeaconWallet).client : (client as DAppClient);
  return dappClient;
};

/**
 * React hook to get the instance of BeaconWallet (from @taquito/beacon-wallet)
 * @returns BeaconWallet
 */
const useBeaconWallet = (): BeaconWallet => {
  const context = React.useContext(DAppContext);
  if (!context) {
    throw new Error('No BeaconWallet set, use WalletProvider to create and set one');
  }
  if (context.clientType === 'beacon') {
    throw new Error(
      `Provider was initialized with clientType: ${context.clientType}. Initialize provider with clientType: taquito`,
    );
  }
  return context.client as BeaconWallet;
};

/**
 * Connect to the wallet
 * @param client DAppClient
 * @param network Network (optional)
 * @param rpcUrl string (optional)
 * @param networkName string (optional)
 * @param activeAccount AccountInfo (optional)
 * @returns Promise<AccountInfo | undefined>
 */
export const connectWallet = async (
  client: DAppClient,
  network?: Network,
  rpcUrl?: string,
  networkName?: string,
  activeAccount?: AccountInfo | null,
): Promise<AccountInfo | undefined> => {
  const connectTo = network ? NetworkType[network] : client.preferredNetwork ?? NetworkType.MAINNET;
  let account = activeAccount ?? (await client.getActiveAccount());
  const opsRequest = account
    ? account.scopes.includes(PermissionScope.OPERATION_REQUEST)
    : undefined;
  const signRequest = account ? account.scopes.includes(PermissionScope.SIGN) : undefined;
  if (!opsRequest || !signRequest) {
    await client.requestPermissions({
      network: { type: connectTo, name: networkName, rpcUrl },
    });
    account = await client.getActiveAccount();
  }
  localStorage.setItem('provider:wallet-connected', 'true');
  return account;
};

/**
 * Disconnect from the wallet
 * @param client DAppClient
 */
export const disconnectWallet = async (client: DAppClient): Promise<void> => {
  await client.destroy();
  localStorage.removeItem('provider:wallet-connected');
};

/**
 * Sets up the wallet and returns
 * @param network Network (optional)
 * @param rpcUrl string (optional)
 * @param networkName string (optional)
 * @returns WalletResult
 */
const useWallet = (network?: Network, rpcUrl?: string, networkName?: string): WalletResult => {
  const client = useDappClient();
  const [state, setState] = React.useState<{
    connected: boolean;
    activeAccount?: AccountInfo | null;
  }>({
    connected: false,
    activeAccount: null,
  });

  React.useEffect(() => {
    setState({
      connected: localStorage.getItem('provider:wallet-connected') === 'true',
    });
  }, []);

  const connect = React.useCallback(async () => {
    const account = await connectWallet(client, network, rpcUrl, networkName, state.activeAccount);
    if (account) {
      setState({
        connected: true,
        activeAccount: account,
      });
    }
  }, [client, state.activeAccount, network, rpcUrl, networkName]);
  const disconnect = React.useCallback(async () => {
    await disconnectWallet(client);
    setState({
      connected: false,
      activeAccount: null,
    });
  }, [client]);

  React.useEffect(() => {
    state.connected && connect();
  }, [state.connected]);

  return {
    client,
    connect,
    disconnect,
    ...state,
  };
};

/**
 * WalletProvider
 */
const WalletProvider: React.FC<WalletProviderProps> = ({
  children,
  clientType = 'beacon',
  network,
  ...rest
}) => {
  const options = { ...rest, preferredNetwork: network ? NetworkType[network] : undefined };
  const [client] = useState<Client>(
    clientType === 'beacon' ? new DAppClient(options) : new BeaconWallet(options),
  );
  return (
    <DAppContext.Provider
      value={{
        client,
        clientType,
      }}
    >
      {children}
    </DAppContext.Provider>
  );
};

export { WalletProvider, useBeaconWallet, useDappClient, useWallet };
export type { WalletProviderProps, WalletResult };
