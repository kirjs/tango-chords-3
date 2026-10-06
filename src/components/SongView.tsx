import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import type { LineToken } from "../chords/chords";
import type { TransposeState } from "../hooks/useTranspose";
import styles from "./SongView.module.scss";

type RenderedLine = LineToken & { tag?: string; sectionEnd?: boolean };

interface Props {
  lines: RenderedLine[];
  displayChord: TransposeState["displayChord"];
  /** The horizontally scrolling container, shared with autoscroll. */
  scrollRef: RefObject<HTMLDivElement | null>;
  /** Shown at the top of the first column (title, performer…). */
  heading?: ReactNode;
}

interface Section {
  tag?: string;
  lines: { line: RenderedLine; index: number }[];
}

// Each [tag] line starts a new section; lines before the first tag form their own.
function groupSections(lines: RenderedLine[]): Section[] {
  const sections: Section[] = [];
  lines.forEach((line, index) => {
    if (line.type === "tagLine" || sections.length === 0) {
      sections.push({ tag: line.tag, lines: [] });
    }
    sections[sections.length - 1]!.lines.push({ line, index });
  });
  return sections;
}

function sentenceCase(text: string) {
  const t = text.trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function Chord({ chord }: { chord: string }) {
  return chord.trim() ? (
    <span className={styles.chord}>{chord}</span>
  ) : (
    <span>{chord}</span>
  );
}

// Lines flow top-to-bottom into as many columns as needed; columns that don't
// fit on screen overflow sideways, so the song only ever scrolls horizontally.
// Columns are as wide as the widest line.
export default function SongView({
  lines,
  displayChord,
  scrollRef,
  heading,
}: Props) {
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [columnWidth, setColumnWidth] = useState<number>();
  const sections = useMemo(() => groupSections(lines), [lines]);

  // Columns must be at least as wide as the widest line. Measured at
  // max-content because lines otherwise stretch to the current column width.
  useLayoutEffect(() => {
    const measure = () => {
      const els = lineRefs.current.filter(
        (el): el is HTMLDivElement => el !== null,
      );
      els.forEach((el) => (el.style.width = "max-content"));
      const widest = Math.max(0, ...els.map((el) => el.offsetWidth));
      els.forEach((el) => (el.style.width = ""));
      setColumnWidth(widest);
    };
    measure();
    document.fonts?.ready.then(measure);
  }, [lines, displayChord]);

  // A vertical mouse wheel scrolls the columns sideways.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        el.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [scrollRef]);

  return (
    <div ref={scrollRef} className={styles.song}>
      {/* Exactly one column wide; the rest overflow to the right at the same
          width, so columns never stretch and the next one peeks in at the edge. */}
      <div
        className={styles.columns}
        style={columnWidth ? { width: columnWidth, columnWidth } : undefined}
      >
        {heading}
        {sections.map((section, s) => (
          <section
            key={s}
            className={[styles.section, section.tag && styles[section.tag]]
              .filter(Boolean)
              .join(" ")}
          >
            {section.lines.map(({ line, index }) => (
              <div
                key={index}
                ref={(el) => {
                  lineRefs.current[index] = el;
                }}
                className={`${styles.line} ${styles[line.type]}`}
              >
                {line.type === "chordsLine" &&
                  line.value.map(
                    (c, j) => c.chord && <Chord key={j} chord={c.chord} />,
                  )}

                {line.type === "lyricsLine" && line.value}

                {line.type === "tagLine" && (
                  <div className={styles.ribbon}>
                    {sentenceCase(line.value)}
                  </div>
                )}

                {line.type === "chordsAndLyricsLine" &&
                  line.value.map((item, j) => {
                    const chord = item.chord
                      ? displayChord(item.chord, item.romanNumeral)
                      : "";
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
          </section>
        ))}
      </div>
    </div>
  );
}
