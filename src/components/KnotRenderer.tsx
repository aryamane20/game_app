import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { KnotNode, KnotEdge } from '../game/types';
import { segmentsIntersect } from '../game/engine';

interface KnotRendererProps {
  nodes: KnotNode[];
  edges: KnotEdge[];
  onNodesChange: (nodes: KnotNode[]) => void;
  onDragEnd: () => void;
  solved: boolean;
  shaking: boolean;
}

const NODE_RADIUS = 14;
const EDGE_WIDTH = 10;
const EDGE_SHADOW_WIDTH = 14;
const CURVE_AMOUNT = 0.18;

// Spring physics for elastic wobble
interface SpringState {
  // Extra offset applied to the control point
  offsetX: number;
  offsetY: number;
  velocityX: number;
  velocityY: number;
}

const SPRING_STIFFNESS = 0.15;
const SPRING_DAMPING = 0.7;
const DRAG_INFLUENCE = 0.35; // how much dragging pulls the control point

function getControlPoint(
  from: KnotNode,
  to: KnotNode,
  edgeIndex: number,
  allEdgesBetween: number
): { cx: number; cy: number } {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1) return { cx: mx, cy: my };
  const px = -dy / len;
  const py = dx / len;
  const sign = edgeIndex % 2 === 0 ? 1 : -1;
  const multiOffset = allEdgesBetween > 1 ? (edgeIndex - (allEdgesBetween - 1) / 2) * 20 : 0;
  const offset = len * CURVE_AMOUNT * sign + multiOffset;
  return { cx: mx + px * offset, cy: my + py * offset };
}

function buildCurvePath(from: KnotNode, to: KnotNode, ctrl: { cx: number; cy: number }): string {
  return `M ${from.x} ${from.y} Q ${ctrl.cx} ${ctrl.cy} ${to.x} ${to.y}`;
}

const KnotRenderer: React.FC<KnotRendererProps> = ({
  nodes,
  edges,
  onNodesChange,
  onDragEnd,
  solved,
  shaking,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragVelocity, setDragVelocity] = useState({ x: 0, y: 0 });
  const lastDragPos = useRef({ x: 0, y: 0 });

  // Spring state for each edge's control point wobble
  const springsRef = useRef<Record<string, SpringState>>({});
  const [springOffsets, setSpringOffsets] = useState<Record<string, { x: number; y: number }>>({});
  const animFrameRef = useRef<number>(0);
  const isAnimating = useRef(false);

  const nodeMap: Record<string, KnotNode> = {};
  nodes.forEach(n => { nodeMap[n.id] = n; });

  const edgePairCount = useMemo(() => {
    const counts: Record<string, number> = {};
    const indices: Record<string, number> = {};
    edges.forEach(e => {
      const key = [e.from, e.to].sort().join('-');
      counts[key] = (counts[key] || 0) + 1;
    });
    const result: Record<string, { index: number; total: number }> = {};
    edges.forEach(e => {
      const key = [e.from, e.to].sort().join('-');
      if (!indices[key]) indices[key] = 0;
      result[e.id] = { index: indices[key]++, total: counts[key] };
    });
    return result;
  }, [edges]);

  // Base control points (no spring applied)
  const baseControls = useMemo(() => {
    const controls: Record<string, { cx: number; cy: number }> = {};
    edges.forEach((edge, i) => {
      const from = nodeMap[edge.from];
      const to = nodeMap[edge.to];
      if (!from || !to) return;
      const pair = edgePairCount[edge.id] || { index: 0, total: 1 };
      controls[edge.id] = getControlPoint(from, to, i + pair.index, pair.total);
    });
    return controls;
  }, [nodes, edges, edgePairCount]);

  // Apply spring wobble when dragging
  useEffect(() => {
    if (!draggingId) {
      // On release: let springs settle
      startSpringAnimation();
      return;
    }

    // While dragging: apply drag velocity as force to connected edges
    edges.forEach(edge => {
      if (edge.from === draggingId || edge.to === draggingId) {
        if (!springsRef.current[edge.id]) {
          springsRef.current[edge.id] = { offsetX: 0, offsetY: 0, velocityX: 0, velocityY: 0 };
        }
        const spring = springsRef.current[edge.id];
        // Push the control point in the drag direction
        spring.velocityX += dragVelocity.x * DRAG_INFLUENCE;
        spring.velocityY += dragVelocity.y * DRAG_INFLUENCE;
      }
    });

    startSpringAnimation();
  }, [draggingId, dragVelocity, nodes]);

  const startSpringAnimation = useCallback(() => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    const tick = () => {
      let anyMoving = false;
      const newOffsets: Record<string, { x: number; y: number }> = {};

      edges.forEach(edge => {
        const spring = springsRef.current[edge.id];
        if (!spring) {
          newOffsets[edge.id] = { x: 0, y: 0 };
          return;
        }

        // Spring force toward 0 (rest position)
        const forceX = -spring.offsetX * SPRING_STIFFNESS;
        const forceY = -spring.offsetY * SPRING_STIFFNESS;

        spring.velocityX = (spring.velocityX + forceX) * SPRING_DAMPING;
        spring.velocityY = (spring.velocityY + forceY) * SPRING_DAMPING;
        spring.offsetX += spring.velocityX;
        spring.offsetY += spring.velocityY;

        // Check if still moving
        const speed = Math.abs(spring.velocityX) + Math.abs(spring.velocityY);
        const displacement = Math.abs(spring.offsetX) + Math.abs(spring.offsetY);
        if (speed > 0.05 || displacement > 0.1) {
          anyMoving = true;
        } else {
          spring.offsetX = 0;
          spring.offsetY = 0;
          spring.velocityX = 0;
          spring.velocityY = 0;
        }

        newOffsets[edge.id] = { x: spring.offsetX, y: spring.offsetY };
      });

      setSpringOffsets({ ...newOffsets });

      if (anyMoving) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        isAnimating.current = false;
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);
  }, [edges]);

  // Cleanup animation frame
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Final control points = base + spring offset
  const edgeControls = useMemo(() => {
    const controls: Record<string, { cx: number; cy: number }> = {};
    edges.forEach(edge => {
      const base = baseControls[edge.id];
      if (!base) return;
      const offset = springOffsets[edge.id] || { x: 0, y: 0 };
      controls[edge.id] = {
        cx: base.cx + offset.x,
        cy: base.cy + offset.y,
      };
    });
    return controls;
  }, [baseControls, springOffsets, edges]);

  // Crossing detection
  const crossingEdgeIds = new Set<string>();
  const intersectionPoints: { x: number; y: number; key: string }[] = [];

  if (!solved) {
    for (let i = 0; i < edges.length; i++) {
      for (let j = i + 1; j < edges.length; j++) {
        const e1 = edges[i], e2 = edges[j];
        if (e1.from === e2.from || e1.from === e2.to || e1.to === e2.from || e1.to === e2.to) continue;
        const n1 = nodeMap[e1.from], n2 = nodeMap[e1.to];
        const n3 = nodeMap[e2.from], n4 = nodeMap[e2.to];
        if (!n1 || !n2 || !n3 || !n4) continue;
        if (segmentsIntersect(n1.x, n1.y, n2.x, n2.y, n3.x, n3.y, n4.x, n4.y)) {
          crossingEdgeIds.add(e1.id);
          crossingEdgeIds.add(e2.id);
          const denom = (n1.x - n2.x) * (n3.y - n4.y) - (n1.y - n2.y) * (n3.x - n4.x);
          if (Math.abs(denom) > 0.001) {
            const t = ((n1.x - n3.x) * (n3.y - n4.y) - (n1.y - n3.y) * (n3.x - n4.x)) / denom;
            intersectionPoints.push({
              x: n1.x + t * (n2.x - n1.x),
              y: n1.y + t * (n2.y - n1.y),
              key: `${e1.id}-${e2.id}`,
            });
          }
        }
      }
    }
  }

  const getSVGPoint = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const svgPt = pt.matrixTransform(ctm.inverse());
    return { x: svgPt.x, y: svgPt.y };
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent, nodeId: string) => {
    if (solved) return;
    e.preventDefault();
    e.stopPropagation();
    const svgPt = getSVGPoint(e.clientX, e.clientY);
    const node = nodeMap[nodeId];
    if (!node) return;
    setDraggingId(nodeId);
    setDragOffset({ x: svgPt.x - node.x, y: svgPt.y - node.y });
    lastDragPos.current = { x: svgPt.x, y: svgPt.y };
    setDragVelocity({ x: 0, y: 0 });
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }, [solved, getSVGPoint, nodeMap]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingId) return;
    e.preventDefault();
    const svgPt = getSVGPoint(e.clientX, e.clientY);
    const newX = Math.max(10, Math.min(390, svgPt.x - dragOffset.x));
    const newY = Math.max(10, Math.min(390, svgPt.y - dragOffset.y));

    // Compute drag velocity for spring wobble
    const vx = svgPt.x - lastDragPos.current.x;
    const vy = svgPt.y - lastDragPos.current.y;
    lastDragPos.current = { x: svgPt.x, y: svgPt.y };
    setDragVelocity({ x: vx, y: vy });

    const newNodes = nodes.map(n =>
      n.id === draggingId ? { ...n, x: newX, y: newY } : n
    );
    onNodesChange(newNodes);
  }, [draggingId, getSVGPoint, dragOffset, nodes, onNodesChange]);

  const handlePointerUp = useCallback(() => {
    if (!draggingId) return;

    // Give a final "snap" impulse to connected springs on release
    edges.forEach(edge => {
      if (edge.from === draggingId || edge.to === draggingId) {
        if (!springsRef.current[edge.id]) {
          springsRef.current[edge.id] = { offsetX: 0, offsetY: 0, velocityX: 0, velocityY: 0 };
        }
        const spring = springsRef.current[edge.id];
        spring.velocityX += dragVelocity.x * 0.8;
        spring.velocityY += dragVelocity.y * 0.8;
      }
    });

    setDraggingId(null);
    setDragVelocity({ x: 0, y: 0 });
    onDragEnd();
  }, [draggingId, dragVelocity, edges, onDragEnd]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 400 400"
      className={`w-full h-full select-none ${shaking ? 'shake' : ''}`}
      style={{ touchAction: 'none' }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <defs>
        <filter id="yarn-texture" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" />
        </filter>
      </defs>

      {/* Edge shadows */}
      {edges.map(edge => {
        const from = nodeMap[edge.from];
        const to = nodeMap[edge.to];
        if (!from || !to) return null;
        const ctrl = edgeControls[edge.id];
        if (!ctrl) return null;
        return (
          <path
            key={`shadow-${edge.id}`}
            d={buildCurvePath(
              { ...from, x: from.x + 1.5, y: from.y + 1.5 },
              { ...to, x: to.x + 1.5, y: to.y + 1.5 },
              { cx: ctrl.cx + 1.5, cy: ctrl.cy + 1.5 }
            )}
            fill="none"
            stroke="rgba(0,0,0,0.08)"
            strokeWidth={EDGE_SHADOW_WIDTH}
            strokeLinecap="round"
          />
        );
      })}

      {/* Curved yarn strands */}
      {edges.map(edge => {
        const from = nodeMap[edge.from];
        const to = nodeMap[edge.to];
        if (!from || !to) return null;
        const ctrl = edgeControls[edge.id];
        if (!ctrl) return null;
        const isCrossing = crossingEdgeIds.has(edge.id);
        const path = buildCurvePath(from, to, ctrl);
        return (
          <g key={`edge-${edge.id}`}>
            <path
              d={path} fill="none" stroke={edge.color}
              strokeWidth={EDGE_WIDTH + 2} strokeLinecap="round"
              opacity={(isCrossing ? 0.55 : 0.9) * 0.3}
            />
            <path
              d={path} fill="none" stroke={edge.color}
              strokeWidth={EDGE_WIDTH} strokeLinecap="round"
              opacity={isCrossing ? 0.6 : 1}
              filter="url(#yarn-texture)"
              style={{ transition: 'opacity 0.2s' }}
            />
            <path
              d={path} fill="none" stroke="rgba(255,255,255,0.25)"
              strokeWidth={3} strokeLinecap="round"
              opacity={isCrossing ? 0.3 : 0.6}
            />
          </g>
        );
      })}

      {/* Crossing indicators */}
      {intersectionPoints.map(pt => (
        <g key={pt.key}>
          <circle cx={pt.x} cy={pt.y} r={8} fill="rgba(239,68,68,0.15)" />
          <text
            x={pt.x} y={pt.y + 1}
            textAnchor="middle" dominantBaseline="central"
            fontSize={10} fontWeight={800} fill="#ef4444" opacity={0.5}
            style={{ pointerEvents: 'none', fontFamily: 'Nunito, sans-serif' }}
          >✕</text>
        </g>
      ))}

      {/* Nodes */}
      {nodes.map(node => {
        const isDragging = draggingId === node.id;
        return (
          <g
            key={node.id}
            className={`${solved ? '' : 'cursor-grab'} ${isDragging ? 'cursor-grabbing' : ''}`}
            onPointerDown={(e) => handlePointerDown(e, node.id)}
          >
            {isDragging && (
              <circle
                cx={node.x} cy={node.y} r={NODE_RADIUS + 6}
                fill="none" stroke="#fbbf24" strokeWidth={3} opacity={0.6}
              />
            )}
            <circle
              cx={node.x + 1} cy={node.y + 1} r={NODE_RADIUS}
              fill="rgba(0,0,0,0.12)"
            />
            <circle
              cx={node.x} cy={node.y} r={isDragging ? NODE_RADIUS + 2 : NODE_RADIUS}
              fill="#fafaf9"
              stroke={isDragging ? '#fbbf24' : '#44403c'}
              strokeWidth={isDragging ? 3 : 2.5}
              style={{ transition: isDragging ? 'none' : 'r 0.2s, stroke 0.2s, stroke-width 0.2s' }}
            />
            <circle
              cx={node.x} cy={node.y} r={4}
              fill={isDragging ? '#f59e0b' : '#78716c'}
              style={{ transition: 'fill 0.2s' }}
            />
          </g>
        );
      })}
    </svg>
  );
};

export default KnotRenderer;
