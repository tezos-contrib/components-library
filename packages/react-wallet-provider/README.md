# `@tezos-contrib/react-wallet-provider`

> A react provider for Dapps to easily setup connection to Beacon/Taquito wallets

## Example usage

```jsx
import { WalletProvider, useWallet } from '@tezos-contrib/react-wallet-provider';

export default function App() {
  return (
    <WalletProvider name="my-example-app" clientType="beacon">
      <App />
    </WalletProvider>
  );
}

function Example() {
  const { connected, activeAccount, connect, disconnect } = useWallet();
  return (
    <div className="App">
      <header className="App-header">
        {!connected && (
          <button className="button button--primary" onClick={connect}>
            Connect
          </button>
        )}
        {connected && (
          <button className="button button--secondary" onClick={disconnect}>
            Disconnect from {activeAccount?.address}
          </button>
        )}
      </header>
    </div>
  );
}
```
