import React from 'react';
import { GameMode } from '../game/types';
import { loadProgress } from '../game/storage';

interface HomeScreenProps {
  onStartMode: (mode: GameMode) => void;
  onSettings: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onStartMode, onSettings }) => {
  const progress = loadProgress();

  return (
    <div className="linen-bg min-h-screen flex flex-col items-center justify-center px-4 py-8">
      {/* Title */}
      <div className="mb-12 text-center">
        <h1 className="text-6xl md:text-7xl font-black tracking-tight text-foreground mb-2">
          🧶 UNRAVEL
        </h1>
        <p className="text-lg text-muted-foreground font-semibold">
          Untangle the knot
        </p>
      </div>

      {/* Streak display */}
      {progress.streak > 0 && (
        <div className="mb-8 px-5 py-2 rounded-full bg-secondary text-foreground font-bold text-sm flex items-center gap-2">
          <span>🔥</span>
          <span>{progress.streak} day streak</span>
        </div>
      )}

      {/* Stars display */}
      {progress.totalStars > 0 && (
        <div className="mb-8 px-5 py-2 rounded-full bg-secondary text-foreground font-bold text-sm flex items-center gap-2">
          <span>⭐</span>
          <span>{progress.totalStars} stars collected</span>
        </div>
      )}

      {/* Mode buttons */}
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={() => onStartMode('story')}
          className="w-full py-4 px-6 rounded-xl bg-foreground text-background font-bold text-lg transition-all hover:scale-105 hover:shadow-lg active:scale-95"
        >
          Story Mode
        </button>
        <button
          onClick={() => onStartMode('zen')}
          className="w-full py-4 px-6 rounded-xl bg-secondary text-foreground font-bold text-lg border-2 border-border transition-all hover:scale-105 hover:shadow-lg active:scale-95"
        >
          Zen Mode
        </button>
        <button
          onClick={() => onStartMode('daily')}
          className="w-full py-4 px-6 rounded-xl bg-secondary text-muted-foreground font-bold text-lg border-2 border-border transition-all hover:scale-105 active:scale-95 opacity-70"
        >
          Daily Knot
          <span className="block text-xs font-normal mt-1">Coming Soon</span>
        </button>
      </div>

      {/* Settings */}
      <button
        onClick={onSettings}
        className="mt-8 text-muted-foreground hover:text-foreground transition-colors text-sm font-semibold"
      >
        ⚙️ Settings
      </button>
    </div>
  );
};

export default HomeScreen;
