import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import AuthSection from "./AuthSection";
import SelectSong from "./SelectSong";
import styles from "./Header.module.scss";

// Sticky top bar. Pages can slot extra controls (e.g. transpose) after the search.
export default function HeaderBar({ children }: { children?: ReactNode }) {
  return (
    <div className={styles.bar}>
      <div className={styles.title}>
        <Link to="/" className={styles.home}>
          🏡
        </Link>
        <SelectSong />
      </div>
      {children}
      <AuthSection />
    </div>
  );
}
