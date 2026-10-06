import { Link } from "react-router-dom";
import { tagLabel } from "../tags";
import styles from "./TagFilter.module.scss";

interface Props {
  tags: string[];
  counts: Record<string, number>;
  total: number;
  active: string | null;
}

// Filters the index by tag; the choice lives in the URL (?tag=tango).
export default function TagFilter({ tags, counts, total, active }: Props) {
  const option = (tag: string | null, label: string, count: number) => (
    <Link
      key={tag ?? "all"}
      to={tag ? `/?tag=${encodeURIComponent(tag)}` : "/"}
      className={styles.option}
      aria-current={active === tag ? "page" : undefined}
    >
      {label}
      <span className={styles.count}>{count}</span>
    </Link>
  );

  return (
    <nav className={styles.filter} aria-label="Filter songs">
      {option(null, "All songs", total)}
      {tags.filter((t) => counts[t]).map((t) => option(t, tagLabel(t), counts[t]!))}
    </nav>
  );
}
