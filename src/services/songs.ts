import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import type { Song, SongData } from "../types";

// Same document shape as the production app:
// songs/{id} = { id, data: SongData, body, userId, createdAt, updatedAt }
const songsCollection = collection(db, "songs");

// A few early documents use an older shape (top-level title/content) and are
// test copies; like the production app, only documents with `data` count.
function toSong(id: string, raw: DocumentData): Song | null {
  if (!raw["data"] || typeof raw["data"] !== "object") {
    return null;
  }
  return {
    id,
    slug: id,
    data: {
      ...raw["data"],
      title: raw["data"].title || "Untitled",
      tags: Array.isArray(raw["data"].tags)
        ? raw["data"].tags.filter((t: unknown): t is string => typeof t === "string")
        : [],
    },
    body: raw["body"] ?? "",
    userId: raw["userId"],
    views: typeof raw["views"] === "number" ? raw["views"] : 0,
  };
}

export const songsService = {
  async getAllSongs(): Promise<Song[]> {
    const snapshot = await getDocs(songsCollection);
    return snapshot.docs
      .map((d) => toSong(d.id, d.data()))
      .filter((s): s is Song => s !== null);
  },

  async getSong(id: string): Promise<Song | null> {
    const snapshot = await getDoc(doc(songsCollection, id));
    return snapshot.exists() ? toSong(snapshot.id, snapshot.data()) : null;
  },

  /** Adds one to the song's view count (a top-level field, so edits keep it). */
  async recordView(id: string): Promise<void> {
    await updateDoc(doc(songsCollection, id), { views: increment(1) });
  },

  async deleteSong(id: string): Promise<void> {
    await deleteDoc(doc(songsCollection, id));
  },

  async saveSong(data: SongData, body: string, id?: string): Promise<string> {
    const ref = id ? doc(songsCollection, id) : doc(songsCollection);
    await setDoc(
      ref,
      {
        id: ref.id,
        data,
        body,
        userId: auth.currentUser?.uid,
        updatedAt: serverTimestamp(),
        // Only stamp on create; merging must not wipe the original value.
        ...(id ? {} : { createdAt: serverTimestamp() }),
      },
      { merge: true },
    );
    return ref.id;
  },
};
