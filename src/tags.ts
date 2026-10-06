import type { Song } from "./types";

// Offered in the editor and as filters even before any song uses them.
export const DEFAULT_TAGS = ["tango", "russian"];

export const tagLabel = (tag: string) => tag.charAt(0).toUpperCase() + tag.slice(1);

/** Default tags plus any others songs already use, defaults first. */
export function allTags(songs: readonly Song[]): string[] {
  const used = new Set(songs.flatMap((s) => s.data.tags ?? []));
  return [...DEFAULT_TAGS, ...[...used].filter((t) => !DEFAULT_TAGS.includes(t)).sort()];
}
