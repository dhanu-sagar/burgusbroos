import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings,
  Flame,
  Clock,
  Sparkles,
  Layers,
  Search,
  Command,
} from 'lucide-react';
import { formatDateLabel, getTodayDateString } from '../utils/dateUtils';
import { getModifierLabel } from '../hooks/useKeyboardShortcuts';

interface HeaderProps {
  currentTab: 'dashboard' | 'tasks' | 'sprint' | 'projects' | 'report';
  setCurrentTab: (tab: 'dashboard' | 'tasks' | 'sprint' | 'projects' | 'report') => void;
  onOpenSettings: () => void;
  onOpenHabits: () => void;
  onOpenCommandPalette: () => void;
  onOpenShortcutsHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenSettings,
  onOpenHabits,
  onOpenCommandPalette,
  onOpenShortcutsHelp,
}) => {
  const { mode, setMode, selectedDate, setSelectedDate, activeSprint, activeSprintElapsedSec } = useApp();
  const today = getTodayDateString();
  const modLabel = getModifierLabel();

  return (
    <header className="sticky top-0 z-40 bg-[#fbfbfd]/80 backdrop-blur-xl border-b border-black/[0.06] transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-4">
        {/* Brand Area */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={() => {
              setSelectedDate(today);
              if (mode === 'advanced') setCurrentTab('dashboard');
            }}
            className="flex items-center gap-3 text-left group focus:outline-none"
            aria-label="Burgusbroos Home"
          >
            <div className="w-9 h-9 rounded-2xl bg-[#111111] text-white flex items-center justify-center font-display font-bold text-base shadow-[0_2px_10px_rgba(0,0,0,0.16)] group-hover:scale-105 group-hover:bg-black transition-all">
              B
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-bold tracking-tight text-[#111111] group-hover:text-black transition-colors block leading-tight">
                  Burgusbroos
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-neutral-100 text-neutral-600 border border-neutral-200/60 font-mono">
                  {mode === 'simple' ? 'Simple Floor' : 'Workspace'}
                </span>
              </div>
              <span className="text-[11px] text-neutral-500 font-normal hidden sm:block leading-none mt-0.5">
                {mode === 'simple' ? 'Tiny compounding daily practices' : 'Flexible sprints & 3-bucket tasks'}
              </span>
            </div>
          </button>
        </div>

        {/* Navigation Tabs (Advanced Mode) */}
        {mode === 'advanced' ? (
          <nav className="hidden md:flex items-center gap-1 bg-black/[0.04] p-1 rounded-2xl border border-black/[0.04]">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                currentTab === 'dashboard'
                  ? 'bg-white text-neutral-900 shadow-[0_1px_4px_rgba(0,0,0,0.08)]'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentTab('tasks')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                currentTab === 'tasks'
                  ? 'bg-white text-neutral-900 shadow-[0_1px_4px_rgba(0,0,0,0.08)]'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Tasks & Buckets
            </button>
            <button
              onClick={() => setCurrentTab('sprint')}
              className={`relative px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                currentTab === 'sprint'
                  ? 'bg-white text-neutral-900 shadow-[0_1px_4px_rgba(0,0,0,0.08)]'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <span>Sprint Focus</span>
              {activeSprint ? (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              ) : null}
            </button>
            <button
              onClick={() => setCurrentTab('projects')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                currentTab === 'projects'
                  ? 'bg-white text-neutral-900 shadow-[0_1px_4px_rgba(0,0,0,0.08)]'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Projects
            </button>
            <button
              onClick={() => setCurrentTab('report')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                currentTab === 'report'
                  ? 'bg-white text-neutral-900 shadow-[0_1px_4px_rgba(0,0,0,0.08)]'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Weekly Analytics
            </button>
          </nav>
        ) : (
          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-neutral-500 bg-black/[0.03] px-3 py-1.5 rounded-full border border-black/[0.04]">
            <span className="font-semibold text-neutral-900">{formatDateLabel(selectedDate)}</span>
            <span className="text-neutral-300">|</span>
            <span>The Daily Three (~5 min floor)</span>
          </div>
        )}

        {/* Center / Right Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Global Command Palette Trigger Button */}
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-neutral-500 hover:text-neutral-900 bg-black/[0.03] hover:bg-black/[0.06] rounded-xl border border-black/[0.05] transition-all"
            title={`Quick Actions & Search (${modLabel}K)`}
          >
            <Search className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden xl:inline text-neutral-400 font-normal">Command palette...</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-white border border-neutral-200/80 rounded-md text-neutral-700 shadow-2xs">
              {modLabel}K
            </kbd>
          </button>

          {/* Active sprint chip if running in background */}
          {activeSprint && mode === 'simple' && (
            <button
              onClick={() => {
                setMode('advanced');
                setCurrentTab('sprint');
              }}
              className="flex items-center gap-1.5 px-3 py-1 text-xs bg-emerald-500/10 text-emerald-800 font-medium rounded-full hover:bg-emerald-500/15 transition-all border border-emerald-500/20"
              title="Active sprint in progress. Click to view."
            >
              <Clock className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
              <span className="font-mono tabular-nums font-semibold">
                {Math.floor(activeSprintElapsedSec / 60)}m focus
              </span>
            </button>
          )}

          {/* Mode Switcher: Simple | Advanced */}
          <div className="flex items-center p-0.5 bg-neutral-200/60 rounded-xl border border-neutral-300/40">
            <button
              type="button"
              onClick={() => setMode('simple')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                mode === 'simple'
                  ? 'bg-white text-neutral-900 shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
              title="Simple Daily Three mode (Press 'M' to toggle)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Simple</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('advanced')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                mode === 'advanced'
                  ? 'bg-white text-neutral-900 shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
              title="Advanced Full Workspace (Press 'M' to toggle)"
            >
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              <span>Advanced</span>
            </button>
          </div>

          {/* Habits icon */}
          <button
            onClick={onOpenHabits}
            className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors relative"
            title="Habits & Gentle Streaks (Press 'H')"
            aria-label="Habits"
          >
            <Flame className="w-4 h-4 text-amber-500" />
          </button>

          {/* Keyboard Shortcuts Cheat Sheet Button */}
          <button
            onClick={onOpenShortcutsHelp}
            className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors"
            title="Keyboard Shortcuts Cheat Sheet (Press '?')"
            aria-label="Keyboard Shortcuts"
          >
            <Command className="w-4 h-4" />
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors"
            title="Preferences & Backup (Press ',')"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile nav for Advanced Mode */}
      {mode === 'advanced' && (
        <div className="md:hidden border-t border-black/[0.05] px-3 py-2 flex items-center justify-around gap-1 overflow-x-auto bg-[#fbfbfd]">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 ${
              currentTab === 'dashboard' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentTab('tasks')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 ${
              currentTab === 'tasks' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Tasks
          </button>
          <button
            onClick={() => setCurrentTab('sprint')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 flex items-center gap-1 ${
              currentTab === 'sprint' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Sprint
            {activeSprint && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
          </button>
          <button
            onClick={() => setCurrentTab('projects')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 ${
              currentTab === 'projects' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Projects
          </button>
          <button
            onClick={() => setCurrentTab('report')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 ${
              currentTab === 'report' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Analytics
          </button>
        </div>
      )}
    </header>
  );
};
