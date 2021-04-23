import React, { useState } from 'react';
import {
  DAppClient,
  NetworkType,
  DAppClientOptions,
  PermissionScope,
  AccountInfo,
} from '@airgap/beacon-sdk';

type Network = keyof typeof NetworkType;

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

const DAppContext = React.createContext<DAppClient | undefined>(undefined);

export const useDappClient = (): DAppClient => {
  const dappClient = React.useContext(DAppContext);
  if (!dappClient) {
    throw new Error('No DAppClient set, use WalletProvider to create and set one');
  }
  return dappClient;
};

export const connectWallet = async (
  client: DAppClient,
  network?: Network,
  rpcUrl?: string,
  networkName?: string,
  activeAccount?: AccountInfo | null,
): Promise<AccountInfo | undefined> => {
  const connectTo = network ? NetworkType[network] : client.preferredNetwork ?? NetworkType.MAINNET;
  const account = activeAccount ?? (await client.getActiveAccount());
  const opsRequest = account
    ? account.scopes.includes(PermissionScope.OPERATION_REQUEST)
    : undefined;
  const signRequest = account ? account.scopes.includes(PermissionScope.SIGN) : undefined;
  if (!opsRequest || !signRequest) {
    await client.requestPermissions({
      network: { type: connectTo, name: networkName, rpcUrl },
    });
  }
  localStorage.setItem('provider:wallet-connected', 'true');
  return account;
};

export const disconnectWallet = async (client: DAppClient): Promise<void> => {
  await client.destroy();
  localStorage.removeItem('provider:wallet-connected');
};

export const useWallet = (
  network?: Network,
  rpcUrl?: string,
  networkName?: string,
): WalletResult => {
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

export const WalletProvider: React.FC<WalletProviderProps> = ({ children, network, ...rest }) => {
  const [client] = useState<DAppClient | undefined>(
    new DAppClient({ ...rest, preferredNetwork: network ? NetworkType[network] : undefined }),
  );
  return <DAppContext.Provider value={client}>{children}</DAppContext.Provider>;
};
