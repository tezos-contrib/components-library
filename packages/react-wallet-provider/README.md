# `@tezos-contrib/react-wallet-provider`

> A react provider for Dapps to easily setup connection to Beacon/Taquito wallets

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
