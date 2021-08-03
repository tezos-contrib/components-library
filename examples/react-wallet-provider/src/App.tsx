import './App.css';
import { useWallet } from '@tezos-contrib/react-wallet-provider';

const AddressComponent: React.FC = () => {
  const { activeAccount } = useWallet();
  return <>{activeAccount?.address}</>;
};

function App() {
  const { connected, connect, disconnect } = useWallet();
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
            Disconnect from <AddressComponent />
          </button>
        )}
      </header>
    </div>
  );
}

export default App;
