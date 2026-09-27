import React from 'react';
import { useApp } from '../context/AppContext';
import { Play, Pause, Maximize2 } from 'lucide-react';
import { formatTimerDigital } from '../utils/dateUtils';

interface ActiveSprintOverlayProps {
  onOpenSprintTab: () => void;
}

export const ActiveSprintOverlay: React.FC<ActiveSprintOverlayProps> = ({ onOpenSprintTab }) => {
  const { activeSprint, activeSprintElapsedSec, pauseSprint, resumeSprint, extendSprint } = useApp();

  if (!activeSprint) return null;

  return (
    <aside
      aria-label="Active sprint timer"
      className="fixed bottom-5 right-5 z-40 bg-[#1d1d1f]/90 backdrop-blur-2xl text-white rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.2)] px-4 py-2.5 border border-white/10 flex items-center gap-3.5 max-w-sm animate-in slide-in-from-bottom-3 duration-200"
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-2 h-2 rounded-full bg-[#34c759] animate-pulse shrink-0" />
        <span className="text-xs font-medium text-white truncate max-w-[130px]">
          {activeSprint.taskName}
        </span>
      </div>

      <div className="font-mono tabular-nums font-medium text-sm text-white shrink-0">
        {formatTimerDigital(activeSprintElapsedSec)}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {activeSprint.isPaused ? (
          <button
            onClick={resumeSprint}
            className="p-1.5 bg-white/15 hover:bg-white/25 rounded-full transition-colors"
            title="Resume"
          >
            <Play className="w-3 h-3 fill-white" />
          </button>
        ) : (
          <button
            onClick={pauseSprint}
            className="p-1.5 bg-white/15 hover:bg-white/25 rounded-full transition-colors"
            title="Pause"
          >
            <Pause className="w-3 h-3" />
          </button>
        )}

        <button
          onClick={() => extendSprint(300)}
          className="px-2 py-1 text-[11px] font-medium bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          title="Add 5 minutes"
        >
          +5m
        </button>

        <button
          onClick={onOpenSprintTab}
          className="p-1.5 text-white/60 hover:text-white rounded-full transition-colors"
          title="Open Sprint"
        >
          <Maximize2 className="w-3 h-3" />
        </button>
      </div>
    </aside>
  );
};
