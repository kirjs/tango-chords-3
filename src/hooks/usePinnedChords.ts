import { useCallback, useState } from "react";
import { transposeChord } from "../chords/chords";

export interface PinnedChord {
  /** As currently shown, i.e. in the current key. */
  name: string;
  /** Which shape was showing when it was pinned. */
  voicing: number;
}

/**
 * Chords pinned beside the sheet while a song is open. They're stored as
 * written (shift 0) so they follow the song when it's transposed.
 */
export function usePinnedChords(shift: number) {
  const [pins, setPins] = useState<{ written: string; voicing: number }[]>([]);

  // No-op at shift 0: transposeChord would also respell names (Bb → Hb).
  const toWritten = useCallback(
    (shown: string) => (shift === 0 ? shown : transposeChord(shown, 12 - shift)),
    [shift],
  );
  const toShown = (written: string) => (shift === 0 ? written : transposeChord(written, shift));

  const pinned: PinnedChord[] = pins.map((p) => ({ name: toShown(p.written), voicing: p.voicing }));

  const isPinned = useCallback(
    (shown: string) => pins.some((p) => p.written === toWritten(shown)),
    [pins, toWritten],
  );

  const togglePin = useCallback(
    (shown: string, voicing = 0) => {
      const written = toWritten(shown);
      setPins((ps) =>
        ps.some((p) => p.written === written)
          ? ps.filter((p) => p.written !== written)
          : [...ps, { written, voicing }],
      );
    },
    [toWritten],
  );

  const setVoicing = useCallback(
    (shown: string, voicing: number) => {
      const written = toWritten(shown);
      setPins((ps) => ps.map((p) => (p.written === written ? { ...p, voicing } : p)));
    },
    [toWritten],
  );

  return { pinned, isPinned, togglePin, setVoicing };
}

export type PinnedChords = ReturnType<typeof usePinnedChords>;
