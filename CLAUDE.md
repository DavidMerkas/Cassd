# CASSD — build guide for AI assistants

Read this first. It captures the vision, conventions, architecture, decisions, and
open threads so a fresh session can continue building without re-deriving everything.

---

## 1. What CASSD is

**"Tasks on tape."** A gamified to-do app where every task is a **cassette**.

Core loop:
1. **Studio** — "print" a new cassette (name it, choose a shelf).
2. **Closet** — your cassettes live on shelves inside a **metal locker**.
3. Drag a tape from the closet up into the **boombox** slot to start "playing" it (a timer runs).
4. **Eject** — the tape pops out; drag/tap it **left = back to the shelf** (still pending)
   or **right = DONE into the crate**. Habit tapes rewind to the closet instead.
5. **Crate** — finished tapes pile up; cash the crate in for **coins**.
6. **Shop** — spend coins on skins (boombox colours, closet paint finishes, cassette styles).

It's a toy as much as a tool — the tactile, physical feel (things slot in, pop out, doors
swing open) is the point. Lean into skeuomorphism and playful motion.

---

## 2. Working agreement (how the maintainer likes to work)

- **Maintainer:** David (GitHub `DavidMerkas`). **He writes in Croatian — reply in Croatian.**
- **Git:** repo `https://github.com/DavidMerkas/Cassd.git`, branch `main`. Repo-local identity is
  `user.email dadex584@gmail.com`. `gh` CLI is authenticated (push works with plain `git push`).
- **Daily workflow:** `git pull` before starting (he switches between a Windows PC and a MacBook),
  commit + `git push` when a piece of work is done.
- **Design flow:** for anything visual/big, he likes to **iterate in a design lab first**
  (`public/cassette-lab.html`, served at `http://localhost:5173/cassette-lab.html`), agree on the
  look, *then* build it into the app. Offer options; he'll pick or send reference images.
- **Verify everything in the browser preview** before saying it's done (see §11). Never ask him to
  check manually.
- **Commit messages:** imperative, explain the "why". Co-author trailer:
  `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- He gives sharp visual feedback and will tell you when something's off. Don't over-explain; show it.

---

## 3. Hard conventions (do not break)

- **Stack:** Vite + React 19 + TypeScript. **Zero runtime dependencies** (only `react` / `react-dom`).
  Do **not** add libraries (no three.js, no CSS frameworks, no animation libs). Everything is
  hand-built. If you think you need a dep, find a CSS/JS way instead or ask first.
- **All styling is inline styles** + a small `src/index.css` (only global resets, `@keyframes`,
  `.press`, `.tape-hover`, `.cassd-scroll`, reduced-motion). No CSS modules, no Tailwind.
- **Design language:**
  - Bold ink outline `#16140F` (2–3px) on almost everything.
  - Hard offset shadows, e.g. `box-shadow: 0 4px 0 #16140F` / `0 6px 0 <dark>` for extrusion.
  - Chunky rounded corners; press-down buttons use `className="press"` with `--sh` (rest) and
    `--sh-a` (pressed) CSS vars.
  - Fonts: **Anton** (display/headings), **Inter** (UI/body), **Space Mono** (LCD / mono bits).
  - Cream frame `#ECE5D6` on a `#d8d3c7` page; coin gold `#FFD23F`; primary CTA orange `#FF5C28`.
- **Build must stay green:** `npm run build` runs `tsc --noEmit && vite build`. Typecheck before commit.
- **New persisted fields** go in `src/storage.ts` (`Persisted` interface + `DEFAULTS`) and usually need
  a migration branch in `load()`.
- **Avoid CSS `color-mix()` in shipped components** where a plain value works — prefer JS colour
  helpers (see `Cassette.tsx` `mix/dark/light`, `Closet.tsx` `shade`). `color-mix` is fine in the lab.

---

## 4. Architecture / file map

```
src/
  App.tsx            All app state + orchestration: tasks, shelves, coins, owned/equipped skins,
                     drag & drop, eject-armed flow, screen routing, persistence effect.
  types.ts           Task, Shelf, Screen, TaskState, Owned, Equipped, DragState, Category, CassetteStyle.
  skins.ts           GROUPS + PALETTE (shelf/tape colours), newShelfId(), defaultShelves(),
                     BB_SKINS (boombox), CLOSET_SKINS (paint finishes), CASSETTE_SKINS, CATALOG, VALUE_PER.
  storage.ts         localStorage (key "cassd:v1"): Persisted, DEFAULTS, load() (+migrateShelves), save().
  util.ts            inkOn(color) -> contrast ink, fmt(seconds) -> mm:ss.
  index.css          global resets, keyframes, .press / .tape-hover / .cassd-scroll, reduced-motion.
  components/
    Closet.tsx       THE metal locker: paint finish, vents, rivets, dark steel interior, metal shelves,
                     user shelves (create/rename/remove, inline edit), tape spines, swing-open doors.
    Studio.tsx       "Print a cassette": name input, shelf picker (+ new shelf), habit toggle, live preview.
    Crate.tsx        Finished tapes in a wooden crate; "crate value" + EMPTY CRATE -> coins.
    Shop.tsx         Buy/equip boombox / closet / cassette skins with coins.
    Boombox.tsx      The dock (position:absolute, floats over content): top slot, docked cassette,
                     2 screens (main LCD + mini tab-dial LCD), speakers, EJECT/CANCEL, prev/next arrows.
    Cassette.tsx     The tape itself (the 3D model — see §7). Used in Studio preview, boombox dock,
                     drag ghost. (Closet renders its own thin colored "spines", NOT this component.)
    PullZones.tsx    The two eject drop targets that peek in from the edges: left = mini metal locker
                     (CLOSET), right = wooden crate (DONE). Tappable when eject is armed.
public/
  cassette-lab.html  Standalone design lab (see §9). Ships in the build at /cassette-lab.html.
```

---

## 5. Data model & persistence

```ts
Shelf = { id: string; name: string; color: string }     // user-created, ordered
Task  = { id, name, shelfId, color, habit, state }
state: 'shelf' | 'playing' | 'done' | 'archived'
```

- Tasks are filed on **user-created shelves** (not fixed categories). `task.color` is copied from the
  shelf's colour at creation. The little tag on a cassette shows `SHELFNAME · A`.
- `storage.ts` key is `cassd:v1`. `DEFAULTS.shelves = defaultShelves()` (Work / Life / Habits).
- **Migration:** older tasks had a fixed `group` string. `migrateShelves()` in `load()` maps legacy
  `group` -> a matching `shelfId` (creating shelves as needed) and drops `group`. Keep this working.
- `App.tsx` persists `{ tasks, shelves, coins, owned, equipped, playedLifetime, boomboxId, elapsed }`
  on every change. `boomboxId` = the currently docked/playing task; `elapsed` = its timer.

---

## 6. Screens & key mechanics

- **Navigation lives on the boombox** (a tab dial): mini LCD shows the current screen + icon, and
  ◀ ▶ arrows cycle closet → studio → crate → shop. There is no separate nav bar.
- **Boombox floats** over the content (`position:absolute`, `pointer-events:none` on the transparent
  fade so clicks pass through; the opaque body re-enables `pointer-events`). Content scrolls behind it
  (the scroll area has big `padding-bottom`).
- **Insert:** drag a shelf tape up; over the dock a dashed drop target + "DROP IT" appear; release to
  dock. Slot geometry constants live in `Boombox.tsx` (`SLOT_LINE = 16`, `INSERT_DEPTH`, `CASS_W = 196`,
  `ZONE_H`). Changing the deck must keep the docked cassette lined up with the slot mouth.
- **Eject flow (important):** the EJECT button does **not** open a modal. It "arms" (`ejectArmed`):
  the docked tape **pops up and out** (tilted), and the two `PullZones` targets slide in. Then:
  drag the tape / tap a target: **left = SHELF** (`ejectShelf`), **right = DONE** (`ejectDone`,
  crate + coins, or rewind for habits), **drop in the middle / CANCEL = re-dock and keep playing**.
- **Closet = metal locker** with **doors that swing open every visit** (`cassd-door-l/r` keyframes;
  the component remounts on navigation so the animation replays). Finish (paint colour) comes from the
  equipped `CLOSET_SKINS[...]`.frame; interior is fixed dark steel so tape spines pop.
- **Shop skins** still work: cassette `cstyle` maps to `sticker` (default), `clean` (flat, no ribs/
  screws), `retro` (foil sheen) — see `Cassette.tsx`.

---

## 7. The cassette model (`Cassette.tsx`)

Built from a real texture guide David provided. Front-facing with **subtle extruded depth** (works in
the boombox slot). Parts, all to spec: recolourable plastic shell (body = shelf colour) with
injection-mold ribs, cream label (`#F6F0E8`, title + `SHELF · A`), black window (`#1E1E1E`) with two
white **sprocket reels** (`#E6E6E6`, spin when playing) + magnetic tape (`#3A2B22`) + dark glass,
bottom mechanism (capstan + square holes), metal corner screws (`#0B0B0B`), optional habit badge.

- **Recolours per shelf:** the body and its shading derive from `color` via the JS `mix/dark/light`
  helpers. Label/window/reels/screws are fixed.
- Designed at base `228 × 142`, scaled by the `w` prop. Reels spin via `cassd-spin` when `state==='playing'`.

---

## 8. The boombox (`Boombox.tsx`)

Skin-driven (`BB_SKINS`, default = "retro" which is now glossy **magenta**). Has a glossy body,
rainbow-sunburst **recessed** speakers with a purple dust-cap, a 3D top face holding the slot, main LCD
(track + timer + EQ bars), and the tab-dial mini LCD. `groupLabel` prop = the playing tape's shelf name.

Known open item: David wants a **stronger isometric** feel for the boombox and finds symmetric-trapezoid
top corners break it (we removed the dark corner wedges). A true isometric redraw (real top+side faces)
is still on the table — see §10.

---

## 9. Design lab — `public/cassette-lab.html`

A standalone HTML gallery used to explore/agree on looks before coding. Currently holds the chosen
cassette build (recolored per shelf) plus earlier explorations (Studio Master, Neon, Sticker Bomb,
Chrome Foil, Clear Shell, and the reference-matched Flat Deck / Inked / Classic). Add new candidates
here, screenshot them, let David pick, then port the winner into a component. (It ships at
`/cassette-lab.html` — harmless; remove from `public/` if you ever want it out of the build.)

---

## 10. Design decisions & open roadmap

Decided:
- Cassette = the texture-guide **3D model**, body recolours per shelf, accents follow the shell.
- Closet = **painted metal locker** with swing-open doors (hip-hop / mixtape vibe).
- Eject = physical: tape pops out, drag/tap left (shelf) or right (done). No modal.
- Nav lives on the boombox; boombox floats over content.
- Shelves are **user-created** (David organizes manually — no AI guessing where tapes go).

There is also a **ROADMAP.md** in the repo root — an idea bank of proposals (mixtapes,
tape lengths, sound, stickers, subscription…). Items there are NOT decided; David picks.

Open / requested (not built yet):
- **Stickers on the locker doors** — David explicitly wants this. The metal doors are the canvas;
  likely earned/bought and stuck on (a sticker layer over the doors, maybe via the shop).
- **Refine the boombox and cassette further** (his words: "boombox i kazetu ćemo kasnije još razraditi").
  Possibly a genuine isometric boombox.
- Sound effects, streaks for habits, more skins — nice-to-haves mentioned in passing.

---

## 11. Verifying changes (preview workflow)

Use the preview tools (dev server `cassd-dev`, port 5173). Don't ask David to check manually.

- **Seed state fast** by writing `localStorage["cassd:v1"]` then reloading. Template:
  ```js
  localStorage.setItem('cassd:v1', JSON.stringify({
    tasks: [{ id:'u0', name:'Write the report', shelfId:'shelf-work', color:'#FF5C28', habit:false, state:'playing' }],
    shelves: [{ id:'shelf-work', name:'Work', color:'#FF5C28' }],
    coins: 42, owned:{boombox:['retro','midnight'],closet:['oak','walnut'],cassette:['sticker','clean']},
    equipped:{boombox:'retro',closet:'oak',cassette:'sticker'}, playedLifetime:3, boomboxId:'u0', elapsed:421
  })); location.reload();
  ```
- To exercise drag/eject in the preview, dispatch synthetic `PointerEvent`s (pointerdown on the
  grab handle → pointermove on `window` → pointerup). Read back `localStorage` / DOM to assert results;
  preview screenshots often lag during animations, so trust DOM state over a screenshot mid-motion.
- The design lab lives at `/cassette-lab.html`.

## 12. Gotchas

- A dev-only React warning `useEffect ... changed size between renders` can appear **only** right after
  editing the persist effect's dependency array under HMR. It's stale (a full reload clears it) and does
  not occur in production. Don't chase it unless it reproduces on a clean load.
- `impeccable` design-hook messages fire on edits; the lab's gallery chrome (Inter font, dark glow,
  numbered markers) trips them but is intentional for an internal tool.
- Boombox slot geometry is interdependent (`SLOT_LINE`, `INSERT_DEPTH`, `CASS_W`) — verify docking after
  any deck change.
- The closet renders tape **spines** itself (thin colored rects); the full `Cassette` component is only
  used in Studio/boombox/drag-ghost.
