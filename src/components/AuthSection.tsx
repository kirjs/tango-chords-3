import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./Header.module.scss";

export default function AuthSection({ showNewSong = true }: { showNewSong?: boolean }) {
  const { user, isLoading, error, login, logout } = useAuth();

  return (
    <div className={styles.auth}>
      {user && showNewSong && (
        <Link to="/songs/new" className={styles.newSong}>
          New song
        </Link>
      )}
      {error && <span className={styles.authError}>{error}</span>}
      {isLoading ? (
        <span className={styles.email}>Signing in…</span>
      ) : user ? (
        <>
          <span className={styles.email} title={user.email ?? undefined}>
            {user.displayName?.split(" ")[0] || user.email}
          </span>
          <button onClick={logout} className={styles.textButton}>
            Sign out
          </button>
        </>
      ) : (
        <button onClick={login} className={styles.textButton}>
          <span className={styles.long}>Sign in with Google</span>
          <span className={styles.short}>Sign in</span>
        </button>
      )}
    </div>
  );
}
