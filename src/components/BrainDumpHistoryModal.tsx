import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, History, ArrowRight, CornerDownRight } from 'lucide-react';
import { formatDateLabel, formatFullDate } from '../utils/dateUtils';
import { BucketType } from '../types';

interface BrainDumpHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPromoteLine: (text: string, bucket: BucketType) => void;
}

export const BrainDumpHistoryModal: React.FC<BrainDumpHistoryModalProps> = ({
  isOpen,
  onClose,
  onPromoteLine,
}) => {
  const { dailyRecords, setSelectedDate } = useApp();
  const [selectedRecordDate, setSelectedRecordDate] = useState<string | null>(null);

  if (!isOpen) return null;

  const recordsWithDumps = Object.values(dailyRecords)
    .filter((r) => r.brainDump && r.brainDump.trim().length > 0)
    .sort((a, b) => b.date.localeCompare(a.date));

  const activeRecord = selectedRecordDate
    ? dailyRecords[selectedRecordDate]
    : recordsWithDumps[0];

  const lines = activeRecord
    ? activeRecord.brainDump
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
      <div className="bg-white rounded-3xl shadow-2xl border border-black/[0.08] w-full max-w-2xl overflow-hidden animate-in fade-in duration-150 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-black/[0.05] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-neutral-800" />
            <h3 className="font-display text-base font-bold text-neutral-900">
              Brain Dump Archives
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-900 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-neutral-100">
          {/* Left: Date selector */}
          <div className="p-3 overflow-y-auto max-h-48 sm:max-h-none space-y-1 bg-neutral-50/50">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 font-mono px-2 py-1">
              Dates
            </div>
            {recordsWithDumps.length === 0 ? (
              <p className="text-xs text-neutral-400 p-2">No notes saved yet.</p>
            ) : (
              recordsWithDumps.map((r) => {
                const isSelected = activeRecord?.date === r.date;
                return (
                  <button
                    key={r.date}
                    onClick={() => setSelectedRecordDate(r.date)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-neutral-900 text-white font-medium shadow-xs'
                        : 'text-neutral-700 hover:bg-neutral-200/60'
                    }`}
                  >
                    <span>{formatDateLabel(r.date)}</span>
                    <span className="text-[10px] font-mono opacity-70">
                      {r.brainDump.split('\n').filter((l) => l.trim()).length} lines
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Right: Notes view */}
          <div className="sm:col-span-2 p-6 overflow-y-auto space-y-4">
            {activeRecord ? (
              <>
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <span className="font-display text-xs font-bold text-neutral-900">
                    {formatFullDate(activeRecord.date)}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedDate(activeRecord.date);
                      onClose();
                    }}
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    Go to this date
                  </button>
                </div>

                <div className="bg-neutral-50 p-4 rounded-2xl text-xs sm:text-sm text-neutral-800 whitespace-pre-wrap leading-relaxed border border-neutral-200/60 font-sans">
                  {activeRecord.brainDump}
                </div>

                {lines.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
                      <CornerDownRight className="w-3.5 h-3.5 text-neutral-400" />
                      Promote any line to a Task Bucket:
                    </div>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {lines.map((line, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-neutral-50 text-xs border border-neutral-200/50 hover:bg-neutral-100 transition-colors"
                        >
                          <span className="truncate flex-1 text-neutral-800">{line.replace(/^[-*•]\s*/, '')}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => {
                                onPromoteLine(line.replace(/^[-*•]\s*/, ''), 'must');
                                onClose();
                              }}
                              className="px-2 py-0.5 text-[10px] bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-md font-semibold border border-rose-200"
                              title="Promote to Must Do"
                            >
                              Must
                            </button>
                            <button
                              onClick={() => {
                                onPromoteLine(line.replace(/^[-*•]\s*/, ''), 'should');
                                onClose();
                              }}
                              className="px-2 py-0.5 text-[10px] bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-md font-semibold border border-amber-200"
                              title="Promote to Should Do"
                            >
                              Should
                            </button>
                            <button
                              onClick={() => {
                                onPromoteLine(line.replace(/^[-*•]\s*/, ''), 'could');
                                onClose();
                              }}
                              className="px-2 py-0.5 text-[10px] bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-md font-semibold border border-sky-200"
                              title="Promote to Could Do"
                            >
                              Could
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-neutral-400 py-6 text-center">
                Select a recorded date to view past dumps.
              </p>
            )}
          </div>
        </div>

        <div className="px-6 py-3.5 border-t border-neutral-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-black rounded-xl shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
