export type BucketType = 'must' | 'should' | 'could';

export type TaskStatus = 'not_started' | 'in_progress' | 'done' | 'skipped';

export type TaskPriority = 'high' | 'medium' | 'low';

export type FocusQuality = 'locked_in' | 'distracted' | 'rough';

export interface DailyHighlight {
  text: string;
  done: boolean;
  completedAt?: string;
}

export interface MicroCommitment {
  text: string;
  done: boolean;
  habitId?: string;
  completedAt?: string;
}

export interface DailyRecord {
  id: string;
  date: string; // YYYY-MM-DD
  brainDump: string;
  dailyHighlight: DailyHighlight;
  microCommitment: MicroCommitment;
  updatedAt: string;
}

export interface Task {
  id: string;
  name: string;
  bucket: BucketType;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string; // YYYY-MM-DD
  projectId?: string;
  notes?: string;
  estimatedMinutes?: number;
  order?: number;
  createdAt: string;
  completedAt?: string;
}

export type CreativeLogType = 'insight' | 'idea' | 'breakthrough' | 'note';

export interface CreativeLogEntry {
  id: string;
  content: string;
  type: CreativeLogType;
  timestampSec: number; // elapsed seconds into sprint when recorded
  createdAt: string; // ISO date string
}

export interface SprintSession {
  id: string;
  taskId?: string;
  taskName?: string;
  bucket?: BucketType;
  projectId?: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  plannedDurationSec: number;
  actualDurationSec: number;
  focusQuality?: FocusQuality;
  endedEarly: boolean;
  notes?: string;
  creativeTakeaway?: string;
  creativeLog?: CreativeLogEntry[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  targetDate?: string; // YYYY-MM-DD
  createdAt: string;
}

export interface Habit {
  id: string;
  name: string;
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate?: string; // YYYY-MM-DD
  createdAt: string;
}

export interface UserSettings {
  mode: 'simple' | 'advanced';
  weekStartDay: 'monday' | 'sunday';
  gentleNudgesEnabled: boolean;
  soundEnabled: boolean;
  dismissedHints: Record<string, boolean>;
}

export interface ActiveSprintState {
  isRunning: boolean;
  isPaused: boolean;
  taskId?: string;
  taskName?: string;
  bucket?: BucketType;
  projectId?: string;
  startTimestamp: number; // Date.now() when active block began
  accumulatedSec: number; // accumulated seconds before current running block
  plannedDurationSec: number;
  creativeLog?: CreativeLogEntry[];
}
