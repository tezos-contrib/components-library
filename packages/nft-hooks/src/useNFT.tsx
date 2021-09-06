import * as React from 'react';
import {
  TezosToolkit,
  MichelCodecPacker,
  ContractAbstraction,
  ContractProvider,
  MichelsonMap,
} from '@taquito/taquito';

export interface UseNFTOptions {
  /**
   * TezosToolkit instance to use.
   * If this is provided then rpcURL and rpcPort and ignored
   */
  tezosToolkit?: TezosToolkit | null;
  /**
   * RPC URL to initialize TezosToolkit
   * Default: https://mainnet.smartpy.io
   */
  rpcURL?: string;
  /**
   * RPC Port to initialize TezosToolkit
   * Default: 443
   */
  rpcPort?: string | number;
  /**
   * Location/BigMap Key of token metadata to use
   * Default: token_metadata
   */
  location?: string;
  /**
   * IPFS Gateway to use
   * Default: https://cloudflare-ipfs.com/ipfs
   */
  ipfsGateWay?: string;
}

export interface UseNFTResult<TData = unknown, TError = unknown> {
  loading: boolean;
  data?: TData[];
  error?: TError;
}

interface NftMapValue {
  token_info: MichelsonMap<string, string>;
}

const RPC_URL = 'https://mainnet.smartpy.io';
const RPC_PORT = 443;
const LOCATION = 'token_metadata';

const DEFAULT_OPTIONS: Required<UseNFTOptions> = {
  tezosToolkit: null,
  rpcURL: RPC_URL,
  rpcPort: RPC_PORT,
  location: LOCATION,
  ipfsGateWay: 'https://cloudflare-ipfs.com/ipfs',
};

const initContract = async (
  tezos: TezosToolkit,
  contractAddress: string,
): Promise<ContractAbstraction<ContractProvider>> => {
  return tezos.contract.at(contractAddress);
};

const fetchIPFS = async <T,>(ipfs: string, ipfsGateWay: string): Promise<T> => {
  const data = await fetch(`${ipfsGateWay}/${ipfs}`);
  return data.json();
};

/**
 *
 * Sourced from: https://github.com/ecadlabs/taquito/blob/master/packages/taquito-utils/src/taquito-utils.ts
 */
const hex2buf = (hex: string): Uint8Array => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return new Uint8Array(hex.match(/[\da-f]{2}/gi)!.map((h) => parseInt(h, 16)));
};

/**
 *
 * Sourced from: https://github.com/ecadlabs/taquito/blob/master/packages/taquito-utils/src/taquito-utils.ts
 */
function bytes2Char(hex: string): string {
  return Buffer.from(hex2buf(hex)).toString('utf8');
}

const resolver = async <T,>(nfts: any, ipfsGateWay: string): Promise<T[]> => {
  const ipfsHash: string[] = [];
  nfts.forEach((value: NftMapValue) => {
    if (value && value.token_info) {
      const ipfsValue = value.token_info.get('');
      if (ipfsValue) {
        ipfsHash.push(bytes2Char(ipfsValue).trim().substr(7));
      }
    }
  });
  return Promise.all(ipfsHash.map((k: string) => fetchIPFS<T>(k, ipfsGateWay)));
};

export function useNFT<TData = unknown, TError = unknown>(
  contract: string,
  assets: (number | string)[],
  options?: UseNFTOptions,
): UseNFTResult<TData, TError> {
  const { tezosToolkit, rpcURL, rpcPort, location, ipfsGateWay } = React.useMemo(
    () => ({ ...options, ...DEFAULT_OPTIONS }),
    [options],
  );

  const [state, setState] = React.useState<UseNFTResult<TData, TError>>({
    loading: true,
  });

  const Tezos: TezosToolkit = React.useMemo(() => {
    if (tezosToolkit) {
      return tezosToolkit;
    }
    const tezos = new TezosToolkit(`${rpcURL}:${rpcPort}`);
    tezos.setPackerProvider(new MichelCodecPacker());
    return tezos;
  }, [tezosToolkit, rpcPort, rpcURL]);

  const ContractStorage = React.useMemo(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return initContract(Tezos, contract).then((resolvedContract: any) => {
      return resolvedContract.storage();
    });
  }, [contract, Tezos]);

  const fetchAssets = React.useCallback(async () => {
    const resolvedContractStorage = await ContractStorage;
    const tokenData = await resolvedContractStorage[location].getMultipleValues(assets);
    try {
      const data = await resolver<TData>(tokenData, ipfsGateWay);
      setState({ loading: false, data, error: undefined });
    } catch (e: unknown) {
      setState({ loading: false, data: undefined, error: e as TError });
    }
  }, [ContractStorage, assets, ipfsGateWay, location]);

  React.useEffect(() => {
    setState({ loading: true, data: state.data, error: undefined });
    fetchAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract, tezosToolkit, rpcURL, rpcPort, location, ipfsGateWay, ...assets]);

  return state;
}
