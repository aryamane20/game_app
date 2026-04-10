import React from 'react';
import { resetProgress } from '../game/storage';

interface SettingsScreenProps {
  onBack: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const [confirmReset, setConfirmReset] = React.useState(false);

  const handleReset = () => {
    if (confirmReset) {
      resetProgress();
      setConfirmReset(false);
      window.location.reload();
    } else {
      setConfirmReset(true);
    }
  };

  return (
    <div className="linen-bg min-h-screen px-4 py-8">
      <div className="max-w-sm mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground transition-colors font-bold text-lg"
          >
            ← Back
          </button>
          <h2 className="text-2xl font-black text-foreground">Settings</h2>
          <div className="w-16" />
        </div>

        <div className="space-y-6">
          {/* Sound toggle (visual only) */}
          <div className="flex items-center justify-between p-4 bg-secondary rounded-xl">
            <span className="font-bold text-foreground">🔊 Sound</span>
            <span className="text-sm text-muted-foreground italic">Coming soon</span>
          </div>

          {/* Reset progress */}
          <div className="p-4 bg-secondary rounded-xl">
            <button
              onClick={handleReset}
              className={`w-full py-3 rounded-xl font-bold transition-all ${
                confirmReset
                  ? 'bg-destructive text-destructive-foreground'
                  : 'bg-muted text-foreground hover:bg-destructive/10'
              }`}
            >
              {confirmReset ? 'Confirm Reset — All Progress Will Be Lost' : '🗑️ Reset All Progress'}
            </button>
            {confirmReset && (
              <button
                onClick={() => setConfirmReset(false)}
                className="w-full mt-2 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            )}
          </div>

          {/* About */}
          <div className="p-4 bg-secondary rounded-xl text-center">
            <p className="text-sm text-muted-foreground">
              🧶 UNRAVEL v1.0
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              A knot-untangling puzzle game based on knot theory
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
