import React from 'react';
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
  client: Client | undefined;
  clientType: ClientType;
  resetClient: () => void;
}

interface WalletProviderProps extends Omit<DAppClientOptions, 'preferredNetwork'> {
  network?: Network;
  clientType?: ClientType;
}

interface WalletResult {
  client: DAppClient | undefined;
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
const useDappClient = (): DAppClient | undefined => {
  const context = React.useContext(DAppContext);
  if (!context) {
    throw new Error('No DAppClient set, use WalletProvider to create and set one');
  }
  const { client, clientType } = context;
  if (typeof client === 'undefined') {
    return client;
  }
  const dappClient: DAppClient =
    clientType === 'taquito' ? (client as BeaconWallet).client : (client as DAppClient);
  return dappClient;
};

/**
 * React hook to get reset client method from provider
 */
const useResetClient = (): ContextType['resetClient'] => {
  const context = React.useContext(DAppContext);
  if (!context) {
    throw new Error('No DAppClient set, use WalletProvider to create and set one');
  }
  const { resetClient } = context;
  return resetClient;
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
    localStorage.setItem('provider:wallet-connected', 'true');
  }

  return account;
};

/**
 * Disconnect from the wallet
 * @param client DAppClient
 */
export const disconnectWallet = async (client: DAppClient): Promise<void> => {
  localStorage.removeItem('provider:wallet-connected');
  await client.destroy();
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
  const reset = useResetClient();
  const [connected, setConnected] = React.useState(false);
  const [accountInfo, setAccountInfo] = React.useState<AccountInfo | undefined>(undefined);
  React.useEffect(() => {
    const getAccountInfo = async () => {
      const activeAccount = await client?.getActiveAccount();
      setAccountInfo(activeAccount);
    };
    getAccountInfo();
  }, [connected, client]);

  const connect = React.useCallback(async () => {
    const account =
      client && (await connectWallet(client, network, rpcUrl, networkName, accountInfo));
    if (account) {
      setConnected(true);
    }
  }, [accountInfo, client, network, networkName, rpcUrl]);
  const disconnect = React.useCallback(async () => {
    if (client) {
      await disconnectWallet(client);
      reset();
      setConnected(false);
    }
  }, [client, reset, connected]);

  React.useEffect(() => {
    if (connected) {
      connect();
    }
  }, []);

  return {
    client,
    connect,
    disconnect,
    activeAccount: accountInfo,
    connected: localStorage.getItem('provider:wallet-connected') === 'true',
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
  const options = React.useMemo(
    () => ({ ...rest, preferredNetwork: network ? NetworkType[network] : undefined }),
    [network, rest],
  );
  const [client, setClient] = React.useState<Client | undefined>(undefined);
  const setNewClient = React.useCallback(() => {
    const newClient = clientType === 'beacon' ? new DAppClient(options) : new BeaconWallet(options);
    setClient(newClient);
  }, [clientType, options]);
  React.useEffect(() => {
    if (typeof client === 'undefined') {
      setNewClient();
    }
  }, [client, setNewClient]);
  return (
    <DAppContext.Provider
      value={{
        client,
        clientType,
        resetClient: setNewClient,
      }}
    >
      {children}
    </DAppContext.Provider>
  );
};

export { WalletProvider, useBeaconWallet, useDappClient, useWallet };
export type { WalletProviderProps, WalletResult };
