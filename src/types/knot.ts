export type Point = {
  x: number;
  y: number;
};

export type Strand = {
  id: string;
  color: string;
  controlPoints: Point[];
};

export type Crossing = {
  id: string;
  position: Point;
  strandOver: string;
  strandUnder: string;
  isResolved: boolean;
};

export type Knot = {
  id: string;
  strands: Strand[];
  crossings: Crossing[];
  minimumMoves: number;
  hint?: string;
};

export type StarRating = 1 | 2 | 3;

export type GamePhase = 'idle' | 'playing' | 'solving' | 'solved';

export type LevelProgress = {
  stars: StarRating;
  bestMoves: number;
  completedAt: string;
};

export type GameState = {
  currentKnot: Knot | null;
  moveHistory: Knot[];
  moveCount: number;
  elapsedSeconds: number;
  gamePhase: GamePhase;
};
