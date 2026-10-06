import { useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import HeaderBar from "../components/HeaderBar";
import SongView from "../components/SongView";
import SongRail from "../components/SongRail";
import { useAuth } from "../context/AuthContext";
import { useTranspose } from "../hooks/useTranspose";
import type { Song } from "../types";
import { useSong } from "./useSong";
import styles from "./SongPage.module.scss";

function SongHeading({ song }: { song: Song }) {
  const { title, performer, composer, lyricist, key } = song.data;
  const credits = [composer && `Music by ${composer}`, lyricist && `words by ${lyricist}`]
    .filter(Boolean)
    .join(", ");

  return (
    <div className={styles.heading}>
      <h1 className={styles.title}>{title}</h1>
      {performer && <p className={styles.performer}>{performer}</p>}
      {credits && <p className={styles.credits}>{credits}</p>}
      {key && <p className={styles.credits}>Written in {key}</p>}
    </div>
  );
}

function LoadedSong({ song }: { song: Song }) {
  const transpose = useTranspose(song);
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = song.data.title;
    return () => {
      document.title = "Tango Chords";
    };
  }, [song.data.title]);

  return (
    <div className={styles.page}>
      <div className={styles.songArea}>
        <SongView
          lines={transpose.transposedSong}
          displayChord={transpose.displayChord}
          scrollRef={scrollRef}
          heading={
            <>
              <SongHeading song={song} />
              {!song.body.trim() && (
                <p className="status">
                  This song has no lyrics or chords yet.{" "}
                  {user && <Link to={`/songs/${song.id}/edit`}>Add them</Link>}
                </p>
              )}
            </>
          }
        />
      </div>
      <SongRail song={song} transpose={transpose} />
    </div>
  );
}

export default function SongPage() {
  const { id } = useParams();
  const { song, isLoading, error } = useSong(id);

  if (song && song.id === id) {
    // Keyed so per-song state (transpose, autoscroll) resets on navigation.
    return <LoadedSong key={song.id} song={song} />;
  }

  return (
    <>
      <HeaderBar />
      <div className="status">{isLoading ? (
          "Loading song…"
        ) : error ? (
          "Couldn't load this song. Check your connection and reload the page."
        ) : (
          <>
            There's no song at this address. <Link to="/">Browse all songs</Link>
          </>
        )}</div>
    </>
  );
}
