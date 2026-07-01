# CASSD — tasks on tape 📼

A gamified todo app styled as a retro cassette deck. Tasks are cassettes:

- **The Closet** — your shelf of pending tapes, organised by section (WORK / RITUAL / BODY / MIND / LIFE)
- **The Studio** — print a new cassette (optionally a *habit*, which rewinds to the closet after each play)
- **The Boombox** — drag a tape from the closet into the deck to start playing (working on) it; pull it out or hit EJECT when you stop
- **The Crate** — finished tapes pile up here; empty the crate to cash them in for coins
- **The Shop** — spend coins on boombox skins, closet wood finishes, and cassette label styles

Everything persists in `localStorage`.

Built from a [Claude Design](https://claude.ai/design) prototype, ported to React.

## Stack

- [Vite](https://vitejs.dev/) + [React 19](https://react.dev/) + TypeScript
- No other runtime dependencies — all styling is inline / vanilla CSS

## Development

```bash
npm install
npm run dev      # dev server on http://localhost:5173
npm run build    # typecheck + production build to dist/
```

## Project layout

```
src/
  App.tsx                  # state container: tasks, coins, drag & drop, screens
  skins.ts                 # groups, boombox/closet/cassette skins, shop catalog
  storage.ts               # localStorage persistence
  util.ts                  # inkOn (contrast ink), fmt (mm:ss)
  components/
    Cassette.tsx           # the tape itself (sticker / clean / retro foil styles)
    Closet.tsx  Studio.tsx  Crate.tsx  Shop.tsx
    Boombox.tsx            # the deck: LCD, speakers, docked tape, eject
    EjectOverlay.tsx       # "where does the tape go?" dialog
```
