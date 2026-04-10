import type { Knot, StarRating } from '../types/knot';

export function flipCrossing(knot: Knot, crossingId: string): Knot {
  return {
    ...knot,
    crossings: knot.crossings.map((c) => {
      if (c.id !== crossingId) return c;
      return {
        ...c,
        strandOver: c.strandUnder,
        strandUnder: c.strandOver,
        isResolved: true,
      };
    }),
  };
}

export function isSolved(knot: Knot): boolean {
  return knot.crossings.every((c) => c.isResolved);
}

export function getStarRating(knot: Knot, movesTaken: number): StarRating {
  if (movesTaken <= knot.minimumMoves) return 3;
  if (movesTaken <= knot.minimumMoves * 2) return 2;
  return 1;
}

export function getRemainingCrossings(knot: Knot): number {
  return knot.crossings.filter((c) => !c.isResolved).length;
}
