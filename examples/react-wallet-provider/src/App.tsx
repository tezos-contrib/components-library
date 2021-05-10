import './App.css';
import { useWallet } from '@tz-contrib/react-wallet-provider';

function App() {
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

export default App;
