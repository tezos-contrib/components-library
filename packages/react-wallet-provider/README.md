# `@tz-contrib/react-wallet-provider`

> A react provider for Dapps to easily setup connection to Beacon/Taquito wallets

![npm (scoped)](https://img.shields.io/npm/v/@tz-contrib/react-wallet-provider?style=for-the-badge)
![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@tz-contrib/react-wallet-provider?style=for-the-badge)

## Installation

- Npm

```bash
npm install --save @tz-contrib/react-wallet-provider @airgap/beacon-sdk @taquito/beacon-wallet
```

- Yarn

```bash
yarn add @tz-contrib/react-wallet-provider @airgap/beacon-sdk @taquito/beacon-wallet
```

## Example usage

```jsx
import { WalletProvider, useWallet } from '@tz-contrib/react-wallet-provider';

export default function App() {
  return (
    <WalletProvider name="my-example-app" clientType="beacon">
      <Example />
    </WalletProvider>
  );
}

function Example() {
  const { connected, activeAccount, connect, disconnect } = useWallet();
  return (
    <div>
      <header>
        {!connected && <button onClick={connect}>Connect</button>}
        {connected && (
          <button onClick={disconnect}>Disconnect from {activeAccount?.address}</button>
        )}
      </header>
    </div>
  );
}
```
