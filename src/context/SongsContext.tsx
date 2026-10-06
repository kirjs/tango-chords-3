import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { songsService } from "../services/songs";
import type { Song } from "../types";

interface SongsState {
  songs: Song[];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

const SongsContext = createContext<SongsState | null>(null);

// Loaded once and shared, so the header search and the song list don't refetch.
export function SongsProvider({ children }: { children: ReactNode }) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await songsService.getAllSongs();
      setSongs(result.sort((a, b) => a.data.title.localeCompare(b.data.title)));
    } catch (e) {
      console.error("Error fetching songs:", e);
      setError("Failed to load songs.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <SongsContext.Provider value={{ songs, isLoading, error, reload }}>{children}</SongsContext.Provider>
  );
}

export function useSongs(): SongsState {
  const ctx = useContext(SongsContext);
  if (!ctx) {
    throw new Error("useSongs must be used inside <SongsProvider>");
  }
  return ctx;
}
