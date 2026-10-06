import { useEffect, useState } from "react";
import { songsService } from "../services/songs";
import type { Song } from "../types";

// Always fetches the single document, so a freshly saved song shows up-to-date.
export function useSong(id: string | undefined) {
  const [song, setSong] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    songsService
      .getSong(id)
      .then((s) => !cancelled && setSong(s))
      .catch((e) => {
        console.error("Error fetching song:", e);
        if (!cancelled) setError("Could not load the song");
      })
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { song, isLoading, error };
}
