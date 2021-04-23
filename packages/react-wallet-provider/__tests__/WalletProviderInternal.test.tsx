import { PermissionScope } from '@airgap/beacon-sdk';
import { waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { connectWallet, disconnectWallet } from '../src/WalletProvider';

it('should invoke client.destroy', () => {
  const mockDestroy = jest.fn();
  const mockClient = {
    destroy: mockDestroy,
  };
  disconnectWallet(mockClient as any);
  expect(mockDestroy).toHaveBeenCalledTimes(1);
});

it('should try to connect to wallet', async () => {
  const fakeActiveAccount = {
    address: '111',
    scopes: [],
  };
  const mockRequestPermissions = jest.fn().mockResolvedValue({});
  const mockGetActiveAccount = jest.fn().mockResolvedValue(fakeActiveAccount);
  const mockClient = {
    getActiveAccount: mockGetActiveAccount,
    requestPermissions: mockRequestPermissions,
  };
  await waitFor(() => {
    connectWallet(mockClient as any);
  });
  expect(mockGetActiveAccount).toHaveBeenCalledTimes(2);
  expect(mockRequestPermissions).toHaveBeenCalled();
});

it('should not try to connect to wallet when scopes are already present', async () => {
  const fakeActiveAccount = {
    address: '111',
    scopes: [PermissionScope.SIGN, PermissionScope.OPERATION_REQUEST],
  };
  const mockRequestPermissions = jest.fn().mockResolvedValue({});
  const mockGetActiveAccount = jest.fn().mockResolvedValue(fakeActiveAccount);
  const mockClient = {
    getActiveAccount: mockGetActiveAccount,
    requestPermissions: mockRequestPermissions,
  };
  await waitFor(() => {
    connectWallet(mockClient as any);
  });
  expect(mockGetActiveAccount).toHaveBeenCalledTimes(1);
  expect(mockRequestPermissions).toHaveBeenCalledTimes(0);
});
