import HeaderBar from "../components/HeaderBar";
import SongList from "../components/SongList";
import { useSongs } from "../context/SongsContext";

export default function HomePage() {
  const { songs, isLoading, error } = useSongs();

  return (
    <>
      <HeaderBar />
      {isLoading && !songs.length ? (
        <div className="status">Loading songs...</div>
      ) : error ? (
        <div className="status error">{error}</div>
      ) : (
        <SongList songs={songs} />
      )}
    </>
  );
}
