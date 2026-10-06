export interface SongData {
  title: string;
  key?: string;
  performer?: string;
  genre?: string;
  composer?: string;
  lyricist?: string;
  source?: string;
}

export interface Song {
  id: string;
  slug: string;
  data: SongData;
  body: string;
  userId?: string;
}
