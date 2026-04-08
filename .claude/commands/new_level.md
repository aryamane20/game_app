# /new-level — Generate a New Knot Level

When I run /new-level, ask me:
1. Which world? (1 = red, 2 = blue, 3 = gold)
2. How many crossings? (3-30)
3. Level number?

Then generate a complete level definition in the correct world file:

```typescript
// data/levels/world[N].ts
{
  id: 'world[N]-level[X]',
  strands: [
    {
      id: 's1',
      color: WORLD_COLORS[worldNumber],
      controlPoints: [
        // Generate bezier control points on a 300x300 grid
        // Points should create a visually interesting knot shape
        // Not too symmetric — organic curves feel more like real yarn
      ]
    }
  ],
  crossings: [
    // Each crossing needs: id, position (on 300x300 grid), strandOver, strandUnder
    // Place crossings where strands visually intersect
    // Spread crossings across the canvas — avoid clustering at center
  ],
  minimumMoves: [calculated based on crossing count],
  hint: "[which crossing to flip first]"
}
```

After generating, verify:
- minimumMoves is achievable (simulate the solve path)
- All crossing positions are within 30-270 on both axes (not at edges)
- At least 60px between any two crossings (tap targets won't overlap)