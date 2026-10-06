import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";
import type { TransposeState } from "../hooks/useTranspose";
import type { Song } from "../types";
import type { PinnedChords } from "../hooks/usePinnedChords";
import KeyPicker from "./KeyPicker";
import PinnedChordCard from "./PinnedChordCard";
import SelectSong from "./SelectSong";
import styles from "./SongRail.module.scss";

interface Props {
  song: Song;
  transpose: TransposeState;
  pins: PinnedChords;
}

// A few buttons on the right edge, so the sheet keeps the whole screen.
export default function SongRail({ song, transpose, pins }: Props) {
  const { user } = useAuth();
  const [isSearching, setIsSearching] = useState(false);

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
      <Link to="/" className={styles.logo} aria-label="All songs" title="All songs">
        <img src={logo} alt="" width={52} height={52} />
      </Link>

      <div className={styles.searchWrap}>
        <button
          className={styles.pearl}
          onClick={() => setIsSearching(true)}
          aria-label="Find a song"
          aria-expanded={isSearching}
          title="Find a song (Ctrl K)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35" />
          </svg>
        </button>
        {isSearching && (
          <div className={styles.searchPopover}>
            <SelectSong autoFocus onClose={() => setIsSearching(false)} />
          </div>
        )}
      </div>

      <KeyPicker transpose={transpose} />

      {user && (
        <Link to={`/songs/${song.id}/edit`} className={styles.pearl} aria-label="Edit song" title="Edit song">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
          </svg>
        </Link>
      )}
      {pins.pinned.length > 0 && (
        <div className={styles.pinnedList} aria-label="Pinned chords">
          {pins.pinned.map((chord) => (
            <PinnedChordCard key={chord.name} chord={chord} onUnpin={() => pins.togglePin(chord.name)} />
          ))}
        </div>
      )}
    </nav>
  );
}
