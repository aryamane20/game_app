
# 🧶 UNRAVEL — Full Single-Player Implementation Plan

## Overview
A knot-untangling puzzle game using knot theory (crossing-based mechanics). Local storage for progress. No payments. Three modes: Story, Zen, and placeholder for Daily Knot.

## 1. Core Game Engine
- **Knot data model**: Represent knots as a graph of crossing points (position, over/under state, connected strands)
- **Rendering**: SVG-based canvas drawing yarn strands as thick (12px), rounded paths in the specified color palette on warm off-white (#fafaf9) background
- **Crossing interaction**: Tap/click a crossing to flip OVER ↔ UNDER. Yellow glow highlight on hover. Animate strand rearrangement in real-time
- **Win detection**: When all crossings are resolved (zero crossings), trigger solve animation
- **Move counter & timer**: Count moves and elapsed time per level

## 2. Solve Animation (The Satisfaction Loop)
- **SNAP** (0–300ms): Strands straighten, crossings collapse, subtle screen shake
- **UNROLL** (300–900ms): Yarn slides smoothly off-screen left to right
- **SCORE** (900ms+): Stars pop in one by one based on move efficiency (⭐⭐⭐ = optimal, ⭐⭐ = ≤2x, ⭐ = solved)

## 3. Level System
- **20+ handcrafted levels** with progressive difficulty (1–2 crossings up to 10+ crossings, single then multi-color strands)
- **Procedural generation** for Zen Mode (random valid knots of configurable complexity)
- **Star ratings** stored per level (best score)
- **Level select screen** showing stars earned, locked/unlocked state

## 4. Game Modes
- **Story Mode**: 20+ levels with gentle narrative framing (untangling memories). Sequential progression with level select
- **Zen Mode**: Infinite procedurally generated knots, no timer, no stars — pure relaxation
- **Daily Knot**: Placeholder UI (shows "Coming Soon") with share card mockup

## 5. UI & Navigation
- **Home screen**: Game title, warm minimal design, mode selection buttons
- **In-game HUD**: Move counter, timer (counting up), pause/menu button
- **Level complete overlay**: Stars, move count, time, "Next Level" / "Retry" buttons
- **Settings**: Sound toggle (visual only for now), reset progress

## 6. Visual Design
- Nunito font, warm off-white background with subtle linen texture
- Yarn colors: red (#ef4444), blue (#3b82f6), amber (#f59e0b), emerald (#10b981)
- Dark warm brown text (#292524), gold stars (#fbbf24)
- Smooth animations throughout using CSS/SVG transitions

## 7. Progress & Persistence
- LocalStorage for: level completion, star ratings, best moves/times, streak counter, current level
- Streak tracking (consecutive days played) shown on home screen

## 8. Polish
- Hover/touch states on all interactive elements
- Responsive design for mobile and desktop
- Tutorial overlay for first 2 levels showing which crossing to tap
