// Looks up guitar fingerings for the chord names used in songs, using
// @tombatossals/chords-db. The data (~236 KB of JSON, ~26 KB gzipped) is
// fetched as a plain file on first use; importing it as a module would make
// Vite's dev server send it as ~2 MB of JavaScript.
import chordDbUrl from "@tombatossals/chords-db/lib/guitar.json?url";

export interface Position {
  /** Per string, low E to high e: -1 muted, 0 open, n = fret (relative to baseFret). */
  frets: number[];
  /** Per string: 0 none, 1–4 finger. */
  fingers: number[];
  baseFret: number;
  /** Frets (relative) played as a barre. */
  barres: number[];
}

interface ChordEntry {
  key: string;
  suffix: string;
  positions: Position[];
}

export interface ChordDb {
  chords: Record<string, ChordEntry[]>;
}

export interface ChordLookup {
  positions: Position[];
  /** Set when the slash chord's exact shape isn't in the database. */
  bass?: string;
}

let dbPromise: Promise<ChordDb> | null = null;

/** Loads the chord data once; after a failure the next call tries again. */
export function loadChordDb(): Promise<ChordDb> {
  dbPromise ??= fetch(chordDbUrl)
    .then((res) => {
      if (!res.ok) throw new Error(`Chord data: HTTP ${res.status}`);
      return res.json() as Promise<ChordDb>;
    })
    .catch((error) => {
      dbPromise = null;
      throw error;
    });
  return dbPromise;
}

// Song notation (H = B, sharps) → the database's key names (flats for Eb/Ab/Bb).
const NOTE_TO_INDEX: Record<string, number> = {
  C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, Fb: 4, "E#": 5, F: 5, "F#": 6, Gb: 6,
  G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11, H: 11, Cb: 11, "B#": 0, "H#": 0,
};
const DB_KEYS = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
// Bass notes in slash suffixes use these spellings.
const DB_BASS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "Bb", "B"];

const dbKey = (index: number) => DB_KEYS[index]!.replace("#", "sharp");

const SUFFIX_ALIASES: Record<string, string> = {
  "": "major",
  maj: "major",
  m: "minor",
  min: "minor",
  "-": "minor",
  "+": "aug",
  "°": "dim",
  ø: "m7b5",
  "7+": "aug7",
  sus: "sus4",
};

/** "F#m7/A" → { root: 6, suffix: "m7", bass: 9, bassName: "A" } */
export function parseChordName(name: string) {
  const m = name.trim().match(/^([A-H])([#b]?)([^/]*)(?:\/([A-H])([#b]?))?$/);
  if (!m) return null;
  const root = NOTE_TO_INDEX[m[1]! + m[2]!];
  const bassName = m[4] ? m[4] + m[5]! : undefined;
  const bass = bassName ? NOTE_TO_INDEX[bassName] : undefined;
  if (root === undefined) return null;
  return { root, suffix: m[3]!, bass, bassName };
}

// Power chord: root and fifth (plus octave) on the low strings; the database
// has none.
function powerChord(root: number): Position {
  const onE = (root - 4 + 12) % 12;
  if (onE === 0) {
    return { frets: [0, 2, 2, -1, -1, -1], fingers: [0, 1, 2, 0, 0, 0], baseFret: 1, barres: [] };
  }
  if (onE <= 7) {
    return { frets: [1, 3, 3, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0], baseFret: onE, barres: [] };
  }
  const onA = (root - 9 + 12) % 12;
  return { frets: [-1, 1, 3, 3, -1, -1], fingers: [0, 1, 3, 4, 0, 0], baseFret: onA, barres: [] };
}

export function lookupChord(db: ChordDb, name: string): ChordLookup | null {
  const parsed = parseChordName(name);
  if (!parsed) return null;
  const { root, bass } = parsed;
  const entries = db.chords[dbKey(root)] ?? [];

  if (parsed.suffix === "5") return { positions: [powerChord(root)] };

  const suffix = SUFFIX_ALIASES[parsed.suffix] ?? parsed.suffix;
  const base = entries.find((e) => e.suffix === suffix);

  if (bass !== undefined && bass !== root) {
    const slash = `${suffix === "major" ? "" : suffix === "minor" ? "m" : `${suffix}`}/${DB_BASS[bass]}`;
    const exact = entries.find((e) => e.suffix === slash);
    if (exact) return { positions: exact.positions };
    if (base) return { positions: base.positions, bass: parsed.bassName };
    return null;
  }
  return base ? { positions: base.positions } : null;
}
