import { useMemo } from "react";
import { analyzeSong } from "../chords/analysis";
import { addChordIndexes } from "../chords/add_chord_indexes";
import {
  calcKeyDifference,
  isMajorKey,
  isMinorKey,
  parseChords,
  transpose,
  transposeChord,
  type LineToken,
} from "../chords/chords";
import { castExists } from "../chords/asserts";
import { tagLines } from "../chords/tag_lines";
import type { Song } from "../types";
import { useLocalStorage } from "./useLocalStorage";

export type Notation = "A" | "i";

// Same localStorage keys as the previous app, so saved transpositions carry over.
export function useTranspose(song: Song) {
  const [shift, setShift] = useLocalStorage(`shift-${song.slug}`, 0);
  const [notation, setNotation] = useLocalStorage<Notation>(`notation-${song.slug}`, "A");
  const songKey = song.data.key || undefined;

  const parsedSong = useMemo(() => parseChords({ text: song.body }), [song.body]);

  const key = songKey ? transposeChord(songKey, shift) : undefined;

  const transposedSong = useMemo(() => {
    const withIndexes = addChordIndexes(tagLines(parsedSong), songKey);
    return transpose(withIndexes, shift) as LineToken[];
  }, [parsedSong, songKey, shift]);

  const magicKey = useMemo(() => {
    const { bestKey } = analyzeSong(transposedSong, "Am");
    return {
      chordName: key ? transposeChord(key, bestKey.shift) : undefined,
      ...bestKey,
    };
  }, [transposedSong, key]);

  let simpleKeys: string[] = [];
  if (key && isMajorKey(key)) {
    simpleKeys = ["C", "G"].filter((c) => c !== magicKey.chordName);
  } else if (key && isMinorKey(key)) {
    simpleKeys = ["Am", "Em"].filter((c) => c !== magicKey.chordName);
  }

  const transposeTones = (n: number) => setShift((shift + n + 12) % 12);
  const transposeToKey = (newKey: string) =>
    transposeTones(calcKeyDifference(castExists(key), newKey));

  const displayChord = (regular: string, roman: string | undefined) =>
    notation === "A" ? regular : roman || "";

  return {
    shift,
    key,
    notation,
    setNotation,
    transposedSong,
    magicKey,
    simpleKeys,
    transposeTones,
    transposeToKey,
    displayChord,
  };
}

export type TransposeState = ReturnType<typeof useTranspose>;
