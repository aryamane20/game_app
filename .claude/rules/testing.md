# Testing Rules

## What to Test
- knotMath.ts: unit test every function (flipCrossing, isSolved, getStarRating)
- progressStore.ts: test streak logic, star persistence
- bezierPath.ts: test path generation outputs

## What NOT to Test
- Visual components (KnotCanvas, SnapAnimation) — test manually on device
- Animations — impossible to unit test meaningfully
- AsyncStorage integration — use E2E or manual testing

## Test File Location
Co-locate with source: `utils/knotMath.test.ts` next to `utils/knotMath.ts`

## Framework
Jest + @testing-library/react-native

## Key Test Cases Required for knotMath
1. flipCrossing flips strandOver and strandUnder correctly
2. flipCrossing returns a new object (immutable)
3. isSolved returns false when crossings exist
4. isSolved returns true when all crossings resolved
5. getStarRating(knot, minimumMoves) returns 3
6. getStarRating(knot, minimumMoves * 3) returns 1