import { useEffect, useRef, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import styles from "./AutoScroll.module.scss";

const TOP_OFFSET = 60;

// Scrolls the page over `duration` seconds. A dot travels down to mid-screen,
// then stays there while the page scrolls underneath it.
export default function AutoScroll({ slug }: { slug: string }) {
  const [duration, setDuration] = useLocalStorage(`song.${slug}.length`, 90);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [indicator, setIndicator] = useState(0);

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

    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    const mid = (windowHeight - 110) / 2;
    const distance = p * (mid + docHeight - windowHeight);

    if (distance <= mid) {
      setIndicator(distance);
    } else {
      setIndicator(mid);
      window.scrollTo(0, distance - mid);
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
    setIndicator(0);
    window.scrollTo(0, 0);
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
      {isScrolling && (
        <div
          className={styles.indicator}
          style={{ top: `${indicator + TOP_OFFSET}px` }}
          onClick={togglePause}
        >
          <div className={styles.innerDot} />
        </div>
      )}
      <div className={styles.scrollLine} />
    </div>
  );
}
