import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Check,
  History,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Flame,
  Sparkles,
  CornerDownRight,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Target,
  Zap,
  ListPlus,
} from 'lucide-react';
import {
  formatDateLabel,
  formatFullDate,
  getTodayDateString,
  getOffsetDateString,
} from '../utils/dateUtils';

interface SimpleModeViewProps {
  onOpenHistory: () => void;
  onOpenHabits: () => void;
  onPromoteLine: (text: string) => void;
}

export const SimpleModeView: React.FC<SimpleModeViewProps> = ({
  onOpenHistory,
  onOpenHabits,
  onPromoteLine,
}) => {
  const {
    selectedDate,
    setSelectedDate,
    currentRecord,
    updateBrainDump,
    updateDailyHighlight,
    toggleDailyHighlightDone,
    updateMicroCommitment,
    toggleMicroCommitmentDone,
    habits,
    setMode,
  } = useApp();

  const today = getTodayDateString();
  const isToday = selectedDate === today;

  // Completion stats
  const highlightCompleted = Boolean(currentRecord.dailyHighlight.text && currentRecord.dailyHighlight.done);
  const microCompleted = Boolean(currentRecord.microCommitment.text && currentRecord.microCommitment.done);
  const dumpPresent = Boolean(currentRecord.brainDump.trim().length > 0);

  const completedCount =
    (dumpPresent ? 1 : 0) +
    (highlightCompleted ? 1 : 0) +
    (microCompleted ? 1 : 0);

  const progressPercent = Math.round((completedCount / 3) * 100);

  const [selectedDumpLine, setSelectedDumpLine] = useState<string>('');

  const dumpLines = currentRecord.brainDump
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Quick writing prompts to reduce blank page friction
  const quickPrompts = [
    "What's currently clogging mental RAM?",
    "One worry I can put on paper",
    "A creative spark to revisit later",
  ];

  const handleAppendPrompt = (prompt: string) => {
    const existing = currentRecord.brainDump ? `${currentRecord.brainDump}\n- ` : '- ';
    updateBrainDump(selectedDate, existing);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12 space-y-8">
      {/* 1. Hero / Header with Strong Typographic Hierarchy */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider font-mono">
              Simple Floor Practice
            </span>
            {isToday ? (
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Today
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-neutral-600 bg-neutral-200/70 px-2.5 py-0.5 rounded-full">
                {formatDateLabel(selectedDate)}
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-neutral-900 leading-tight">
            {formatFullDate(selectedDate)}
          </h1>
          <p className="text-sm text-neutral-500 mt-1.5 leading-relaxed font-normal">
            Three tiny daily practices. No rigid pressure — just quiet clarity.
          </p>
        </div>

        {/* Date Paging Selector */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-black/[0.08] shadow-sm self-start sm:self-auto">
          <button
            onClick={() => setSelectedDate(getOffsetDateString(selectedDate, -1))}
            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-all"
            title="Previous day"
            aria-label="Previous day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {!isToday ? (
            <button
              onClick={() => setSelectedDate(today)}
              className="px-2.5 py-1 text-xs font-semibold text-neutral-800 hover:bg-neutral-100 rounded-lg transition-all"
            >
              Today
            </button>
          ) : (
            <span className="px-2 text-xs font-semibold text-neutral-400 font-mono">Today</span>
          )}
          <button
            onClick={() => setSelectedDate(getOffsetDateString(selectedDate, 1))}
            disabled={selectedDate >= today}
            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-all disabled:opacity-20 disabled:pointer-events-none"
            title="Next day"
            aria-label="Next day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Visual Progress Indicator: Tangible Sense of Accomplishment */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-black/[0.07] shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Circular Progress Ring */}
            <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-neutral-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={`transition-all duration-700 ease-out ${
                    completedCount === 3 ? 'text-emerald-500' : 'text-neutral-900'
                  }`}
                  strokeDasharray={`${progressPercent}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xs font-mono font-bold tabular-nums text-neutral-800">
                {completedCount}/3
              </span>
            </div>

            <div>
              <h2 className="font-display text-base font-bold text-neutral-900 tracking-tight">
                {completedCount === 3
                  ? 'Daily Floor Completed! ✨'
                  : completedCount === 0
                  ? 'Begin Today’s Compounding'
                  : `${completedCount} of 3 practices checked`}
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                {completedCount === 3
                  ? 'You’ve secured your baseline for today. Tiny beats perfect.'
                  : 'Compounding comes from consistency, not massive single days.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onOpenHabits}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/15 text-amber-900 text-xs font-semibold transition-all border border-amber-500/20"
              title="View your gentle streak habits"
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>{habits.length} Habits</span>
            </button>
          </div>
        </div>

        {/* Multi-step pill indicator */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-neutral-100">
          <div className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium transition-all ${
            dumpPresent ? 'bg-emerald-50 text-emerald-900' : 'bg-neutral-50 text-neutral-500'
          }`}>
            <span className={`w-2 h-2 rounded-full ${dumpPresent ? 'bg-emerald-500' : 'bg-neutral-300'}`} />
            <span className="truncate">1. Brain Dump</span>
          </div>
          <div className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium transition-all ${
            highlightCompleted ? 'bg-emerald-50 text-emerald-900' : 'bg-neutral-50 text-neutral-500'
          }`}>
            <span className={`w-2 h-2 rounded-full ${highlightCompleted ? 'bg-emerald-500' : 'bg-neutral-300'}`} />
            <span className="truncate">2. Highlight</span>
          </div>
          <div className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium transition-all ${
            microCompleted ? 'bg-emerald-50 text-emerald-900' : 'bg-neutral-50 text-neutral-500'
          }`}>
            <span className={`w-2 h-2 rounded-full ${microCompleted ? 'bg-emerald-500' : 'bg-neutral-300'}`} />
            <span className="truncate">3. Micro Step</span>
          </div>
        </div>
      </div>

      {/* 3. PRACTICE 1: Brain Dump (Empty RAM) */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border border-black/[0.07] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-neutral-900 text-white text-xs font-bold font-mono">
                1
              </span>
              <h2 className="font-display text-lg font-bold text-neutral-900 tracking-tight">
                Brain Dump
              </h2>
            </div>
            <p className="text-xs text-neutral-500">
              Empty your mental RAM. Type stream-of-consciousness thoughts, worries, or ideas without organizing them.
            </p>
          </div>

          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-all border border-neutral-200/80 shrink-0 font-medium"
            title="Browse previous day brain dumps"
          >
            <History className="w-3.5 h-3.5" />
            <span>Past Dumps</span>
          </button>
        </div>

        {/* Quick prompt triggers */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleAppendPrompt(prompt)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-neutral-100/80 hover:bg-neutral-200/80 text-neutral-600 transition-colors"
            >
              + {prompt}
            </button>
          ))}
        </div>

        {/* Uncluttered Text Area */}
        <div className="relative">
          <textarea
            value={currentRecord.brainDump}
            onChange={(e) => updateBrainDump(selectedDate, e.target.value)}
            placeholder="What's floating in your head right now? Don't worry about grammar or structure — just dump it here..."
            rows={5}
            className="w-full p-4 rounded-2xl bg-[#fafafa] border border-black/[0.06] text-neutral-800 text-sm leading-relaxed placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-all resize-y"
          />
          <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-1.5 px-1 font-mono">
            <span>{dumpLines.length} line{dumpLines.length === 1 ? '' : 's'}</span>
            <span>{currentRecord.brainDump.length} characters</span>
          </div>
        </div>

        {/* Line promotion helper */}
        {dumpLines.length > 0 && (
          <div className="pt-2 border-t border-neutral-100">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
                <CornerDownRight className="w-3.5 h-3.5 text-neutral-400" />
                Promote a line to your Task Backlog
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {dumpLines.slice(0, 6).map((line, i) => (
                <button
                  key={i}
                  onClick={() => onPromoteLine(line.replace(/^[-*•]\s*/, ''))}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-700 rounded-lg transition-all text-left truncate max-w-full"
                  title="Turn this note into a task"
                >
                  <ListPlus className="w-3 h-3 shrink-0" />
                  <span className="truncate">{line.replace(/^[-*•]\s*/, '')}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 4. PRACTICE 2: Daily Highlight */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border border-black/[0.07] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-amber-500 text-white text-xs font-bold font-mono">
              2
            </span>
            <h2 className="font-display text-lg font-bold text-neutral-900 tracking-tight">
              Daily Highlight
            </h2>
          </div>
          <p className="text-xs text-neutral-500">
            What is the <strong>ONE thing</strong> that will make today feel successful, even if nothing else gets done?
          </p>
        </div>

        {/* Input Box with High-Contrast Checkbox */}
        <div className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl bg-[#fafafa] border border-black/[0.06] focus-within:bg-white focus-within:ring-2 focus-within:ring-neutral-900/10 focus-within:border-neutral-400 transition-all">
          <button
            type="button"
            onClick={() => toggleDailyHighlightDone(selectedDate)}
            disabled={!currentRecord.dailyHighlight.text}
            className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all shrink-0 ${
              highlightCompleted
                ? 'bg-emerald-500 text-white shadow-sm scale-105'
                : 'border-2 border-neutral-300 hover:border-neutral-400 text-transparent bg-white'
            } disabled:opacity-30 disabled:cursor-not-allowed`}
            title={highlightCompleted ? 'Mark incomplete' : 'Mark completed'}
          >
            <Check className="w-4 h-4 stroke-[3]" />
          </button>

          <input
            type="text"
            value={currentRecord.dailyHighlight.text}
            onChange={(e) => updateDailyHighlight(selectedDate, e.target.value)}
            placeholder="e.g. Finish the pitch deck draft for Monday's meeting"
            className={`w-full bg-transparent text-sm sm:text-base font-medium focus:outline-none placeholder:text-neutral-400 ${
              highlightCompleted ? 'line-through text-neutral-400' : 'text-neutral-900'
            }`}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
          <span className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-amber-500" />
            Pick one focal priority — protect it from distraction.
          </span>
          {highlightCompleted && (
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Accomplished today
            </span>
          )}
        </div>
      </section>

      {/* 5. PRACTICE 3: Micro-Commitment */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border border-black/[0.07] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-blue-500 text-white text-xs font-bold font-mono">
              3
            </span>
            <h2 className="font-display text-lg font-bold text-neutral-900 tracking-tight">
              Micro-Commitment
            </h2>
          </div>
          <p className="text-xs text-neutral-500">
            A tiny, 2-minute starter action so ridiculously small you cannot make an excuse to procrastinate.
          </p>
        </div>

        {/* Input Box with High-Contrast Checkbox */}
        <div className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl bg-[#fafafa] border border-black/[0.06] focus-within:bg-white focus-within:ring-2 focus-within:ring-neutral-900/10 focus-within:border-neutral-400 transition-all">
          <button
            type="button"
            onClick={() => toggleMicroCommitmentDone(selectedDate)}
            disabled={!currentRecord.microCommitment.text}
            className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all shrink-0 ${
              microCompleted
                ? 'bg-emerald-500 text-white shadow-sm scale-105'
                : 'border-2 border-neutral-300 hover:border-neutral-400 text-transparent bg-white'
            } disabled:opacity-30 disabled:cursor-not-allowed`}
            title={microCompleted ? 'Mark incomplete' : 'Mark completed'}
          >
            <Check className="w-4 h-4 stroke-[3]" />
          </button>

          <input
            type="text"
            value={currentRecord.microCommitment.text}
            onChange={(e) => updateMicroCommitment(selectedDate, e.target.value)}
            placeholder="e.g. Open the spreadsheet and write just 1 line, or put on walking shoes"
            className={`w-full bg-transparent text-sm sm:text-base font-medium focus:outline-none placeholder:text-neutral-400 ${
              microCompleted ? 'line-through text-neutral-400' : 'text-neutral-900'
            }`}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-blue-500" />
            Once you start for 2 minutes, momentum takes over.
          </span>
          {microCompleted && (
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Micro habit complete
            </span>
          )}
        </div>
      </section>

      {/* 6. Contextual Bridge to Advanced Workspace */}
      <div className="p-6 rounded-3xl bg-neutral-100/70 border border-neutral-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <h3 className="font-display text-sm font-bold text-neutral-900">
            Ready to expand your focus?
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Switch to the Advanced Workspace for flexible Sprint Timers, 3-Bucket tasks (Must/Should/Could), and automated time tracking.
          </p>
        </div>
        <button
          onClick={() => setMode('advanced')}
          className="px-4 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-all shadow-sm shrink-0 flex items-center gap-1.5"
        >
          <span>Open Full Workspace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
