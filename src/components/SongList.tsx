import { useCallback, useMemo, useState, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSongs } from "../context/SongsContext";
import { songsService } from "../services/songs";
import type { Song } from "../types";
import ConfirmDelete from "./ConfirmDelete";
import SongContextMenu from "./SongContextMenu";
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
  const { user } = useAuth();
  const { reload } = useSongs();
  const [menu, setMenu] = useState<{ song: Song; x: number; y: number } | null>(null);
  const [toDelete, setToDelete] = useState<Song | null>(null);
  const closeMenu = useCallback(() => setMenu(null), []);

  // Signed-out visitors can't edit or delete, so they keep the browser's menu.
  const openMenu = (song: Song) => (e: MouseEvent) => {
    if (!user) return;
    e.preventDefault();
    // Keyboard-triggered menus report 0,0; anchor to the entry instead.
    const rect = e.currentTarget.getBoundingClientRect();
    const fromKeyboard = e.clientX === 0 && e.clientY === 0;
    setMenu({
      song,
      x: fromKeyboard ? rect.left : e.clientX,
      y: fromKeyboard ? rect.bottom : e.clientY,
    });
  };

  return (
    <div className={styles.index}>
      {groups.map(({ letter, songs }) => (
        <section key={letter} className={styles.group} aria-label={letter}>
          <h2 className={styles.letter} aria-hidden>
            {letter}
          </h2>
          <ul>
            {songs.map((song) => (
              <li key={song.id} onContextMenu={openMenu(song)}>
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
      {menu && (
        <SongContextMenu {...menu} onDelete={setToDelete} onClose={closeMenu} />
      )}
      {toDelete && (
        <ConfirmDelete
          song={toDelete}
          onCancel={() => setToDelete(null)}
          onConfirm={async () => {
            await songsService.deleteSong(toDelete.id);
            setToDelete(null);
            await reload();
          }}
        />
      )}
    </div>
  );
}
