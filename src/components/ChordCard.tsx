import { useEffect, useState, type HTMLAttributes, type Ref } from "react";
import { loadChordDb, lookupChord, type ChordDb, type Position } from "../chords/diagrams";
import ChordDiagram from "./ChordDiagram";
import styles from "./ChordCard.module.scss";

// Screen-reader text, low E to high e: "x 3 2 0 1 0".
const describe = (name: string, p: Position) =>
  `${name}: frets ${p.frets.map((f) => (f < 0 ? "x" : f === 0 ? "0" : f + p.baseFret - 1)).join(" ")}, low to high`;

const PinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 17v5M9 3h6l-1 6 4 4v2H6v-2l4-4z" />
  </svg>
);

interface Props extends HTMLAttributes<HTMLDivElement> {
  name: string;
  /** Which shape to show; clamped to the shapes available. */
  voicing: number;
  onVoicingChange: (voicing: number) => void;
  isPinned: boolean;
  onTogglePin: () => void;
  ref?: Ref<HTMLDivElement>;
}

/**
 * A chord's name, pin toggle, shape switcher and diagram. Used both for the
 * card that opens over a chord in the sheet and for chords pinned beside it.
 */
export default function ChordCard({
  name,
  voicing,
  onVoicingChange,
  isPinned,
  onTogglePin,
  className,
  ...rest
}: Props) {
  const [db, setDb] = useState<ChordDb | null>(null);
  const [failed, setFailed] = useState(false);

  const load = () => {
    setFailed(false);
    loadChordDb().then(setDb, () => setFailed(true));
  };
  useEffect(load, []);

  const found = db ? lookupChord(db, name) : null;
  const positions = found?.positions ?? [];
  const index = Math.min(voicing, Math.max(0, positions.length - 1));
  const position = positions[index];
  const step = (delta: number) => onVoicingChange((index + delta + positions.length) % positions.length);

  return (
    <div className={[styles.card, className].filter(Boolean).join(" ")} {...rest}>
      <div className={styles.header}>
        <span className={styles.name}>{name}</span>
        {position && (
          <button
            className={styles.pin}
            onClick={onTogglePin}
            aria-pressed={isPinned}
            aria-label={isPinned ? `Unpin ${name}` : `Pin ${name} beside the song`}
            title={isPinned ? "Unpin" : "Pin beside the song"}
          >
            <PinIcon />
          </button>
        )}
        {positions.length > 1 && (
          <span className={styles.voicings}>
            <button onClick={() => step(-1)} aria-label="Previous shape">
              ‹
            </button>
            {index + 1}/{positions.length}
            <button onClick={() => step(1)} aria-label="Next shape">
              ›
            </button>
          </span>
        )}
      </div>
      {position ? (
        <ChordDiagram position={position} label={describe(name, position)} />
      ) : (
        <p className={styles.note}>
          {failed ? (
            <>
              Couldn't load chord shapes.{" "}
              <button className={styles.retry} onClick={load}>
                Try again
              </button>
            </>
          ) : db ? (
            "No diagram for this chord."
          ) : (
            "Loading chord shapes…"
          )}
        </p>
      )}
      {found?.bass && <p className={styles.note}>Bass: {found.bass}</p>}
    </div>
  );
}
