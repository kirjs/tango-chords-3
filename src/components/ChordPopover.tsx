import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { loadChordDb, lookupChord, type ChordDb } from "../chords/diagrams";
import ChordDiagram from "./ChordDiagram";
import styles from "./ChordPopover.module.scss";

interface Props {
  name: string;
  /** The chord's position on screen; the card opens below it. */
  anchor: DOMRect;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
}

export default function ChordPopover({ name, anchor, onPointerEnter, onPointerLeave }: Props) {
  const [db, setDb] = useState<ChordDb | null>(null);
  const [failed, setFailed] = useState(false);
  const [voicing, setVoicing] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: anchor.left, top: anchor.bottom + 6 });

  useEffect(() => {
    loadChordDb().then(setDb, () => setFailed(true));
  }, []);
  useEffect(() => setVoicing(0), [name]);

  const found = db ? lookupChord(db, name) : null;
  const positions = found?.positions ?? [];
  const position = positions[Math.min(voicing, positions.length - 1)];

  // Below the chord if it fits, otherwise above; always inside the window.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const below = anchor.bottom + 6;
    const top = below + height > window.innerHeight - 8 ? anchor.top - height - 6 : below;
    setPos({
      left: Math.max(8, Math.min(anchor.left - 8, window.innerWidth - width - 8)),
      top: Math.max(8, top),
    });
  }, [anchor, name, db, voicing]);

  return (
    <div
      ref={ref}
      className={styles.card}
      style={pos}
      role="dialog"
      aria-label={`${name} chord diagram`}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <div className={styles.header}>
        <span className={styles.name}>{name}</span>
        {positions.length > 1 && (
          <span className={styles.voicings}>
            <button onClick={() => setVoicing((voicing - 1 + positions.length) % positions.length)} aria-label="Previous shape">
              ‹
            </button>
            {voicing + 1}/{positions.length}
            <button onClick={() => setVoicing((voicing + 1) % positions.length)} aria-label="Next shape">
              ›
            </button>
          </span>
        )}
      </div>
      {position ? (
        <ChordDiagram position={position} />
      ) : (
        <p className={styles.note}>{failed ? "Couldn't load chord shapes." : db ? "No diagram for this chord." : "Loading…"}</p>
      )}
      {found?.bass && <p className={styles.note}>Bass: {found.bass}</p>}
    </div>
  );
}
