import 'isomorphic-fetch';
import { renderHook } from '@testing-library/react-hooks';
import { useNFT } from '../src';

window.fetch = fetch;

test('should fetch NFTs', async () => {
  const { result, waitForValueToChange } = renderHook(() =>
    useNFT('KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton', ['270248', '270560']),
  );
  expect(result.current.loading).toBe(true);
  await waitForValueToChange(() => result.current.loading, { interval: 50000, timeout: 100000 });
  expect(result.current.loading).toBe(false);
  expect(result.current.data?.length).toBe(2);
}, 100000);
