# `@tezos-contrib/react-wallet-provider`

> A react provider for Dapps to easily setup connection to Beacon/Taquito wallets

## Installation

- Npm

```bash
npm install --save @tezos-contrib/react-wallet-provider @airgap/beacon-sdk @taquito/beacon-wallet
```

- Yarn

```bash
yarn add @tezos-contrib/react-wallet-provider @airgap/beacon-sdk @taquito/beacon-wallet
```

## Example usage

```jsx
import { WalletProvider, useWallet } from '@tezos-contrib/react-wallet-provider';

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
