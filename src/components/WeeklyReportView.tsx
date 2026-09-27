import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import {
  getTodayDateString,
  getOffsetDateString,
  getWeekRange,
  formatDurationHuman,
} from '../utils/dateUtils';
import { generateWeeklyReport } from '../utils/reportUtils';
import { FocusProgressRing } from './FocusProgressRing';
import { motion } from 'framer-motion';

export const WeeklyReportView: React.FC = () => {
  const { dailyRecords, tasks, sprints, settings } = useApp();

  const today = getTodayDateString();
  const [currentDatePivot, setCurrentDatePivot] = useState<string>(today);

  const weekRange = useMemo(
    () => getWeekRange(currentDatePivot, settings.weekStartDay),
    [currentDatePivot, settings.weekStartDay]
  );

  const prevWeekRange = useMemo(() => {
    const prevDate = getOffsetDateString(weekRange.start, -7);
    return getWeekRange(prevDate, settings.weekStartDay);
  }, [weekRange.start, settings.weekStartDay]);

  const report = useMemo(
    () => generateWeeklyReport(weekRange, prevWeekRange, dailyRecords, tasks, sprints),
    [weekRange, prevWeekRange, dailyRecords, tasks, sprints]
  );

  const isCurrentWeek = weekRange.days.includes(today);

  return (
    <div className="space-y-7 max-w-3xl mx-auto py-2">
      {/* Week Navigator */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider font-mono">
              Reality Analytics
            </span>
            {isCurrentWeek && (
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Current Week
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-neutral-900">
            Weekly Report
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-normal leading-relaxed">
            Reflecting on reality without guilt. Notice your patterns kindly and calibrate effortlessly.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-black/[0.08] shadow-xs self-start sm:self-auto">
          <button
            onClick={() => setCurrentDatePivot(getOffsetDateString(weekRange.start, -7))}
            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-all"
            title="Previous week"
            aria-label="Previous week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold font-mono tabular-nums text-neutral-900 px-3">
            {weekRange.label}
          </span>
          <button
            onClick={() => setCurrentDatePivot(getOffsetDateString(weekRange.start, 7))}
            disabled={isCurrentWeek}
            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-all disabled:opacity-20 disabled:pointer-events-none"
            title="Next week"
            aria-label="Next week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Friendly Rule-Based Observations */}
      {report.nudges.length > 0 && (
        <div className="space-y-3">
          {report.nudges.map((nudge) => (
            <div
              key={nudge.id}
              className={`p-5 rounded-3xl border transition-all ${
                nudge.type === 'positive'
                  ? 'bg-emerald-50/70 border-emerald-200/80 text-neutral-900'
                  : nudge.type === 'gentle_observation'
                  ? 'bg-amber-50/70 border-amber-200/80 text-neutral-900'
                  : 'bg-white border-neutral-200/80 text-neutral-900'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5">
                  <Sparkles
                    className={`w-4 h-4 ${
                      nudge.type === 'positive'
                        ? 'text-emerald-700'
                        : nudge.type === 'gentle_observation'
                        ? 'text-amber-600'
                        : 'text-neutral-500'
                    }`}
                  />
                </div>
                <div>
                  <h4 className="font-display text-sm font-bold text-neutral-900">
                    {nudge.title}
                  </h4>
                  <p className="text-xs mt-1 text-neutral-600 leading-relaxed font-normal">
                    {nudge.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Focus Score Hero Card with Minimal Progress Ring */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-3xl border border-black/[0.07] p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
      >
        <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
          {/* Minimalist Progress Ring */}
          <div className="flex flex-col items-center">
            <FocusProgressRing score={report.focusScore.score} size={140} strokeWidth={9} />
            <div className="mt-3 flex items-center gap-1.5 bg-neutral-50 px-2.5 py-1 rounded-full border border-neutral-200/60">
              <span
                className={`w-2 h-2 rounded-full ${
                  report.focusScore.tier === 'deep_flow'
                    ? 'bg-emerald-500'
                    : report.focusScore.tier === 'steady_cadence'
                    ? 'bg-neutral-900'
                    : report.focusScore.tier === 'building_momentum'
                    ? 'bg-amber-500'
                    : 'bg-sky-500'
                }`}
              />
              <span className="font-display text-xs font-bold text-neutral-900">
                {report.focusScore.tierLabel}
              </span>
            </div>
          </div>

          {/* Details & Pillars */}
          <div className="flex-1 w-full space-y-4 text-center md:text-left">
            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider font-mono">
                    Weekly Focus Caliber
                  </span>
                  <span className="text-[10px] font-semibold bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-md border border-neutral-200/60 font-mono">
                    Tasks + Sprints
                  </span>
                </div>

                {/* Week-over-week change */}
                <div className="flex items-center gap-1 text-xs font-mono tabular-nums font-semibold">
                  {report.focusScore.scoreChange > 0 ? (
                    <span className="text-emerald-700 flex items-center gap-0.5">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      +{report.focusScore.scoreChange}%
                    </span>
                  ) : report.focusScore.scoreChange < 0 ? (
                    <span className="text-neutral-500 flex items-center gap-0.5">
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      {report.focusScore.scoreChange}%
                    </span>
                  ) : (
                    <span className="text-neutral-500">Steady</span>
                  )}
                  <span className="text-[11px] text-neutral-400 font-normal">vs prev week</span>
                </div>
              </div>

              <h3 className="font-display text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">
                Focus Score: {report.focusScore.score}/100
              </h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed max-w-xl">
                {report.focusScore.description}
              </p>
            </div>

            {/* Two Pillars: Tasks and Sprints */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Completed Tasks Pillar */}
              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/60 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-display font-bold text-neutral-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-neutral-700" />
                    Completed Tasks
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-neutral-900">
                    +{report.focusScore.taskScore} <span className="text-neutral-400 font-normal">/ 50 pts</span>
                  </span>
                </div>
                <div className="text-[11px] text-neutral-500 font-mono flex items-center justify-between mb-2">
                  <span>{report.focusScore.completedTasksCount} task{report.focusScore.completedTasksCount === 1 ? '' : 's'} done</span>
                  <span>Target: {report.focusScore.targetTasks}</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-200/70 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neutral-900 rounded-full transition-all"
                    style={{ width: `${(report.focusScore.taskScore / 50) * 100}%` }}
                  />
                </div>
              </div>

              {/* Sprint Durations Pillar */}
              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/60 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-display font-bold text-neutral-800 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-neutral-700" />
                    Sprint Durations
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-neutral-900">
                    +{report.focusScore.sprintScore} <span className="text-neutral-400 font-normal">/ 50 pts</span>
                  </span>
                </div>
                <div className="text-[11px] text-neutral-500 font-mono flex items-center justify-between mb-2">
                  <span>{formatDurationHuman(report.totalSprintTimeSec)} logged</span>
                  <span>Target: 2.5h</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-200/70 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neutral-900 rounded-full transition-all"
                    style={{ width: `${(report.focusScore.sprintScore / 50) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Headline Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Daily Highlights Rate */}
        <div className="bg-white rounded-3xl border border-black/[0.07] p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5">
            <span className="font-display font-bold text-neutral-900">Daily Highlights Rate</span>
            <span className="font-mono text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
              Anchors
            </span>
          </div>

          <div className="flex items-baseline gap-3 my-2">
            <span className="text-4xl font-light font-mono tabular-nums text-neutral-900">
              {report.highlightsCompleted}/{report.highlightsTotal}
            </span>
            <span className="text-xs font-mono font-semibold tabular-nums text-neutral-500">
              ({report.highlightsRate}%)
            </span>
          </div>

          <div className="mt-4 pt-3.5 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span>Prior Week: <strong className="font-mono tabular-nums text-neutral-800">{report.prevHighlightsRate}%</strong></span>
            <div className="flex items-center gap-1 font-mono tabular-nums font-semibold">
              {report.highlightsChange >= 0 ? (
                <span className="text-emerald-700 flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  +{report.highlightsChange}%
                </span>
              ) : (
                <span className="text-neutral-500 flex items-center">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  {report.highlightsChange}%
                </span>
              )}
              <span className="text-[11px] text-neutral-400 font-normal">vs prev</span>
            </div>
          </div>
        </div>

        {/* Micro-Commitments Rate */}
        <div className="bg-white rounded-3xl border border-black/[0.07] p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5">
            <span className="font-display font-bold text-neutral-900">Micro-Commitments Rate</span>
            <span className="font-mono text-[11px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
              2-Min Habits
            </span>
          </div>

          <div className="flex items-baseline gap-3 my-2">
            <span className="text-4xl font-light font-mono tabular-nums text-neutral-900">
              {report.microCommitmentsCompleted}/{report.microCommitmentsTotal}
            </span>
            <span className="text-xs font-mono font-semibold tabular-nums text-neutral-500">
              ({report.microCommitmentsRate}%)
            </span>
          </div>

          <div className="mt-4 pt-3.5 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span>Prior Week: <strong className="font-mono tabular-nums text-neutral-800">{report.prevMicroRate}%</strong></span>
            <div className="flex items-center gap-1 font-mono tabular-nums font-semibold">
              {report.microChange >= 0 ? (
                <span className="text-emerald-700 flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  +{report.microChange}%
                </span>
              ) : (
                <span className="text-neutral-500 flex items-center">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  {report.microChange}%
                </span>
              )}
              <span className="text-[11px] text-neutral-400 font-normal">vs prev</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mini-Calendar Grids */}
      <div className="bg-white rounded-3xl border border-black/[0.07] p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <div>
          <h3 className="font-display text-base font-bold text-neutral-900 tracking-tight">
            Daily Practice Map
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Notice patterns without shame — empty days are neutral rest days, never broken chains.
          </p>
        </div>

        <div className="grid grid-cols-7 gap-2.5 text-center">
          {report.weekRange.days.map((dayStr) => {
            const dateObj = new Date(`${dayStr}T00:00:00`);
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum = dateObj.getDate();
            const isToday = dayStr === today;

            const hl = report.dayHighlights[dayStr];
            const mc = report.dayMicros[dayStr];

            const hlDone = hl?.done;
            const mcDone = mc?.done;

            return (
              <div
                key={dayStr}
                className={`p-3 rounded-2xl border transition-all ${
                  isToday
                    ? 'border-neutral-900/30 bg-neutral-50 ring-1 ring-neutral-900/10'
                    : 'border-neutral-100 bg-neutral-50/50'
                }`}
              >
                <div className="text-[11px] font-semibold text-neutral-500">
                  {dayName}
                </div>
                <div className="text-sm font-mono tabular-nums font-bold text-neutral-900 mt-0.5">
                  {dayNum}
                </div>

                <div className="mt-2.5 space-y-1">
                  <div
                    title={hl?.text ? `Highlight: ${hl.text}` : 'No highlight set'}
                    className={`h-2 rounded-full transition-colors ${
                      hlDone ? 'bg-amber-500 shadow-xs' : hl?.text ? 'bg-amber-500/25' : 'bg-neutral-200/50'
                    }`}
                  />
                  <div
                    title={mc?.text ? `Micro: ${mc.text}` : 'No micro set'}
                    className={`h-2 rounded-full transition-colors ${
                      mcDone ? 'bg-blue-500 shadow-xs' : mc?.text ? 'bg-blue-500/25' : 'bg-neutral-200/50'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-neutral-500 pt-2 border-t border-neutral-100">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Daily Highlight</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Micro-Commitment</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-200" />
            <span>Rest Day</span>
          </div>
        </div>
      </div>

      {/* Task & Sprint Breakdown by Urgency */}
      <div className="bg-white rounded-3xl border border-black/[0.07] p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5">
        <div>
          <h3 className="font-display text-base font-bold text-neutral-900 tracking-tight">
            Focus Time Distribution
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Reality-based urgency distribution across Must, Should, and Could Do blocks.
          </p>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-display text-sm font-bold text-neutral-900">
              Total Focus: <span className="font-mono tabular-nums text-base font-light text-neutral-950 ml-1">{formatDurationHuman(report.totalSprintTimeSec)}</span>
            </span>
            <span className="text-neutral-500 font-mono text-xs tabular-nums">
              {report.sprintCount} session{report.sprintCount === 1 ? '' : 's'}
            </span>
          </div>

          <div className="h-3 rounded-full bg-neutral-100 overflow-hidden flex p-0.5 border border-neutral-200/50">
            {report.totalSprintTimeSec > 0 ? (
              <>
                <div
                  style={{ width: `${report.bucketPercentages.must}%` }}
                  className="bg-neutral-900 rounded-l-full"
                  title={`Must Do: ${formatDurationHuman(report.timeByBucketSec.must)}`}
                />
                <div
                  style={{ width: `${report.bucketPercentages.should}%` }}
                  className="bg-amber-500"
                  title={`Should Do: ${formatDurationHuman(report.timeByBucketSec.should)}`}
                />
                <div
                  style={{ width: `${report.bucketPercentages.could}%` }}
                  className="bg-sky-500 rounded-r-full"
                  title={`Could Do: ${formatDurationHuman(report.timeByBucketSec.could)}`}
                />
              </>
            ) : (
              <div className="w-full bg-neutral-100 rounded-full" />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
          {/* Must Do */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/60">
            <div className="flex items-center gap-1.5 text-xs font-display font-bold text-neutral-900 mb-1">
              <span className="w-2 h-2 rounded-full bg-neutral-900" />
              <span>Must Do</span>
            </div>
            <div className="text-2xl font-light font-mono tabular-nums text-neutral-900">
              {formatDurationHuman(report.timeByBucketSec.must)}
            </div>
            <div className="text-[11px] text-neutral-500 mt-1 font-mono tabular-nums">
              {report.bucketPercentages.must}% of focus time
            </div>
            <div className="text-[11px] text-neutral-500 mt-2 pt-2 border-t border-neutral-200/60">
              Tasks: <strong className="font-mono text-neutral-900">{report.tasksByBucket.must.completed}</strong> completed
            </div>
          </div>

          {/* Should Do */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/60">
            <div className="flex items-center gap-1.5 text-xs font-display font-bold text-neutral-900 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Should Do</span>
            </div>
            <div className="text-2xl font-light font-mono tabular-nums text-neutral-900">
              {formatDurationHuman(report.timeByBucketSec.should)}
            </div>
            <div className="text-[11px] text-neutral-500 mt-1 font-mono tabular-nums">
              {report.bucketPercentages.should}% of focus time
            </div>
            <div className="text-[11px] text-neutral-500 mt-2 pt-2 border-t border-neutral-200/60">
              Tasks: <strong className="font-mono text-neutral-900">{report.tasksByBucket.should.completed}</strong> completed
            </div>
          </div>

          {/* Could Do */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/60">
            <div className="flex items-center gap-1.5 text-xs font-display font-bold text-neutral-900 mb-1">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span>Could Do</span>
            </div>
            <div className="text-2xl font-light font-mono tabular-nums text-neutral-900">
              {formatDurationHuman(report.timeByBucketSec.could)}
            </div>
            <div className="text-[11px] text-neutral-500 mt-1 font-mono tabular-nums">
              {report.bucketPercentages.could}% of focus time
            </div>
            <div className="text-[11px] text-neutral-500 mt-2 pt-2 border-t border-neutral-200/60">
              Tasks: <strong className="font-mono text-neutral-900">{report.tasksByBucket.could.completed}</strong> completed
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
