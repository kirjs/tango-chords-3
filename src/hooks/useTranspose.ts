import { useMemo } from "react";
import { analyzeSong } from "../chords/analysis";
import { getChordIndex, parseChords, transpose, transposeChord, type LineToken } from "../chords/chords";
import { tagLines } from "../chords/tag_lines";
import type { Song } from "../types";
import { useLocalStorage } from "./useLocalStorage";

export interface KeyOption {
  /** Semitones up from the written key, 0–11. */
  shift: number;
  label: string;
  /** Average chord difficulty in this key, 1 (easy) to 4 (hard). */
  score?: number;
}

function relativeLabel(shift: number) {
  if (shift === 0) return "±0";
  return shift <= 6 ? `+${shift}` : `−${12 - shift}`;
}

// Same localStorage key as the previous app, so saved transpositions carry over.
export function useTranspose(song: Song) {
  const [shift, setShift] = useLocalStorage(`shift-${song.slug}`, 0);
  const songKey = song.data.key || undefined;

  // The parser rejects empty text; a song can be saved without a body.
  const parsedSong = useMemo(
    () => (song.body.trim() ? parseChords({ text: song.body }) : []),
    [song.body],
  );

  const transposedSong = useMemo(
    () => transpose(tagLines(parsedSong), shift) as LineToken[],
    [parsedSong, shift],
  );

  // Difficulty of every transposition. Unknown chords make the analysis
  // throw; then there are simply no scores and no easiest key.
  const analysis = useMemo(() => {
    try {
      const result = analyzeSong(parsedSong, "Am");
      return Number.isFinite(result.bestKey.score) ? result : null;
    } catch {
      return null;
    }
  }, [parsedSong]);

  /** Shift (from the written key) whose chords are easiest to play. */
  const easiestShift = analysis?.bestKey.shift ?? null;

  // All 12 keys: by name in chromatic order from C when the song has a key,
  // otherwise as semitone offsets from −5 to +6.
  const keyOptions = useMemo<KeyOption[]>(() => {
    const options = Array.from({ length: 12 }, (_, s) => ({
      shift: s,
      label: songKey ? transposeChord(songKey, s) : relativeLabel(s),
      score: analysis?.allKeys.find((k) => k.shift === s)?.score,
    }));
    return songKey
      ? options.sort((a, b) => getChordIndex(a.label) - getChordIndex(b.label))
      : options.sort((a, b) => ((a.shift + 5) % 12) - ((b.shift + 5) % 12));
  }, [songKey, analysis]);

  const current = keyOptions.find((o) => o.shift === shift) ?? keyOptions[0]!;

  return {
    shift,
    setShift,
    currentLabel: current.label,
    keyOptions,
    easiestShift,
    transposedSong,
  };
}

export type TransposeState = ReturnType<typeof useTranspose>;
