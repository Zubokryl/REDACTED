import { useMemo } from 'react';

export function useRandomWidths(count: number, min = 5, max = 20) {
  return useMemo(() => (
    Array.from({ length: count }, () => Math.random() * (max - min) + min)
  ), [count, min, max]);
}