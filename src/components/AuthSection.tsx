import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./Header.module.scss";

export default function AuthSection({ showNewSong = true }: { showNewSong?: boolean }) {
  const { user, isLoading, error, login, logout } = useAuth();

  return (
    <div className={styles.auth}>
      {user && showNewSong && (
        <Link to="/songs/new" className={styles.newSong}>
          Add New Song
        </Link>
      )}
      {error && <span className={styles.authError}>{error}</span>}
      {isLoading ? (
        <span>Loading...</span>
      ) : user ? (
        <>
          <span className={styles.email}>{user.email}</span>
          <button onClick={logout} className={styles.logout}>
            Logout
          </button>
        </>
      ) : (
        <button onClick={login} className={styles.login}>
          Login with Google
        </button>
      )}
    </div>
  );
}
