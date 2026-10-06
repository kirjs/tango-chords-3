import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

export interface OpenChord {
  name: string;
  anchor: DOMRect;
  pinned: boolean;
}

const CARD = '[role="dialog"][aria-label$="chord diagram"]';

/**
 * Chord diagrams for a sheet. Chords are found by their data-chord attribute.
 * - Mouse: hovering previews the diagram.
 * - Keyboard: Tab to a chord previews it; Enter/Space pins it and moves focus
 *   into the card (to flip shapes); Escape closes and returns focus.
 * - Click or tap pins it until you click elsewhere or press Escape.
 * The card follows its chord when the sheet scrolls.
 */
export function useChordPopover(scrollRef: RefObject<HTMLElement | null>) {
  const [open, setOpen] = useState<OpenChord | null>(null);
  const hideTimer = useRef<number | undefined>(undefined);
  const anchorEl = useRef<HTMLElement | null>(null);
  const openRef = useRef(open);
  openRef.current = open;

  const show = useCallback((chord: HTMLElement, pinned: boolean) => {
    anchorEl.current = chord;
    setOpen({ name: chord.dataset.chord!, anchor: chord.getBoundingClientRect(), pinned });
  }, []);

  const close = useCallback((returnFocus = false) => {
    setOpen(null);
    if (returnFocus) anchorEl.current?.focus();
  }, []);

  const cancelHide = useCallback(() => window.clearTimeout(hideTimer.current), []);
  const scheduleHide = useCallback(() => {
    cancelHide();
    hideTimer.current = window.setTimeout(() => {
      const card = document.querySelector(CARD);
      const focusInside = card?.contains(document.activeElement) || document.activeElement === anchorEl.current;
      if (!openRef.current?.pinned && !focusInside) setOpen(null);
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
      show(chord, false);
    };
    const onOut = (e: PointerEvent) => {
      if (chordAt(e) && e.pointerType === "mouse") scheduleHide();
    };
    const onClick = (e: MouseEvent) => {
      const chord = chordAt(e);
      if (!chord) return;
      const current = openRef.current;
      if (current?.pinned && current.name === chord.dataset.chord && anchorEl.current === chord) close();
      else show(chord, true);
    };
    const onFocusIn = (e: FocusEvent) => {
      const chord = chordAt(e);
      if (!chord) return;
      cancelHide();
      if (!(openRef.current?.pinned && anchorEl.current === chord)) show(chord, false);
    };
    const onFocusOut = (e: FocusEvent) => {
      const next = e.relatedTarget as Element | null;
      if (next?.closest(CARD) || next?.closest("[data-chord]")) return;
      if (!openRef.current?.pinned) scheduleHide();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      const chord = chordAt(e);
      if (!chord || (e.key !== "Enter" && e.key !== " ")) return;
      e.preventDefault();
      show(chord, true);
      // Move into the card once it has rendered, so Tab reaches its buttons.
      requestAnimationFrame(() => {
        const card = document.querySelector<HTMLElement>(CARD);
        (card?.querySelector<HTMLElement>("button") ?? card)?.focus();
      });
    };
    // Follow the chord as the sheet scrolls; close once it's off screen.
    const onScroll = () => {
      const chord = anchorEl.current;
      if (!openRef.current || !chord?.isConnected) return;
      const anchor = chord.getBoundingClientRect();
      if (anchor.right < 0 || anchor.left > window.innerWidth) setOpen(null);
      else setOpen((o) => (o ? { ...o, anchor } : o));
    };

    el.addEventListener("pointerover", onOver);
    el.addEventListener("pointerout", onOut);
    el.addEventListener("click", onClick);
    el.addEventListener("focusin", onFocusIn);
    el.addEventListener("focusout", onFocusOut);
    el.addEventListener("keydown", onKeyDown);
    el.addEventListener("scroll", onScroll);
    return () => {
      el.removeEventListener("pointerover", onOver);
      el.removeEventListener("pointerout", onOut);
      el.removeEventListener("click", onClick);
      el.removeEventListener("focusin", onFocusIn);
      el.removeEventListener("focusout", onFocusOut);
      el.removeEventListener("keydown", onKeyDown);
      el.removeEventListener("scroll", onScroll);
    };
  }, [scrollRef, cancelHide, scheduleHide, show, close]);

  // Escape closes (returning focus to the chord); while pinned, so does a
  // click outside the card and the chords.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(true);
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Element;
      if (open.pinned && !t.closest("[data-chord]") && !t.closest(CARD)) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open, close]);

  useEffect(() => cancelHide, [cancelHide]);

  return {
    open,
    // Keep a preview open while the pointer is over the card itself.
    onCardEnter: cancelHide,
    onCardLeave: scheduleHide,
  };
}
