import { toRomanNumeralNotation } from "./to_roman_numeral";
import { type LineToken } from "./chords";

export function addChordIndexes(
  song: LineToken[],
  key: string | undefined,
): LineToken[] {
  if (!key) {
    return song;
  }

  return song.map((line) => {
    if (line.type === "chordsAndLyricsLine") {      
      return {
        ...line,
        value: line.value.map((v) => {
          if (!v.chord) {
            return { ...v };
          }

          return {
            ...v,            
            romanNumeral: toRomanNumeralNotation(v.chord, key),
          };
        }),
      };
    }

    if (line.type === "chordsLine") {
      return {
        ...line,
        value: line.value.map((chord) => {
          return {
            ...chord,            
            romanNumeral: toRomanNumeralNotation(chord.chord, key),
          };
        }),
      };
    } else {
      return line;
    }
  });
}
