export interface KnotNode {
  id: string;
  x: number;
  y: number;
}

export interface KnotEdge {
  id: string;
  from: string;   // node id
  to: string;     // node id
  color: string;  // hex color string
}

export interface KnotLevel {
  id: number;
  name: string;
  nodes: KnotNode[];
  edges: KnotEdge[];
  minMoves: number;     // used for star rating
  narrative?: string;
}

export type GameMode = 'story' | 'zen' | 'daily';
export type GameScreen = 'home' | 'levelSelect' | 'game' | 'settings';
