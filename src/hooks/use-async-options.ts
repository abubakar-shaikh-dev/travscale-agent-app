// React
import { useEffect, useState } from "react";

interface AsyncOptionsState<T> {
  data: T | null;
  isPending: boolean;
}

interface AsyncOptionsFullState<T> {
  key: string;
  data: T | null;
  isPending: boolean;
}

/**
 * Minimal async loader hook for cached dataset access (lib/geo). The key
 * doubles as the effect dependency, so callers encode their inputs in it:
 *   useAsyncOptions(`states:${country}`, () => getStateOptions(country))
 *
 * A key change resets synchronously during render (the React-endorsed
 * "adjust state when a prop changes" pattern) and results are guarded
 * against unmount and out-of-order completions.
 */
export function useAsyncOptions<T>(
  key: string,
  loader: () => Promise<T>
): AsyncOptionsState<T> {
  const [state, setState] = useState<AsyncOptionsFullState<T>>({
    key,
    data: null,
    isPending: true,
  });

  const [prevKey, setPrevKey] = useState(key);
  if (prevKey !== key) {
    setPrevKey(key);
    setState({ key, data: null, isPending: true });
  }

  useEffect(() => {
    let alive = true;
    loader()
      .then((data) => {
        if (alive) setState({ key, data, isPending: false });
      })
      .catch(() => {
        if (alive) setState({ key, data: null, isPending: false });
      });
    return () => {
      alive = false;
    };
    // The key encodes every input the loader reads; the loader closure is
    // recreated each render on purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return {
    data: state.key === key ? state.data : null,
    isPending: state.key === key ? state.isPending : true,
  };
}
