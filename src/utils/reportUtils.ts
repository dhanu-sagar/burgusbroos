import { DailyRecord, Task, SprintSession, BucketType } from '../types';
import { WeekRange, formatDurationHuman } from './dateUtils';

export interface FocusScoreData {
  score: number; // 0 to 100
  taskScore: number; // 0 to 50
  sprintScore: number; // 0 to 50
  completedTasksCount: number;
  targetTasks: number; // 8 tasks weekly benchmark
  sprintMinutes: number;
  targetSprintMinutes: number; // 150 mins (2.5 hrs) benchmark
  tier: 'deep_flow' | 'steady_cadence' | 'building_momentum' | 'gentle_start' | 'restful_slate';
  tierLabel: string;
  tierColor: string;
  description: string;
  prevScore: number;
  scoreChange: number;
}

export interface WeeklyReportSummary {
  weekRange: WeekRange;
  highlightsCompleted: number;
  highlightsTotal: number;
  highlightsRate: number; // 0 to 100
  microCommitmentsCompleted: number;
  microCommitmentsTotal: number;
  microCommitmentsRate: number; // 0 to 100

  // Prev week comparisons
  prevHighlightsRate: number;
  highlightsChange: number; // e.g. +14
  prevMicroRate: number;
  microChange: number;

  // Day by day maps for calendar view
  dayHighlights: Record<string, { text: string; done: boolean }>;
  dayMicros: Record<string, { text: string; done: boolean }>;

  // Time by bucket
  timeByBucketSec: Record<BucketType, number>;
  totalSprintTimeSec: number;
  bucketPercentages: Record<BucketType, number>;

  // Tasks completed vs total this week
  tasksByBucket: Record<BucketType, { completed: number; total: number }>;

  // Sprints logged count
  sprintCount: number;

  // Focus Score breakdown
  focusScore: FocusScoreData;

  // Gentle nudges
  nudges: Array<{
    id: string;
    type: 'positive' | 'gentle_observation' | 'encouraging';
    title: string;
    message: string;
  }>;
}

export function generateWeeklyReport(
  weekRange: WeekRange,
  prevWeekRange: WeekRange,
  dailyRecords: Record<string, DailyRecord>,
  tasks: Task[],
  sprints: SprintSession[]
): WeeklyReportSummary {
  // 1. Highlight & Micro stats for current week
  let highlightsCompleted = 0;
  let highlightsTotal = 0;
  let microCompleted = 0;
  let microTotal = 0;

  const dayHighlights: Record<string, { text: string; done: boolean }> = {};
  const dayMicros: Record<string, { text: string; done: boolean }> = {};

  weekRange.days.forEach((dayStr) => {
    const rec = dailyRecords[dayStr];
    if (rec) {
      if (rec.dailyHighlight && rec.dailyHighlight.text?.trim()) {
        highlightsTotal += 1;
        if (rec.dailyHighlight.done) highlightsCompleted += 1;
        dayHighlights[dayStr] = {
          text: rec.dailyHighlight.text,
          done: rec.dailyHighlight.done,
        };
      } else {
        dayHighlights[dayStr] = { text: '', done: false };
      }

      if (rec.microCommitment && rec.microCommitment.text?.trim()) {
        microTotal += 1;
        if (rec.microCommitment.done) microCompleted += 1;
        dayMicros[dayStr] = {
          text: rec.microCommitment.text,
          done: rec.microCommitment.done,
        };
      } else {
        dayMicros[dayStr] = { text: '', done: false };
      }
    } else {
      dayHighlights[dayStr] = { text: '', done: false };
      dayMicros[dayStr] = { text: '', done: false };
    }
  });

  const highlightsDenominator = Math.max(highlightsTotal, 7);
  const highlightsRate = Math.round((highlightsCompleted / highlightsDenominator) * 100);

  const microDenominator = Math.max(microTotal, 7);
  const microCommitmentsRate = Math.round((microCompleted / microDenominator) * 100);

  // 2. Previous week stats for comparison
  let prevHighlightsCompleted = 0;
  let prevMicroCompleted = 0;
  prevWeekRange.days.forEach((dayStr) => {
    const rec = dailyRecords[dayStr];
    if (rec?.dailyHighlight?.done) prevHighlightsCompleted += 1;
    if (rec?.microCommitment?.done) prevMicroCompleted += 1;
  });
  const prevHighlightsRate = Math.round((prevHighlightsCompleted / 7) * 100);
  const prevMicroRate = Math.round((prevMicroCompleted / 7) * 100);

  const highlightsChange = highlightsRate - prevHighlightsRate;
  const microChange = microCommitmentsRate - prevMicroRate;

  // 3. Sprint time by bucket for this week
  const weekStartTs = new Date(`${weekRange.start}T00:00:00`).getTime();
  const weekEndTs = new Date(`${weekRange.end}T23:59:59`).getTime();

  const weekSprints = sprints.filter((s) => {
    const sTime = new Date(s.startTime).getTime();
    return sTime >= weekStartTs && sTime <= weekEndTs;
  });

  const timeByBucketSec: Record<BucketType, number> = {
    must: 0,
    should: 0,
    could: 0,
  };

  weekSprints.forEach((s) => {
    const bucket = s.bucket || 'must';
    timeByBucketSec[bucket] = (timeByBucketSec[bucket] || 0) + (s.actualDurationSec || 0);
  });

  const totalSprintTimeSec =
    timeByBucketSec.must + timeByBucketSec.should + timeByBucketSec.could;

  const bucketPercentages: Record<BucketType, number> = {
    must: totalSprintTimeSec > 0 ? Math.round((timeByBucketSec.must / totalSprintTimeSec) * 100) : 0,
    should: totalSprintTimeSec > 0 ? Math.round((timeByBucketSec.should / totalSprintTimeSec) * 100) : 0,
    could: totalSprintTimeSec > 0 ? Math.round((timeByBucketSec.could / totalSprintTimeSec) * 100) : 0,
  };

  // 4. Tasks breakdown by bucket
  const tasksByBucket: Record<BucketType, { completed: number; total: number }> = {
    must: { completed: 0, total: 0 },
    should: { completed: 0, total: 0 },
    could: { completed: 0, total: 0 },
  };

  tasks.forEach((t) => {
    if (tasksByBucket[t.bucket]) {
      tasksByBucket[t.bucket].total += 1;
      if (t.status === 'done') {
        tasksByBucket[t.bucket].completed += 1;
      }
    }
  });

  // 5. Focus Score Calculation
  // Pillar A: Tasks Completed (0-50 pts, benchmark 8 tasks = 50 pts)
  const completedTasksThisWeek = tasks.filter((t) => {
    if (t.status !== 'done') return false;
    if (t.completedAt) {
      const cTs = new Date(t.completedAt).getTime();
      return cTs >= weekStartTs && cTs <= weekEndTs;
    }
    const crTs = new Date(t.createdAt).getTime();
    return crTs <= weekEndTs;
  });
  const completedTasksCount = completedTasksThisWeek.length;
  const targetTasks = 8;
  const taskScore = Math.min(50, Math.round((completedTasksCount / targetTasks) * 50));

  // Pillar B: Sprint Duration (0-50 pts, benchmark 150 mins [2.5 hrs] = 50 pts)
  const sprintMinutes = Math.round(totalSprintTimeSec / 60);
  const targetSprintMinutes = 150;
  const sprintScore = Math.min(50, Math.round((sprintMinutes / targetSprintMinutes) * 50));

  const totalFocusScore = Math.min(100, taskScore + sprintScore);

  // Previous week focus score calculation for delta comparison
  const prevWeekStartTs = new Date(`${prevWeekRange.start}T00:00:00`).getTime();
  const prevWeekEndTs = new Date(`${prevWeekRange.end}T23:59:59`).getTime();

  const prevWeekSprints = sprints.filter((s) => {
    const sTime = new Date(s.startTime).getTime();
    return sTime >= prevWeekStartTs && sTime <= prevWeekEndTs;
  });
  const prevTotalSprintTimeSec = prevWeekSprints.reduce((acc, s) => acc + (s.actualDurationSec || 0), 0);
  const prevSprintMinutes = Math.round(prevTotalSprintTimeSec / 60);
  const prevSprintScore = Math.min(50, Math.round((prevSprintMinutes / targetSprintMinutes) * 50));

  const prevCompletedTasks = tasks.filter((t) => {
    if (t.status !== 'done') return false;
    if (t.completedAt) {
      const cTs = new Date(t.completedAt).getTime();
      return cTs >= prevWeekStartTs && cTs <= prevWeekEndTs;
    }
    return false;
  });
  const prevTaskScore = Math.min(50, Math.round((prevCompletedTasks.length / targetTasks) * 50));
  const prevFocusScore = Math.min(100, prevTaskScore + prevSprintScore);
  const scoreChange = totalFocusScore - prevFocusScore;

  // Determine tier and encouraging narrative
  let tier: FocusScoreData['tier'] = 'restful_slate';
  let tierLabel = 'Fresh Slate';
  let tierColor = 'neutral';
  let description = 'A quiet rest-focused week. Dive into your next sprint whenever you feel ready.';

  if (totalFocusScore >= 80) {
    tier = 'deep_flow';
    tierLabel = 'Deep Flow';
    tierColor = 'emerald';
    description = 'Outstanding synthesis of deep sprint immersion and tangible task throughput.';
  } else if (totalFocusScore >= 55) {
    tier = 'steady_cadence';
    tierLabel = 'Steady Cadence';
    tierColor = 'neutral';
    description = 'Well-calibrated focus rhythm balancing deliberate sprint blocks and steady task wins.';
  } else if (totalFocusScore >= 30) {
    tier = 'building_momentum';
    tierLabel = 'Building Momentum';
    tierColor = 'amber';
    description = 'Solid, meaningful steps forward. Each focus sprint compounds toward larger clarity.';
  } else if (totalFocusScore > 0) {
    tier = 'gentle_start';
    tierLabel = 'Gentle Start';
    tierColor = 'sky';
    description = 'Warm early rhythm — plenty of open space to immerse into single-task sprints.';
  }

  const focusScore: FocusScoreData = {
    score: totalFocusScore,
    taskScore,
    sprintScore,
    completedTasksCount,
    targetTasks,
    sprintMinutes,
    targetSprintMinutes,
    tier,
    tierLabel,
    tierColor,
    description,
    prevScore: prevFocusScore,
    scoreChange,
  };

  // 6. Generate friendly, non-judgmental rule-based nudges
  const nudges: WeeklyReportSummary['nudges'] = [];

  if (focusScore.score >= 80) {
    nudges.push({
      id: 'high-focus-score',
      type: 'positive',
      title: 'High Focus Caliber',
      message: `Your Focus Score reached ${focusScore.score}/100 this week with ${formatDurationHuman(totalSprintTimeSec)} in sprints and ${completedTasksCount} completed tasks. High-leverage execution in flow.`,
    });
  }

  // Nudge 1: Daily highlight reflection
  if (highlightsCompleted >= 5) {
    nudges.push({
      id: 'high-highlights',
      type: 'positive',
      title: 'Strong focus on what mattered',
      message: `You completed ${highlightsCompleted} of 7 Daily Highlights this week. Nailing the single most fulfilling anchor transforms how the week feels.`,
    });
  } else if (highlightsCompleted > 0) {
    nudges.push({
      id: 'moderate-highlights',
      type: 'encouraging',
      title: 'Solid anchors logged',
      message: `${highlightsCompleted} meaningful daily highlight${highlightsCompleted > 1 ? 's' : ''} locked in this week. Even 1 or 2 clear highlights create steady momentum.`,
    });
  } else {
    nudges.push({
      id: 'fresh-start',
      type: 'encouraging',
      title: 'Fresh page ahead',
      message: `No worries if this week was unpredictable or low-energy. Picking just one highlight tomorrow is always enough to restart.`,
    });
  }

  // Nudge 2: Time tracking reality check (Urgent vs Meaningful)
  if (totalSprintTimeSec > 0) {
    if (bucketPercentages.must >= 70 && bucketPercentages.should < 20) {
      nudges.push({
        id: 'must-dominant',
        type: 'gentle_observation',
        title: 'Heads up on urgent vs. meaningful time',
        message: `${bucketPercentages.must}% of your focus time went toward urgent "Must Do" tasks. Consider carving out one 25-minute sprint for a nourishing "Should Do" activity next week.`,
      });
    } else if (bucketPercentages.should >= 35) {
      nudges.push({
        id: 'balanced-growth',
        type: 'positive',
        title: 'Protected time for meaningful growth',
        message: `You spent ${bucketPercentages.should}% (${formatDurationHuman(timeByBucketSec.should)}) of your focus time in the "Should Do" bucket. That builds long-term satisfaction.`,
      });
    } else {
      nudges.push({
        id: 'time-logged',
        type: 'positive',
        title: 'Focus time registered',
        message: `Logged ${formatDurationHuman(totalSprintTimeSec)} across ${weekSprints.length} flexible sprint block${weekSprints.length === 1 ? '' : 's'} without rigid time boxing.`,
      });
    }
  }

  // Nudge 3: Micro commitments
  if (microCompleted >= 5) {
    nudges.push({
      id: 'micro-consistent',
      type: 'positive',
      title: 'Tiny compounding habits working',
      message: `Completed ${microCompleted} micro-commitments this week. 2-minute steps quietly compound into effortless habits over time.`,
    });
  }

  return {
    weekRange,
    highlightsCompleted,
    highlightsTotal: 7,
    highlightsRate,
    microCommitmentsCompleted: microCompleted,
    microCommitmentsTotal: 7,
    microCommitmentsRate,
    prevHighlightsRate,
    highlightsChange,
    prevMicroRate,
    microChange,
    dayHighlights,
    dayMicros,
    timeByBucketSec,
    totalSprintTimeSec,
    bucketPercentages,
    tasksByBucket,
    sprintCount: weekSprints.length,
    focusScore,
    nudges,
  };
}
