import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import AuthSection from "./AuthSection";
import SelectSong from "./SelectSong";
import styles from "./Header.module.scss";

// Top bar. Pages can slot extra controls (e.g. transpose) after the search.
export default function HeaderBar({ children }: { children?: ReactNode }) {
  return (
    <header className={styles.bar}>
      <Link to="/" className={styles.wordmark}>
        Tango Chords
      </Link>
      <SelectSong />
      {children && <div className={styles.extra}>{children}</div>}
      <AuthSection />
    </header>
  );
}
