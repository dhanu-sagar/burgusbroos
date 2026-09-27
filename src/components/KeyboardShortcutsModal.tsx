import React from 'react';
import { X, Command, Sparkles, Zap, Clock, Navigation, CheckCircle2 } from 'lucide-react';
import { getModifierLabel } from '../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
  note?: string;
}

interface ShortcutSection {
  title: string;
  icon: React.ReactNode;
  items: ShortcutItem[];
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const modLabel = getModifierLabel();

  if (!isOpen) return null;

  const sections: ShortcutSection[] = [
    {
      title: 'Global & General',
      icon: <Command className="w-4 h-4 text-neutral-800" />,
      items: [
        {
          keys: [`${modLabel}K`],
          description: 'Open Command Palette & Global Search',
          note: 'Works everywhere, even inside text fields',
        },
        {
          keys: ['?'],
          description: 'Open Keyboard Shortcuts cheat sheet',
        },
        {
          keys: ['Esc'],
          description: 'Close active modal, palette, or dialog',
        },
        {
          keys: [','],
          description: 'Open Settings, Preferences & Data Backup',
        },
      ],
    },
    {
      title: 'Creation & Daily Practices',
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
      items: [
        {
          keys: ['N'],
          description: 'Create New Task',
          note: 'Opens task modal with quick bucket assignments',
        },
        {
          keys: ['M'],
          description: 'Toggle Mode',
          note: 'Switch between Simple Floor (Daily Three) & Advanced Workspace',
        },
        {
          keys: ['H'],
          description: 'Open Habits & Gentle Streaks',
        },
        {
          keys: ['B'],
          description: 'Open Brain Dump History Archive',
        },
      ],
    },
    {
      title: 'Focus Sprints & Flow',
      icon: <Clock className="w-4 h-4 text-emerald-600" />,
      items: [
        {
          keys: ['S'],
          description: 'Launch Quick 25-Min Focus Sprint',
        },
        {
          keys: ['Space'],
          description: 'Pause or Resume active sprint',
          note: 'When a sprint session is active',
        },
        {
          keys: ['E'],
          description: 'Extend active sprint by +5 minutes',
        },
      ],
    },
    {
      title: 'Direct View Navigation',
      icon: <Navigation className="w-4 h-4 text-blue-500" />,
      items: [
        {
          keys: ['1'],
          description: 'Go to Dashboard View',
        },
        {
          keys: ['2'],
          description: 'Go to Tasks & Buckets (Must / Should / Could)',
        },
        {
          keys: ['3'],
          description: 'Go to Sprint Focus Studio',
        },
        {
          keys: ['4'],
          description: 'Go to Projects Workspace',
        },
        {
          keys: ['5'],
          description: 'Go to Weekly Reality Analytics',
        },
        {
          keys: ['T'],
          description: 'Jump date to Today',
        },
      ],
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-100"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-black/[0.08] w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-black/[0.05] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-mono font-bold text-xs">
              ⌘
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-neutral-900 leading-tight">
                Keyboard Shortcuts
              </h3>
              <p className="text-[11px] text-neutral-500 font-normal">
                Designed for power users to navigate and act at the speed of thought.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-xl hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sections.map((section, sIdx) => (
              <div
                key={sIdx}
                className="bg-neutral-50/60 rounded-2xl p-4 border border-neutral-200/60 space-y-3"
              >
                <div className="flex items-center gap-2 border-b border-neutral-200/60 pb-2">
                  {section.icon}
                  <h4 className="font-display text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    {section.title}
                  </h4>
                </div>

                <div className="space-y-2.5">
                  {section.items.map((item, iIdx) => (
                    <div
                      key={iIdx}
                      className="flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-neutral-800 leading-snug">
                          {item.description}
                        </div>
                        {item.note && (
                          <div className="text-[10px] text-neutral-500 mt-0.5 leading-snug">
                            {item.note}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {item.keys.map((k, kIdx) => (
                          <kbd
                            key={kIdx}
                            className="px-2 py-0.5 text-[11px] font-mono font-semibold text-neutral-800 bg-white border border-neutral-300 rounded-lg shadow-2xs tabular-nums"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 flex items-center justify-between">
            <span className="font-normal">
              💡 <strong>Pro-tip:</strong> Single-key shortcuts (like <kbd className="font-mono px-1.5 py-0.2 bg-white/80 rounded border border-amber-300 text-[10px]">N</kbd> or <kbd className="font-mono px-1.5 py-0.2 bg-white/80 rounded border border-amber-300 text-[10px]">S</kbd>) automatically deactivate while you are typing inside inputs or brain dumps to prevent accidental triggers.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500 shrink-0">
          <span>Press <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-neutral-100 border border-neutral-200 rounded">Esc</kbd> anytime to dismiss</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
