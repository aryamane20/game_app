# UNRAVEL — Claude Instructions


## What This Project Is
A minimalist mobile puzzle game where players untangle yarn knots by tapping 
crossing points. Built with React Native + Expo for iOS and Android.

The core loop: tap a crossing → flip over/under → knot simplifies → 
snap animation plays → stars awarded. Simple to learn, hard to master.

## do
Ask em question everytime you try to create something new or make changes to the files. Wait for my response and then only proceed. 

## Tech Stack (never substitute these without asking)
- Framework: React Native + Expo SDK 52
- Language: TypeScript (strict mode always)
- Canvas/Drawing: @shopify/react-native-skia (ALL knot rendering lives here)
- Animations: react-native-reanimated 3 (ALL motion lives here)
- Styling: NativeWind (Tailwind utility classes)
- State: Zustand (gameStore + progressStore)
- Navigation: Expo Router (file-based, lives in /app directory)
- Storage: @react-native-async-storage/async-storage
- Haptics: expo-haptics (fire on EVERY crossing tap and solve)
- Audio: expo-av
- Build: Expo EAS

## Project Structure

app/              → Expo Router screens (index, game/[id], result, daily, zen)
components/       → UI components (never put game logic here)
hooks/            → Custom hooks (useKnot, useGameLoop, useHaptics, useStreak)
stores/           → Zustand stores only (gameStore, progressStore)
data/levels/      → Knot level definitions (world1, world2, world3)
utils/            → Pure functions (knotMath, bezierPath, shareImage)
types/            → TypeScript types only (knot.ts)
assets/           → Fonts, sounds, images

## Core Game Types
```typescript
type Point = { x: number; y: number }
type Crossing = { id: string; position: Point; strandOver: string; strandUnder: string; isResolved: boolean }
type Strand = { id: string; color: string; controlPoints: Point[] }
type Knot = { id: string; strands: Strand[]; crossings: Crossing[]; minimumMoves: number }
type StarRating = 1 | 2 | 3
```

## Design System (never deviate from these)
- Background: #FAFAF9 (warm off-white)
- Primary: #EF4444 (red yarn)
- Text primary: #1C1917
- Text muted: #78716C
- Crossing highlight: #FBBF24 (gold)
- Font: Nunito (rounded, warm)
- Border radius: rounded-2xl on all cards
- Shadows: shadow-sm only — this is a minimal game

## Critical Rules
1. KnotCanvas.tsx uses ONLY Skia APIs — no React Native Views inside the canvas
2. ALL animations use Reanimated — never CSS transitions or Animated API
3. Haptics fire on every user interaction — non-negotiable for game feel
4. Undo is always available — never disable it
5. No loading spinners inside the game screen — preload everything
6. Levels are immutable data — never mutate level objects, always create new state
7. Every crossing tap target must be minimum 44pt (Apple HIG)
8. TypeScript strict mode — no `any` types, ever

## The Snap Animation (most important feature)
When isSolved() returns true, this sequence MUST play in order:
1. Crossings scale to 0 + fade (0-300ms)
2. Strands straighten to horizontal lines (300-700ms)  
3. Lines slide off screen right, staggered 60ms each (700-1200ms)
4. onComplete() fires at 1200ms
Never shortcut or simplify this animation. It is the core satisfaction mechanic.

## What Makes This Game Addictive (keep in mind when building)
- The snap animation is the dopamine hit — protect it
- Haptic feedback makes taps feel physical
- Undo removes frustration — players who aren't frustrated play longer
- Stars on incomplete levels pull players back (Zeigarnik effect)
- Daily Knot streak creates daily habit loop

## When Adding a New Level
See: .claude/commands/new-level.md

## When Reviewing Animation Code  
See: .claude/rules/animations.md