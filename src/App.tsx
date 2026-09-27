/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { SimpleModeView } from './components/SimpleModeView';
import { DashboardView } from './components/DashboardView';
import { TasksView } from './components/TasksView';
import { SprintView } from './components/SprintView';
import { ProjectsView } from './components/ProjectsView';
import { WeeklyReportView } from './components/WeeklyReportView';
import { ActiveSprintOverlay } from './components/ActiveSprintOverlay';
import { TaskModal } from './components/TaskModal';
import { HabitsModal } from './components/HabitsModal';
import { BrainDumpHistoryModal } from './components/BrainDumpHistoryModal';
import { SettingsModal } from './components/SettingsModal';
import { CommandPalette } from './components/CommandPalette';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { Task, BucketType } from './types';
import { useKeyboardShortcuts, ShortcutDefinition } from './hooks/useKeyboardShortcuts';
import { getTodayDateString } from './utils/dateUtils';
import { motion, AnimatePresence } from 'framer-motion';

function MainAppContent() {
  const {
    mode,
    setMode,
    startSprint,
    activeSprint,
    pauseSprint,
    resumeSprint,
    extendSprint,
    promoteBrainDumpLine,
    setSelectedDate,
  } = useApp();

  // Navigation tab for Advanced Mode
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'tasks' | 'sprint' | 'projects' | 'report'>('dashboard');

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [defaultBucket, setDefaultBucket] = useState<BucketType>('must');

  const [isHabitsModalOpen, setIsHabitsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState(false);

  // Helper to open Task modal
  const handleOpenTaskModal = useCallback((task?: Task | null, bucket?: BucketType) => {
    setTaskToEdit(task || null);
    setDefaultBucket(bucket || 'must');
    setIsTaskModalOpen(true);
  }, []);

  // Helper to launch sprint directly from a task
  const handleLaunchSprint = useCallback((task?: Task) => {
    if (task) {
      startSprint({
        taskId: task.id,
        taskName: task.name,
        bucket: task.bucket,
        projectId: task.projectId,
        plannedDurationSec: (task.estimatedMinutes ? task.estimatedMinutes * 60 : 1500),
      });
    } else {
      startSprint({
        taskName: 'Quick Focus Sprint',
        bucket: 'must',
        plannedDurationSec: 1500, // 25 min default
      });
    }
    // Switch to sprint tab in advanced mode
    setMode('advanced');
    setCurrentTab('sprint');
  }, [startSprint, setMode]);

  // Helper to promote line from brain dump
  const handlePromoteLine = useCallback((text: string, bucket?: BucketType) => {
    promoteBrainDumpLine(text, bucket || 'must');
  }, [promoteBrainDumpLine]);

  // Helper to close any open modal
  const handleCloseAnyModal = useCallback(() => {
    if (isCommandPaletteOpen) {
      setIsCommandPaletteOpen(false);
      return;
    }
    if (isShortcutsHelpOpen) {
      setIsShortcutsHelpOpen(false);
      return;
    }
    if (isTaskModalOpen) {
      setIsTaskModalOpen(false);
      return;
    }
    if (isHabitsModalOpen) {
      setIsHabitsModalOpen(false);
      return;
    }
    if (isHistoryModalOpen) {
      setIsHistoryModalOpen(false);
      return;
    }
    if (isSettingsModalOpen) {
      setIsSettingsModalOpen(false);
      return;
    }
  }, [
    isCommandPaletteOpen,
    isShortcutsHelpOpen,
    isTaskModalOpen,
    isHabitsModalOpen,
    isHistoryModalOpen,
    isSettingsModalOpen,
  ]);

  // Define global keyboard shortcuts
  const shortcuts = useMemo<ShortcutDefinition[]>(() => {
    return [
      // 1. Command Palette: Cmd+K / Ctrl+K
      {
        id: 'toggle-command-palette',
        key: 'k',
        metaOrCtrl: true,
        allowInInput: true,
        category: 'General',
        description: 'Open Command Palette & Global Search',
        action: () => {
          setIsCommandPaletteOpen((prev) => !prev);
        },
      },
      // 2. Escape: dismiss modals or palettes
      {
        id: 'dismiss-modal',
        key: 'Escape',
        allowInInput: true,
        category: 'General',
        description: 'Close active modal or palette',
        action: () => {
          handleCloseAnyModal();
        },
      },
      // 3. New Task: N
      {
        id: 'new-task',
        key: 'n',
        category: 'Actions',
        description: 'Create New Task',
        action: () => {
          handleOpenTaskModal();
        },
      },
      // 4. Toggle Mode: M
      {
        id: 'toggle-mode',
        key: 'm',
        category: 'Navigation',
        description: 'Toggle Simple Floor ↔ Advanced Workspace',
        action: () => {
          setMode(mode === 'simple' ? 'advanced' : 'simple');
        },
      },
      // 5. Quick Sprint: S
      {
        id: 'quick-sprint',
        key: 's',
        category: 'Sprint',
        description: 'Launch Quick 25-Min Sprint or open Sprint tab',
        action: () => {
          if (!activeSprint) {
            handleLaunchSprint();
          } else {
            setMode('advanced');
            setCurrentTab('sprint');
          }
        },
      },
      // 6. Sprint Pause/Resume: Space (only when sprint is active)
      {
        id: 'toggle-sprint-pause',
        key: ' ',
        category: 'Sprint',
        description: 'Pause or resume active sprint',
        enabled: Boolean(activeSprint),
        action: () => {
          if (activeSprint) {
            if (activeSprint.isPaused) {
              resumeSprint();
            } else {
              pauseSprint();
            }
          }
        },
      },
      // 7. Sprint Extend: E
      {
        id: 'extend-sprint',
        key: 'e',
        category: 'Sprint',
        description: 'Extend active sprint by +5 minutes',
        enabled: Boolean(activeSprint),
        action: () => {
          if (activeSprint) {
            extendSprint(300);
          }
        },
      },
      // 8. Shortcuts Help: ?
      {
        id: 'shortcuts-help',
        key: '?',
        category: 'General',
        description: 'Show Keyboard Shortcuts cheat sheet',
        action: () => {
          setIsShortcutsHelpOpen((prev) => !prev);
        },
      },
      // 9. Habits: H
      {
        id: 'open-habits',
        key: 'h',
        category: 'Actions',
        description: 'Open Habits & Streaks',
        action: () => {
          setIsHabitsModalOpen(true);
        },
      },
      // 10. Brain Dump History: B
      {
        id: 'open-history',
        key: 'b',
        category: 'Actions',
        description: 'Open Brain Dump History Archive',
        action: () => {
          setIsHistoryModalOpen(true);
        },
      },
      // 11. Settings: ,
      {
        id: 'open-settings',
        key: ',',
        category: 'General',
        description: 'Open Settings & Preferences',
        action: () => {
          setIsSettingsModalOpen(true);
        },
      },
      // 12. Jump to Today: T
      {
        id: 'jump-today',
        key: 't',
        category: 'Navigation',
        description: 'Jump date to Today',
        action: () => {
          setSelectedDate(getTodayDateString());
        },
      },
      // 13. Direct Tab Navigation: 1 - 5
      {
        id: 'nav-tab-1',
        key: '1',
        category: 'Navigation',
        description: 'Go to Dashboard',
        action: () => {
          setMode('advanced');
          setCurrentTab('dashboard');
        },
      },
      {
        id: 'nav-tab-2',
        key: '2',
        category: 'Navigation',
        description: 'Go to Tasks & Buckets',
        action: () => {
          setMode('advanced');
          setCurrentTab('tasks');
        },
      },
      {
        id: 'nav-tab-3',
        key: '3',
        category: 'Navigation',
        description: 'Go to Sprint Focus',
        action: () => {
          setMode('advanced');
          setCurrentTab('sprint');
        },
      },
      {
        id: 'nav-tab-4',
        key: '4',
        category: 'Navigation',
        description: 'Go to Projects',
        action: () => {
          setMode('advanced');
          setCurrentTab('projects');
        },
      },
      {
        id: 'nav-tab-5',
        key: '5',
        category: 'Navigation',
        description: 'Go to Weekly Analytics',
        action: () => {
          setMode('advanced');
          setCurrentTab('report');
        },
      },
    ];
  }, [
    mode,
    setMode,
    activeSprint,
    pauseSprint,
    resumeSprint,
    extendSprint,
    handleOpenTaskModal,
    handleLaunchSprint,
    handleCloseAnyModal,
    setSelectedDate,
  ]);

  // Activate the global keyboard shortcuts hook
  useKeyboardShortcuts({ shortcuts });

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-[#111111] flex flex-col font-sans">
      {/* Top Navigation Bar with Strict Top Bar Contract */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenHabits={() => setIsHabitsModalOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenShortcutsHelp={() => setIsShortcutsHelpOpen(true)}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <AnimatePresence mode="wait">
          {mode === 'simple' ? (
            <motion.div
              key="simple-mode"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              <SimpleModeView
                onOpenHistory={() => setIsHistoryModalOpen(true)}
                onOpenHabits={() => setIsHabitsModalOpen(true)}
                onPromoteLine={(text) => handlePromoteLine(text, 'must')}
              />
            </motion.div>
          ) : (
            <motion.div
              key={`advanced-${currentTab}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              {currentTab === 'dashboard' && (
                <DashboardView
                  onOpenTaskModal={handleOpenTaskModal}
                  onLaunchSprint={handleLaunchSprint}
                  onNavigateToTab={(tab) => setCurrentTab(tab)}
                  onOpenHistory={() => setIsHistoryModalOpen(true)}
                />
              )}
              {currentTab === 'tasks' && (
                <TasksView
                  onOpenTaskModal={handleOpenTaskModal}
                  onLaunchSprint={handleLaunchSprint}
                />
              )}
              {currentTab === 'sprint' && (
                <SprintView onOpenTaskModal={() => handleOpenTaskModal()} />
              )}
              {currentTab === 'projects' && (
                <ProjectsView
                  onOpenTaskModal={handleOpenTaskModal}
                  onLaunchSprint={handleLaunchSprint}
                />
              )}
              {currentTab === 'report' && <WeeklyReportView />}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Persistent mini-timer overlay when sprint is running and user isn't on the full sprint page */}
      {(mode === 'simple' || currentTab !== 'sprint') && (
        <ActiveSprintOverlay
          onOpenSprintTab={() => {
            setMode('advanced');
            setCurrentTab('sprint');
          }}
        />
      )}

      {/* Modals & Overlays */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenTaskModal={handleOpenTaskModal}
        onLaunchSprint={handleLaunchSprint}
        onNavigateToTab={(tab) => {
          setMode('advanced');
          setCurrentTab(tab);
        }}
        onOpenHabits={() => setIsHabitsModalOpen(true)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenShortcutsHelp={() => setIsShortcutsHelpOpen(true)}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsHelpOpen}
        onClose={() => setIsShortcutsHelpOpen(false)}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        taskToEdit={taskToEdit}
        defaultBucket={defaultBucket}
      />

      <HabitsModal
        isOpen={isHabitsModalOpen}
        onClose={() => setIsHabitsModalOpen(false)}
      />

      <BrainDumpHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onPromoteLine={handlePromoteLine}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
