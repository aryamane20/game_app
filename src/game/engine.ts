import { KnotNode, KnotEdge } from './types';

/**
 * Check if two line segments intersect (excluding shared endpoints).
 * Segment 1: (p1, p2), Segment 2: (p3, p4)
 */
function ccw(ax: number, ay: number, bx: number, by: number, cx: number, cy: number): number {
  return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
}

export function segmentsIntersect(
  x1: number, y1: number, x2: number, y2: number,
  x3: number, y3: number, x4: number, y4: number
): boolean {
  const d1 = ccw(x3, y3, x4, y4, x1, y1);
  const d2 = ccw(x3, y3, x4, y4, x2, y2);
  const d3 = ccw(x1, y1, x2, y2, x3, y3);
  const d4 = ccw(x1, y1, x2, y2, x4, y4);

  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
      ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
    return true;
  }

  return false;
}

/**
 * Count the number of edge crossings in the current node arrangement
 */
export function countCrossings(nodes: KnotNode[], edges: KnotEdge[]): number {
  const nodeMap: Record<string, KnotNode> = {};
  nodes.forEach(n => { nodeMap[n.id] = n; });

  let crossings = 0;
  for (let i = 0; i < edges.length; i++) {
    for (let j = i + 1; j < edges.length; j++) {
      const e1 = edges[i];
      const e2 = edges[j];

      // Skip edges that share a node (they meet at a point, not a real crossing)
      if (e1.from === e2.from || e1.from === e2.to ||
          e1.to === e2.from || e1.to === e2.to) {
        continue;
      }

      const n1 = nodeMap[e1.from];
      const n2 = nodeMap[e1.to];
      const n3 = nodeMap[e2.from];
      const n4 = nodeMap[e2.to];

      if (n1 && n2 && n3 && n4 &&
          segmentsIntersect(n1.x, n1.y, n2.x, n2.y, n3.x, n3.y, n4.x, n4.y)) {
        crossings++;
      }
    }
  }
  return crossings;
}

/**
 * Check if the knot is fully untangled (zero crossings)
 */
export function isKnotSolved(nodes: KnotNode[], edges: KnotEdge[]): boolean {
  return countCrossings(nodes, edges) === 0;
}

/**
 * Deep clone level nodes for gameplay
 */
export function cloneNodes(nodes: KnotNode[]): KnotNode[] {
  return nodes.map(n => ({ ...n }));
}
