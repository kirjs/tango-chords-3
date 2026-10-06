import type { LineToken } from "../chords/chords";
import type { TransposeState } from "../hooks/useTranspose";
import styles from "./SongView.module.scss";

type RenderedLine = LineToken & { tag?: string; sectionEnd?: boolean };

interface Props {
  lines: RenderedLine[];
  displayChord: TransposeState["displayChord"];
}

function Chord({ chord }: { chord: string }) {
  return chord.trim() ? <span className={styles.chord}>{chord}</span> : <span>{chord}</span>;
}

export default function SongView({ lines, displayChord }: Props) {
  return (
    <div className={styles.song}>
      {lines.map((line, i) => (
        <div
          key={i}
          className={[
            styles.line,
            styles[line.type],
            line.tag && styles[line.tag],
            line.sectionEnd && styles.sectionEnd,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {line.type === "chordsLine" &&
            line.value.map((c, j) => c.chord && <Chord key={j} chord={c.chord} />)}

          {line.type === "lyricsLine" && line.value}

          {line.type === "tagLine" && <div className={styles.tag}>{line.value}</div>}

          {line.type === "chordsAndLyricsLine" &&
            line.value.map((item, j) => {
              const chord = item.chord ? displayChord(item.chord, item.romanNumeral) : "";
              return (
                <div key={j}>
                  <div className={styles.chordOrSpacer}>
                    {chord && <Chord chord={chord} />}
                    {" ".repeat(Math.max(0, item.length - chord.length))}
                  </div>
                  <div className={styles.lyrics}>{item.lyrics}</div>
                </div>
              );
            })}
        </div>
      ))}
    </div>
  );
}
