import { useEffect, useRef, useState } from "react";
import type { TransposeState } from "../hooks/useTranspose";
import styles from "./SongRail.module.scss";

// One button showing the current key; opens a grid of all 12 keys.
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
        <div className={styles.keyGrid} role="group" aria-label="Choose a key">
          {keyOptions.map((option) => (
            <button
              key={option.shift}
              className={[
                styles.pearl,
                option.shift === 0 && styles.written,
              ]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={option.shift === shift}
              title={[
                option.shift === 0 && "As written",
                option.shift === easiestShift && "Easiest to play",
              ]
                .filter(Boolean)
                .join(", ") || undefined}
              onClick={() => {
                setShift(option.shift);
                setIsOpen(false);
              }}
            >
              {option.label}
              {option.shift === easiestShift && (
                <span className={styles.star} aria-label="easiest">
                  ✦
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
