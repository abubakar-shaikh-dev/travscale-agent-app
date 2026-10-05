// React
import { useState } from "react";

/**
 * Previous-render value cache. Used to derive the wizard's slide direction
 * from step index transitions. Implemented with the React-endorsed
 * "adjust state during render" pattern so no ref is read during render.
 */
export function usePrevious<T>(value: T): T | undefined {
  const [previous, setPrevious] = useState<T | undefined>(undefined);
  const [current, setCurrent] = useState(value);

  if (current !== value) {
    setPrevious(current);
    setCurrent(value);
  }

  return previous;
}
