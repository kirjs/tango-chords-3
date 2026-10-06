# tango-chords-3

Chord sheets with transposition, roman-numeral notation and auto-scroll.
React + Vite rewrite of the Vue app at https://tango-chords.web.app, using the
same Firebase project (`tango-chords`) and Firestore `songs` collection.

```sh
npm install
npm run dev      # http://localhost:5173
npm test
npm run build
```

## Data

`songs/{id}`:

```ts
{ id, data: { title, key, performer, composer, lyricist, genre, source }, body, userId, createdAt, updatedAt }
```

`body` is plain text with chord lines above lyric lines; `[Chorus]`-style tag
lines start colored sections. Reading is public; creating/editing requires
Google login.

## Layout

- `src/chords/` – parsing, transposition, key analysis (framework-agnostic, from tangochords2)
- `src/services/` – Firebase init and Firestore access
- `src/context/` – auth and shared song list
- `src/hooks/useTranspose.ts` – per-song transpose/notation state
- `src/pages/` – home list, song view, editor
