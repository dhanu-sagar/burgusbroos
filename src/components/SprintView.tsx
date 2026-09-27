import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Play,
  Pause,
  Check,
  Clock,
  Plus,
  Trash2,
  X,
  Sparkles,
  Zap,
  Target,
  Smile,
  CheckCircle2,
  Lightbulb,
  FileText,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  BookOpen,
  Send,
  CornerDownLeft,
} from 'lucide-react';
import { formatTimerDigital, formatDurationHuman, getTodayDateString } from '../utils/dateUtils';
import { FocusQuality, Task, BucketType, CreativeLogEntry, CreativeLogType, SprintSession } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface SprintViewProps {
  onOpenTaskModal: () => void;
}

export const SprintView: React.FC<SprintViewProps> = ({ onOpenTaskModal }) => {
  const {
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
    tasks,
    addTask,
  } = useApp();

  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [customDurationMinutes, setCustomDurationMinutes] = useState<number>(25);
  const [freeformName, setFreeformName] = useState<string>('');
  const [freeformBucket, setFreeformBucket] = useState<BucketType>('must');

  // Active Sprint In-Session Creative Entry state
  const [liveCreativeInput, setLiveCreativeInput] = useState('');
  const [liveCreativeType, setLiveCreativeType] = useState<CreativeLogType>('insight');
  const [showCreativeLog, setShowCreativeLog] = useState(true);

  // Finishing Modal state
  const [isFinishing, setIsFinishing] = useState(false);
  const [focusQuality, setFocusQuality] = useState<FocusQuality>('locked_in');
  const [sprintNotes, setSprintNotes] = useState('');
  const [creativeTakeaway, setCreativeTakeaway] = useState('');
  const [markTaskDone, setMarkTaskDone] = useState(false);
  const [promoteToTaskMap, setPromoteToTaskMap] = useState<Record<string, boolean>>({});

  // Manual Log Modal state
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualBucket, setManualBucket] = useState<BucketType>('must');
  const [manualDurationMins, setManualDurationMins] = useState(25);
  const [manualQuality, setManualQuality] = useState<FocusQuality>('locked_in');
  const [manualTakeaway, setManualTakeaway] = useState('');
  const [manualNotes, setManualNotes] = useState('');

  // Expanded History cards
  const [expandedSprintId, setExpandedSprintId] = useState<string | null>(null);

  // Inline retrospective note on existing sprint
  const [retroNoteText, setRetroNoteText] = useState('');
  const [retroNoteType, setRetroNoteType] = useState<CreativeLogType>('note');

  // Feedback banner when task is promoted
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const availableTasks = tasks.filter((t) => t.status !== 'done');

  const handleStartSuggested = (minutes: number) => {
    let taskName = freeformName.trim();
    let bucket = freeformBucket;
    let projectId: string | undefined;

    if (selectedTaskId) {
      const t = tasks.find((item) => item.id === selectedTaskId);
      if (t) {
        taskName = t.name;
        bucket = t.bucket;
        projectId = t.projectId;
      }
    }

    startSprint({
      taskId: selectedTaskId || undefined,
      taskName: taskName || 'Deep Focus Session',
      bucket,
      projectId,
      plannedDurationSec: minutes * 60,
    });
  };

  const handleLiveAddCreative = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!liveCreativeInput.trim()) return;

    addSprintCreativeEntry({
      content: liveCreativeInput.trim(),
      type: liveCreativeType,
    });
    setLiveCreativeInput('');
  };

  const handleConvertIdeaToTask = (content: string, bucket: BucketType = 'should') => {
    addTask({
      name: content,
      bucket,
      status: 'not_started',
      priority: 'medium',
      notes: `Captured in focus sprint on ${getTodayDateString()}`,
    });
    setFeedbackMsg(`Added idea to ${bucket.toUpperCase()} Do backlog!`);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleInitiateEnd = () => {
    // Pre-fill default takeaway or notes if any
    setCreativeTakeaway('');
    setSprintNotes('');
    setFocusQuality('locked_in');
    setMarkTaskDone(false);

    // Default: promote any ideas captured during sprint
    const initialMap: Record<string, boolean> = {};
    if (activeSprint?.creativeLog) {
      activeSprint.creativeLog.forEach((entry) => {
        if (entry.type === 'idea') {
          initialMap[entry.id] = false;
        }
      });
    }
    setPromoteToTaskMap(initialMap);
    setIsFinishing(true);
  };

  const handleConfirmEnd = () => {
    // If user checked any idea to promote to task, add them
    if (activeSprint?.creativeLog) {
      activeSprint.creativeLog.forEach((entry) => {
        if (promoteToTaskMap[entry.id]) {
          handleConvertIdeaToTask(entry.content, activeSprint.bucket || 'should');
        }
      });
    }

    endSprint(
      focusQuality,
      sprintNotes,
      markTaskDone,
      activeSprint?.creativeLog,
      creativeTakeaway
    );

    setIsFinishing(false);
    setSprintNotes('');
    setCreativeTakeaway('');
    setMarkTaskDone(false);
  };

  const handleSaveManualSprint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    const actualSec = Math.max(60, manualDurationMins * 60);
    const now = Date.now();

    logCompletedSprintManually({
      taskName: manualName.trim(),
      bucket: manualBucket,
      startTime: new Date(now - actualSec * 1000).toISOString(),
      endTime: new Date(now).toISOString(),
      plannedDurationSec: actualSec,
      actualDurationSec: actualSec,
      focusQuality: manualQuality,
      endedEarly: false,
      notes: manualNotes.trim() || undefined,
      creativeTakeaway: manualTakeaway.trim() || undefined,
      creativeLog: manualTakeaway
        ? [
            {
              id: `cl-${Date.now()}`,
              content: manualTakeaway.trim(),
              type: 'insight',
              timestampSec: actualSec,
              createdAt: new Date().toISOString(),
            },
          ]
        : undefined,
    });

    setIsManualModalOpen(false);
    setManualName('');
    setManualTakeaway('');
    setManualNotes('');
    setFeedbackMsg('Sprint session recorded successfully.');
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleAddRetroNote = (sprintId: string) => {
    if (!retroNoteText.trim()) return;
    const targetSprint = sprints.find((s) => s.id === sprintId);
    if (!targetSprint) return;

    const newEntry: CreativeLogEntry = {
      id: `cl-${Date.now()}`,
      content: retroNoteText.trim(),
      type: retroNoteType,
      timestampSec: targetSprint.actualDurationSec,
      createdAt: new Date().toISOString(),
    };

    updateSprint(sprintId, {
      creativeLog: [...(targetSprint.creativeLog || []), newEntry],
    });

    setRetroNoteText('');
  };

  const totalFocusSec = sprints.reduce((acc, s) => acc + (s.actualDurationSec || 0), 0);

  const getLogTypeBadge = (type: CreativeLogType) => {
    switch (type) {
      case 'breakthrough':
        return {
          icon: Sparkles,
          label: 'Breakthrough',
          bg: 'bg-amber-50 text-amber-900 border-amber-200/80',
          dot: 'bg-amber-500',
        };
      case 'idea':
        return {
          icon: Lightbulb,
          label: 'Idea',
          bg: 'bg-sky-50 text-sky-900 border-sky-200/80',
          dot: 'bg-sky-500',
        };
      case 'insight':
        return {
          icon: Zap,
          label: 'Insight',
          bg: 'bg-emerald-50 text-emerald-900 border-emerald-200/80',
          dot: 'bg-emerald-500',
        };
      default:
        return {
          icon: FileText,
          label: 'Note',
          bg: 'bg-neutral-100 text-neutral-800 border-neutral-200/80',
          dot: 'bg-neutral-500',
        };
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto py-2">
      {/* Toast Feedback Notification */}
      <AnimatePresence>
        {feedbackMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg border border-neutral-700 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{feedbackMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider font-mono">
              Natural Focus Flow
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold font-mono bg-amber-50 text-amber-800 border border-amber-200/60 px-2 py-0.5 rounded-md">
              <Sparkles className="w-3 h-3" />
              Creative Log Enabled
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-neutral-900">
            Sprint Sessions
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-normal leading-relaxed">
            Not time prison. Work blocks designed around natural energy with an in-sprint creative scratchpad for sudden insights.
          </p>
        </div>

        <div className="flex items-center gap-4 text-right bg-white px-4 py-2.5 rounded-2xl border border-black/[0.07] shadow-xs shrink-0">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-mono">Total Focus</div>
            <div className="text-base font-bold font-mono tabular-nums text-neutral-900">
              {formatDurationHuman(totalFocusSec)}
            </div>
          </div>
          <div className="border-l border-neutral-200/80 pl-4">
            <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-mono">Logged Blocks</div>
            <div className="text-base font-bold font-mono tabular-nums text-neutral-900">
              {sprints.length}
            </div>
          </div>
        </div>
      </div>

      {/* Main Active Sprint Workspace */}
      {activeSprint ? (
        <div className="space-y-5">
          {/* Timer Card */}
          <div className="bg-white rounded-3xl border border-black/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-7 sm:p-10 text-center space-y-6 relative overflow-hidden">
            <div className="space-y-2">
              <span
                className={`inline-flex items-center gap-1.5 text-[11px] font-semibold font-mono px-3.5 py-1 rounded-full uppercase tracking-wider border ${
                  activeSprint.isPaused
                    ? 'bg-amber-50 text-amber-800 border-amber-200/60'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200/60'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    activeSprint.isPaused ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'
                  }`}
                />
                {activeSprint.isPaused ? 'Session Paused' : 'Focus Flow Active'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-neutral-900 tracking-tight mt-2">
                {activeSprint.taskName}
              </h2>
              <div className="text-xs text-neutral-500 flex items-center justify-center gap-2">
                <span className="capitalize font-semibold text-neutral-800 font-mono">
                  {activeSprint.bucket} Do
                </span>
                <span>·</span>
                <span>Target: {Math.round(activeSprint.plannedDurationSec / 60)}m</span>
                {activeSprintElapsedSec > activeSprint.plannedDurationSec && (
                  <>
                    <span>·</span>
                    <span className="text-emerald-700 font-semibold font-mono">
                      Extended (+{formatDurationHuman(activeSprintElapsedSec - activeSprint.plannedDurationSec)})
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Minimalist Large Digital Timer */}
            <div className="py-2">
              <div className="text-7xl sm:text-8xl md:text-9xl font-light font-mono tracking-tighter tabular-nums text-neutral-900 select-none">
                {formatTimerDigital(activeSprintElapsedSec)}
              </div>
              <p className="text-xs text-neutral-500 mt-2 font-normal">
                {activeSprint.isPaused
                  ? 'Sprint is paused · Take a breath and reset.'
                  : 'Steady momentum · End whenever you reach natural friction.'}
              </p>
            </div>

            {/* Controls: Pause/Resume, Extend, Complete */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              {activeSprint.isPaused ? (
                <button
                  onClick={resumeSprint}
                  className="flex items-center gap-2 px-6 py-3 text-xs font-semibold text-white bg-neutral-900 hover:bg-black rounded-2xl transition-all shadow-sm hover:scale-[1.02]"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Resume Sprint</span>
                </button>
              ) : (
                <button
                  onClick={pauseSprint}
                  className="flex items-center gap-2 px-6 py-3 text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-2xl transition-all"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </button>
              )}

              <button
                onClick={() => extendSprint(300)}
                className="px-4 py-3 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-2xl transition-colors font-mono"
                title="Add 5 minutes of flow"
              >
                +5m
              </button>
              <button
                onClick={() => extendSprint(900)}
                className="px-4 py-3 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-2xl transition-colors font-mono"
                title="Add 15 minutes of flow"
              >
                +15m
              </button>

              <button
                onClick={handleInitiateEnd}
                className="flex items-center gap-2 px-6 py-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-2xl transition-all shadow-sm hover:scale-[1.02]"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Complete & Log</span>
              </button>
            </div>

            <div>
              <button
                onClick={cancelSprint}
                className="text-xs text-neutral-400 hover:text-rose-600 transition-colors"
              >
                Discard this session without logging
              </button>
            </div>
          </div>

          {/* IN-SESSION CREATIVE LOG & FLOW SCRATCHPAD */}
          <div className="bg-white rounded-3xl border border-black/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-neutral-900 flex items-center gap-2">
                    <span>Creative Flow Log</span>
                    <span className="text-[10px] font-mono font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                      {(activeSprint.creativeLog || []).length} captured
                    </span>
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Capture insights, breakthrough ideas, and notes without breaking concentration.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowCreativeLog((prev) => !prev)}
                className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors"
                title={showCreativeLog ? 'Collapse scratchpad' : 'Expand scratchpad'}
              >
                {showCreativeLog ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {showCreativeLog && (
              <div className="space-y-3.5 pt-1">
                {/* Fast Input Bar */}
                <form onSubmit={handleLiveAddCreative} className="space-y-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(
                      [
                        { type: 'insight', label: 'Insight', icon: Zap },
                        { type: 'idea', label: 'Idea', icon: Lightbulb },
                        { type: 'breakthrough', label: 'Breakthrough', icon: Sparkles },
                        { type: 'note', label: 'Note', icon: FileText },
                      ] as const
                    ).map(({ type, label, icon: Icon }) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setLiveCreativeType(type)}
                        className={`text-[11px] font-medium px-2.5 py-1 rounded-xl transition-all flex items-center gap-1.5 border ${
                          liveCreativeType === type
                            ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                            : 'bg-neutral-50 text-neutral-600 hover:text-neutral-900 border-neutral-200/80'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={liveCreativeInput}
                      onChange={(e) => setLiveCreativeInput(e.target.value)}
                      placeholder="Jot down an idea, decision, or eureka moment..."
                      className="flex-1 text-xs px-3.5 py-2.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!liveCreativeInput.trim()}
                      className="px-4 py-2.5 text-xs font-semibold bg-neutral-900 text-white rounded-2xl hover:bg-black disabled:opacity-40 disabled:hover:bg-neutral-900 transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <span>Capture</span>
                      <CornerDownLeft className="w-3 h-3 text-neutral-300" />
                    </button>
                  </div>
                </form>

                {/* List of Captured Entries */}
                <div className="space-y-2">
                  {(!activeSprint.creativeLog || activeSprint.creativeLog.length === 0) ? (
                    <div className="p-4 rounded-2xl bg-neutral-50/70 border border-dashed border-neutral-200 text-center text-xs text-neutral-400">
                      No creative items captured yet in this sprint. Type above to record an epiphany as you work.
                    </div>
                  ) : (
                    <AnimatePresence>
                      {activeSprint.creativeLog.map((entry) => {
                        const badge = getLogTypeBadge(entry.type);
                        const Icon = badge.icon;
                        const minutesInto = Math.floor(entry.timestampSec / 60);
                        const secondsInto = entry.timestampSec % 60;
                        const timeLabel = `+${minutesInto}:${secondsInto.toString().padStart(2, '0')}`;

                        return (
                          <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            className="p-3 rounded-2xl bg-neutral-50/90 border border-neutral-200/70 flex items-start justify-between gap-3 text-xs group"
                          >
                            <div className="flex items-start gap-2.5 min-w-0">
                              <span className="font-mono text-[10px] text-neutral-600 bg-white px-1.5 py-0.5 rounded border border-neutral-200 shrink-0 mt-0.5 font-medium">
                                {timeLabel}
                              </span>
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border shrink-0 ${badge.bg}`}
                              >
                                <Icon className="w-3 h-3" />
                                <span>{badge.label}</span>
                              </span>
                              <p className="text-neutral-900 leading-snug font-normal break-words pt-0.5">
                                {entry.content}
                              </p>
                            </div>

                            <div className="flex items-center gap-1 shrink-0 pt-0.5">
                              {entry.type === 'idea' && (
                                <button
                                  type="button"
                                  onClick={() => handleConvertIdeaToTask(entry.content, activeSprint.bucket)}
                                  className="text-[11px] text-neutral-600 hover:text-neutral-900 font-medium px-2 py-1 bg-white hover:bg-neutral-100 rounded-lg border border-neutral-200 transition-colors flex items-center gap-1"
                                  title="Add to Task Backlog"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span className="hidden sm:inline">To Tasks</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => removeSprintCreativeEntry(entry.id)}
                                className="p-1 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-neutral-100 transition-colors"
                                title="Delete entry"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Setup Sprint Card */
        <div className="bg-white rounded-3xl border border-black/[0.07] shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 sm:p-8 space-y-6">
          <div className="border-b border-black/[0.05] pb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-neutral-900 tracking-tight">
                Start a Flexible Focus Session
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                Attach an existing task from your backlog or dive into freeform flow with a live creative scratchpad.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Task Picker */}
            <div>
              <label className="block text-xs font-semibold text-neutral-900 mb-1.5">
                Attach task from backlog (optional)
              </label>
              <select
                value={selectedTaskId}
                onChange={(e) => {
                  setSelectedTaskId(e.target.value);
                  if (e.target.value) setFreeformName('');
                }}
                className="w-full text-xs sm:text-sm px-4 py-3 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 font-medium"
              >
                <option value="">No task (Freeform focus block)</option>
                {availableTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    [{t.bucket.toUpperCase()}] {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Freeform Name & Bucket */}
            {!selectedTaskId && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-900 mb-1.5">
                    What are you focusing on?
                  </label>
                  <input
                    type="text"
                    value={freeformName}
                    onChange={(e) => setFreeformName(e.target.value)}
                    placeholder="e.g. Brainstorming architecture, sketching layout"
                    className="w-full text-xs sm:text-sm px-4 py-3 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-900 mb-1.5">
                    Bucket Attribution
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['must', 'should', 'could'] as BucketType[]).map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setFreeformBucket(b)}
                        className={`py-2 px-2 text-xs rounded-xl capitalize font-semibold transition-all ${
                          freeformBucket === b
                            ? 'bg-neutral-900 text-white shadow-xs'
                            : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                        }`}
                      >
                        {b} Do
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Presets */}
          <div>
            <label className="block text-xs font-semibold text-neutral-900 mb-3">
              Suggested Duration Presets
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <button
                type="button"
                onClick={() => handleStartSuggested(15)}
                className="p-4 rounded-2xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/70 transition-all text-left group hover:scale-[1.01]"
              >
                <div className="font-mono text-xl font-bold tabular-nums text-neutral-900">
                  15 min
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">Quick win / Low friction</div>
              </button>

              <button
                type="button"
                onClick={() => handleStartSuggested(25)}
                className="p-4 rounded-2xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/70 transition-all text-left group hover:scale-[1.01]"
              >
                <div className="font-mono text-xl font-bold tabular-nums text-neutral-900">
                  25 min
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">Standard Pomodoro</div>
              </button>

              <button
                type="button"
                onClick={() => handleStartSuggested(45)}
                className="p-4 rounded-2xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/70 transition-all text-left group hover:scale-[1.01]"
              >
                <div className="font-mono text-xl font-bold tabular-nums text-neutral-900">
                  45 min
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">Deep flow state</div>
              </button>

              <button
                type="button"
                onClick={() => handleStartSuggested(customDurationMinutes)}
                className="p-4 rounded-2xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/70 transition-all text-left group hover:scale-[1.01]"
              >
                <div className="font-mono text-xl font-bold tabular-nums text-neutral-900">
                  Custom
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-xs">
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={customDurationMinutes}
                    onChange={(e) => setCustomDurationMinutes(Number(e.target.value))}
                    onClick={(e) => e.stopPropagation()}
                    className="w-14 px-2 py-0.5 bg-white border border-neutral-300 rounded-lg text-center text-neutral-900 font-mono font-semibold"
                  />
                  <span className="text-neutral-500">min</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completion & Reflection Dialog */}
      {isFinishing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl border border-black/[0.08] w-full max-w-lg overflow-hidden animate-in fade-in duration-150 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-black/[0.05] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="font-display text-base font-bold text-neutral-900">
                  Sprint Creative Reflection
                </h3>
              </div>
              <button
                onClick={() => setIsFinishing(false)}
                className="p-1 text-neutral-400 hover:text-neutral-900 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="bg-neutral-50 p-4 rounded-2xl text-center border border-neutral-200/60">
                <div className="text-xs text-neutral-500 font-mono uppercase tracking-wider">Logged Duration</div>
                <div className="text-3xl font-light font-mono tabular-nums text-neutral-900 mt-1">
                  {formatDurationHuman(activeSprintElapsedSec)}
                </div>
                <div className="text-[11px] text-neutral-500 mt-1">
                  {activeSprintElapsedSec < (activeSprint?.plannedDurationSec || 0) * 0.9
                    ? 'Ended early — every minute counts towards reality tracking.'
                    : 'Solid duration logged.'}
                </div>
              </div>

              {/* Focus Quality */}
              <div>
                <label className="block text-xs font-semibold text-neutral-900 mb-2">
                  Focus quality (optional)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFocusQuality('locked_in')}
                    className={`py-2.5 px-3 rounded-2xl text-center text-xs font-semibold transition-all ${
                      focusQuality === 'locked_in'
                        ? 'bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/40 border border-emerald-200'
                        : 'bg-neutral-50 text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    ⚡ Locked in
                  </button>

                  <button
                    type="button"
                    onClick={() => setFocusQuality('distracted')}
                    className={`py-2.5 px-3 rounded-2xl text-center text-xs font-semibold transition-all ${
                      focusQuality === 'distracted'
                        ? 'bg-amber-50 text-amber-800 ring-2 ring-amber-500/40 border border-amber-200'
                        : 'bg-neutral-50 text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    🧘 Balanced
                  </button>

                  <button
                    type="button"
                    onClick={() => setFocusQuality('rough')}
                    className={`py-2.5 px-3 rounded-2xl text-center text-xs font-semibold transition-all ${
                      focusQuality === 'rough'
                        ? 'bg-rose-50 text-rose-800 ring-2 ring-rose-500/40 border border-rose-200'
                        : 'bg-neutral-50 text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    🌪️ Distracted
                  </button>
                </div>
              </div>

              {/* Creative Takeaway / Key Artifact */}
              <div>
                <label className="block text-xs font-semibold text-neutral-900 mb-1.5 flex items-center justify-between">
                  <span>Creative Takeaway / Key Artifact (optional)</span>
                  <span className="text-[10px] text-neutral-400 font-normal">What did you ship or discover?</span>
                </label>
                <input
                  type="text"
                  value={creativeTakeaway}
                  onChange={(e) => setCreativeTakeaway(e.target.value)}
                  placeholder="e.g. Outlined cleaner animation spec; resolved responsive navbar friction"
                  className="w-full text-xs p-3 rounded-2xl bg-neutral-50 border border-neutral-200/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 text-neutral-900"
                />
              </div>

              {/* Captured Creative Log Items Review */}
              {activeSprint?.creativeLog && activeSprint.creativeLog.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Captured Flow Entries ({activeSprint.creativeLog.length})</span>
                    </span>
                    <span className="text-[11px] text-neutral-400">Promote to backlog?</span>
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto p-1">
                    {activeSprint.creativeLog.map((entry) => {
                      const badge = getLogTypeBadge(entry.type);
                      const Icon = badge.icon;
                      return (
                        <div
                          key={entry.id}
                          className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/70 text-xs flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ${badge.bg} shrink-0`}>
                              <Icon className="w-3 h-3" />
                              <span>{badge.label}</span>
                            </span>
                            <span className="text-neutral-800 truncate">{entry.content}</span>
                          </div>

                          {entry.type === 'idea' && (
                            <label className="flex items-center gap-1 text-[11px] text-neutral-600 shrink-0 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!promoteToTaskMap[entry.id]}
                                onChange={(e) =>
                                  setPromoteToTaskMap((prev) => ({
                                    ...prev,
                                    [entry.id]: e.target.checked,
                                  }))
                                }
                                className="w-3.5 h-3.5 rounded text-neutral-900"
                              />
                              <span className="text-[10px] font-medium">To Backlog</span>
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Optional Notes */}
              <div>
                <label className="block text-xs font-semibold text-neutral-900 mb-1.5">
                  General session notes (optional)
                </label>
                <input
                  type="text"
                  value={sprintNotes}
                  onChange={(e) => setSprintNotes(e.target.value)}
                  placeholder="Additional context or blockers"
                  className="w-full text-xs p-3 rounded-2xl bg-neutral-50 border border-neutral-200/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 text-neutral-900"
                />
              </div>

              {/* Mark Task Done Checkbox */}
              {activeSprint?.taskId && (
                <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-neutral-50 border border-neutral-200/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={markTaskDone}
                    onChange={(e) => setMarkTaskDone(e.target.checked)}
                    className="w-4 h-4 rounded text-neutral-900 focus:ring-neutral-900"
                  />
                  <span className="text-xs font-medium text-neutral-800">
                    Mark task as completed in backlog
                  </span>
                </label>
              )}
            </div>

            <div className="p-4 border-t border-black/[0.05] flex gap-2 bg-neutral-50/50 shrink-0">
              <button
                onClick={() => setIsFinishing(false)}
                className="flex-1 py-2.5 px-4 text-xs font-semibold text-neutral-600 hover:text-neutral-900 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmEnd}
                className="flex-1 py-2.5 px-4 text-xs font-semibold text-white bg-neutral-900 hover:bg-black rounded-xl transition-all shadow-sm"
              >
                Save to Sprint History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Focus Session Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl border border-black/[0.08] w-full max-w-md overflow-hidden animate-in fade-in duration-150">
            <div className="px-6 py-4 border-b border-black/[0.05] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-neutral-700" />
                <h3 className="font-display text-base font-bold text-neutral-900">
                  Log Past Focus Session
                </h3>
              </div>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-900 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualSprint} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-900 mb-1.5">
                  Focus session topic / activity *
                </label>
                <input
                  type="text"
                  required
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="e.g. Offline architecture sketching"
                  className="w-full text-xs p-3 rounded-2xl bg-neutral-50 border border-neutral-200/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 text-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-900 mb-1.5">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={360}
                    value={manualDurationMins}
                    onChange={(e) => setManualDurationMins(Number(e.target.value))}
                    className="w-full text-xs p-3 rounded-2xl bg-neutral-50 border border-neutral-200/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 text-neutral-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-900 mb-1.5">
                    Bucket Attribution
                  </label>
                  <select
                    value={manualBucket}
                    onChange={(e) => setManualBucket(e.target.value as BucketType)}
                    className="w-full text-xs p-3 rounded-2xl bg-neutral-50 border border-neutral-200/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 text-neutral-900 font-semibold"
                  >
                    <option value="must">Must Do</option>
                    <option value="should">Should Do</option>
                    <option value="could">Could Do</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-900 mb-1.5">
                  Creative Takeaway / Breakthrough
                </label>
                <input
                  type="text"
                  value={manualTakeaway}
                  onChange={(e) => setManualTakeaway(e.target.value)}
                  placeholder="Key takeaway from this session"
                  className="w-full text-xs p-3 rounded-2xl bg-neutral-50 border border-neutral-200/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 text-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-900 mb-1.5">
                  Focus Quality
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setManualQuality('locked_in')}
                    className={`py-2 px-2 text-center text-xs font-semibold rounded-xl border ${
                      manualQuality === 'locked_in'
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200'
                    }`}
                  >
                    ⚡ Flow
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualQuality('distracted')}
                    className={`py-2 px-2 text-center text-xs font-semibold rounded-xl border ${
                      manualQuality === 'distracted'
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200'
                    }`}
                  >
                    🧘 Balanced
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualQuality('rough')}
                    className={`py-2 px-2 text-center text-xs font-semibold rounded-xl border ${
                      manualQuality === 'rough'
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200'
                    }`}
                  >
                    🌪️ Interrupted
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="flex-1 py-2.5 px-4 text-xs font-semibold text-neutral-600 hover:text-neutral-900 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 text-xs font-semibold text-white bg-neutral-900 hover:bg-black rounded-xl transition-all shadow-sm"
                >
                  Record Sprint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SPRINT HISTORY & REAL FOCUS LOG (with Creative Logs) */}
      <div className="bg-white rounded-3xl border border-black/[0.07] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="px-6 py-4 border-b border-black/[0.05] flex items-center justify-between">
          <div>
            <h3 className="font-display text-sm font-bold text-neutral-900 flex items-center gap-2">
              <span>Sprint History & Creative Logs</span>
            </h3>
            <p className="text-xs text-neutral-500">
              Browse sessions, epiphanies, and creative takeaways.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="text-xs font-semibold text-neutral-800 hover:text-neutral-950 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/80 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Past Sprint</span>
            </button>
          </div>
        </div>

        {sprints.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-400">
            No sprints logged yet. Launch your first session above!
          </div>
        ) : (
          <div className="divide-y divide-black/[0.04]">
            {sprints.map((s) => {
              const isExpanded = expandedSprintId === s.id;
              const hasCreativeLog = s.creativeLog && s.creativeLog.length > 0;
              const hasTakeaway = !!s.creativeTakeaway;

              return (
                <div key={s.id} className="transition-colors">
                  <div
                    onClick={() => setExpandedSprintId(isExpanded ? null : s.id)}
                    className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/70 transition-colors cursor-pointer text-xs"
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center font-mono font-bold text-neutral-700 shrink-0 mt-0.5 sm:mt-0">
                        <Clock className="w-4 h-4 text-neutral-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-neutral-900 truncate">
                            {s.taskName}
                          </span>
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 font-medium">
                            {s.bucket} Do
                          </span>
                          {hasCreativeLog && (
                            <span className="text-[10px] font-medium inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200/80 px-2 py-0.5 rounded-md font-mono">
                              <Sparkles className="w-2.5 h-2.5" />
                              {s.creativeLog!.length} {s.creativeLog!.length === 1 ? 'entry' : 'entries'}
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-neutral-400 mt-1 font-mono flex flex-wrap items-center gap-2">
                          <span>
                            {new Date(s.startTime).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                            })}{' '}
                            at{' '}
                            {new Date(s.startTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>

                          {hasTakeaway && (
                            <span className="text-neutral-700 font-sans italic truncate max-w-sm">
                              · "{s.creativeTakeaway}"
                            </span>
                          )}
                          {!hasTakeaway && s.notes && (
                            <span className="text-neutral-500 font-sans italic truncate max-w-xs">
                              · "{s.notes}"
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0">
                      <span className="font-mono tabular-nums font-bold text-neutral-900">
                        {formatDurationHuman(s.actualDurationSec)}
                      </span>
                      {s.focusQuality && (
                        <span className="text-xs" title={`Focus quality: ${s.focusQuality}`}>
                          {s.focusQuality === 'locked_in'
                            ? '⚡'
                            : s.focusQuality === 'distracted'
                            ? '🧘'
                            : '🌪️'}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedSprintId(isExpanded ? null : s.id);
                        }}
                        className="p-1 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
                        title={isExpanded ? 'Collapse creative log' : 'Expand creative log'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSprint(s.id);
                        }}
                        className="p-1 text-neutral-400 hover:text-rose-600 rounded-lg transition-colors"
                        title="Delete log entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Creative Drawer */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-neutral-50/70 border-t border-black/[0.04] px-6 py-4 space-y-3.5"
                      >
                        {/* Creative Takeaway Highlight */}
                        {s.creativeTakeaway && (
                          <div className="p-3.5 rounded-2xl bg-white border border-black/[0.06] shadow-xs">
                            <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-neutral-500 block mb-1">
                              Creative Takeaway & Breakthrough
                            </span>
                            <p className="text-xs text-neutral-900 font-medium italic">
                              "{s.creativeTakeaway}"
                            </p>
                          </div>
                        )}

                        {/* List of creative log items */}
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-500 uppercase tracking-wider font-mono mb-2">
                            <span>Flow Entries & Insights</span>
                            <span>{s.creativeLog ? s.creativeLog.length : 0} logged</span>
                          </div>

                          {(!s.creativeLog || s.creativeLog.length === 0) ? (
                            <p className="text-xs text-neutral-400 italic">
                              No flow scratchpad entries were recorded during this timer block.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {s.creativeLog.map((entry) => {
                                const badge = getLogTypeBadge(entry.type);
                                const Icon = badge.icon;
                                const minutesInto = Math.floor(entry.timestampSec / 60);
                                const secondsInto = entry.timestampSec % 60;
                                const timeLabel = `+${minutesInto}:${secondsInto.toString().padStart(2, '0')}`;

                                return (
                                  <div
                                    key={entry.id}
                                    className="p-2.5 rounded-xl bg-white border border-neutral-200/70 text-xs flex items-center justify-between gap-3"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="font-mono text-[10px] text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded font-medium">
                                        {timeLabel}
                                      </span>
                                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${badge.bg} shrink-0`}>
                                        <Icon className="w-3 h-3" />
                                        <span>{badge.label}</span>
                                      </span>
                                      <span className="text-neutral-900 font-normal leading-snug">
                                        {entry.content}
                                      </span>
                                    </div>

                                    {/* Action to promote past idea to task backlog */}
                                    <button
                                      type="button"
                                      onClick={() => handleConvertIdeaToTask(entry.content, s.bucket)}
                                      className="text-[11px] font-medium text-neutral-600 hover:text-neutral-900 bg-neutral-50 hover:bg-neutral-100 px-2.5 py-1 rounded-lg border border-neutral-200 flex items-center gap-1 shrink-0 transition-colors"
                                      title="Convert this insight into a backlog task"
                                    >
                                      <Plus className="w-3 h-3" />
                                      <span>Add as Task</span>
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Add Retro Note directly to this session */}
                        <div className="pt-2 border-t border-neutral-200/60">
                          <label className="block text-[11px] font-semibold text-neutral-600 mb-1.5">
                            Append a retrospective note or takeaway:
                          </label>
                          <div className="flex items-center gap-2">
                            <select
                              value={retroNoteType}
                              onChange={(e) => setRetroNoteType(e.target.value as CreativeLogType)}
                              className="text-xs py-1.5 px-2.5 rounded-xl bg-white border border-neutral-200/80 text-neutral-700 font-medium"
                            >
                              <option value="insight">Insight</option>
                              <option value="idea">Idea</option>
                              <option value="breakthrough">Breakthrough</option>
                              <option value="note">Note</option>
                            </select>
                            <input
                              type="text"
                              value={retroNoteText}
                              onChange={(e) => setRetroNoteText(e.target.value)}
                              placeholder="Add follow-up reflection..."
                              className="flex-1 text-xs px-3 py-1.5 rounded-xl bg-white border border-neutral-200/80 text-neutral-900 placeholder:text-neutral-400"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddRetroNote(s.id)}
                              disabled={!retroNoteText.trim()}
                              className="px-3 py-1.5 text-xs font-semibold bg-neutral-900 text-white rounded-xl hover:bg-black disabled:opacity-40"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
