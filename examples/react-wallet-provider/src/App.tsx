import React from 'react';
import logo from './logo.svg';
import './App.css';
import { useWallet } from '@tezos-contrib/react-wallet-provider';

function App() {
  const { client, connected, activeAccount, connect, disconnect } = useWallet('DELPHINET');
  console.log(client, connected, activeAccount);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div onClick={connect}>Connect</div>
        <div onClick={disconnect}>Disconnect</div>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
