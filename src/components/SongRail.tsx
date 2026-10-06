import { Link } from "react-router-dom";
import logo from "../assets/bandoneon.svg";
import { useAuth } from "../context/AuthContext";
import type { TransposeState } from "../hooks/useTranspose";
import type { Song } from "../types";
import KeyPicker from "./KeyPicker";
import styles from "./SongRail.module.scss";

interface Props {
  song: Song;
  transpose: TransposeState;
}

// A few buttons on the right edge, so the sheet keeps the whole screen.
export default function SongRail({ song, transpose }: Props) {
  const { user } = useAuth();

  return (
    <nav className={styles.rail} aria-label="Song controls">
      <Link to="/" className={styles.logo} aria-label="All songs" title="All songs">
        <img src={logo} alt="" width={60} height={43} />
      </Link>

      <KeyPicker transpose={transpose} />

      {user && (
        <Link to={`/songs/${song.id}/edit`} className={styles.pearl} aria-label="Edit song" title="Edit song">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
          </svg>
        </Link>
      )}
    </nav>
  );
}
