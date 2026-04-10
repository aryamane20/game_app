import React, { useState, useEffect, useCallback, useRef } from 'react';
import { KnotLevel, KnotNode } from '../game/types';
import { isKnotSolved, cloneNodes, countCrossings } from '../game/engine';
import { saveLevelResult, calculateStars } from '../game/storage';
import KnotRenderer from './KnotRenderer';
import StarRating from './StarRating';

interface GameScreenProps {
  level: KnotLevel;
  mode: 'story' | 'zen';
  onBack: () => void;
  onNextLevel?: () => void;
  onRetry: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({
  level,
  mode,
  onBack,
  onNextLevel,
  onRetry,
}) => {
  const [nodes, setNodes] = useState<KnotNode[]>([]);
  const [moves, setMoves] = useState(0);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [solved, setSolved] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [stars, setStars] = useState(0);
  const [showTutorial, setShowTutorial] = useState(level.id <= 2 && mode === 'story');
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setNodes(cloneNodes(level.nodes));
    setMoves(0);
    setSolved(false);
    setShowScore(false);
    setStars(0);
    setShaking(false);
    setShowTutorial(level.id <= 2 && mode === 'story');
  }, [level, mode]);

  useEffect(() => {
    if (solved) return;
    timerRef.current = window.setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 100);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTime, solved]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNodesChange = useCallback((newNodes: KnotNode[]) => {
    if (solved) return;
    if (showTutorial) setShowTutorial(false);
    setNodes(newNodes);
  }, [solved, showTutorial]);

  const handleDragEnd = useCallback(() => {
    if (solved) return;
    const newMoves = moves + 1;
    setMoves(newMoves);

    if (isKnotSolved(nodes, level.edges)) {
      const finalTime = Date.now() - startTime;
      const finalStars = calculateStars(newMoves, level.minMoves);

      if (mode === 'story' && level.id > 0) {
        saveLevelResult(level.id, newMoves, finalTime, level.minMoves);
      }

      setSolved(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 300);
      setTimeout(() => {
        setStars(finalStars);
        setShowScore(true);
      }, 900);
    }
  }, [solved, moves, nodes, level, startTime, mode]);

  const crossingCount = countCrossings(nodes, level.edges);

  return (
    <div className="linen-bg min-h-screen flex flex-col">
      {/* HUD */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <button
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground transition-colors font-bold"
        >
          ← {mode === 'story' ? 'Levels' : 'Menu'}
        </button>
        <div className="text-center">
          <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            {mode === 'zen' ? 'Zen Mode' : `Level ${level.id}`}
          </div>
          <div className="text-sm font-bold text-foreground">{level.name}</div>
        </div>
        <div className="text-right text-sm">
          <div className="font-bold text-foreground">{formatTime(elapsed)}</div>
          <div className="text-xs text-muted-foreground">{moves} moves</div>
        </div>
      </div>

      {/* Narrative */}
      {level.narrative && !solved && (
        <div className="text-center px-6 pt-4">
          <p className="text-sm text-muted-foreground italic">"{level.narrative}"</p>
        </div>
      )}

      {/* Crossings remaining */}
      {!solved && (
        <div className="text-center px-4 pt-2">
          <span className={`text-xs font-semibold ${crossingCount === 0 ? 'text-yarn-emerald' : 'text-muted-foreground'}`}>
            {crossingCount === 0 ? '✓ No crossings!' : `${crossingCount} crossing${crossingCount !== 1 ? 's' : ''} remaining`}
          </span>
        </div>
      )}

      {/* Tutorial */}
      {showTutorial && !solved && (
        <div className="text-center px-6 pt-4">
          <div className="inline-block px-4 py-2 rounded-lg bg-foreground text-background text-sm font-semibold">
            👆 Drag the nodes to untangle the yarn. No strands should cross!
          </div>
        </div>
      )}

      {/* Knot area */}
      <div className="flex-1 flex items-center justify-center px-4 py-4">
        <div className={`w-full max-w-[500px] aspect-square transition-all duration-600 ${solved && !showScore ? 'scale-95 opacity-80' : ''}`}>
          <KnotRenderer
            nodes={nodes}
            edges={level.edges}
            onNodesChange={handleNodesChange}
            onDragEnd={handleDragEnd}
            solved={solved}
            shaking={shaking}
          />
        </div>
      </div>

      {/* Score overlay */}
      {showScore && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-background rounded-2xl p-8 mx-4 max-w-sm w-full shadow-2xl text-center animate-scale-in">
            <h2 className="text-3xl font-black text-foreground mb-2">
              {stars === 3 ? '✨ Perfect!' : stars === 2 ? '🎉 Great!' : '👍 Solved!'}
            </h2>
            <p className="text-muted-foreground text-sm mb-6">{level.name}</p>

            <StarRating stars={stars} size={48} animated />

            <div className="mt-6 flex justify-center gap-8 text-sm">
              <div>
                <div className="text-2xl font-black text-foreground">{moves}</div>
                <div className="text-muted-foreground">moves</div>
              </div>
              <div>
                <div className="text-2xl font-black text-foreground">{formatTime(elapsed)}</div>
                <div className="text-muted-foreground">time</div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={onRetry}
                className="flex-1 py-3 rounded-xl bg-secondary text-foreground font-bold transition-all hover:scale-105 active:scale-95"
              >
                Retry
              </button>
              {onNextLevel && (
                <button
                  onClick={onNextLevel}
                  className="flex-1 py-3 rounded-xl bg-foreground text-background font-bold transition-all hover:scale-105 active:scale-95"
                >
                  {mode === 'zen' ? 'New Knot →' : 'Next Level →'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameScreen;
