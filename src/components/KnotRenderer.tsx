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
const CURVE_AMOUNT = 0.18;
const BG_COLOR = '#fafaf9';

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

const KnotRenderer: React.FC<KnotRendererProps> = ({
  nodes,
  edges,
  onNodesChange,
  onDragEnd,
  solved,
  shaking,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

  // Memoize crossing detection
  const { crossingEdgeIds, intersectionPoints } = useMemo(() => {
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

    return { crossingEdgeIds, intersectionPoints };
  }, [nodes, edges, solved]);

  const getCanvasPoint = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (400 / rect.width),
      y: (clientY - rect.top) * (400 / rect.height),
    };
  }, []);

  const handleCanvasPointerDown = useCallback((e: React.PointerEvent) => {
    if (solved) return;
    e.preventDefault();
    e.stopPropagation();

    const pt = getCanvasPoint(e.clientX, e.clientY);

    // Hit-test to find clicked node
    const clicked = nodes.find(n => {
      const dx = pt.x - n.x;
      const dy = pt.y - n.y;
      return Math.sqrt(dx * dx + dy * dy) <= NODE_RADIUS + 6;
    });

    if (!clicked) return;

    setDraggingId(clicked.id);
    setDragOffset({ x: pt.x - clicked.x, y: pt.y - clicked.y });
    lastDragPos.current = { x: pt.x, y: pt.y };
    setDragVelocity({ x: 0, y: 0 });
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }, [solved, getCanvasPoint, nodes]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingId) return;
    e.preventDefault();
    const pt = getCanvasPoint(e.clientX, e.clientY);
    const newX = Math.max(10, Math.min(390, pt.x - dragOffset.x));
    const newY = Math.max(10, Math.min(390, pt.y - dragOffset.y));

    // Compute drag velocity for spring wobble
    const vx = pt.x - lastDragPos.current.x;
    const vy = pt.y - lastDragPos.current.y;
    lastDragPos.current = { x: pt.x, y: pt.y };
    setDragVelocity({ x: vx, y: vy });

    const newNodes = nodes.map(n =>
      n.id === draggingId ? { ...n, x: newX, y: newY } : n
    );
    onNodesChange(newNodes);
  }, [draggingId, getCanvasPoint, dragOffset, nodes, onNodesChange]);

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

  // Draw function for canvas rendering
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Setup for DPR-aware rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;

    ctx.save();
    ctx.scale(dpr * canvas.clientWidth / 400, dpr * canvas.clientHeight / 400);

    // Clear background
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, 400, 400);

    // Draw edge shadows
    edges.forEach(edge => {
      const from = nodeMap[edge.from];
      const to = nodeMap[edge.to];
      if (!from || !to) return;
      const ctrl = edgeControls[edge.id];
      if (!ctrl) return;

      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = 13;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      ctx.beginPath();
      ctx.moveTo(from.x + 2, from.y + 2);
      ctx.quadraticCurveTo(ctrl.cx + 2, ctrl.cy + 2, to.x + 2, to.y + 2);
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    });

    // Draw yarn strands (4-layer rendering)
    edges.forEach(edge => {
      const from = nodeMap[edge.from];
      const to = nodeMap[edge.to];
      if (!from || !to) return;
      const ctrl = edgeControls[edge.id];
      if (!ctrl) return;

      const isCrossing = crossingEdgeIds.has(edge.id);

      // Layer 1: Drop shadow
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 13;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.quadraticCurveTo(ctrl.cx, ctrl.cy, to.x, to.y);
      ctx.stroke();

      // Layer 2: Outer glow
      ctx.strokeStyle = edge.color;
      ctx.lineWidth = 18;
      ctx.globalAlpha = isCrossing ? 0.12 : 0.2;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.quadraticCurveTo(ctrl.cx, ctrl.cy, to.x, to.y);
      ctx.stroke();

      // Layer 3: Main yarn core
      ctx.strokeStyle = edge.color;
      ctx.lineWidth = 11;
      ctx.globalAlpha = isCrossing ? 0.6 : 1.0;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.quadraticCurveTo(ctrl.cx, ctrl.cy, to.x, to.y);
      ctx.stroke();

      // Layer 4: Specular highlight (top edge)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 3;
      ctx.globalAlpha = isCrossing ? 0.4 : 0.7;
      ctx.beginPath();
      ctx.moveTo(from.x - 1, from.y - 1);
      ctx.quadraticCurveTo(ctrl.cx - 1, ctrl.cy - 1, to.x - 1, to.y - 1);
      ctx.stroke();

      ctx.globalAlpha = 1.0;
    });

    // Draw crossing markers
    intersectionPoints.forEach(pt => {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
      ctx.font = 'bold 10px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✕', pt.x, pt.y);
    });

    // Draw nodes
    nodes.forEach(node => {
      const isDragging = draggingId === node.id;

      // Layer 1: Shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
      ctx.shadowBlur = 6;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.beginPath();
      ctx.arc(node.x + 2, node.y + 2, NODE_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;

      // Layer 2: Body with radial gradient
      const grad = ctx.createRadialGradient(node.x - 4, node.y - 4, 2, node.x, node.y, NODE_RADIUS);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.5, '#fafaf9');
      grad.addColorStop(1, '#e8e0d8');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      // Node border
      ctx.strokeStyle = isDragging ? '#fbbf24' : '#44403c';
      ctx.lineWidth = isDragging ? 3 : 2.5;
      ctx.beginPath();
      ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
      ctx.stroke();

      // Layer 3: Center pip with gradient
      const pipGrad = ctx.createRadialGradient(node.x - 1, node.y - 1, 0, node.x, node.y, 4);
      pipGrad.addColorStop(0, isDragging ? '#f59e0b' : '#a8a29e');
      pipGrad.addColorStop(1, isDragging ? '#78716c' : '#57534e');
      ctx.fillStyle = pipGrad;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Dragging glow ring
      if (isDragging) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2.5;
        ctx.globalAlpha = 0.6;
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(node.x, node.y, NODE_RADIUS + 7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
      }
    });

    ctx.restore();
  }, [nodes, edges, edgeControls, crossingEdgeIds, intersectionPoints, draggingId]);

  // Trigger redraw on visual state changes
  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full select-none ${shaking ? 'shake' : ''}`}
      style={{ touchAction: 'none', cursor: draggingId ? 'grabbing' : solved ? 'default' : 'grab' }}
      onPointerDown={handleCanvasPointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    />
  );
};

export default KnotRenderer;
