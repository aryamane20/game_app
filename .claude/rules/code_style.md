# Code Style Rules

## TypeScript
- Strict mode always — tsconfig has "strict": true
- No `any` — use `unknown` and narrow, or define a proper type
- Prefer `type` over `interface` for game data structures
- All props must be typed — no implicit props

## Component Rules
- One component per file
- Props interface named `[ComponentName]Props`
- Default export only
- Keep under 150 lines — if longer, extract a sub-component
- No business logic in components — use hooks

## Naming Conventions
- Components: PascalCase (KnotCanvas, StarReveal)
- Hooks: camelCase starting with "use" (useKnot, useStreak)
- Utils: camelCase (flipCrossing, isSolved)
- Types: PascalCase (Knot, Crossing, StarRating)
- Constants: SCREAMING_SNAKE (MIN_CROSSING_SIZE, SNAP_DURATION_MS)
- Zustand stores: camelCase with "Store" suffix (gameStore, progressStore)

## File Structure Per Component
1. Imports (external first, internal second)
2. Types/interfaces
3. Constants
4. Component function
5. Styles (if any StyleSheet)
6. Default export

## NativeWind Rules
- Use Tailwind utility classes for all layout and spacing
- Never mix StyleSheet.create with NativeWind on the same component
- Custom colors must be defined in tailwind.config.js — no arbitrary values in JSX

## Zustand Rules
- Actions defined inside the store, not outside
- Never mutate state — always return new objects
- AsyncStorage persistence via zustand/middleware `persist`

## Animation Rules (see animations.md for full detail)
- All animations: react-native-reanimated only
- Use `withSpring` for UI interactions (button presses, crossing taps)
- Use `withTiming` for sequential game animations (snap sequence)
- All animation configs as named constants, not inline objects