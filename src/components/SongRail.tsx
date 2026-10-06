import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { TransposeState } from "../hooks/useTranspose";
import type { Song } from "../types";
import SelectSong from "./SelectSong";
import styles from "./SongRail.module.scss";

const Icon = ({ d }: { d: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
);

const ICONS = {
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35",
  edit: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z",
};

interface Props {
  song: Song;
  transpose: TransposeState;
}

// A slim column of round buttons on the right edge, so the sheet keeps the
// full height of the screen.
export default function SongRail({ song, transpose }: Props) {
  const { user } = useAuth();
  const [isSearching, setIsSearching] = useState(false);
  const { shift, key, notation, setNotation, magicKey, simpleKeys, transposeTones, transposeToKey } =
    transpose;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearching(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <nav className={styles.rail} aria-label="Song controls">
      <Link to="/" className={styles.pearl} aria-label="All songs" title="All songs">
        <Icon d={ICONS.list} />
      </Link>
      <button
        className={styles.pearl}
        onClick={() => setIsSearching(true)}
        aria-label="Find a song"
        aria-expanded={isSearching}
        title="Find a song (Ctrl K)"
      >
        <Icon d={ICONS.search} />
      </button>
      {isSearching && (
        <div className={styles.searchPopover}>
          <SelectSong autoFocus onClose={() => setIsSearching(false)} />
        </div>
      )}

      {notation === "A" && (
        <div className={styles.group} role="group" aria-label="Key">
          <button className={styles.pearl} onClick={() => transposeTones(1)} aria-label="Up a semitone" title="Up a semitone">
            +
          </button>
          <span className={styles.key} aria-live="polite">
            {key ?? (shift === 0 ? "±0" : (shift > 0 ? "+" : "") + shift)}
          </span>
          <button className={styles.pearl} onClick={() => transposeTones(-1)} aria-label="Down a semitone" title="Down a semitone">
            −
          </button>
        </div>
      )}

      {notation === "A" && (
        <div className={styles.group} role="group" aria-label="Quick keys">
          {simpleKeys.map((k) => (
            <button
              key={k}
              className={styles.pearl}
              onClick={() => transposeToKey(k)}
              aria-pressed={key === k}
              title={`Play in ${k}`}
            >
              {k}
            </button>
          ))}
          <button
            className={styles.pearl}
            onClick={() => transposeTones(magicKey.shift)}
            aria-pressed={magicKey.shift === 0}
            aria-label={`Easiest key${magicKey.chordName ? `: ${magicKey.chordName}` : ""}`}
            title="Easiest key to play"
          >
            {magicKey.chordName}
            <span className={magicKey.chordName ? styles.star : styles.starAlone} aria-hidden>
              ✦
            </span>
          </button>
        </div>
      )}

      {key && (
        <button
          className={styles.pearl}
          onClick={() => setNotation(notation === "A" ? "i" : "A")}
          aria-pressed={notation === "i"}
          aria-label="Show scale degrees instead of chord names"
          title={notation === "A" ? "Show numbers (I, IV, V…)" : "Show chord names"}
        >
          <span className={styles.roman}>IV</span>
        </button>
      )}

      {user && (
        <Link to={`/songs/${song.id}/edit`} className={styles.pearl} aria-label="Edit song" title="Edit song">
          <Icon d={ICONS.edit} />
        </Link>
      )}
    </nav>
  );
}
