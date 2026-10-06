import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

export interface OpenChord {
  name: string;
  anchor: DOMRect;
  pinned: boolean;
}

/**
 * Chord diagrams for a sheet: hovering a chord (mouse) previews its diagram;
 * clicking or tapping pins it until you click elsewhere, press Escape or
 * scroll. Chords are found by their data-chord attribute.
 */
export function useChordPopover(scrollRef: RefObject<HTMLElement | null>) {
  const [open, setOpen] = useState<OpenChord | null>(null);
  const hideTimer = useRef<number | undefined>(undefined);
  const openRef = useRef(open);
  openRef.current = open;

  const cancelHide = useCallback(() => window.clearTimeout(hideTimer.current), []);
  const scheduleHide = useCallback(() => {
    cancelHide();
    hideTimer.current = window.setTimeout(() => {
      if (!openRef.current?.pinned) setOpen(null);
    }, 150);
  }, [cancelHide]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const chordAt = (e: Event) => (e.target as Element).closest<HTMLElement>("[data-chord]");

    const onOver = (e: PointerEvent) => {
      const chord = chordAt(e);
      if (!chord || e.pointerType !== "mouse" || openRef.current?.pinned) return;
      cancelHide();
      setOpen({ name: chord.dataset.chord!, anchor: chord.getBoundingClientRect(), pinned: false });
    };
    const onOut = (e: PointerEvent) => {
      if (chordAt(e) && e.pointerType === "mouse") scheduleHide();
    };
    const onClick = (e: MouseEvent) => {
      const chord = chordAt(e);
      if (!chord) return;
      const name = chord.dataset.chord!;
      const current = openRef.current;
      setOpen(
        current?.pinned && current.name === name
          ? null
          : { name, anchor: chord.getBoundingClientRect(), pinned: true },
      );
    };
    const close = () => setOpen(null);

    el.addEventListener("pointerover", onOver);
    el.addEventListener("pointerout", onOut);
    el.addEventListener("click", onClick);
    el.addEventListener("scroll", close);
    return () => {
      el.removeEventListener("pointerover", onOver);
      el.removeEventListener("pointerout", onOut);
      el.removeEventListener("click", onClick);
      el.removeEventListener("scroll", close);
    };
  }, [scrollRef, cancelHide, scheduleHide]);

  // Pinned: close on Escape or a click outside the card and the chords.
  useEffect(() => {
    if (!open?.pinned) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    const onDown = (e: PointerEvent) => {
      const t = e.target as Element;
      if (!t.closest("[data-chord]") && !t.closest('[role="dialog"][aria-label$="chord diagram"]')) {
        setOpen(null);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open?.pinned]);

  useEffect(() => cancelHide, [cancelHide]);

  return {
    open,
    // Keep a hover preview open while the pointer is over the card itself.
    onCardEnter: cancelHide,
    onCardLeave: scheduleHide,
  };
}
