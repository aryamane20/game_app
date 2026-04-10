import type { Knot } from '../types/knot';
import { flipCrossing, isSolved, getStarRating } from './knotMath';

const makeKnot = (overrides?: Partial<Knot>): Knot => ({
  id: 'test-knot',
  minimumMoves: 3,
  strands: [
    { id: 'a', color: '#EF4444', controlPoints: [{ x: 0, y: 0 }, { x: 100, y: 100 }] },
    { id: 'b', color: '#3B82F6', controlPoints: [{ x: 100, y: 0 }, { x: 0, y: 100 }] },
  ],
  crossings: [
    { id: 'c1', position: { x: 50, y: 50 }, strandOver: 'a', strandUnder: 'b', isResolved: false },
    { id: 'c2', position: { x: 70, y: 30 }, strandOver: 'b', strandUnder: 'a', isResolved: false },
  ],
  ...overrides,
});

describe('flipCrossing', () => {
  it('swaps strandOver and strandUnder', () => {
    const knot = makeKnot();
    const result = flipCrossing(knot, 'c1');
    const flipped = result.crossings.find((c) => c.id === 'c1')!;
    expect(flipped.strandOver).toBe('b');
    expect(flipped.strandUnder).toBe('a');
  });

  it('marks the crossing as resolved', () => {
    const knot = makeKnot();
    const result = flipCrossing(knot, 'c1');
    const flipped = result.crossings.find((c) => c.id === 'c1')!;
    expect(flipped.isResolved).toBe(true);
  });

  it('returns a new knot object (immutability)', () => {
    const knot = makeKnot();
    const result = flipCrossing(knot, 'c1');
    expect(result).not.toBe(knot);
    expect(result.crossings).not.toBe(knot.crossings);
    // original is unchanged
    expect(knot.crossings[0].isResolved).toBe(false);
  });

  it('does not modify other crossings', () => {
    const knot = makeKnot();
    const result = flipCrossing(knot, 'c1');
    const untouched = result.crossings.find((c) => c.id === 'c2')!;
    expect(untouched.strandOver).toBe('b');
    expect(untouched.strandUnder).toBe('a');
    expect(untouched.isResolved).toBe(false);
  });
});

describe('isSolved', () => {
  it('returns false when crossings are unresolved', () => {
    expect(isSolved(makeKnot())).toBe(false);
  });

  it('returns false when only some crossings are resolved', () => {
    const knot = makeKnot();
    const partial = flipCrossing(knot, 'c1');
    expect(isSolved(partial)).toBe(false);
  });

  it('returns true when all crossings are resolved', () => {
    let knot = makeKnot();
    knot = flipCrossing(knot, 'c1');
    knot = flipCrossing(knot, 'c2');
    expect(isSolved(knot)).toBe(true);
  });
});

describe('getStarRating', () => {
  it('returns 3 stars at minimumMoves', () => {
    const knot = makeKnot();
    expect(getStarRating(knot, knot.minimumMoves)).toBe(3);
  });

  it('returns 3 stars below minimumMoves', () => {
    const knot = makeKnot();
    expect(getStarRating(knot, knot.minimumMoves - 1)).toBe(3);
  });

  it('returns 2 stars between minimumMoves and minimumMoves * 2', () => {
    const knot = makeKnot();
    expect(getStarRating(knot, knot.minimumMoves + 1)).toBe(2);
    expect(getStarRating(knot, knot.minimumMoves * 2)).toBe(2);
  });

  it('returns 1 star above minimumMoves * 2', () => {
    const knot = makeKnot();
    expect(getStarRating(knot, knot.minimumMoves * 2 + 1)).toBe(1);
    expect(getStarRating(knot, knot.minimumMoves * 3)).toBe(1);
  });
});
