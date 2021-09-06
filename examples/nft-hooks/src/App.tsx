import React from 'react';
import { useNFT } from '@tezos-contrib/nft-hooks';
import './App.css';

function App() {
  const { data, loading } = useNFT('KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton', ['270248', '270560']);
  return (
    <div className="App">
      {loading && <p>Loading...</p>}
      {!loading && data && data.map((item: any) => <p>{item.name}</p>)}
    </div>
  );
}
export default App;
