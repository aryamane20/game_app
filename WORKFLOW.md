# UNRAVEL — Build Order & Workflow

## Golden Rule for Claude Code
Build ONE layer at a time. Never scaffold the next layer until 
the current one has zero TypeScript errors and works on device.
Run `npx tsc --noEmit` after every layer before moving on.

## Dependency Map (what needs what)
types/knot.ts
↓
utils/knotMath.ts + utils/bezierPath.ts
↓
data/levels/world1.ts
↓
stores/gameStore.ts + stores/progressStore.ts
↓
hooks/useKnot.ts + hooks/useHaptics.ts
↓
components/KnotCanvas.tsx
↓
components/CrossingPoint.tsx + components/StrandPath.tsx
↓
components/SnapAnimation.tsx
↓
app/game/[levelId].tsx (game screen)
↓
app/result/index.tsx (result screen)
↓
app/index.tsx (home screen)
↓
app/game/daily.tsx + app/zen/index.tsx
↓
utils/shareImage.ts + hooks/useStreak.ts
↓
utils/iap.ts (monetization - last)

---

## LAYER 1 — Foundation (build this first, nothing else)

**Goal:** TypeScript compiles. No UI yet. Just data and logic.

### 1.1 — Types
File: `types/knot.ts`
```typescript
// Must define ALL of these before anything else:
// Point, Strand, Crossing, Knot, StarRating, GamePhase,
// LevelProgress, GameState, DailyKnotResult
```
✅ Done when: `npx tsc --noEmit` passes with zero errors

### 1.2 — Knot Math (pure functions, no React)
File: `utils/knotMath.ts`
```typescript
// flipCrossing(knot, crossingId): Knot
// isSolved(knot): boolean  
// getStarRating(knot, moves): StarRating
// getRemainingCrossings(knot): number
```
✅ Done when: unit tests pass for all 4 functions

### 1.3 — Bezier Path Generator
File: `utils/bezierPath.ts`
```typescript
// generatePath(strand: Strand): string
// getUnderGapPath(strand, crossing): string
```
✅ Done when: generates valid SVG path strings

### 1.4 — Level Data
File: `data/levels/world1.ts`
- 5 hardcoded levels only
- Each level: id, strands, crossings, minimumMoves
- Control points on a 300×300 grid
- Minimum 60px between any two crossings

✅ Done when: all 5 levels import without errors, types match

---

## LAYER 2 — State (build this second)

**Goal:** Game state works in isolation. Still no UI.

### 2.1 — Game Store
File: `stores/gameStore.ts`
```typescript
// State: currentKnot, moveHistory, moveCount, gamePhase
// Actions: startLevel, flipCrossing, undo, triggerSolve, reset
// Rules: 
//   - flipCrossing calls knotMath.flipCrossing (immutable)
//   - flipCrossing checks isSolved after every flip
//   - moveHistory stores last 20 states for undo
```
✅ Done when: can startLevel → flipCrossing → undo in isolation

### 2.2 — Progress Store  
File: `stores/progressStore.ts`
```typescript
// State: levelProgress, dailyStreak, lastPlayedDate, totalSolved
// Actions: completeLevel, updateStreak, resetProgress
// Persistence: zustand persist middleware → AsyncStorage
```
✅ Done when: progress survives app restart

---

## LAYER 3 — Core Hooks (build this third)

### 3.1 — useKnot
File: `hooks/useKnot.ts`
- Wraps gameStore actions
- Exposes: knot, moveCount, flip(id), undo, isSolved
- Triggers haptic on every flip (import useHaptics)

### 3.2 — useHaptics
File: `hooks/useHaptics.ts`
- Wraps expo-haptics
- Exposes: tapFeedback, solveFeedback, wrongFeedback, starFeedback
- Always wrapped in try/catch (simulator throws)

### 3.3 — useSound
File: `hooks/useSound.ts`
- Wraps expo-av
- Sounds: flip tick, solve chime, star pop
- Preloads all sounds on mount, unloads on unmount

### 3.4 — useGameTimer
File: `hooks/useGameTimer.ts`
- Tracks elapsed seconds since level start
- Pauses when app goes to background (AppState listener)
- Resets on new level

✅ Layer 3 done when: all hooks import cleanly, no circular deps

---

## LAYER 4 — Canvas Components (most complex layer)

**Build in this exact sub-order:**

### 4.1 — StrandPath
File: `components/StrandPath.tsx`
- Renders ONE strand using Skia Path
- Props: strand, crossings (to know where to draw gaps)
- Under-strand gap: white strokeWidth 22 then colored strokeWidth 14
- No touch handling — pure visual

### 4.2 — CrossingPoint
File: `components/CrossingPoint.tsx`
- Renders ONE crossing circle
- Props: crossing, onFlip, isResolved
- Touch target: minimum 44pt (use hitSlop if needed)
- Animation: scale 1→1.3→1 on press (Reanimated spring)
- Visual: gold circle, fades when resolved

### 4.3 — KnotCanvas
File: `components/KnotCanvas.tsx`
- Renders all StrandPaths + all CrossingPoints
- Uses Skia Canvas as container
- Props: knot, onCrossingFlip
- Entrance animation: scale 0.95→1, opacity 0→1 (400ms)
- Size: square, 80% of screen width, centered

### 4.4 — SnapAnimation
File: `components/SnapAnimation.tsx`
- Triggered when isSolved() returns true
- Phase 1 (0-300ms): crossings disappear
- Phase 2 (300-700ms): strands → horizontal lines
- Phase 3 (700-1200ms): lines slide off right, staggered 60ms
- Calls onComplete() at 1200ms
- This is THE most important component. Get it right.

✅ Layer 4 done when: can render a knot, tap crossings, 
                      see snap animation play end to end on device

---

## LAYER 5 — Screens

### 5.1 — Game Screen (build before home screen)
File: `app/game/[levelId].tsx`
- Loads level from params → gameStore.startLevel()
- Renders: KnotCanvas + HUD (move counter, timer)
- Handles solve: gameStore → SnapAnimation → navigate to result
- Renders bottom toolbar: Undo + Hint buttons
- No loading states — level data is local, always instant

### 5.2 — Result Screen
File: `app/result/index.tsx`
- Receives: levelId, moveCount, starRating via route params
- Runs the timed star reveal animation sequence
- Shows comparison (your best vs global avg)
- Buttons: Share, Next Level, Replay

### 5.3 — Home Screen (build last of the main 3)
File: `app/index.tsx`
- Reads from progressStore on mount
- Shows: Continue card, Story Mode, Daily Knot, Zen Mode
- All press animations via Reanimated
- Haptics on every card press

### 5.4 — Daily Knot Screen
File: `app/game/daily.tsx`
- Gets today's knot from dailyKnots array (date hash)
- Checks if already solved today (progressStore)
- If solved: show result + share, block replay
- If unsolved: render game screen
- On solve: update streak

### 5.5 — Zen Mode
File: `app/zen/index.tsx`
- No timer, no move counter, no stars
- Procedurally picks a random unsolved level
- "Next" button skips to another random level
- Calm background music (expo-av)

✅ Layer 5 done when: full game loop works end to end:
Home → Game → Solve → Result → Home

---

## LAYER 6 — Polish & Monetization (last)

Only start this when Layer 5 is fully working.

### 6.1 — Share Card
File: `utils/shareImage.ts`
- Generate share text for result screen
- Daily Knot special share format

### 6.2 — Streak Logic
File: `hooks/useStreak.ts`
- Daily streak increment/reset
- Streak display on home screen

### 6.3 — In-App Purchases
File: `utils/iap.ts`
- expo-in-app-purchases setup
- Premium unlock (levels 21-100)
- Daily Knot Pass subscription
- ALWAYS validate server-side

### 6.4 — World 2 + World 3 Level Data
Files: `data/levels/world2.ts`, `data/levels/world3.ts`
- Only add after World 1 gameplay is proven fun

---

## How to Use This With Claude Code

**Each session, start with:**
> "We are on Layer [X], Step [Y]. 
>  Previous step is complete and TypeScript compiles clean.
>  Build [specific file] now following CLAUDE.md conventions."

**Never say:**
> "Build the whole game" ← Claude Code will create everything 
>                           at once with broken dependencies

**Always verify before next step:**
```bash
npx tsc --noEmit          # zero errors required
npx expo start            # test on device
```

## Current Build Status
- [ ] Layer 1 — Foundation
- [ ] Layer 2 — State
- [ ] Layer 3 — Hooks
- [ ] Layer 4 — Canvas
- [ ] Layer 5 — Screens
- [ ] Layer 6 — Polish