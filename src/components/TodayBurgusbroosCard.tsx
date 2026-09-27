import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Check, ChevronDown, ChevronUp, Edit3, Target, Zap, Sparkles, CheckCircle2 } from 'lucide-react';
import { formatDateLabel } from '../utils/dateUtils';

interface TodayBurgusbroosCardProps {
  onOpenHistory?: () => void;
  onPromoteLine?: (text: string) => void;
}

export const TodayBurgusbroosCard: React.FC<TodayBurgusbroosCardProps> = ({
  onOpenHistory,
}) => {
  const {
    currentRecord,
    updateBrainDump,
    updateDailyHighlight,
    toggleDailyHighlightDone,
    updateMicroCommitment,
    toggleMicroCommitmentDone,
    selectedDate,
  } = useApp();

  const [isExpanded, setIsExpanded] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState(false);
  const [highlightInput, setHighlightInput] = useState(currentRecord.dailyHighlight.text);
  const [editingMicro, setEditingMicro] = useState(false);
  const [microInput, setMicroInput] = useState(currentRecord.microCommitment.text);

  const completedCount =
    (currentRecord.brainDump.trim() ? 1 : 0) +
    (currentRecord.dailyHighlight.done ? 1 : 0) +
    (currentRecord.microCommitment.done ? 1 : 0);

  const handleSaveHighlight = () => {
    updateDailyHighlight(selectedDate, highlightInput);
    setEditingHighlight(false);
  };

  const handleSaveMicro = () => {
    updateMicroCommitment(selectedDate, microInput);
    setEditingMicro(false);
  };

  return (
    <div className="bg-white rounded-3xl border border-black/[0.07] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden transition-all">
      {/* Top Banner Row */}
      <div className="px-6 py-4 bg-neutral-50/70 border-b border-black/[0.05] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <h2 className="font-display text-sm font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <span>Today's Daily Practices</span>
            <span className="text-xs text-neutral-500 font-normal">
              ({formatDateLabel(selectedDate)})
            </span>
          </h2>
          <span className="text-[11px] font-mono tabular-nums font-semibold text-neutral-800 bg-white border border-neutral-200/80 px-2.5 py-0.5 rounded-full shadow-xs">
            {completedCount}/3 done
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 px-3 py-1 rounded-xl hover:bg-neutral-200/60 transition-colors"
            >
              Past Notes
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800 bg-white border border-neutral-200/80 hover:bg-neutral-100 shadow-xs px-3 py-1 rounded-xl transition-all"
          >
            <span>{isExpanded ? 'Hide Dump' : 'Open Brain Dump'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main 2 Highlight & Micro items always visible */}
      <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Daily Highlight */}
        <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-neutral-50/60 border border-neutral-200/60 hover:border-neutral-300 transition-all">
          <button
            type="button"
            onClick={() => toggleDailyHighlightDone(selectedDate)}
            className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0 ${
              currentRecord.dailyHighlight.done
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'border-2 border-neutral-300 hover:border-neutral-400 bg-white text-transparent'
            }`}
            aria-label="Toggle highlight done"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
              <span className="font-semibold text-neutral-800 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-500" />
                Daily Highlight
              </span>
              <span className="text-[10px] text-amber-700 bg-amber-500/10 px-2 py-0.5 rounded-md font-semibold font-mono">
                Anchor
              </span>
            </div>

            {editingHighlight ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={highlightInput}
                  onChange={(e) => setHighlightInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveHighlight()}
                  className="w-full text-xs p-2 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 font-sans"
                  autoFocus
                />
                <button
                  onClick={handleSaveHighlight}
                  className="text-xs bg-neutral-900 text-white px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap hover:bg-black transition-all"
                >
                  Save
                </button>
              </div>
            ) : (
              <div
                onClick={() => {
                  setHighlightInput(currentRecord.dailyHighlight.text);
                  setEditingHighlight(true);
                }}
                className="group cursor-pointer flex items-center justify-between gap-2"
              >
                <p
                  className={`text-xs sm:text-sm font-medium leading-snug truncate ${
                    currentRecord.dailyHighlight.done
                      ? 'text-neutral-400 line-through'
                      : currentRecord.dailyHighlight.text
                      ? 'text-neutral-900'
                      : 'text-neutral-400 italic font-normal'
                  }`}
                >
                  {currentRecord.dailyHighlight.text || 'Click to set today’s anchor priority...'}
                </p>
                <Edit3 className="w-3.5 h-3.5 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
            )}
          </div>
        </div>

        {/* Micro-Commitment */}
        <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-neutral-50/60 border border-neutral-200/60 hover:border-neutral-300 transition-all">
          <button
            type="button"
            onClick={() => toggleMicroCommitmentDone(selectedDate)}
            className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0 ${
              currentRecord.microCommitment.done
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'border-2 border-neutral-300 hover:border-neutral-400 bg-white text-transparent'
            }`}
            aria-label="Toggle micro-commitment done"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
              <span className="font-semibold text-neutral-800 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-blue-500" />
                Micro-Commitment
              </span>
              <span className="text-[10px] text-blue-700 bg-blue-500/10 px-2 py-0.5 rounded-md font-semibold font-mono">
                2-min step
              </span>
            </div>

            {editingMicro ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={microInput}
                  onChange={(e) => setMicroInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveMicro()}
                  className="w-full text-xs p-2 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 font-sans"
                  autoFocus
                />
                <button
                  onClick={handleSaveMicro}
                  className="text-xs bg-neutral-900 text-white px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap hover:bg-black transition-all"
                >
                  Save
                </button>
              </div>
            ) : (
              <div
                onClick={() => {
                  setMicroInput(currentRecord.microCommitment.text);
                  setEditingMicro(true);
                }}
                className="group cursor-pointer flex items-center justify-between gap-2"
              >
                <p
                  className={`text-xs sm:text-sm font-medium leading-snug truncate ${
                    currentRecord.microCommitment.done
                      ? 'text-neutral-400 line-through'
                      : currentRecord.microCommitment.text
                      ? 'text-neutral-900'
                      : 'text-neutral-400 italic font-normal'
                  }`}
                >
                  {currentRecord.microCommitment.text || 'Click to set 2-minute starter habit...'}
                </p>
                <Edit3 className="w-3.5 h-3.5 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Brain Dump */}
      {isExpanded && (
        <div className="px-6 pb-6 pt-2 border-t border-neutral-100 bg-neutral-50/40">
          <div className="flex items-center justify-between mb-2">
            <span className="font-display text-xs font-bold text-neutral-800">
              Brain Dump (Unfiltered Mental RAM)
            </span>
            <span className="text-[11px] text-neutral-400 font-mono">
              Auto-saved to today's record
            </span>
          </div>
          <textarea
            rows={3}
            value={currentRecord.brainDump}
            onChange={(e) => updateBrainDump(selectedDate, e.target.value)}
            placeholder="Freeform thoughts or ideas for today..."
            className="w-full text-xs sm:text-sm text-neutral-800 p-4 rounded-2xl border border-neutral-200 bg-white shadow-xs focus:outline-none focus:ring-2 focus:ring-neutral-900/10 resize-y font-sans leading-relaxed"
          />
        </div>
      )}
    </div>
  );
};
