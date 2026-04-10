import React from 'react';
import { levels } from '../game/levels';
import { loadProgress } from '../game/storage';
import StarRating from './StarRating';

interface LevelSelectProps {
  onSelectLevel: (levelId: number) => void;
  onBack: () => void;
}

const LevelSelect: React.FC<LevelSelectProps> = ({ onSelectLevel, onBack }) => {
  const progress = loadProgress();

  return (
    <div className="linen-bg min-h-screen px-4 py-8">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground transition-colors font-bold text-lg"
          >
            ← Back
          </button>
          <h2 className="text-2xl font-black text-foreground">Story Mode</h2>
          <div className="w-16" />
        </div>

        {/* Level grid */}
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
          {levels.map(level => {
            const lp = progress.levels[level.id];
            const unlocked = level.id <= progress.currentLevel;
            const completed = lp?.completed;

            return (
              <button
                key={level.id}
                onClick={() => unlocked && onSelectLevel(level.id)}
                disabled={!unlocked}
                className={`
                  relative aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all
                  ${unlocked
                    ? completed
                      ? 'bg-foreground text-background hover:scale-110 hover:shadow-lg'
                      : 'bg-secondary text-foreground border-2 border-border hover:scale-110 hover:shadow-lg'
                    : 'bg-muted text-muted-foreground opacity-40 cursor-not-allowed'
                  }
                `}
              >
                <span className="text-lg font-black">{level.id}</span>
                {completed && lp && (
                  <StarRating stars={lp.stars} size={12} />
                )}
                {!unlocked && (
                  <span className="text-xs">🔒</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LevelSelect;
