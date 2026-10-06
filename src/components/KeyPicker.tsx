import { useEffect, useRef, useState } from "react";
import type { TransposeState } from "../hooks/useTranspose";
import styles from "./SongRail.module.scss";

type Difficulty = "easy" | "medium" | "hard" | "unknown";

function difficulty(score: number | undefined): Difficulty {
  if (score === undefined) return "unknown";
  if (score <= 1.5) return "easy";
  if (score <= 2.5) return "medium";
  return "hard";
}

// One button showing the current key; opens a grid of all 12 keys with how
// hard each is to play, which one is written and which is easiest.
export default function KeyPicker({ transpose }: { transpose: TransposeState }) {
  const { shift, setShift, currentLabel, keyOptions, easiestShift } = transpose;
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={styles.keyPicker} ref={rootRef}>
      <button
        className={`${styles.pearl} ${styles.keyButton}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`Key: ${currentLabel}. Change key`}
        title="Change key"
      >
        {currentLabel}
      </button>
      {isOpen && (
        <div className={styles.keyPopup}>
          <div className={styles.keyGrid} role="group" aria-label="Choose a key">
            {keyOptions.map((option) => {
              const isWritten = option.shift === 0;
              const isEasiest = option.shift === easiestShift;
              const notes = [
                isWritten && "as written",
                isEasiest && "easiest to play",
                option.score !== undefined && `difficulty ${option.score.toFixed(1)} of 4`,
              ].filter(Boolean);
              return (
                <button
                  key={option.shift}
                  className={[
                    styles.keyTile,
                    styles[difficulty(option.score)],
                    isWritten && styles.written,
                    isEasiest && styles.easiest,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-pressed={option.shift === shift}
                  aria-label={[option.label, ...notes].join(", ")}
                  title={notes.join(", ") || undefined}
                  onClick={() => {
                    setShift(option.shift);
                    setIsOpen(false);
                  }}
                >
                  <span className={styles.tileKey}>{option.label}</span>
                  {option.score !== undefined && (
                    <span className={styles.tileScore}>{option.score.toFixed(1)}</span>
                  )}
                  {isWritten && <span className={styles.tileNote}>written</span>}
                  {isEasiest && (
                    <span className={styles.star} aria-hidden>
                      ✦
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <p className={styles.legend}>
            {keyOptions.some((o) => o.score !== undefined) &&
              "Numbers are chord difficulty, 1 easy to 4 hard. "}
            {easiestShift !== null && (
              <>
                <span className={styles.legendStar}>✦</span> easiest.
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
