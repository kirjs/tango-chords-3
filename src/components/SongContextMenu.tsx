import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Song } from "../types";
import styles from "./SongContextMenu.module.scss";

interface Props {
  song: Song;
  x: number;
  y: number;
  onDelete: (song: Song) => void;
  onClose: () => void;
}

export default function SongContextMenu({ song, x, y, onDelete, onClose }: Props) {
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: x, top: y });

  // Keep the menu on screen, and focus the first item for keyboard use.
  useLayoutEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    setPos({
      left: Math.min(x, window.innerWidth - width - 8),
      top: Math.min(y, window.innerHeight - height - 8),
    });
    el.querySelector<HTMLButtonElement>("button")?.focus();
  }, [x, y]);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) onClose();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      const items = [...(menuRef.current?.querySelectorAll("button") ?? [])];
      const i = items.indexOf(document.activeElement as HTMLButtonElement);
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowDown") items[(i + 1) % items.length]?.focus();
      else if (e.key === "ArrowUp") items[(i - 1 + items.length) % items.length]?.focus();
      else return;
      e.preventDefault();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onClose, true);
    window.addEventListener("resize", onClose);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onClose, true);
      window.removeEventListener("resize", onClose);
    };
  }, [onClose]);

  const act = (fn: () => void) => () => {
    onClose();
    fn();
  };

  return (
    <div
      ref={menuRef}
      className={styles.menu}
      style={pos}
      role="menu"
      aria-label={song.data.title}
    >
      <button role="menuitem" onClick={act(() => navigate(`/songs/${song.id}`))}>
        Open
      </button>
      <button role="menuitem" onClick={act(() => navigate(`/songs/${song.id}/edit`))}>
        Edit
      </button>
      <hr />
      <button role="menuitem" className={styles.danger} onClick={act(() => onDelete(song))}>
        Delete…
      </button>
    </div>
  );
}
