import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  BucketType,
  DailyRecord,
  Task,
  TaskStatus,
  SprintSession,
  Project,
  Habit,
  UserSettings,
  ActiveSprintState,
  FocusQuality,
  CreativeLogEntry,
  CreativeLogType,
} from '../types';
import { getDefaultSeedData } from '../utils/defaultData';
import { getTodayDateString } from '../utils/dateUtils';

interface AppContextType {
  // Mode & navigation
  mode: 'simple' | 'advanced';
  setMode: (mode: 'simple' | 'advanced') => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;

  // Daily records (Simple Mode + Top of Advanced Mode)
  dailyRecords: Record<string, DailyRecord>;
  currentRecord: DailyRecord;
  updateBrainDump: (date: string, brainDump: string) => void;
  updateDailyHighlight: (date: string, text: string, done?: boolean) => void;
  toggleDailyHighlightDone: (date: string) => void;
  updateMicroCommitment: (date: string, text: string, done?: boolean, habitId?: string) => void;
  toggleMicroCommitmentDone: (date: string) => void;
  promoteBrainDumpLine: (lineText: string, bucket: BucketType) => void;

  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  reorderTasks: (newTasks: Task[]) => void;
  moveTaskInBucket: (sourceId: string, targetId: string, position?: 'before' | 'after') => void;
  moveTaskToBucket: (taskId: string, targetBucket: BucketType, targetIndex?: number) => void;

  // Sprints
  activeSprint: ActiveSprintState | null;
  activeSprintElapsedSec: number;
  startSprint: (params: {
    taskId?: string;
    taskName?: string;
    bucket?: BucketType;
    projectId?: string;
    plannedDurationSec?: number;
  }) => void;
  pauseSprint: () => void;
  resumeSprint: () => void;
  extendSprint: (extraSec: number) => void;
  addSprintCreativeEntry: (entry: { content: string; type?: CreativeLogType }) => void;
  removeSprintCreativeEntry: (entryId: string) => void;
  endSprint: (
    focusQuality?: FocusQuality,
    notes?: string,
    markTaskDone?: boolean,
    creativeLog?: CreativeLogEntry[],
    creativeTakeaway?: string
  ) => void;
  cancelSprint: () => void;
  sprints: SprintSession[];
  deleteSprint: (id: string) => void;
  updateSprint: (id: string, updates: Partial<SprintSession>) => void;
  logCompletedSprintManually: (sprint: Omit<SprintSession, 'id'>) => void;

  // Projects
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProjectStats: (projectId: string) => {
    totalTasks: number;
    completedTasks: number;
    progressPercent: number;
    totalTimeSec: number;
    statusLine: string;
  };

  // Habits
  habits: Habit[];
  addHabit: (name: string) => Habit;
  toggleHabitToday: (habitId: string) => void;

  // Settings & Hints
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;
  dismissHint: (key: string) => void;
  exportData: () => void;
  importData: (jsonStr: string) => boolean;
  resetToDefaults: () => void;
}

const STORAGE_KEY = 'burgusbroos_app_data_v1';
const ACTIVE_SPRINT_KEY = 'burgusbroos_active_sprint_v1';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial data
  const [dataLoaded, setDataLoaded] = useState(false);
  const [dailyRecords, setDailyRecords] = useState<Record<string, DailyRecord>>({});
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sprints, setSprints] = useState<SprintSession[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    mode: 'simple',
    weekStartDay: 'monday',
    gentleNudgesEnabled: true,
    soundEnabled: false,
    dismissedHints: {},
  });

  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [activeSprint, setActiveSprint] = useState<ActiveSprintState | null>(null);
  const [activeSprintElapsedSec, setActiveSprintElapsedSec] = useState<number>(0);

  // Initialize from storage or seed
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setDailyRecords(parsed.dailyRecords || {});
        setTasks(parsed.tasks || []);
        setSprints(parsed.sprints || []);
        setProjects(parsed.projects || []);
        setHabits(parsed.habits || []);
        if (parsed.settings) {
          setSettings(parsed.settings);
        }
      } else {
        const seed = getDefaultSeedData();
        setDailyRecords(seed.dailyRecords);
        setTasks(seed.tasks);
        setSprints(seed.sprints);
        setProjects(seed.projects);
        setHabits(seed.habits);
        setSettings(seed.settings);
      }

      // Check active sprint from storage
      const storedSprint = localStorage.getItem(ACTIVE_SPRINT_KEY);
      if (storedSprint) {
        const parsedSprint: ActiveSprintState = JSON.parse(storedSprint);
        setActiveSprint(parsedSprint);
      }
    } catch (e) {
      console.error('Error loading stored Burgusbroos data:', e);
      const seed = getDefaultSeedData();
      setDailyRecords(seed.dailyRecords);
      setTasks(seed.tasks);
      setSprints(seed.sprints);
      setProjects(seed.projects);
      setHabits(seed.habits);
      setSettings(seed.settings);
    } finally {
      setDataLoaded(true);
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (!dataLoaded) return;
    try {
      const payload = {
        dailyRecords,
        tasks,
        sprints,
        projects,
        habits,
        settings,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Error saving Burgusbroos data:', e);
    }
  }, [dailyRecords, tasks, sprints, projects, habits, settings, dataLoaded]);

  // Persist active sprint
  useEffect(() => {
    if (activeSprint) {
      localStorage.setItem(ACTIVE_SPRINT_KEY, JSON.stringify(activeSprint));
    } else {
      localStorage.removeItem(ACTIVE_SPRINT_KEY);
    }
  }, [activeSprint]);

  // Sprint ticker
  useEffect(() => {
    if (!activeSprint) {
      setActiveSprintElapsedSec(0);
      return;
    }

    const calcElapsed = () => {
      if (activeSprint.isPaused) {
        return activeSprint.accumulatedSec;
      }
      const now = Date.now();
      const currentChunkSec = Math.max(0, Math.floor((now - activeSprint.startTimestamp) / 1000));
      return activeSprint.accumulatedSec + currentChunkSec;
    };

    setActiveSprintElapsedSec(calcElapsed());

    if (!activeSprint.isPaused && activeSprint.isRunning) {
      const interval = setInterval(() => {
        setActiveSprintElapsedSec(calcElapsed());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeSprint]);

  // Mode switcher with setting persistence
  const mode = settings.mode;
  const setMode = useCallback((newMode: 'simple' | 'advanced') => {
    setSettings((prev) => ({ ...prev, mode: newMode }));
  }, []);

  // Ensure record for selected date exists
  const currentRecord = useMemo((): DailyRecord => {
    if (dailyRecords[selectedDate]) {
      return dailyRecords[selectedDate];
    }
    return {
      id: `record-${selectedDate}`,
      date: selectedDate,
      brainDump: '',
      dailyHighlight: { text: '', done: false },
      microCommitment: { text: '', done: false },
      updatedAt: new Date().toISOString(),
    };
  }, [dailyRecords, selectedDate]);

  // Daily records updates
  const updateBrainDump = useCallback((date: string, brainDump: string) => {
    setDailyRecords((prev) => {
      const existing = prev[date] || {
        id: `record-${date}`,
        date,
        brainDump: '',
        dailyHighlight: { text: '', done: false },
        microCommitment: { text: '', done: false },
        updatedAt: new Date().toISOString(),
      };
      return {
        ...prev,
        [date]: {
          ...existing,
          brainDump,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  const updateDailyHighlight = useCallback((date: string, text: string, done?: boolean) => {
    setDailyRecords((prev) => {
      const existing = prev[date] || {
        id: `record-${date}`,
        date,
        brainDump: '',
        dailyHighlight: { text: '', done: false },
        microCommitment: { text: '', done: false },
        updatedAt: new Date().toISOString(),
      };
      const isDone = done !== undefined ? done : existing.dailyHighlight.done;
      return {
        ...prev,
        [date]: {
          ...existing,
          dailyHighlight: {
            text,
            done: isDone,
            completedAt: isDone ? existing.dailyHighlight.completedAt || new Date().toISOString() : undefined,
          },
          updatedAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  const toggleDailyHighlightDone = useCallback((date: string) => {
    setDailyRecords((prev) => {
      const existing = prev[date] || {
        id: `record-${date}`,
        date,
        brainDump: '',
        dailyHighlight: { text: '', done: false },
        microCommitment: { text: '', done: false },
        updatedAt: new Date().toISOString(),
      };
      const nextDone = !existing.dailyHighlight.done;
      return {
        ...prev,
        [date]: {
          ...existing,
          dailyHighlight: {
            ...existing.dailyHighlight,
            done: nextDone,
            completedAt: nextDone ? new Date().toISOString() : undefined,
          },
          updatedAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  const updateMicroCommitment = useCallback(
    (date: string, text: string, done?: boolean, habitId?: string) => {
      setDailyRecords((prev) => {
        const existing = prev[date] || {
          id: `record-${date}`,
          date,
          brainDump: '',
          dailyHighlight: { text: '', done: false },
          microCommitment: { text: '', done: false },
          updatedAt: new Date().toISOString(),
        };
        const isDone = done !== undefined ? done : existing.microCommitment.done;
        return {
          ...prev,
          [date]: {
            ...existing,
            microCommitment: {
              text,
              done: isDone,
              habitId: habitId !== undefined ? habitId : existing.microCommitment.habitId,
              completedAt: isDone ? existing.microCommitment.completedAt || new Date().toISOString() : undefined,
            },
            updatedAt: new Date().toISOString(),
          },
        };
      });
    },
    []
  );

  const toggleMicroCommitmentDone = useCallback((date: string) => {
    setDailyRecords((prev) => {
      const existing = prev[date] || {
        id: `record-${date}`,
        date,
        brainDump: '',
        dailyHighlight: { text: '', done: false },
        microCommitment: { text: '', done: false },
        updatedAt: new Date().toISOString(),
      };
      const nextDone = !existing.microCommitment.done;

      // If tied to habit, update streak if completed today
      if (existing.microCommitment.habitId && nextDone) {
        setHabits((prevHabits) =>
          prevHabits.map((h) => {
            if (h.id === existing.microCommitment.habitId) {
              const newStreak = h.currentStreak + 1;
              return {
                ...h,
                currentStreak: newStreak,
                bestStreak: Math.max(h.bestStreak, newStreak),
                lastCompletedDate: date,
              };
            }
            return h;
          })
        );
      }

      return {
        ...prev,
        [date]: {
          ...existing,
          microCommitment: {
            ...existing.microCommitment,
            done: nextDone,
            completedAt: nextDone ? new Date().toISOString() : undefined,
          },
          updatedAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  const promoteBrainDumpLine = useCallback(
    (lineText: string, bucket: BucketType) => {
      const cleanText = lineText.replace(/^[-*•\d.)\]\s]+/, '').trim();
      if (!cleanText) return;
      const newTask: Task = {
        id: `task-${Date.now()}`,
        name: cleanText,
        bucket,
        status: 'not_started',
        priority: bucket === 'must' ? 'high' : bucket === 'should' ? 'medium' : 'low',
        dueDate: getTodayDateString(),
        createdAt: getTodayDateString(),
      };
      setTasks((prev) => [newTask, ...prev]);
    },
    []
  );

  // Task actions
  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: getTodayDateString(),
    };
    setTasks((prev) => [newTask, ...prev]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, ...updates };
          if (updates.status === 'done' && !t.completedAt) {
            updated.completedAt = new Date().toISOString();
          } else if (updates.status && updates.status !== 'done') {
            updated.completedAt = undefined;
          }
          return updated;
        }
        return t;
      })
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const setTaskStatus = useCallback((id: string, status: TaskStatus) => {
    updateTask(id, { status });
  }, [updateTask]);

  const reorderTasks = useCallback((newTasks: Task[]) => {
    setTasks(newTasks);
  }, []);

  const moveTaskToBucket = useCallback(
    (taskId: string, targetBucket: BucketType, targetIndex?: number) => {
      setTasks((prev) => {
        const task = prev.find((t) => t.id === taskId);
        if (!task) return prev;

        const updatedTask: Task = { ...task, bucket: targetBucket };
        const remaining = prev.filter((t) => t.id !== taskId);

        if (targetIndex !== undefined) {
          const bucketItems = remaining.filter((t) => t.bucket === targetBucket);
          if (targetIndex >= bucketItems.length) {
            const lastItem = bucketItems[bucketItems.length - 1];
            if (lastItem) {
              const idx = remaining.findIndex((t) => t.id === lastItem.id);
              remaining.splice(idx + 1, 0, updatedTask);
              return remaining;
            }
          } else if (targetIndex >= 0 && bucketItems.length > 0) {
            const targetItem = bucketItems[targetIndex];
            if (targetItem) {
              const idx = remaining.findIndex((t) => t.id === targetItem.id);
              remaining.splice(idx, 0, updatedTask);
              return remaining;
            }
          }
        }

        // Insert at beginning of that bucket, or beginning of list
        const firstBucketIdx = remaining.findIndex((t) => t.bucket === targetBucket);
        if (firstBucketIdx !== -1) {
          remaining.splice(firstBucketIdx, 0, updatedTask);
        } else {
          remaining.unshift(updatedTask);
        }
        return remaining;
      });
    },
    []
  );

  const moveTaskInBucket = useCallback(
    (sourceId: string, targetId: string, position: 'before' | 'after' = 'before') => {
      if (sourceId === targetId) return;
      setTasks((prev) => {
        const sourceIndex = prev.findIndex((t) => t.id === sourceId);
        const targetIndex = prev.findIndex((t) => t.id === targetId);
        if (sourceIndex === -1 || targetIndex === -1) return prev;

        const sourceTask = prev[sourceIndex];
        const targetTask = prev[targetIndex];

        // Adopt target task's bucket if moved across buckets
        const updatedSourceTask: Task = {
          ...sourceTask,
          bucket: targetTask.bucket,
        };

        const next = [...prev];
        next.splice(sourceIndex, 1);

        const newTargetIndex = next.findIndex((t) => t.id === targetId);
        if (newTargetIndex === -1) return prev;

        const insertIndex = position === 'after' ? newTargetIndex + 1 : newTargetIndex;
        next.splice(insertIndex, 0, updatedSourceTask);
        return next;
      });
    },
    []
  );

  // Sprint actions ("Not Time Prison")
  const startSprint = useCallback(
    (params: {
      taskId?: string;
      taskName?: string;
      bucket?: BucketType;
      projectId?: string;
      plannedDurationSec?: number;
    }) => {
      let resolvedTaskName = params.taskName;
      let resolvedBucket = params.bucket;
      let resolvedProjectId = params.projectId;

      if (params.taskId) {
        const found = tasks.find((t) => t.id === params.taskId);
        if (found) {
          resolvedTaskName = resolvedTaskName || found.name;
          resolvedBucket = resolvedBucket || found.bucket;
          resolvedProjectId = resolvedProjectId || found.projectId;
          // Set task to in_progress if not started
          if (found.status === 'not_started') {
            updateTask(found.id, { status: 'in_progress' });
          }
        }
      }

      const newActive: ActiveSprintState = {
        isRunning: true,
        isPaused: false,
        taskId: params.taskId,
        taskName: resolvedTaskName || 'Focused Session',
        bucket: resolvedBucket || 'must',
        projectId: resolvedProjectId,
        startTimestamp: Date.now(),
        accumulatedSec: 0,
        plannedDurationSec: params.plannedDurationSec || 1500, // 25 min default
      };

      setActiveSprint(newActive);
      setActiveSprintElapsedSec(0);
    },
    [tasks, updateTask]
  );

  const pauseSprint = useCallback(() => {
    if (!activeSprint || activeSprint.isPaused) return;
    const now = Date.now();
    const additionalSec = Math.max(0, Math.floor((now - activeSprint.startTimestamp) / 1000));
    setActiveSprint({
      ...activeSprint,
      isPaused: true,
      accumulatedSec: activeSprint.accumulatedSec + additionalSec,
    });
  }, [activeSprint]);

  const resumeSprint = useCallback(() => {
    if (!activeSprint || !activeSprint.isPaused) return;
    setActiveSprint({
      ...activeSprint,
      isPaused: false,
      startTimestamp: Date.now(),
    });
  }, [activeSprint]);

  const extendSprint = useCallback(
    (extraSec: number) => {
      if (!activeSprint) return;
      setActiveSprint((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          plannedDurationSec: prev.plannedDurationSec + extraSec,
        };
      });
    },
    [activeSprint]
  );

  const addSprintCreativeEntry = useCallback(
    (entry: { content: string; type?: CreativeLogType }) => {
      if (!activeSprint || !entry.content.trim()) return;
      const now = Date.now();
      let currentElapsed = activeSprint.accumulatedSec;
      if (!activeSprint.isPaused) {
        currentElapsed += Math.max(0, Math.floor((now - activeSprint.startTimestamp) / 1000));
      }
      const newEntry: CreativeLogEntry = {
        id: `cl-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        content: entry.content.trim(),
        type: entry.type || 'insight',
        timestampSec: currentElapsed,
        createdAt: new Date().toISOString(),
      };
      setActiveSprint((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          creativeLog: [...(prev.creativeLog || []), newEntry],
        };
      });
    },
    [activeSprint]
  );

  const removeSprintCreativeEntry = useCallback((entryId: string) => {
    setActiveSprint((prev) => {
      if (!prev || !prev.creativeLog) return prev;
      return {
        ...prev,
        creativeLog: prev.creativeLog.filter((item) => item.id !== entryId),
      };
    });
  }, []);

  const endSprint = useCallback(
    (
      focusQuality?: FocusQuality,
      notes?: string,
      markTaskDone?: boolean,
      creativeLog?: CreativeLogEntry[],
      creativeTakeaway?: string
    ) => {
      if (!activeSprint) return;

      const now = Date.now();
      let totalActualSec = activeSprint.accumulatedSec;
      if (!activeSprint.isPaused) {
        totalActualSec += Math.max(0, Math.floor((now - activeSprint.startTimestamp) / 1000));
      }

      // If duration is at least 10 seconds, log it as a valid session
      if (totalActualSec >= 10) {
        const endedEarly = totalActualSec < activeSprint.plannedDurationSec * 0.9;
        const finalCreativeLog = creativeLog !== undefined ? creativeLog : (activeSprint.creativeLog || []);
        const newSprint: SprintSession = {
          id: `sprint-${Date.now()}`,
          taskId: activeSprint.taskId,
          taskName: activeSprint.taskName,
          bucket: activeSprint.bucket,
          projectId: activeSprint.projectId,
          startTime: new Date(now - totalActualSec * 1000).toISOString(),
          endTime: new Date(now).toISOString(),
          plannedDurationSec: activeSprint.plannedDurationSec,
          actualDurationSec: totalActualSec,
          focusQuality: focusQuality || 'locked_in',
          endedEarly,
          notes: notes ? notes.trim() : undefined,
          creativeTakeaway: creativeTakeaway ? creativeTakeaway.trim() : undefined,
          creativeLog: finalCreativeLog.length > 0 ? finalCreativeLog : undefined,
        };

        setSprints((prev) => [newSprint, ...prev]);

        // If user chose to mark task done
        if (markTaskDone && activeSprint.taskId) {
          updateTask(activeSprint.taskId, { status: 'done' });
        }
      }

      setActiveSprint(null);
      setActiveSprintElapsedSec(0);
    },
    [activeSprint, updateTask]
  );

  const cancelSprint = useCallback(() => {
    setActiveSprint(null);
    setActiveSprintElapsedSec(0);
  }, []);

  const deleteSprint = useCallback((id: string) => {
    setSprints((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const updateSprint = useCallback((id: string, updates: Partial<SprintSession>) => {
    setSprints((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  }, []);

  const logCompletedSprintManually = useCallback((sprintData: Omit<SprintSession, 'id'>) => {
    const newSprint: SprintSession = {
      ...sprintData,
      id: `sprint-${Date.now()}`,
    };
    setSprints((prev) => [newSprint, ...prev]);
  }, []);

  // Project actions & auto-computed stats
  const addProject = useCallback((projectData: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject: Project = {
      ...projectData,
      id: `proj-${Date.now()}`,
      createdAt: getTodayDateString(),
    };
    setProjects((prev) => [...prev, newProject]);
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    // Detach project from tasks
    setTasks((prev) => prev.map((t) => (t.projectId === id ? { ...t, projectId: undefined } : t)));
  }, []);

  const getProjectStats = useCallback(
    (projectId: string) => {
      const projectTasks = tasks.filter((t) => t.projectId === projectId);
      const totalTasks = projectTasks.length;
      const completedTasks = projectTasks.filter((t) => t.status === 'done').length;
      const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Calculate time from linked sprints
      const projectTaskIds = new Set(projectTasks.map((t) => t.id));
      const projectSprints = sprints.filter(
        (s) => s.projectId === projectId || (s.taskId && projectTaskIds.has(s.taskId))
      );

      const totalTimeSec = projectSprints.reduce((acc, s) => acc + (s.actualDurationSec || 0), 0);

      const hours = Math.floor(totalTimeSec / 3600);
      const minutes = Math.floor((totalTimeSec % 3600) / 60);
      const timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

      const statusLine = `${completedTasks} of ${totalTasks} tasks done · ${timeStr} logged in sprints`;

      return {
        totalTasks,
        completedTasks,
        progressPercent,
        totalTimeSec,
        statusLine,
      };
    },
    [tasks, sprints]
  );

  // Habit actions
  const addHabit = useCallback((name: string) => {
    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      name: name.trim(),
      currentStreak: 0,
      bestStreak: 0,
      createdAt: getTodayDateString(),
    };
    setHabits((prev) => [...prev, newHabit]);
    return newHabit;
  }, []);

  const toggleHabitToday = useCallback((habitId: string) => {
    const today = getTodayDateString();
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          const isDoneToday = h.lastCompletedDate === today;
          if (isDoneToday) {
            // Uncheck
            const decStreak = Math.max(0, h.currentStreak - 1);
            return {
              ...h,
              currentStreak: decStreak,
              lastCompletedDate: undefined,
            };
          } else {
            // Check
            const incStreak = h.currentStreak + 1;
            return {
              ...h,
              currentStreak: incStreak,
              bestStreak: Math.max(h.bestStreak, incStreak),
              lastCompletedDate: today,
            };
          }
        }
        return h;
      })
    );
  }, []);

  // Settings
  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const dismissHint = useCallback((key: string) => {
    setSettings((prev) => ({
      ...prev,
      dismissedHints: { ...prev.dismissedHints, [key]: true },
    }));
  }, []);

  const exportData = useCallback(() => {
    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      dailyRecords,
      tasks,
      sprints,
      projects,
      habits,
      settings,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `burgusbroos-backup-${getTodayDateString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [dailyRecords, tasks, sprints, projects, habits, settings]);

  const importData = useCallback((jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.dailyRecords && parsed.tasks) {
        setDailyRecords(parsed.dailyRecords);
        setTasks(parsed.tasks);
        setSprints(parsed.sprints || []);
        setProjects(parsed.projects || []);
        setHabits(parsed.habits || []);
        if (parsed.settings) setSettings(parsed.settings);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }, []);

  const resetToDefaults = useCallback(() => {
    const seed = getDefaultSeedData();
    setDailyRecords(seed.dailyRecords);
    setTasks(seed.tasks);
    setSprints(seed.sprints);
    setProjects(seed.projects);
    setHabits(seed.habits);
    setSettings(seed.settings);
    setActiveSprint(null);
    localStorage.removeItem(ACTIVE_SPRINT_KEY);
  }, []);

  return (
    <AppContext.Provider
      value={{
        mode,
        setMode,
        selectedDate,
        setSelectedDate,
        dailyRecords,
        currentRecord,
        updateBrainDump,
        updateDailyHighlight,
        toggleDailyHighlightDone,
        updateMicroCommitment,
        toggleMicroCommitmentDone,
        promoteBrainDumpLine,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        setTaskStatus,
        reorderTasks,
        moveTaskInBucket,
        moveTaskToBucket,
        activeSprint,
        activeSprintElapsedSec,
        startSprint,
        pauseSprint,
        resumeSprint,
        extendSprint,
        addSprintCreativeEntry,
        removeSprintCreativeEntry,
        endSprint,
        cancelSprint,
        sprints,
        deleteSprint,
        updateSprint,
        logCompletedSprintManually,
        projects,
        addProject,
        updateProject,
        deleteProject,
        getProjectStats,
        habits,
        addHabit,
        toggleHabitToday,
        settings,
        updateSettings,
        dismissHint,
        exportData,
        importData,
        resetToDefaults,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
