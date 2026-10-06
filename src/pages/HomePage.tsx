import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import HeaderBar from "../components/HeaderBar";
import SongList from "../components/SongList";
import TagFilter from "../components/TagFilter";
import { useAuth } from "../context/AuthContext";
import { useSongs } from "../context/SongsContext";
import { allTags } from "../tags";

export default function HomePage() {
  const { songs, isLoading, error } = useSongs();
  const { user } = useAuth();
  const [params] = useSearchParams();
  const activeTag = params.get("tag");

  const tags = useMemo(() => allTags(songs), [songs]);
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const song of songs) for (const t of song.data.tags ?? []) c[t] = (c[t] ?? 0) + 1;
    return c;
  }, [songs]);
  const visible = useMemo(
    () => (activeTag ? songs.filter((s) => s.data.tags?.includes(activeTag)) : songs),
    [songs, activeTag],
  );

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
        <>
          <TagFilter tags={tags} counts={counts} total={songs.length} active={activeTag} />
          {visible.length ? (
            <SongList songs={visible} />
          ) : (
            <div className="status">
              No songs are tagged “{activeTag}”. <Link to="/">Show all songs</Link>
            </div>
          )}
        </>
      )}
    </>
  );
}
