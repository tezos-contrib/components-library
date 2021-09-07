# `@tezos-contrib/nft-hooks`

> React hooks to fetch NFTs on Tezos

## Installation

- Npm

```bash
npm install --save @tezos-contrib/nft-hooks @taquito/taquito
```

- Yarn

```bash
yarn add @tezos-contrib/nft-hooks @taquito/taquito
```

## Example usage

```jsx
import { useNFT } from '@tezos-contrib/nft-hooks';

export default function App() {
  const { data, error, loading } = useNFT('KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton', [
    '270248',
    '270560',
  ]);
  return (
    <div>
      {loading && <p>Loading...</p>}
      {!loading && data && data.map((item) => <p>{item.name}</p>)}
    </div>
  );
}
```
