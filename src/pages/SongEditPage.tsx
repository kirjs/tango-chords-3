import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HeaderBar from "../components/HeaderBar";
import { useSongs } from "../context/SongsContext";
import { songsService } from "../services/songs";
import { allTags, tagLabel } from "../tags";
import type { SongData } from "../types";
import { useSong } from "./useSong";
import styles from "./SongEditPage.module.scss";

const KEYS = [
  "A", "Am", "Bb", "Bbm", "B", "Bm", "C", "Cm", "C#", "C#m", "D", "Dm",
  "Eb", "Ebm", "E", "Em", "F", "Fm", "F#", "F#m", "G", "Gm", "G#", "G#m",
];

const emptyData: SongData = {
  title: "",
  key: "",
  performer: "",
  genre: "",
  composer: "",
  lyricist: "",
  source: "",
  tags: [],
};

// Used for both /songs/new (no id) and /songs/:id/edit.
export default function SongEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { songs, reload } = useSongs();
  const tagOptions = allTags(songs);
  const { song, error: loadError } = useSong(id);

  const [data, setData] = useState<SongData>(emptyData);
  const [body, setBody] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (song) {
      setData({ ...emptyData, ...song.data });
      setBody(song.body);
    }
  }, [song]);

  const update = (field: keyof SongData) => (e: { target: { value: string } }) =>
    setData((d) => ({ ...d, [field]: e.target.value }));

  const toggleTag = (tag: string) =>
    setData((d) => {
      const tags = d.tags ?? [];
      return { ...d, tags: tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag] };
    });

  const save = async () => {
    if (!data.title.trim()) {
      setError("Title is required");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const savedId = await songsService.saveSong(data, body, id);
      await reload();
      navigate(`/songs/${savedId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const cancel = () => navigate(id ? `/songs/${id}` : "/");

  return (
    <>
      <HeaderBar />
      <div className={styles.songEdit}>
        <h1 className={styles.heading}>{id ? "Edit song" : "New song"}</h1>
        {(error || loadError) && <div className={styles.error}>{error || loadError}</div>}

        <div className={styles.row}>
          <label className={styles.grow}>
            Title
            <input type="text" value={data.title} onChange={update("title")} />
          </label>
          <label>
            Key
            <select value={data.key} onChange={update("key")}>
              <option value="">Select key</option>
              {KEYS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className={styles.row}>
          <label className={styles.grow}>
            Performer
            <input type="text" value={data.performer} onChange={update("performer")} />
          </label>
          <label className={styles.grow}>
            Composer
            <input type="text" value={data.composer} onChange={update("composer")} />
          </label>
          <label className={styles.grow}>
            Lyricist
            <input type="text" value={data.lyricist} onChange={update("lyricist")} />
          </label>
        </div>

        <fieldset className={styles.tags}>
          <legend>Tags</legend>
          {tagOptions.map((tag) => (
            <label key={tag} className={styles.tag}>
              <input
                type="checkbox"
                checked={data.tags?.includes(tag) ?? false}
                onChange={() => toggleTag(tag)}
              />
              {tagLabel(tag)}
            </label>
          ))}
        </fieldset>

        <label>
          Lyrics and chords
          <span className={styles.hint}>
            Write each chord line above its lyric line. Start a section with a line like [Verse] or
            [Chorus].
          </span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={22}
            spellCheck={false}
            placeholder={"[Verse]\nAm          E7         Am\nEsquinas de barrio porteño"}
          />
        </label>

        <div className={styles.buttons}>
          <button onClick={cancel} disabled={isSaving}>
            Cancel
          </button>
          <button className={styles.primary} onClick={save} disabled={isSaving || !data.title.trim()}>
            {isSaving ? "Saving…" : "Save song"}
          </button>
        </div>
      </div>
    </>
  );
}
