import { useMemo } from "react";
import { Link } from "react-router-dom";
import type { Song } from "../types";
import styles from "./SongList.module.scss";

interface LetterGroup {
  letter: string;
  songs: Song[];
}

// A songbook index: alphabetical, grouped under their initial letter.
function groupByLetter(songs: Song[]): LetterGroup[] {
  const groups = new Map<string, Song[]>();
  for (const song of songs) {
    const first = song.data.title.trim().charAt(0).toLocaleUpperCase();
    const letter = /\p{L}/u.test(first) ? first : "#";
    groups.set(letter, [...(groups.get(letter) ?? []), song]);
  }
  return [...groups.entries()]
    .map(([letter, songs]) => ({ letter, songs }))
    .sort((a, b) => a.letter.localeCompare(b.letter));
}

export default function SongList({ songs }: { songs: Song[] }) {
  const groups = useMemo(() => groupByLetter(songs), [songs]);

  return (
    <div className={styles.index}>
      {groups.map(({ letter, songs }) => (
        <section key={letter} className={styles.group} aria-label={letter}>
          <h2 className={styles.letter} aria-hidden>
            {letter}
          </h2>
          <ul>
            {songs.map((song) => (
              <li key={song.id}>
                <Link to={`/songs/${song.id}`} className={styles.entry}>
                  <span className={styles.title}>{song.data.title}</span>
                  <span className={styles.leader} aria-hidden />
                  {song.data.key && <span className={styles.key}>{song.data.key}</span>}
                </Link>
                {song.data.performer && <div className={styles.performer}>{song.data.performer}</div>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
