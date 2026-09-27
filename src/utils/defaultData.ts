import { DailyRecord, Task, SprintSession, Project, Habit, UserSettings } from '../types';
import { getTodayDateString, getOffsetDateString } from './dateUtils';

export function getDefaultSeedData() {
  const today = getTodayDateString();
  const yesterday = getOffsetDateString(today, -1);
  const twoDaysAgo = getOffsetDateString(today, -2);
  const threeDaysAgo = getOffsetDateString(today, -3);

  const defaultProjects: Project[] = [
    {
      id: 'proj-1',
      name: 'Q3 Product Redesign',
      description: 'Streamlining user workflows and decluttering dashboard views.',
      color: '#0284c7', // Sky
      targetDate: getOffsetDateString(today, 14),
      createdAt: threeDaysAgo,
    },
    {
      id: 'proj-2',
      name: 'Personal Wellbeing & Movement',
      description: 'Consistent gentle routines, stretching, and evening wind-down.',
      color: '#16a34a', // Emerald
      targetDate: getOffsetDateString(today, 30),
      createdAt: threeDaysAgo,
    },
  ];

  const defaultHabits: Habit[] = [
    {
      id: 'habit-1',
      name: '2-min morning neck & shoulder stretch',
      currentStreak: 4,
      bestStreak: 7,
      lastCompletedDate: yesterday,
      createdAt: threeDaysAgo,
    },
    {
      id: 'habit-2',
      name: 'Review finances & clear open receipts',
      currentStreak: 2,
      bestStreak: 5,
      lastCompletedDate: yesterday,
      createdAt: threeDaysAgo,
    },
  ];

  const defaultDailyRecords: Record<string, DailyRecord> = {
    [today]: {
      id: `record-${today}`,
      date: today,
      brainDump: `Lots on the mind this morning:\n- Need to finalize the quarterly review slide deck.\n- Send quick reply to Sarah regarding the roadmap.\n- Buy fresh coffee beans on the way home.\n- Read that article on low-friction habits.`,
      dailyHighlight: {
        text: 'Finalize the design proposal architecture outline',
        done: false,
      },
      microCommitment: {
        text: '2-min morning neck & shoulder stretch',
        done: false,
        habitId: 'habit-1',
      },
      updatedAt: new Date().toISOString(),
    },
    [yesterday]: {
      id: `record-${yesterday}`,
      date: yesterday,
      brainDump: `Feeling calmer today. Finished reading chapter 4. Let's make sure the client draft gets approved.`,
      dailyHighlight: {
        text: 'Review client feedback notes calmly without rushing',
        done: true,
        completedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      microCommitment: {
        text: '2-min morning neck & shoulder stretch',
        done: true,
        habitId: 'habit-1',
        completedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    [twoDaysAgo]: {
      id: `record-${twoDaysAgo}`,
      date: twoDaysAgo,
      brainDump: `Busy afternoon. Remember to drink water and take 5 minute breathing breaks.`,
      dailyHighlight: {
        text: 'Submit updated invoicing details to finance team',
        done: true,
        completedAt: new Date(Date.now() - 172800000).toISOString(),
      },
      microCommitment: {
        text: 'Review finances & clear open receipts',
        done: true,
        habitId: 'habit-2',
        completedAt: new Date(Date.now() - 172800000).toISOString(),
      },
      updatedAt: new Date(Date.now() - 172800000).toISOString(),
    },
    [threeDaysAgo]: {
      id: `record-${threeDaysAgo}`,
      date: threeDaysAgo,
      brainDump: `Starting fresh week. Keeping expectations reasonable. One small win at a time.`,
      dailyHighlight: {
        text: 'Map out the core sprint targets for the week',
        done: true,
        completedAt: new Date(Date.now() - 259200000).toISOString(),
      },
      microCommitment: {
        text: '2-min morning neck & shoulder stretch',
        done: true,
        habitId: 'habit-1',
        completedAt: new Date(Date.now() - 259200000).toISOString(),
      },
      updatedAt: new Date(Date.now() - 259200000).toISOString(),
    },
  };

  const defaultTasks: Task[] = [
    {
      id: 'task-1',
      name: 'Send quarterly review slide deck to leadership',
      bucket: 'must',
      status: 'in_progress',
      priority: 'high',
      dueDate: today,
      projectId: 'proj-1',
      notes: 'Review executive summary and check slide 6 metrics.',
      createdAt: yesterday,
    },
    {
      id: 'task-2',
      name: 'Pay quarterly cloud hosting invoice',
      bucket: 'must',
      status: 'done',
      priority: 'high',
      dueDate: yesterday,
      createdAt: threeDaysAgo,
      completedAt: yesterday,
    },
    {
      id: 'task-3',
      name: 'Draft thoughtful architecture proposal for Q4 feature set',
      bucket: 'should',
      status: 'not_started',
      priority: 'medium',
      dueDate: getOffsetDateString(today, 3),
      projectId: 'proj-1',
      notes: 'Brings long-term clarity to team, no rigid deadline today.',
      createdAt: yesterday,
    },
    {
      id: 'task-4',
      name: 'Listen to recorded mentor talk on sustainable engineering',
      bucket: 'should',
      status: 'done',
      priority: 'medium',
      projectId: 'proj-2',
      createdAt: threeDaysAgo,
      completedAt: twoDaysAgo,
    },
    {
      id: 'task-5',
      name: 'Explore new typography pairings & icon sets for personal portfolio',
      bucket: 'could',
      status: 'not_started',
      priority: 'low',
      notes: 'Fun creative exploration when bandwidth permits.',
      createdAt: yesterday,
    },
    {
      id: 'task-6',
      name: 'Organize digital desktop bookmarks & clean Downloads folder',
      bucket: 'could',
      status: 'skipped',
      priority: 'low',
      notes: 'Skipped for now to protect mental energy for high-impact work.',
      createdAt: threeDaysAgo,
    },
  ];

  const defaultSprints: SprintSession[] = [
    {
      id: 'sprint-1',
      taskId: 'task-1',
      taskName: 'Send quarterly review slide deck to leadership',
      bucket: 'must',
      projectId: 'proj-1',
      startTime: new Date(Date.now() - 7200000).toISOString(),
      endTime: new Date(Date.now() - 5400000).toISOString(),
      plannedDurationSec: 1500, // 25m
      actualDurationSec: 1800, // 30m (extended flow!)
      focusQuality: 'locked_in',
      endedEarly: false,
      notes: 'Great momentum, polished the first half of slides.',
      creativeTakeaway: 'Adopted Apple-style high-contrast metric callouts for slide 6.',
      creativeLog: [
        {
          id: 'cl-1',
          content: 'Split slide 4 into two uncluttered visual beats instead of cramped bullet list.',
          type: 'breakthrough',
          timestampSec: 420,
          createdAt: new Date(Date.now() - 6780000).toISOString(),
        },
        {
          id: 'cl-2',
          content: 'Need to sync with Sarah on Q4 roadmap assumptions before final send.',
          type: 'idea',
          timestampSec: 980,
          createdAt: new Date(Date.now() - 6220000).toISOString(),
        },
      ],
    },
    {
      id: 'sprint-2',
      taskId: 'task-4',
      taskName: 'Listen to recorded mentor talk on sustainable engineering',
      bucket: 'should',
      projectId: 'proj-2',
      startTime: new Date(Date.now() - 172800000).toISOString(),
      endTime: new Date(Date.now() - 170400000).toISOString(),
      plannedDurationSec: 3000, // 50m
      actualDurationSec: 2400, // 40m ended early guilt-free
      focusQuality: 'locked_in',
      endedEarly: true,
      notes: 'Took key notes, stopped early when core points were captured.',
      creativeTakeaway: 'The "floor principle" protects against burnout far better than arbitrary sprint deadlines.',
      creativeLog: [
        {
          id: 'cl-3',
          content: 'Sustainable pacing = honoring natural friction points rather than forcing rigid 60m blocks.',
          type: 'insight',
          timestampSec: 610,
          createdAt: new Date(Date.now() - 172190000).toISOString(),
        },
      ],
    },
    {
      id: 'sprint-3',
      taskId: 'task-2',
      taskName: 'Pay quarterly cloud hosting invoice',
      bucket: 'must',
      startTime: new Date(Date.now() - 86400000).toISOString(),
      endTime: new Date(Date.now() - 85200000).toISOString(),
      plannedDurationSec: 1500, // 25m
      actualDurationSec: 1200, // 20m
      focusQuality: 'locked_in',
      endedEarly: true,
      creativeTakeaway: 'Set auto-pay reminder so this never interrupts deep work again.',
      creativeLog: [
        {
          id: 'cl-4',
          content: 'Noticed redundant idle database tier costing $35/mo — tagged for cleanup.',
          type: 'insight',
          timestampSec: 350,
          createdAt: new Date(Date.now() - 86050000).toISOString(),
        },
      ],
    },
  ];

  const defaultSettings: UserSettings = {
    mode: 'simple', // Start in simple mode as requested by default
    weekStartDay: 'monday',
    gentleNudgesEnabled: true,
    soundEnabled: false,
    dismissedHints: {},
  };

  return {
    dailyRecords: defaultDailyRecords,
    tasks: defaultTasks,
    sprints: defaultSprints,
    projects: defaultProjects,
    habits: defaultHabits,
    settings: defaultSettings,
  };
}
