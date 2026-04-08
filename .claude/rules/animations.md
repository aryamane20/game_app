# Animation Rules for UNRAVEL

## Library
react-native-reanimated 3 ONLY. Never use:
- React Native's built-in Animated API
- CSS transitions
- setTimeout for animation sequencing (use withDelay or withSequence)

## Standard Timings (use these constants everywhere)
```typescript
export const TIMING = {
  CROSSING_FLIP: 150,      // crossing tap response
  SCREEN_TRANSITION: 300,  // between screens
  STAR_POP: 200,           // each star on result screen
  STAR_STAGGER: 300,       // delay between stars
  SNAP_STRAIGHTEN: 400,    // strands → horizontal
  SNAP_UNROLL: 500,        // lines slide off screen
  SNAP_STAGGER: 60,        // delay between each strand unrolling
  BUTTON_PRESS: 100,       // scale feedback on press
}
```

## Standard Springs
```typescript
export const SPRINGS = {
  BOUNCY: { damping: 10, stiffness: 200 },   // star pop, crossing flip
  SNAPPY: { damping: 20, stiffness: 400 },   // button press
  GENTLE: { damping: 15, stiffness: 100 },   // screen entrance
}
```

## Haptic Pairing (every animation should have a haptic)
| Animation | Haptic |
|---|---|
| Crossing tap | `impactAsync('medium')` |
| Crossing resolves | `impactAsync('light')` |
| Knot solved | `notificationAsync('success')` |
| Wrong move | `notificationAsync('warning')` |
| Star pop | `impactAsync('light')` |
| Button press | `selectionAsync()` |

## The Snap Sequence (do not modify without updating CLAUDE.md)
```typescript
// Always use withSequence + withDelay, never setTimeout
runOnJS(startSnap)()
// Phase 1: crossings disappear
withTiming(0, { duration: TIMING.SNAP_STRAIGHTEN })
// Phase 2: strands straighten  
withTiming(targetY, { duration: TIMING.SNAP_STRAIGHTEN, easing: Easing.out(Easing.cubic) })
// Phase 3: staggered unroll
withDelay(index * TIMING.SNAP_STAGGER, withTiming(screenWidth, { duration: TIMING.SNAP_UNROLL }))
```