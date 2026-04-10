import { KnotLevel } from './types';

interface StoredProgress {
  currentLevel: number;
  streak: number;
  lastPlayedDate: string;   // ISO date string YYYY-MM-DD
  totalStars: number;
  levels: Record<number, { completed: boolean; stars: number }>;
}

const STORAGE_KEY = 'unravel_progress';

const DEFAULT_PROGRESS: StoredProgress = {
  currentLevel: 1,
  streak: 0,
  lastPlayedDate: '',
  totalStars: 0,
  levels: {},
};

export function loadProgress(): StoredProgress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_PROGRESS;
    return JSON.parse(stored) as StoredProgress;
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function calculateStars(moves: number, minMoves: number): number {
  if (moves <= minMoves) return 3;
  if (moves <= minMoves * 2) return 2;
  return 1;
}

export function saveLevelResult(
  levelId: number,
  moves: number,
  _time: number,
  minMoves: number
): void {
  const progress = loadProgress();

  // Update level record
  if (!progress.levels[levelId]) {
    progress.levels[levelId] = { completed: true, stars: 0 };
  }
  const stars = calculateStars(moves, minMoves);
  progress.levels[levelId].completed = true;
  progress.levels[levelId].stars = Math.max(
    progress.levels[levelId].stars,
    stars
  );

  // Unlock next level
  progress.currentLevel = Math.max(progress.currentLevel, levelId + 1);

  // Recalculate total stars
  progress.totalStars = Object.values(progress.levels).reduce(
    (sum, lp) => sum + lp.stars,
    0
  );

  // Update streak (consecutive days)
  const today = new Date().toISOString().slice(0, 10);
  if (progress.lastPlayedDate !== today) {
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .slice(0, 10);
    if (progress.lastPlayedDate === yesterday) {
      progress.streak += 1;
    } else {
      progress.streak = 1;
    }
    progress.lastPlayedDate = today;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function resetProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
}
