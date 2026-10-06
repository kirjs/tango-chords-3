import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSongs } from "../context/SongsContext";
import type { Song } from "../types";
import styles from "./Header.module.scss";

export default function SelectSong() {
  const { songs } = useSongs();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return songs;
    }
    return songs.filter(
      (s) => s.data.title.toLowerCase().includes(q) || s.data.performer?.toLowerCase().includes(q),
    );
  }, [songs, query]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const select = (song: Song | undefined) => {
    if (!song) {
      return;
    }
    setQuery("");
    inputRef.current?.blur();
    navigate(`/songs/${song.id}`);
  };

  const move = (delta: number) => {
    const n = filtered.length;
    if (n) {
      setHighlighted((highlighted + delta + n) % n);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      move(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      move(-1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      select(filtered[highlighted]);
    } else if (e.key === "Escape") {
      inputRef.current?.blur();
    }
  };

  return (
    <div className={styles.search}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        placeholder="🎶 Find a song (CMD + K)"
        className={styles.searchInput}
        onChange={(e) => {
          setQuery(e.target.value);
          setHighlighted(0);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        onKeyDown={onKeyDown}
      />
      {isOpen && filtered.length > 0 && (
        <div className={styles.dropdown}>
          {filtered.map((song, i) => (
            <div
              key={song.id}
              className={`${styles.dropdownItem} ${i === highlighted ? styles.highlighted : ""}`}
              // mousedown fires before the input's blur closes the list.
              onMouseDown={(e) => {
                e.preventDefault();
                select(song);
              }}
            >
              {song.data.title}
              {song.data.performer && <span className={styles.performer}>{song.data.performer}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
