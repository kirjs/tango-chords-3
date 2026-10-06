import { useEffect, useRef, useState, type RefObject } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import styles from "./AutoScroll.module.scss";

interface Props {
  slug: string;
  scrollRef: RefObject<HTMLDivElement | null>;
}

interface Marker {
  left: number;
  top: number;
  height: number;
}

// Scrolls the song's columns sideways over `duration` seconds. A marker travels
// right to mid-screen, then stays there while the columns scroll underneath it.
export default function AutoScroll({ slug, scrollRef }: Props) {
  const [duration, setDuration] = useLocalStorage(`song.${slug}.length`, 90);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [marker, setMarker] = useState<Marker | null>(null);

  const frame = useRef<number | null>(null);
  const startTime = useRef<number | null>(null);
  const pauseStart = useRef<number | null>(null);
  const pausedTotal = useRef(0);
  const durationRef = useRef(duration);
  durationRef.current = duration;

  const cancel = () => {
    if (frame.current !== null) {
      cancelAnimationFrame(frame.current);
      frame.current = null;
    }
  };

  const step = (timestamp: number) => {
    startTime.current ??= timestamp;
    const elapsed = timestamp - startTime.current - pausedTotal.current;
    const p = Math.min(elapsed / (durationRef.current * 1000), 1);

    const el = scrollRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      const mid = el.clientWidth / 2;
      const distance = p * (mid + el.scrollWidth - el.clientWidth);
      const x = Math.min(distance, mid);
      el.scrollLeft = distance - x;
      setMarker({ left: rect.left + x, top: rect.top, height: el.clientHeight });
    }
    setProgress(p);

    if (p < 1) {
      frame.current = requestAnimationFrame(step);
    } else {
      frame.current = null;
      setIsScrolling(false);
    }
  };

  const reset = () => {
    setProgress(0);
    setMarker(null);
    scrollRef.current?.scrollTo({ left: 0 });
    startTime.current = null;
    pauseStart.current = null;
    pausedTotal.current = 0;
  };

  const toggleScroll = () => {
    cancel();
    reset();
    if (isScrolling) {
      setIsScrolling(false);
    } else {
      setIsScrolling(true);
      setIsPaused(false);
      frame.current = requestAnimationFrame(step);
    }
  };

  const togglePause = () => {
    if (!isScrolling) {
      return;
    }
    if (isPaused) {
      if (pauseStart.current !== null) {
        pausedTotal.current += performance.now() - pauseStart.current;
        pauseStart.current = null;
      }
      frame.current = requestAnimationFrame(step);
    } else {
      cancel();
      pauseStart.current = performance.now();
    }
    setIsPaused(!isPaused);
  };

  useEffect(() => cancel, []);

  return (
    <div className={styles.autoScroll}>
      <button onClick={toggleScroll}>{isScrolling ? "Stop" : "Start"}</button>
      <button onClick={togglePause} disabled={!isScrolling}>
        {isPaused ? "Resume" : "Pause"}
      </button>
      <span className={styles.speed}>{Math.round(progress * 100)}%</span>
      <input
        type="number"
        className={styles.length}
        value={duration}
        min={1}
        title="Song length, seconds"
        onChange={(e) => setDuration(Number(e.target.value) || 1)}
      />
      {isScrolling && marker && (
        <div
          className={styles.marker}
          style={{ left: marker.left, top: marker.top, height: marker.height }}
          onClick={togglePause}
          title={isPaused ? "Resume" : "Pause"}
        />
      )}
    </div>
  );
}
