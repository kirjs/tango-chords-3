import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Notation, TransposeState } from "../hooks/useTranspose";
import type { Song } from "../types";
import AutoScroll from "./AutoScroll";
import styles from "./TransposeBar.module.scss";

const ArrowUp = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4L4 12H8V20H16V12H20L12 4Z" fill="currentColor" />
  </svg>
);

const ArrowDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 20L20 12H16V4H8V12H4L12 20Z" fill="currentColor" />
  </svg>
);

interface Props {
  song: Song;
  transpose: TransposeState;
}

export default function TransposeBar({ song, transpose }: Props) {
  const { user } = useAuth();
  const { shift, key, notation, setNotation, magicKey, simpleKeys, transposeTones, transposeToKey } =
    transpose;
  const hasKeyTools = simpleKeys.length > 0 || magicKey;

  return (
    <div className={styles.controls}>
      {key && (
        <div className={styles.panel}>
          <select value={notation} onChange={(e) => setNotation(e.target.value as Notation)}>
            <option value="A">A</option>
            <option value="i">i</option>
          </select>
        </div>
      )}

      {notation === "A" && (
        <div className={styles.panel}>
          <button onClick={() => transposeTones(1)} title="Up a semitone">
            <ArrowUp />
          </button>
          <span className={styles.key}>{key ?? (shift > 0 ? "+" : "") + shift}</span>
          <button onClick={() => transposeTones(-1)} title="Down a semitone">
            <ArrowDown />
          </button>
        </div>
      )}

      {notation === "A" && hasKeyTools && (
        <div className={styles.panel}>
          {simpleKeys.map((k) => (
            <button key={k} onClick={() => transposeToKey(k)} disabled={key === k}>
              {k}
            </button>
          ))}
          <button
            onClick={() => transposeTones(magicKey.shift)}
            disabled={magicKey.shift === 0}
            title="Easiest key to play"
          >
            {magicKey.chordName} 🪄
          </button>
        </div>
      )}

      {hasKeyTools && (
        <div className={styles.panel}>
          <AutoScroll slug={song.slug} />
        </div>
      )}

      {user && (
        <div className={styles.panel}>
          <Link to={`/songs/${song.id}/edit`} className={styles.edit}>
            Edit
          </Link>
        </div>
      )}
    </div>
  );
}
