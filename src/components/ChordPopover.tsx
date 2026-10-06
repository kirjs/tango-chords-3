import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { loadChordDb, lookupChord, type ChordDb, type Position } from "../chords/diagrams";
import ChordDiagram from "./ChordDiagram";
import styles from "./ChordPopover.module.scss";

// Screen-reader text, low E to high e: "x 3 2 0 1 0".
const describe = (name: string, p: Position) =>
  `${name}: frets ${p.frets.map((f) => (f < 0 ? "x" : f === 0 ? "0" : f + p.baseFret - 1)).join(" ")}, low to high`;

interface Props {
  name: string;
  /** The chord's position on screen; the card opens below it. */
  anchor: DOMRect;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  isPinned: boolean;
  /** Pins/unpins the chord beside the sheet, keeping the shape on show. */
  onTogglePin: (voicing: number) => void;
}

const PinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 17v5M9 3h6l-1 6 4 4v2H6v-2l4-4z" />
  </svg>
);

export default function ChordPopover({
  name,
  anchor,
  onPointerEnter,
  onPointerLeave,
  isPinned,
  onTogglePin,
}: Props) {
  const [db, setDb] = useState<ChordDb | null>(null);
  const [failed, setFailed] = useState(false);
  const [voicing, setVoicing] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: anchor.left, top: anchor.bottom + 6 });

  const load = () => {
    setFailed(false);
    loadChordDb().then(setDb, () => setFailed(true));
  };
  useEffect(load, []);
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
      tabIndex={-1}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <div className={styles.header}>
        <span className={styles.name}>{name}</span>
        {position && (
          <button
            className={styles.pin}
            onClick={() => onTogglePin(voicing)}
            aria-pressed={isPinned}
            aria-label={isPinned ? `Unpin ${name}` : `Pin ${name} beside the song`}
            title={isPinned ? "Unpin" : "Pin beside the song"}
          >
            <PinIcon />
          </button>
        )}
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
