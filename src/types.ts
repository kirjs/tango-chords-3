export interface SongData {
  title: string;
  key?: string;
  performer?: string;
  genre?: string;
  composer?: string;
  lyricist?: string;
  source?: string;
  /** Lowercase, e.g. ["tango"] or ["russian"]. */
  tags?: string[];
}

export interface Song {
  id: string;
  slug: string;
  data: SongData;
  body: string;
  userId?: string;
}
