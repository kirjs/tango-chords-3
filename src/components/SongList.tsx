import { useMemo } from "react";
import { Link } from "react-router-dom";
import { analyzeSong, type SongKey } from "../chords/analysis";
import { parseChords } from "../chords/chords";
import type { Song } from "../types";
import styles from "./SongList.module.scss";

interface SongStats {
  song: Song;
  complexityScore: string;
  sumScore?: number;
  worstKey?: SongKey;
}

function getSongStats(song: Song): SongStats {
  try {
    const { bestKey, worstKey } = analyzeSong(parseChords({ text: song.body }), song.data.key);
    return {
      song,
      complexityScore: bestKey.score ? bestKey.score.toString().slice(0, 4) : "0",
      sumScore: bestKey.sumScore,
      worstKey,
    };
  } catch (e) {
    // User-entered songs can contain chords the analyzer doesn't know.
    console.warn(`Could not analyze "${song.data.title}":`, e);
    return { song, complexityScore: "?" };
  }
}

// Songs without chords score 0/0.
const num = (n: number | undefined) => (n === undefined || Number.isNaN(n) ? "" : n);

export default function SongList({ songs }: { songs: Song[] }) {
  const stats = useMemo(() => songs.map(getSongStats), [songs]);

  return (
    <div className={styles.songList}>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Performer</th>
            <th>Complexity</th>
            <th>Key</th>
            <th>Score</th>
            <th>Worst Key Score</th>
            <th>Worst Key</th>
          </tr>
        </thead>
        <tbody>
          {stats.map(({ song, complexityScore, sumScore, worstKey }) => (
            <tr key={song.id}>
              <td>
                <Link to={`/songs/${song.id}`}>{song.data.title}</Link>
              </td>
              <td>{song.data.performer}</td>
              <td>{complexityScore}</td>
              <td>{song.data.key}</td>
              <td>{num(sumScore)}</td>
              <td>{num(worstKey?.sumScore)}</td>
              <td>{num(worstKey?.score)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
