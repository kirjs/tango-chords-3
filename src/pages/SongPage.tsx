import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import HeaderBar from "../components/HeaderBar";
import SongView from "../components/SongView";
import SongRail from "../components/SongRail";
import { useAuth } from "../context/AuthContext";
import { usePinnedChords } from "../hooks/usePinnedChords";
import { useTranspose } from "../hooks/useTranspose";
import { songsService } from "../services/songs";
import { tagLabel } from "../tags";
import type { Song } from "../types";
import { useSong } from "./useSong";
import styles from "./SongPage.module.scss";

const viewsLabel = (n: number) => `${n.toLocaleString()} ${n === 1 ? "view" : "views"}`;

function SongHeading({ song, views }: { song: Song; views: number }) {
  const { title, performer, composer, lyricist, key, tags = [] } = song.data;
  const credits = [composer && `Music by ${composer}`, lyricist && `words by ${lyricist}`]
    .filter(Boolean)
    .join(", ");

  return (
    <div className={styles.heading}>
      <div className={styles.titleRow}>
        <Link to="/" className={styles.home} aria-label="All songs" title="All songs">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M3 10.5 12 3l9 7.5M5 9.5V21h5v-6h4v6h5V9.5" />
          </svg>
        </Link>
        <h1 className={styles.title}>{title}</h1>
      </div>
      {performer || credits || key || tags.length > 0 ? (
        <details className={styles.details}>
          <summary>
            Details
            <span className={styles.views}>{viewsLabel(views)}</span>
          </summary>
          {performer && <p className={styles.performer}>{performer}</p>}
          {credits && <p className={styles.credits}>{credits}</p>}
          {key && <p className={styles.credits}>Written in {key}</p>}
          {tags.length > 0 && (
            <p className={styles.tags}>
              {tags.map((t) => (
                <Link key={t} to={`/?tag=${encodeURIComponent(t)}`}>
                  {tagLabel(t)}
                </Link>
              ))}
            </p>
          )}
        </details>
      ) : (
        <p className={`${styles.details} ${styles.views}`}>{viewsLabel(views)}</p>
      )}
    </div>
  );
}

function LoadedSong({ song }: { song: Song }) {
  const transpose = useTranspose(song);
  const pins = usePinnedChords(transpose.shift);

  // Count this visit once (StrictMode runs effects twice in development).
  const [views, setViews] = useState(song.views);
  const counted = useRef(false);
  useEffect(() => {
    if (counted.current) return;
    counted.current = true;
    songsService.recordView(song.id).then(
      () => setViews((v) => v + 1),
      // Not signed in: the security rules don't allow the write. Show the count anyway.
      () => {},
    );
  }, [song.id]);
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = song.data.title;
    return () => {
      document.title = "Tango Chords";
    };
  }, [song.data.title]);

  return (
    <div className={`${styles.page} ${pins.pinned.length ? styles.withPins : ""}`}>
      <div className={styles.songArea}>
        <SongView
          lines={transpose.transposedSong}
          scrollRef={scrollRef}
          pins={pins}
          heading={
            <>
              <SongHeading song={song} views={views} />
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
      <SongRail song={song} transpose={transpose} pins={pins} />
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
