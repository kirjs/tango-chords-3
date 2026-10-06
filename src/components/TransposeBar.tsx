import type { RefObject } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Notation, TransposeState } from "../hooks/useTranspose";
import type { Song } from "../types";
import AutoScroll from "./AutoScroll";
import styles from "./TransposeBar.module.scss";

interface Props {
  song: Song;
  transpose: TransposeState;
  scrollRef: RefObject<HTMLDivElement | null>;
}

export default function TransposeBar({ song, transpose, scrollRef }: Props) {
  const { user } = useAuth();
  const { shift, key, notation, setNotation, magicKey, simpleKeys, transposeTones, transposeToKey } =
    transpose;

  return (
    <div className={styles.controls}>
      {notation === "A" && (
        <div className={styles.group} role="group" aria-label="Key">
          <button className={styles.pearl} onClick={() => transposeTones(-1)} aria-label="Down a semitone">
            −
          </button>
          <span className={styles.key} aria-live="polite">
            {key ?? (shift === 0 ? "±0" : (shift > 0 ? "+" : "") + shift)}
          </span>
          <button className={styles.pearl} onClick={() => transposeTones(1)} aria-label="Up a semitone">
            +
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
            className={`${styles.pearl} ${styles.easiest}`}
            onClick={() => transposeTones(magicKey.shift)}
            aria-pressed={magicKey.shift === 0}
            title="Easiest key to play"
          >
            {magicKey.chordName ?? <span className={styles.word}>Easiest</span>}
            <span className={styles.star} aria-hidden>
              ✦
            </span>
          </button>
        </div>
      )}

      {key && (
        <button
          className={styles.textButton}
          onClick={() => setNotation(notation === "A" ? "i" : "A")}
          title="Switch between chord names and scale degrees (I, IV, V…)"
        >
          {notation === "A" ? "Show numbers" : "Show chord names"}
        </button>
      )}

      <AutoScroll slug={song.slug} scrollRef={scrollRef} />

      {user && (
        <Link to={`/songs/${song.id}/edit`} className={styles.textButton}>
          Edit
        </Link>
      )}
    </div>
  );
}
