import { useCallback, useEffect, useState } from "react";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) {
      return fallback;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      // The old Vue app (@vueuse) stored strings unquoted, e.g. notation = i.
      return typeof fallback === "string" ? (raw as T) : fallback;
    }
  } catch {
    return fallback;
  }
}

export function useLocalStorage<T>(key: string, fallback: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => read(key, fallback));

  useEffect(() => {
    setValue(read(key, fallback));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const set = useCallback(
    (next: T) => {
      setValue(next);
      localStorage.setItem(key, JSON.stringify(next));
    },
    [key],
  );

  return [value, set];
}
