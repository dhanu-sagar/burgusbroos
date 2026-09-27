import React from 'react';
import { useApp } from '../context/AppContext';
import { TodayBurgusbroosCard } from './TodayBurgusbroosCard';
import {
  Play,
  Check,
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
  Zap,
  Target,
  Flame,
  CheckCircle2,
  GripVertical,
} from 'lucide-react';
import { Task, BucketType } from '../types';
import { formatDurationHuman, getTodayDateString } from '../utils/dateUtils';
import { useTaskDragAndDrop } from '../hooks/useTaskDragAndDrop';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardViewProps {
  onOpenTaskModal: (task?: Task | null, defaultBucket?: BucketType) => void;
  onLaunchSprint: (task?: Task) => void;
  onNavigateToTab: (tab: 'dashboard' | 'tasks' | 'sprint' | 'projects' | 'report') => void;
  onOpenHistory: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenTaskModal,
  onLaunchSprint,
  onNavigateToTab,
  onOpenHistory,
}) => {
  const { tasks, sprints, setTaskStatus } = useApp();
  const today = getTodayDateString();

  const {
    draggedTaskId,
    dragOverTaskId,
    dragOverPosition,
    dragOverBucket,
    handleDragStart,
    handleDragEnd,
    handleTaskDragOver,
    handleTaskDrop,
    handleBucketDragOver,
    handleBucketDrop,
  } = useTaskDragAndDrop();

  // Reality-based time tracking computation
  const todayStartTs = new Date(`${today}T00:00:00`).getTime();
  const todaySprints = sprints.filter((s) => new Date(s.startTime).getTime() >= todayStartTs);

  const timeByBucketSec: Record<BucketType, number> = {
    must: 0,
    should: 0,
    could: 0,
  };

  todaySprints.forEach((s) => {
    const bucket = s.bucket || 'must';
    timeByBucketSec[bucket] += s.actualDurationSec || 0;
  });

  const totalTodayFocusSec = timeByBucketSec.must + timeByBucketSec.should + timeByBucketSec.could;

  const mustTasks = tasks.filter((t) => t.bucket === 'must' && t.status !== 'done').slice(0, 4);
  const shouldTasks = tasks.filter((t) => t.bucket === 'should' && t.status !== 'done').slice(0, 4);
  const couldTasks = tasks.filter((t) => t.bucket === 'could' && t.status !== 'done').slice(0, 4);

  return (
    <div className="space-y-8">
      {/* 1. Today's Practices (Top Card) */}
      <TodayBurgusbroosCard onOpenHistory={onOpenHistory} />

      {/* 2. Middle Grid: Reality-Based Time Tracking + Quick Sprint Launch */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reality-Based Time Tracking */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-black/[0.07] p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
                <h3 className="font-display text-base font-bold text-neutral-900 tracking-tight">
                  Reality-Based Time Tracking
                </h3>
              </div>
              <span className="text-[11px] font-mono text-neutral-500 bg-neutral-100 px-2.5 py-0.5 rounded-md font-medium">
                Auto-Logged From Sprints
              </span>
            </div>
            <p className="text-xs text-neutral-500 mb-5 leading-relaxed font-normal">
              No manual timesheets or fake calendars. Sprints automatically record where your cognitive energy actually went.
            </p>

            {/* Time breakdown visual bar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-display text-sm font-bold text-neutral-900">
                  Focus Today: <span className="font-mono tabular-nums text-lg font-light text-neutral-950 ml-1.5">{formatDurationHuman(totalTodayFocusSec)}</span>
                </span>
                <span className="text-neutral-500 font-mono text-xs tabular-nums font-medium">
                  {todaySprints.length} completed session{todaySprints.length === 1 ? '' : 's'}
                </span>
              </div>

              {/* Multi-segment Apple-style bar */}
              <div className="h-3.5 rounded-full bg-neutral-100 overflow-hidden flex p-0.5 border border-neutral-200/50">
                {totalTodayFocusSec > 0 ? (
                  <>
                    <div
                      style={{ width: `${(timeByBucketSec.must / totalTodayFocusSec) * 100}%` }}
                      className="bg-neutral-900 rounded-l-full transition-all"
                      title={`Must Do: ${formatDurationHuman(timeByBucketSec.must)}`}
                    />
                    <div
                      style={{ width: `${(timeByBucketSec.should / totalTodayFocusSec) * 100}%` }}
                      className="bg-amber-500 transition-all"
                      title={`Should Do: ${formatDurationHuman(timeByBucketSec.should)}`}
                    />
                    <div
                      style={{ width: `${(timeByBucketSec.could / totalTodayFocusSec) * 100}%` }}
                      className="bg-sky-500 rounded-r-full transition-all"
                      title={`Could Do: ${formatDurationHuman(timeByBucketSec.could)}`}
                    />
                  </>
                ) : (
                  <div className="w-full bg-neutral-100 rounded-full" />
                )}
              </div>

              {/* Legend with tabular numbers */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-xs text-neutral-600">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-md bg-neutral-900 shrink-0" />
                  <span className="truncate">Must: <strong className="font-mono tabular-nums text-neutral-900 font-semibold">{formatDurationHuman(timeByBucketSec.must)}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-md bg-amber-500 shrink-0" />
                  <span className="truncate">Should: <strong className="font-mono tabular-nums text-neutral-900 font-semibold">{formatDurationHuman(timeByBucketSec.should)}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-md bg-sky-500 shrink-0" />
                  <span className="truncate">Could: <strong className="font-mono tabular-nums text-neutral-900 font-semibold">{formatDurationHuman(timeByBucketSec.could)}</strong></span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span className="truncate mr-3">
              {totalTodayFocusSec === 0
                ? "No sprints logged today yet. Launch a gentle 25-minute block to get in flow."
                : timeByBucketSec.must > timeByBucketSec.should
                ? "Observation: Heavy focus in urgent Must Do tasks. Guard some space for Should Do."
                : "Balanced: You gave quality attention to nourishing Should Do growth today."}
            </span>
            <button
              onClick={() => onNavigateToTab('report')}
              className="text-neutral-900 hover:text-black font-semibold inline-flex items-center gap-1 shrink-0 group"
            >
              <span>Weekly Analytics</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Quick Launch Sprint Card */}
        <div className="bg-[#111111] text-white rounded-3xl p-6 sm:p-7 shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex flex-col justify-between relative overflow-hidden">
          {/* Subtle gradient aura */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                Flexible Flow
              </span>
              <Clock className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="font-display text-xl font-bold text-white tracking-tight">
              Focus Sprint
            </h4>
            <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed font-normal">
              Not time prison. Start with 25 minutes, extend if you hit flow, or end early with zero guilt.
            </p>
          </div>

          <div className="mt-6 space-y-2.5">
            <button
              onClick={() => onLaunchSprint()}
              className="w-full py-3 px-4 bg-white text-neutral-900 hover:bg-neutral-100 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm hover:scale-[1.01]"
            >
              <Play className="w-3.5 h-3.5 fill-neutral-900" />
              <span>Launch 25-Min Sprint</span>
            </button>
            <button
              onClick={() => onNavigateToTab('sprint')}
              className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/15 text-white rounded-2xl text-xs font-semibold flex items-center justify-center transition-colors"
            >
              Custom Durations & Sprints
            </button>
          </div>
        </div>
      </div>

      {/* 3. Three Task Buckets At A Glance */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h3 className="font-display text-lg font-bold text-neutral-900 tracking-tight">
              Task Buckets
            </h3>
            <p className="text-xs text-neutral-500">
              Categorized by real urgency and personal fulfillment
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('tasks')}
            className="text-xs text-neutral-600 hover:text-neutral-900 font-semibold flex items-center gap-1 group"
          >
            <span>View All ({tasks.length})</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Must Do */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.04, ease: [0.16, 1, 0.3, 1] }}
            onDragOver={(e) => handleBucketDragOver(e, 'must')}
            onDrop={(e) => handleBucketDrop(e, 'must')}
            className={`bg-white rounded-3xl border transition-all p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between ${
              dragOverBucket === 'must' && !dragOverTaskId
                ? 'border-neutral-900 ring-2 ring-neutral-900/10 bg-neutral-50/50'
                : 'border-black/[0.07] hover:border-black/[0.12]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-display text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Must Do</span>
                </span>
                <button
                  onClick={() => onOpenTaskModal(null, 'must')}
                  className="p-1 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                  title="Add Must Do task"
                  aria-label="Add Must Do task"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-neutral-500 mb-3.5 line-clamp-1">
                Clear deadlines & real consequences
              </p>

              <div className="space-y-1.5 min-h-[80px]">
                {mustTasks.length === 0 ? (
                  <div
                    onDragOver={(e) => handleBucketDragOver(e, 'must')}
                    onDrop={(e) => handleBucketDrop(e, 'must')}
                    className="border-2 border-dashed border-neutral-200 rounded-xl py-6 text-center text-xs text-neutral-400 italic"
                  >
                    Drop task here or click +
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {mustTasks.map((t, idx) => {
                      const isDragOverThis = dragOverTaskId === t.id;
                      const isBeingDragged = draggedTaskId === t.id;
                      return (
                        <motion.div
                          key={t.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.96 }}
                          transition={{
                            duration: 0.2,
                            delay: Math.min(idx * 0.03, 0.15),
                            ease: [0.16, 1, 0.3, 1],
                          }}
                        >
                          {isDragOverThis && dragOverPosition === 'before' && (
                            <div className="h-0.5 bg-neutral-900 rounded-full my-0.5 shadow-xs transition-all animate-pulse" />
                          )}
                          <div
                            draggable={true}
                            onDragStart={(e) => handleDragStart(e, t.id)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => handleTaskDragOver(e, t.id, 'must')}
                            onDrop={(e) => handleTaskDrop(e, t.id)}
                            className={`group flex items-center gap-2 text-xs p-2 rounded-xl transition-all border ${
                              isBeingDragged
                                ? 'opacity-30 border-dashed border-neutral-400 bg-neutral-50'
                                : 'hover:bg-neutral-50 border-transparent hover:border-neutral-200/60'
                            }`}
                          >
                            <div
                              className="text-neutral-300 group-hover:text-neutral-500 cursor-grab active:cursor-grabbing p-0.5 shrink-0"
                              title="Drag to reprioritize"
                            >
                              <GripVertical className="w-3.5 h-3.5" />
                            </div>
                            <button
                              onClick={() => setTaskStatus(t.id, 'done')}
                              className="w-4 h-4 rounded-md border-2 border-neutral-300 hover:border-neutral-400 flex items-center justify-center shrink-0 bg-white transition-colors"
                              title="Mark done"
                              aria-label="Mark done"
                            />
                            <span className="text-neutral-800 font-medium truncate flex-1">{t.name}</span>
                            <button
                              onClick={() => onLaunchSprint(t)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all"
                              title="Start sprint with this task"
                              aria-label="Start sprint with this task"
                            >
                              <Play className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                            </button>
                          </div>
                          {isDragOverThis && dragOverPosition === 'after' && (
                            <div className="h-0.5 bg-neutral-900 rounded-full my-0.5 shadow-xs transition-all animate-pulse" />
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-100 text-[11px] text-neutral-500 font-mono">
              Clear immediate blockers first
            </div>
          </motion.div>

          {/* Should Do */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            onDragOver={(e) => handleBucketDragOver(e, 'should')}
            onDrop={(e) => handleBucketDrop(e, 'should')}
            className={`bg-white rounded-3xl border transition-all p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between ${
              dragOverBucket === 'should' && !dragOverTaskId
                ? 'border-neutral-900 ring-2 ring-neutral-900/10 bg-neutral-50/50'
                : 'border-black/[0.07] hover:border-black/[0.12]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-display text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>Should Do</span>
                </span>
                <button
                  onClick={() => onOpenTaskModal(null, 'should')}
                  className="p-1 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                  title="Add Should Do task"
                  aria-label="Add Should Do task"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-neutral-500 mb-3.5 line-clamp-1">
                Brings joy & long-term fulfillment
              </p>

              <div className="space-y-1.5 min-h-[80px]">
                {shouldTasks.length === 0 ? (
                  <div
                    onDragOver={(e) => handleBucketDragOver(e, 'should')}
                    onDrop={(e) => handleBucketDrop(e, 'should')}
                    className="border-2 border-dashed border-neutral-200 rounded-xl py-6 text-center text-xs text-neutral-400 italic"
                  >
                    Drop task here or click +
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {shouldTasks.map((t, idx) => {
                      const isDragOverThis = dragOverTaskId === t.id;
                      const isBeingDragged = draggedTaskId === t.id;
                      return (
                        <motion.div
                          key={t.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.96 }}
                          transition={{
                            duration: 0.2,
                            delay: Math.min(idx * 0.03, 0.15),
                            ease: [0.16, 1, 0.3, 1],
                          }}
                        >
                          {isDragOverThis && dragOverPosition === 'before' && (
                            <div className="h-0.5 bg-neutral-900 rounded-full my-0.5 shadow-xs transition-all animate-pulse" />
                          )}
                          <div
                            draggable={true}
                            onDragStart={(e) => handleDragStart(e, t.id)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => handleTaskDragOver(e, t.id, 'should')}
                            onDrop={(e) => handleTaskDrop(e, t.id)}
                            className={`group flex items-center gap-2 text-xs p-2 rounded-xl transition-all border ${
                              isBeingDragged
                                ? 'opacity-30 border-dashed border-neutral-400 bg-neutral-50'
                                : 'hover:bg-neutral-50 border-transparent hover:border-neutral-200/60'
                            }`}
                          >
                            <div
                              className="text-neutral-300 group-hover:text-neutral-500 cursor-grab active:cursor-grabbing p-0.5 shrink-0"
                              title="Drag to reprioritize"
                            >
                              <GripVertical className="w-3.5 h-3.5" />
                            </div>
                            <button
                              onClick={() => setTaskStatus(t.id, 'done')}
                              className="w-4 h-4 rounded-md border-2 border-neutral-300 hover:border-neutral-400 flex items-center justify-center shrink-0 bg-white transition-colors"
                              title="Mark done"
                              aria-label="Mark done"
                            />
                            <span className="text-neutral-800 font-medium truncate flex-1">{t.name}</span>
                            <button
                              onClick={() => onLaunchSprint(t)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all"
                              title="Start sprint with this task"
                              aria-label="Start sprint with this task"
                            >
                              <Play className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                            </button>
                          </div>
                          {isDragOverThis && dragOverPosition === 'after' && (
                            <div className="h-0.5 bg-neutral-900 rounded-full my-0.5 shadow-xs transition-all animate-pulse" />
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-100 text-[11px] text-neutral-500 font-mono">
              Easy to postpone, makes life richer
            </div>
          </motion.div>

          {/* Could Do */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            onDragOver={(e) => handleBucketDragOver(e, 'could')}
            onDrop={(e) => handleBucketDrop(e, 'could')}
            className={`bg-white rounded-3xl border transition-all p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between ${
              dragOverBucket === 'could' && !dragOverTaskId
                ? 'border-neutral-900 ring-2 ring-neutral-900/10 bg-neutral-50/50'
                : 'border-black/[0.07] hover:border-black/[0.12]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-display text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  <span>Could Do</span>
                </span>
                <button
                  onClick={() => onOpenTaskModal(null, 'could')}
                  className="p-1 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                  title="Add Could Do task"
                  aria-label="Add Could Do task"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-neutral-500 mb-3.5 line-clamp-1">
                Curiosity & fun with extra bandwidth
              </p>

              <div className="space-y-1.5 min-h-[80px]">
                {couldTasks.length === 0 ? (
                  <div
                    onDragOver={(e) => handleBucketDragOver(e, 'could')}
                    onDrop={(e) => handleBucketDrop(e, 'could')}
                    className="border-2 border-dashed border-neutral-200 rounded-xl py-6 text-center text-xs text-neutral-400 italic"
                  >
                    Drop task here or click +
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {couldTasks.map((t, idx) => {
                      const isDragOverThis = dragOverTaskId === t.id;
                      const isBeingDragged = draggedTaskId === t.id;
                      return (
                        <motion.div
                          key={t.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.96 }}
                          transition={{
                            duration: 0.2,
                            delay: Math.min(idx * 0.03, 0.15),
                            ease: [0.16, 1, 0.3, 1],
                          }}
                        >
                          {isDragOverThis && dragOverPosition === 'before' && (
                            <div className="h-0.5 bg-neutral-900 rounded-full my-0.5 shadow-xs transition-all animate-pulse" />
                          )}
                          <div
                            draggable={true}
                            onDragStart={(e) => handleDragStart(e, t.id)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => handleTaskDragOver(e, t.id, 'could')}
                            onDrop={(e) => handleTaskDrop(e, t.id)}
                            className={`group flex items-center gap-2 text-xs p-2 rounded-xl transition-all border ${
                              isBeingDragged
                                ? 'opacity-30 border-dashed border-neutral-400 bg-neutral-50'
                                : 'hover:bg-neutral-50 border-transparent hover:border-neutral-200/60'
                            }`}
                          >
                            <div
                              className="text-neutral-300 group-hover:text-neutral-500 cursor-grab active:cursor-grabbing p-0.5 shrink-0"
                              title="Drag to reprioritize"
                            >
                              <GripVertical className="w-3.5 h-3.5" />
                            </div>
                            <button
                              onClick={() => setTaskStatus(t.id, 'done')}
                              className="w-4 h-4 rounded-md border-2 border-neutral-300 hover:border-neutral-400 flex items-center justify-center shrink-0 bg-white transition-colors"
                              title="Mark done"
                              aria-label="Mark done"
                            />
                            <span className="text-neutral-800 font-medium truncate flex-1">{t.name}</span>
                            <button
                              onClick={() => onLaunchSprint(t)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all"
                              title="Start sprint with this task"
                              aria-label="Start sprint with this task"
                            >
                              <Play className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                            </button>
                          </div>
                          {isDragOverThis && dragOverPosition === 'after' && (
                            <div className="h-0.5 bg-neutral-900 rounded-full my-0.5 shadow-xs transition-all animate-pulse" />
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-100 text-[11px] text-neutral-500 font-mono">
              Zero-guilt idea backlog
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
