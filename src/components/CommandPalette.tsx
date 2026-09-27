import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Plus,
  Play,
  Pause,
  CheckCircle2,
  Flame,
  History,
  Settings,
  Layers,
  Sparkles,
  LayoutDashboard,
  CheckSquare,
  Clock,
  FolderGit2,
  BarChart3,
  Calendar,
  HelpCircle,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { Task, BucketType } from '../types';
import { getModifierLabel } from '../hooks/useKeyboardShortcuts';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTaskModal: (task?: Task | null, bucket?: BucketType) => void;
  onLaunchSprint: (task?: Task) => void;
  onNavigateToTab: (tab: 'dashboard' | 'tasks' | 'sprint' | 'projects' | 'report') => void;
  onOpenHabits: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onOpenShortcutsHelp: () => void;
}

interface PaletteAction {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Actions' | 'Navigation' | 'Tasks' | 'Projects' | 'General';
  icon: React.ReactNode;
  shortcutBadge?: string;
  perform: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenTaskModal,
  onLaunchSprint,
  onNavigateToTab,
  onOpenHabits,
  onOpenHistory,
  onOpenSettings,
  onOpenShortcutsHelp,
}) => {
  const {
    mode,
    setMode,
    tasks,
    projects,
    activeSprint,
    pauseSprint,
    resumeSprint,
    setSelectedDate,
  } = useApp();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const modLabel = getModifierLabel();

  // Reset query and selected index on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Construct all searchable items
  const allActions = useMemo<PaletteAction[]>(() => {
    const list: PaletteAction[] = [];

    // Core Actions
    list.push({
      id: 'new-task',
      title: 'Create New Task',
      subtitle: 'Open task modal to add to your backlog',
      category: 'Actions',
      icon: <Plus className="w-4 h-4 text-neutral-900" />,
      shortcutBadge: 'N',
      perform: () => {
        onClose();
        onOpenTaskModal();
      },
    });

    list.push({
      id: 'new-must-task',
      title: 'New Must Do Task',
      subtitle: 'Clear deadlines and real consequences',
      category: 'Actions',
      icon: <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />,
      perform: () => {
        onClose();
        onOpenTaskModal(null, 'must');
      },
    });

    list.push({
      id: 'new-should-task',
      title: 'New Should Do Task',
      subtitle: 'Meaningful, joyful, enriching growth',
      category: 'Actions',
      icon: <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />,
      perform: () => {
        onClose();
        onOpenTaskModal(null, 'should');
      },
    });

    list.push({
      id: 'new-could-task',
      title: 'New Could Do Task',
      subtitle: 'Curiosity & fun with extra bandwidth',
      category: 'Actions',
      icon: <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />,
      perform: () => {
        onClose();
        onOpenTaskModal(null, 'could');
      },
    });

    // Sprint actions
    if (activeSprint) {
      if (activeSprint.isPaused) {
        list.push({
          id: 'resume-sprint',
          title: `Resume Sprint: "${activeSprint.taskName}"`,
          subtitle: 'Continue focus session',
          category: 'Actions',
          icon: <Play className="w-4 h-4 text-emerald-600" />,
          shortcutBadge: 'Space',
          perform: () => {
            onClose();
            resumeSprint();
            setMode('advanced');
            onNavigateToTab('sprint');
          },
        });
      } else {
        list.push({
          id: 'pause-sprint',
          title: `Pause Sprint: "${activeSprint.taskName}"`,
          subtitle: 'Take a short breather',
          category: 'Actions',
          icon: <Pause className="w-4 h-4 text-amber-600" />,
          shortcutBadge: 'Space',
          perform: () => {
            onClose();
            pauseSprint();
          },
        });
      }
    } else {
      list.push({
        id: 'start-sprint',
        title: 'Start 25-Min Focus Sprint',
        subtitle: 'Gentle flow session without rigid locks',
        category: 'Actions',
        icon: <Play className="w-4 h-4 text-emerald-600" />,
        shortcutBadge: 'S',
        perform: () => {
          onClose();
          onLaunchSprint();
        },
      });
    }

    // Navigation & Views
    list.push({
      id: 'toggle-mode',
      title: mode === 'simple' ? 'Switch to Advanced Workspace' : 'Switch to Simple Floor Mode',
      subtitle: mode === 'simple' ? 'Unlocks task buckets, sprints & analytics' : 'Back to the Daily Three baseline',
      category: 'Navigation',
      icon: mode === 'simple' ? <Layers className="w-4 h-4 text-blue-500" /> : <Sparkles className="w-4 h-4 text-amber-500" />,
      shortcutBadge: 'M',
      perform: () => {
        onClose();
        setMode(mode === 'simple' ? 'advanced' : 'simple');
      },
    });

    list.push({
      id: 'nav-dashboard',
      title: 'Go to Dashboard',
      subtitle: 'Today summary, reality time tracking, urgent backlog',
      category: 'Navigation',
      icon: <LayoutDashboard className="w-4 h-4 text-neutral-600" />,
      shortcutBadge: '1',
      perform: () => {
        onClose();
        setMode('advanced');
        onNavigateToTab('dashboard');
      },
    });

    list.push({
      id: 'nav-tasks',
      title: 'Go to Tasks & Buckets',
      subtitle: 'Manage Must, Should, and Could Do priorities',
      category: 'Navigation',
      icon: <CheckSquare className="w-4 h-4 text-neutral-600" />,
      shortcutBadge: '2',
      perform: () => {
        onClose();
        setMode('advanced');
        onNavigateToTab('tasks');
      },
    });

    list.push({
      id: 'nav-sprint',
      title: 'Go to Sprint Focus',
      subtitle: 'Timer, natural intervals, and session history',
      category: 'Navigation',
      icon: <Clock className="w-4 h-4 text-neutral-600" />,
      shortcutBadge: '3',
      perform: () => {
        onClose();
        setMode('advanced');
        onNavigateToTab('sprint');
      },
    });

    list.push({
      id: 'nav-projects',
      title: 'Go to Projects',
      subtitle: 'Project containers and execution milestones',
      category: 'Navigation',
      icon: <FolderGit2 className="w-4 h-4 text-neutral-600" />,
      shortcutBadge: '4',
      perform: () => {
        onClose();
        setMode('advanced');
        onNavigateToTab('projects');
      },
    });

    list.push({
      id: 'nav-report',
      title: 'Go to Weekly Analytics',
      subtitle: 'Non-judgmental observations and reality distributions',
      category: 'Navigation',
      icon: <BarChart3 className="w-4 h-4 text-neutral-600" />,
      shortcutBadge: '5',
      perform: () => {
        onClose();
        setMode('advanced');
        onNavigateToTab('report');
      },
    });

    list.push({
      id: 'jump-today',
      title: 'Jump to Today',
      subtitle: 'Return date cursor to the present day',
      category: 'Navigation',
      icon: <Calendar className="w-4 h-4 text-neutral-600" />,
      shortcutBadge: 'T',
      perform: () => {
        onClose();
        const todayStr = new Date().toISOString().split('T')[0];
        setSelectedDate(todayStr);
      },
    });

    // Modals & Panels
    list.push({
      id: 'open-habits',
      title: 'Open Gentle Habits & Streaks',
      subtitle: 'Daily streak tracking with zero guilt resets',
      category: 'General',
      icon: <Flame className="w-4 h-4 text-amber-500" />,
      shortcutBadge: 'H',
      perform: () => {
        onClose();
        onOpenHabits();
      },
    });

    list.push({
      id: 'open-history',
      title: 'Open Brain Dump History',
      subtitle: 'Browse unfiltered past mental RAM dumps',
      category: 'General',
      icon: <History className="w-4 h-4 text-neutral-700" />,
      shortcutBadge: 'B',
      perform: () => {
        onClose();
        onOpenHistory();
      },
    });

    list.push({
      id: 'open-shortcuts',
      title: 'Keyboard Shortcuts Cheat Sheet',
      subtitle: 'View all keyboard shortcuts and hotkeys',
      category: 'General',
      icon: <HelpCircle className="w-4 h-4 text-neutral-700" />,
      shortcutBadge: '?',
      perform: () => {
        onClose();
        onOpenShortcutsHelp();
      },
    });

    list.push({
      id: 'open-settings',
      title: 'Open Settings & Data Backup',
      subtitle: 'Configure default mode, export JSON, or reset sample data',
      category: 'General',
      icon: <Settings className="w-4 h-4 text-neutral-700" />,
      shortcutBadge: ',',
      perform: () => {
        onClose();
        onOpenSettings();
      },
    });

    // Existing Tasks (Searchable)
    tasks.forEach((t) => {
      const isDone = t.status === 'done';
      list.push({
        id: `task-${t.id}`,
        title: t.name,
        subtitle: `[${t.bucket.toUpperCase()} DO] ${t.estimatedMinutes ? `${t.estimatedMinutes}m est` : ''} · ${isDone ? 'Completed' : 'Open task'}`,
        category: 'Tasks',
        icon: isDone ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        ) : (
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              t.bucket === 'must'
                ? 'bg-rose-500'
                : t.bucket === 'should'
                ? 'bg-amber-500'
                : 'bg-sky-500'
            }`}
          />
        ),
        perform: () => {
          onClose();
          onOpenTaskModal(t);
        },
      });
    });

    // Existing Projects (Searchable)
    projects.forEach((p) => {
      list.push({
        id: `project-${p.id}`,
        title: p.name,
        subtitle: `Project · ${p.description || 'Active project'}`,
        category: 'Projects',
        icon: <FolderGit2 className="w-4 h-4 text-neutral-700" />,
        perform: () => {
          onClose();
          setMode('advanced');
          onNavigateToTab('projects');
        },
      });
    });

    return list;
  }, [
    mode,
    activeSprint,
    tasks,
    projects,
    onClose,
    onOpenTaskModal,
    onLaunchSprint,
    onNavigateToTab,
    onOpenHabits,
    onOpenHistory,
    onOpenSettings,
    onOpenShortcutsHelp,
    pauseSprint,
    resumeSprint,
    setMode,
    setSelectedDate,
  ]);

  // Filter actions based on query
  const filteredActions = useMemo(() => {
    if (!query.trim()) {
      // When empty, show Actions, Navigation & General first
      return allActions.filter(
        (a) => a.category === 'Actions' || a.category === 'Navigation' || a.category === 'General'
      );
    }

    const q = query.toLowerCase().trim();
    return allActions.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.subtitle && a.subtitle.toLowerCase().includes(q)) ||
        a.category.toLowerCase().includes(q)
    );
  }, [allActions, query]);

  // Keyboard navigation within the palette
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filteredActions.length > 0 ? (prev + 1) % filteredActions.length : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filteredActions.length > 0
            ? (prev - 1 + filteredActions.length) % filteredActions.length
            : 0
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredActions[selectedIndex]) {
          filteredActions[selectedIndex].perform();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredActions, selectedIndex, onClose]);

  // Reset selected index when filtered list changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector<HTMLElement>(`[data-index="${selectedIndex}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-100"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-black/[0.09] w-full max-w-xl overflow-hidden flex flex-col max-h-[75vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 sm:px-6 py-4 border-b border-black/[0.06] bg-white">
          <Search className="w-5 h-5 text-neutral-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, task, project, or shortcut..."
            className="w-full text-sm sm:text-base font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none bg-transparent"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-semibold text-neutral-400 bg-neutral-100 border border-neutral-200 rounded-md">
            Esc
          </kbd>
        </div>

        {/* Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 sm:p-3 divide-y divide-transparent">
          {filteredActions.length === 0 ? (
            <div className="text-center py-12 px-4 text-xs text-neutral-400">
              <p className="font-display font-bold text-sm text-neutral-800">No matching commands or tasks</p>
              <p className="mt-1">Try searching for "task", "sprint", "must", or press N for a new task.</p>
            </div>
          ) : (
            filteredActions.map((action, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={action.id}
                  data-index={index}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => action.perform()}
                  className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'text-neutral-800 hover:bg-neutral-100/80'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-white/10 text-white'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      {action.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-semibold truncate leading-tight">
                          {action.title}
                        </span>
                        <span
                          className={`text-[9px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded ${
                            isSelected
                              ? 'bg-white/20 text-white/80'
                              : 'bg-neutral-100 text-neutral-500'
                          }`}
                        >
                          {action.category}
                        </span>
                      </div>
                      {action.subtitle && (
                        <p
                          className={`text-[11px] truncate leading-normal mt-0.5 ${
                            isSelected ? 'text-neutral-300' : 'text-neutral-400'
                          }`}
                        >
                          {action.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {action.shortcutBadge && (
                      <kbd
                        className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded-md ${
                          isSelected
                            ? 'bg-white/20 text-white border border-white/20'
                            : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                        }`}
                      >
                        {action.shortcutBadge}
                      </kbd>
                    )}
                    {isSelected && (
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-300" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-5 py-2.5 bg-neutral-50 border-t border-black/[0.05] flex items-center justify-between text-[11px] text-neutral-500 font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-neutral-200 text-neutral-700 shadow-xs">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-neutral-200 text-neutral-700 shadow-xs">↓</kbd>
              <span className="ml-1">Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-neutral-200 text-neutral-700 shadow-xs">↵</kbd>
              <span className="ml-1">Select</span>
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span>Shortcut:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white border border-neutral-200 text-neutral-700 shadow-xs">
              {modLabel}K
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
};
