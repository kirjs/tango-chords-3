import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import HeaderBar from "../components/HeaderBar";
import SongView from "../components/SongView";
import TransposeBar from "../components/TransposeBar";
import { useTranspose } from "../hooks/useTranspose";
import type { Song } from "../types";
import { useSong } from "./useSong";
import styles from "./SongPage.module.scss";

function LoadedSong({ song }: { song: Song }) {
  const transpose = useTranspose(song);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = song.data.title;
    return () => {
      document.title = "Tango Chords";
    };
  }, [song.data.title]);

  return (
    <div className={styles.page}>
      <HeaderBar>
        <TransposeBar song={song} transpose={transpose} scrollRef={scrollRef} />
      </HeaderBar>
      <div className={styles.songArea}>
        <SongView
          lines={transpose.transposedSong}
          displayChord={transpose.displayChord}
          scrollRef={scrollRef}
        />
      </div>
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
      <div className="status">{isLoading ? "Loading song..." : error ?? "Song not found"}</div>
    </>
  );
}
