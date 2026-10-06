import { useEffect, useState } from "react";
import { loadChordDb, lookupChord, type ChordDb } from "../chords/diagrams";
import type { PinnedChord } from "../hooks/usePinnedChords";
import ChordDiagram from "./ChordDiagram";
import styles from "./SongRail.module.scss";

// A compact diagram kept under the rail's buttons while the song is open.
export default function PinnedChordCard({ chord, onUnpin }: { chord: PinnedChord; onUnpin: () => void }) {
  const [db, setDb] = useState<ChordDb | null>(null);
  useEffect(() => {
    loadChordDb().then(setDb, () => {});
  }, []);

  const positions = db ? (lookupChord(db, chord.name)?.positions ?? []) : [];
  const position = positions[Math.min(chord.voicing, positions.length - 1)];

  return (
    <div className={styles.pinned}>
      <div className={styles.pinnedHeader}>
        <span className={styles.pinnedName}>{chord.name}</span>
        <button onClick={onUnpin} aria-label={`Unpin ${chord.name}`} title="Unpin">
          ×
        </button>
      </div>
      {position && <ChordDiagram position={position} scale={0.85} label={chord.name} />}
    </div>
  );
}
