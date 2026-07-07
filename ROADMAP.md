# CASSD — product roadmap & idea bank

Status: **proposals, not decisions.** David picks from this menu; when an item is chosen,
move it into CLAUDE.md §10 as "decided" and build it. Everything here respects the hard
conventions (zero deps, inline styles, tactile/skeuomorphic feel).

## Direction set by David (2026-07-07)

1. **Goal: revenue + portfolio.** Monetization is real, not hypothetical — build toward
   §4.1 (Club subscription), but feel/polish still ships first (portfolio value).
2. **Target: App Store + Play Store.** Plan for a **Capacitor wrapper** (see §5.6).
   Consequences: digital goods must use **in-app purchases** (Apple mandates IAP,
   15–30% cut; Stripe not allowed for digital content inside iOS app). Design the
   subscription around StoreKit/Play Billing from the start, not Stripe.
   Note: Capacitor is a build/shell dependency — the *app runtime* stays zero-dep;
   record this exception in CLAUDE.md §3 when the time comes.
3. **Social: yes, where it makes sense.** Start with zero-backend versions (mixtape in
   a share URL, share images); full accounts/duo-habits come with the sync backend.

---

## North star

CASSD should feel like a **collectible music ritual**, not a productivity app.
The tape metaphor is the moat — every feature should deepen it. Rule of thumb:
if a feature could exist in any todo app unchanged, re-skin it through the cassette
world or drop it.

---

## 1. Deepen the core loop (make it more than a todo)

### 1.1 Mixtapes (playlists of tasks) — highest leverage
- A **mixtape** = ordered list of cassettes (a plan for the day / a project).
- Boombox gets **auto-advance**: finish a tape → next one slides in (with sound).
- Side A / Side B: morning vs afternoon, or "must do" vs "nice to do".
- Finished mixtape = a **cover artwork** (generated from tape colours + names) that
  goes into a "record shelf" archive. This is the shareable artifact (see §3).

### 1.2 Tape length = time estimate
- When printing, pick **C-30 / C-60 / C-90** (or custom). The boombox counts **down**;
  the tape visibly "runs out" (reel sizes shift — left reel empties, right fills).
- Running out of tape ≠ fail: it flips to Side B (overtime) with a different LCD colour.
- This turns the timer from a stopwatch into drama, and enables pomodoro-style focus
  sessions without ever saying "pomodoro".

### 1.3 Habit tapes that wear
- Each habit completion = one **overdub**: counter on the label (`REC ×12`), and the
  tape visually ages — label scuffs, corner wear, faded ink. Wear = pride, like a
  worn-in pair of jeans. Streak break = a small piece of tape "spliced" (visible scar).
- Streak milestones print a **sticker** you can slap on the locker door (§1.5).

### 1.4 Sound design (cheap, huge payoff)
- WebAudio-synthesized (no asset deps): slot **clunk**, motor hum while playing,
  spring **eject**, crate **thunk**, coin cash-in jingle. Global mute toggle.
- This is likely the single biggest "feel" upgrade per hour of work.

### 1.5 Stickers on the locker (already wanted)
- Two sources: **bought** (shop packs) and **earned** (achievements: first 10 tapes,
  7-day streak, emptied a full crate, night-owl session…).
- Free placement on the doors (drag, rotate slightly, they persist). The locker becomes
  the user's identity — the screenshot people will want to share.

### 1.6 Weekly recap as "liner notes"
- Every Monday: a generated **album insert** — tapes played, minutes, best day, longest
  session — styled like a cassette J-card. Also the vehicle for share images (§3).

---

## 2. Retention & engagement

- **Daily pressing bonus:** first tape printed each day mints +N coins; small streak
  multiplier. Keeps the Studio in the daily path.
- **Collectible drops:** occasionally a finished task ejects as a **rare shell**
  (chrome, clear, glow-in-dark). Rarity tiers. Collection page = "tape binder".
  Collecting is the retention engine cosmetics alone won't give.
- **PWA + install prompt + notifications:** "Your tape is still playing ▶" if a task
  runs > X h; gentle morning nudge if a mixtape is queued. Requires PWA work (§5).
- **Empty-state charm:** locker with no tapes should invite ("shelves look lonely —
  print your first tape"), not look broken.

---

## 3. Growth (getting more people in)

- **Shareable artifacts, not invites:** recap J-card, mixtape cover, and the stickered
  locker export as **story-sized images** (canvas render). Watermark `CASSD · tasks on tape`.
  This is the organic loop: the app is visually unusual enough that screenshots carry it.
- **"Snimi mi mixtape":** send a friend a mixtape (a list of challenge tasks) via a
  share link. Receiver gets real cassettes on a special shelf. Needs backend (§5) —
  but a v0 can encode the mixtape in the URL itself, zero backend.
- **Duo habit tape:** one shared habit with a friend; both must play it that day to
  keep the streak. Strong retention mechanic, needs accounts.
- Positioning for store/socials: **"a toy that gets things done"** — lead with the
  eject animation and locker, never with checklists.

---

## 4. Monetization

Principle: **never sell productivity** (all task features free), **sell identity &
convenience** (cosmetics, sync). Avoid pay-to-win coins.

### 4.1 CASSD Club (subscription, ~€2–3/mo)
- **Monthly skin drop:** 1 boombox + 1 locker finish + 1 shell + sticker pack, Club-only,
  rotates — the "season pass" feel with zero gameplay lock.
- **Cloud sync + backup** across devices (currently localStorage-only; §5).
- **Full liner-notes history** (free keeps last 4 weeks).
- **Custom label maker:** fonts, marker-style handwriting, label colours, doodles.
- Coin perk: small weekly coin stipend (cosmetic economy only, so this is safe).

### 4.2 One-time purchases
- **Deluxe unlock** (lifetime cosmetics catalog) for subscription-averse users.
- Occasional **limited edition packs** (e.g. "Y2K pack", "Studio 54 pack").

### 4.3 What NOT to do
- No ads (kills the toy feel). No selling coins directly at launch. No locking core
  loop features (habits, shelves, mixtapes) behind pay.

---

## 5. Technical prerequisites (build order matters)

1. **PWA:** manifest + service worker + offline. Zero-dep, unlocks install +
   notifications. Do this first; the app is already mobile-shaped (412px frame).
2. **Sound engine:** small WebAudio module (`src/sound.ts`), synthesized effects.
3. **Accounts + sync:** the first real backend decision. Smallest viable path:
   lightweight auth + a single JSON blob per user (the `Persisted` object) with
   last-write-wins + version field. Everything social/paid hangs off this.
4. **Payments:** only after sync exists. Store target (decided) means **IAP via
   StoreKit / Play Billing** through the Capacitor shell — not Stripe — for anything
   sold inside the app. Web version can keep a Stripe path if it stays separate.
5. **Share-image renderer:** offscreen `<canvas>` painting the J-card/locker → PNG.
6. **Capacitor shell (decided direction):** wrap the built Vite app for iOS/Android.
   Needed for store presence, IAP, native notifications, haptics (nice fit for the
   tactile feel). Keep it a thin shell: all product code stays plain web / zero-dep.
   Requires: Apple Developer account ($99/yr), Play Console ($25 once), a Mac with
   Xcode (David has a MacBook — OK).

Suggested sequence: **1 (PWA basics) → 2 (sound) → §1.2/§1.3/§1.5 (client features)
→ 5 (share images) → 6 (Capacitor + store beta) → 3 (accounts/sync) → 4 (IAP Club).**
Ship feel first, then store presence, then backend, then money.

---

## 6. Guide for future AI sessions

- Read CLAUDE.md first (conventions are hard rules). This file is the **idea menu**;
  do not build from it unless David picked the item.
- When David picks an item: move it to CLAUDE.md §10 "Decided", sketch visuals in the
  design lab first if it's a look, then implement.
- Every new mechanic must pass the **metaphor test** (§ North star) and the
  **zero-dep test** (no libraries; WebAudio/canvas/CSS only).
- New persisted fields → `storage.ts` `Persisted` + `DEFAULTS` + migration in `load()`.
- Monetization code must never gate task functionality — cosmetics & sync only (§4).
