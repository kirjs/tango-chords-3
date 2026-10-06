import HeaderBar from "../components/HeaderBar";
import SongList from "../components/SongList";
import { useAuth } from "../context/AuthContext";
import { useSongs } from "../context/SongsContext";
import { Link } from "react-router-dom";

export default function HomePage() {
  const { songs, isLoading, error } = useSongs();
  const { user } = useAuth();

  return (
    <>
      <HeaderBar />
      {isLoading && !songs.length ? (
        <div className="status">Loading songs…</div>
      ) : error ? (
        <div className="status error">Couldn't load the songs. Check your connection and reload the page.</div>
      ) : songs.length === 0 ? (
        <div className="status">
          No songs yet. {user ? <Link to="/songs/new">Add the first one</Link> : "Sign in to add one."}
        </div>
      ) : (
        <SongList songs={songs} />
      )}
    </>
  );
}
