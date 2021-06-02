import { DAppClient } from '@airgap/beacon-sdk';
import { renderHook } from '@testing-library/react-hooks';
import { WalletProvider, useWallet, useDappClient, useBeaconWallet } from '../src';

test('should create DAppClient with only name', () => {
  const wrapper: React.FC = ({ children }) => (
    <WalletProvider name="example">{children}</WalletProvider>
  );
  const { result } = renderHook(() => useDappClient(), { wrapper });
  expect(result.current?.name).toBe('example');
});

test('should create DAppClient with only name and clientType', () => {
  const wrapper: React.FC = ({ children }) => (
    <WalletProvider name="example" clientType="taquito">
      {children}
    </WalletProvider>
  );
  const { result } = renderHook(() => useDappClient(), { wrapper });
  expect(result.current?.name).toBe('example');
});

test('should create BeaconWallet', () => {
  const wrapper: React.FC = ({ children }) => (
    <WalletProvider name="example" clientType="taquito">
      {children}
    </WalletProvider>
  );
  const { result } = renderHook(() => useBeaconWallet(), { wrapper });
  expect(typeof result.current.getPKH).toBe('function');
});

test('should create DAppClient with only name and network', () => {
  const wrapper: React.FC = ({ children }) => (
    <WalletProvider name="example" network="MAINNET">
      {children}
    </WalletProvider>
  );
  const { result } = renderHook(() => useDappClient(), { wrapper });
  expect(result.current?.name).toBe('example');
});

test('should return wallet details with useWallet', () => {
  const wrapper: React.FC = ({ children }) => (
    <WalletProvider name="example" network="MAINNET">
      {children}
    </WalletProvider>
  );
  const { result } = renderHook(() => useWallet(), { wrapper });
  expect(typeof result.current.connect).toBe('function');
  expect(typeof result.current.disconnect).toBe('function');
  expect(result.current.connected).toBe(false);
  expect(result.current.client instanceof DAppClient).toBe(true);
  expect(result.current.activeAccount).toBeFalsy();
});

test('useDappClient should throw error when using without provider', () => {
  let errorMessage = '';
  try {
    const {
      result: { current },
    } = renderHook(() => useDappClient());
  } catch (error) {
    errorMessage = error;
  }
  expect(errorMessage.toString()).toBe(
    'Error: No DAppClient set, use WalletProvider to create and set one',
  );
});

test('useBeaconWallet should throw error when using without provider', () => {
  let errorMessage = '';
  try {
    const {
      result: { current },
    } = renderHook(() => useBeaconWallet());
  } catch (error) {
    errorMessage = error;
  }
  expect(errorMessage.toString()).toBe(
    'Error: No BeaconWallet set, use WalletProvider to create and set one',
  );
});

test('useBeaconWallet should throw error when using with wrong clientType prop', () => {
  const wrapper: React.FC = ({ children }) => (
    <WalletProvider name="example">{children}</WalletProvider>
  );
  let errorMessage = '';
  try {
    const {
      result: { current },
    } = renderHook(() => useBeaconWallet(), { wrapper });
  } catch (error) {
    errorMessage = error;
  }
  expect(errorMessage.toString()).toBe(
    'Error: Provider was initialized with clientType: beacon. Initialize provider with clientType: taquito',
  );
});
