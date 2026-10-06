import { useEffect, useLayoutEffect, useRef, useState } from "react";
import ChordCard from "./ChordCard";
import styles from "./ChordPopover.module.scss";

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

// The chord card, opened over a chord in the sheet.
export default function ChordPopover({ name, anchor, onPointerEnter, onPointerLeave, isPinned, onTogglePin }: Props) {
  const [voicing, setVoicing] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: anchor.left, top: anchor.bottom + 6 });

  useEffect(() => setVoicing(0), [name]);

  // Below the chord if it fits, otherwise above; always inside the window.
  // The card's size changes once shapes load, so re-measure when it resizes.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const place = () => {
      const { width, height } = el.getBoundingClientRect();
      const below = anchor.bottom + 6;
      const top = below + height > window.innerHeight - 8 ? anchor.top - height - 6 : below;
      setPos({
        left: Math.max(8, Math.min(anchor.left - 8, window.innerWidth - width - 8)),
        top: Math.max(8, top),
      });
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(el);
    return () => observer.disconnect();
  }, [anchor]);

  return (
    <ChordCard
      ref={ref}
      className={styles.popover}
      style={pos}
      role="dialog"
      aria-label={`${name} chord diagram`}
      tabIndex={-1}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      name={name}
      voicing={voicing}
      onVoicingChange={setVoicing}
      isPinned={isPinned}
      onTogglePin={() => onTogglePin(voicing)}
    />
  );
}
