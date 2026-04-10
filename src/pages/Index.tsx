import React, { useState, useCallback } from 'react';
import { GameMode, GameScreen as GameScreenType } from '@/game/types';
import { levels, generateZenKnot } from '@/game/levels';
import { cloneNodes } from '@/game/engine';
import HomeScreen from '@/components/HomeScreen';
import LevelSelect from '@/components/LevelSelect';
import GameScreenComponent from '@/components/GameScreen';
import SettingsScreen from '@/components/SettingsScreen';

const App: React.FC = () => {
  const [screen, setScreen] = useState<GameScreenType>('home');
  const [mode, setMode] = useState<GameMode>('story');
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [zenComplexity, setZenComplexity] = useState(1);
  const [zenLevel, setZenLevel] = useState(() => generateZenKnot(1));
  const [gameKey, setGameKey] = useState(0);

  const handleStartMode = useCallback((m: GameMode) => {
    setMode(m);
    if (m === 'story') {
      setScreen('levelSelect');
    } else if (m === 'zen') {
      const newKnot = generateZenKnot(zenComplexity);
      setZenLevel(newKnot);
      setGameKey(k => k + 1);
      setScreen('game');
    } else {
      setScreen('home');
    }
  }, [zenComplexity]);

  const handleSelectLevel = useCallback((levelId: number) => {
    setCurrentLevelId(levelId);
    setGameKey(k => k + 1);
    setScreen('game');
  }, []);

  const handleBack = useCallback(() => {
    if (screen === 'game' && mode === 'story') {
      setScreen('levelSelect');
    } else {
      setScreen('home');
    }
  }, [screen, mode]);

  const handleNextLevel = useCallback(() => {
    if (mode === 'story') {
      const nextId = currentLevelId + 1;
      if (nextId <= levels.length) {
        setCurrentLevelId(nextId);
        setGameKey(k => k + 1);
      } else {
        setScreen('levelSelect');
      }
    } else if (mode === 'zen') {
      const newComplexity = zenComplexity + 1;
      setZenComplexity(newComplexity);
      setZenLevel(generateZenKnot(newComplexity));
      setGameKey(k => k + 1);
    }
  }, [mode, currentLevelId, zenComplexity]);

  const handleRetry = useCallback(() => {
    if (mode === 'zen') {
      setZenLevel(generateZenKnot(zenComplexity));
    }
    setGameKey(k => k + 1);
  }, [mode, zenComplexity]);

  const currentLevel = mode === 'story'
    ? levels.find(l => l.id === currentLevelId)
    : zenLevel;

  // Deep clone the level for the game
  const gameLevel = currentLevel ? {
    ...currentLevel,
    nodes: cloneNodes(currentLevel.nodes),
  } : null;

  return (
    <>
      {screen === 'home' && (
        <HomeScreen
          onStartMode={handleStartMode}
          onSettings={() => setScreen('settings')}
        />
      )}
      {screen === 'levelSelect' && (
        <LevelSelect
          onSelectLevel={handleSelectLevel}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'game' && gameLevel && (
        <GameScreenComponent
          key={gameKey}
          level={gameLevel}
          mode={mode === 'daily' ? 'story' : mode}
          onBack={handleBack}
          onNextLevel={handleNextLevel}
          onRetry={handleRetry}
        />
      )}
      {screen === 'settings' && (
        <SettingsScreen onBack={() => setScreen('home')} />
      )}
    </>
  );
};

export default App;
