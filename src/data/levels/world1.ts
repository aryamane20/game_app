import type { Knot } from '../../types/knot';

// All control points on a 300×300 grid.
// Crossings kept within x:30–270, y:30–270.
// Minimum 60 px between any two crossing positions.
// Single self-intersecting red strand per level.

// Level 1 — "Simple Loop"
// One red strand that traces a figure-8, crossing itself twice.
// Crossings: c1 (100,130)  c2 (200,170)   distance ≈ 107 px ✓
const level1: Knot = {
  id: 'w1-l1',
  strands: [
    {
      id: 's1',
      color: '#EF4444',
      controlPoints: [
        { x: 150, y: 40 },  // top anchor
        { x: 55,  y: 90 },  // curve upper-left
        { x: 50,  y: 190 }, // curve lower-left
        { x: 100, y: 130 }, // crossing c1 region
        { x: 145, y: 100 }, // bridge between loops
        { x: 155, y: 200 }, // bridge lower
        { x: 200, y: 170 }, // crossing c2 region
        { x: 250, y: 190 }, // curve lower-right
        { x: 245, y: 90 },  // curve upper-right
        { x: 150, y: 260 }, // bottom anchor
      ],
    },
  ],
  crossings: [
    {
      id: 'c1',
      position: { x: 100, y: 130 },
      strandOver: 's1',
      strandUnder: 's1',
      isResolved: false,
    },
    {
      id: 'c2',
      position: { x: 200, y: 170 },
      strandOver: 's1',
      strandUnder: 's1',
      isResolved: false,
    },
  ],
  minimumMoves: 2,
  hint: 'c1',
};

// Level 2 — "Four Winds"
// One red strand that winds through four quadrants, crossing itself four times.
// Crossings: c1 (90,100)  c2 (210,100)  c3 (90,200)  c4 (210,200)
// Min distance 100 px (diagonal pair ≈ 156 px) ✓
const level2: Knot = {
  id: 'w1-l2',
  strands: [
    {
      id: 's1',
      color: '#EF4444',
      controlPoints: [
        { x: 150, y: 40 },  // top anchor
        { x: 50,  y: 60 },  // upper-left approach
        { x: 40,  y: 140 }, // left mid
        { x: 90,  y: 100 }, // crossing c1 region
        { x: 150, y: 80 },  // top bridge
        { x: 210, y: 100 }, // crossing c2 region
        { x: 260, y: 140 }, // right mid
        { x: 260, y: 220 }, // lower-right
        { x: 210, y: 200 }, // crossing c4 region
        { x: 150, y: 220 }, // bottom bridge
        { x: 90,  y: 200 }, // crossing c3 region
        { x: 40,  y: 220 }, // lower-left
        { x: 50,  y: 260 }, // bottom-left exit
        { x: 150, y: 260 }, // bottom anchor
      ],
    },
  ],
  crossings: [
    {
      id: 'c1',
      position: { x: 90, y: 100 },
      strandOver: 's1',
      strandUnder: 's1',
      isResolved: false,
    },
    {
      id: 'c2',
      position: { x: 210, y: 100 },
      strandOver: 's1',
      strandUnder: 's1',
      isResolved: false,
    },
    {
      id: 'c3',
      position: { x: 90, y: 200 },
      strandOver: 's1',
      strandUnder: 's1',
      isResolved: false,
    },
    {
      id: 'c4',
      position: { x: 210, y: 200 },
      strandOver: 's1',
      strandUnder: 's1',
      isResolved: false,
    },
  ],
  minimumMoves: 3,
  hint: 'c1',
};

// Level 3 — "Star Knot"
// One red strand that traces a star-like path, crossing itself six times.
// Crossing positions and minimum distances:
//   c1(80,90)   c2(220,90)  → 140 px ✓
//   c1(80,90)   c3(60,180)  →  92 px ✓
//   c3(60,180)  c5(120,240) →  85 px ✓
//   c5(120,240) c6(180,240) →  60 px ✓  (exactly at minimum)
//   All other pairs > 60 px ✓
const level3: Knot = {
  id: 'w1-l3',
  strands: [
    {
      id: 's1',
      color: '#EF4444',
      controlPoints: [
        { x: 150, y: 35 },  // top anchor
        { x: 60,  y: 55 },  // upper-left sweep
        { x: 45,  y: 130 }, // left approach
        { x: 80,  y: 90 },  // crossing c1 region
        { x: 120, y: 60 },  // top-left bridge
        { x: 150, y: 70 },  // top mid
        { x: 180, y: 60 },  // top-right bridge
        { x: 220, y: 90 },  // crossing c2 region
        { x: 255, y: 130 }, // right approach
        { x: 240, y: 180 }, // crossing c4 region
        { x: 210, y: 210 }, // lower-right bridge
        { x: 180, y: 240 }, // crossing c6 region
        { x: 150, y: 255 }, // bottom mid
        { x: 120, y: 240 }, // crossing c5 region
        { x: 90,  y: 210 }, // lower-left bridge
        { x: 60,  y: 180 }, // crossing c3 region
        { x: 45,  y: 210 }, // far lower-left
        { x: 60,  y: 260 }, // bottom-left exit
        { x: 150, y: 265 }, // bottom anchor
      ],
    },
  ],
  crossings: [
    {
      id: 'c1',
      position: { x: 80, y: 90 },
      strandOver: 's1',
      strandUnder: 's1',
      isResolved: false,
    },
    {
      id: 'c2',
      position: { x: 220, y: 90 },
      strandOver: 's1',
      strandUnder: 's1',
      isResolved: false,
    },
    {
      id: 'c3',
      position: { x: 60, y: 180 },
      strandOver: 's1',
      strandUnder: 's1',
      isResolved: false,
    },
    {
      id: 'c4',
      position: { x: 240, y: 180 },
      strandOver: 's1',
      strandUnder: 's1',
      isResolved: false,
    },
    {
      id: 'c5',
      position: { x: 120, y: 240 },
      strandOver: 's1',
      strandUnder: 's1',
      isResolved: false,
    },
    {
      id: 'c6',
      position: { x: 180, y: 240 },
      strandOver: 's1',
      strandUnder: 's1',
      isResolved: false,
    },
  ],
  minimumMoves: 4,
  hint: 'c1',
};

export const world1Levels: Knot[] = [level1, level2, level3];
