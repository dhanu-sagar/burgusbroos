import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Flame, Check } from 'lucide-react';
import { getTodayDateString } from '../utils/dateUtils';

interface HabitsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HabitsModal: React.FC<HabitsModalProps> = ({ isOpen, onClose }) => {
  const { habits, addHabit, toggleHabitToday } = useApp();
  const [newHabitName, setNewHabitName] = useState('');
  const today = getTodayDateString();

  if (!isOpen) return null;

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    addHabit(newHabitName.trim());
    setNewHabitName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
      <div className="bg-white rounded-3xl shadow-2xl border border-black/[0.08] w-full max-w-md overflow-hidden animate-in fade-in duration-150">
        <div className="px-6 py-4 border-b border-black/[0.05] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <h3 className="font-display text-base font-bold text-neutral-900">
              Gentle Habits & Streaks
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-900 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-neutral-500 leading-relaxed font-normal">
            Streaks reset quietly without guilt or red failure marks. A missed day is simply a rest day — your all-time best streak remains honored.
          </p>

          <form onSubmit={handleAddHabit} className="flex gap-2">
            <input
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="e.g. 2-min neck stretch or drink water"
              className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80 text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
            />
            <button
              type="submit"
              className="px-4 py-2.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-black rounded-xl transition-all whitespace-nowrap shadow-xs"
            >
              Add
            </button>
          </form>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {habits.length === 0 ? (
              <p className="text-xs text-neutral-400 text-center py-6">
                No habits added yet.
              </p>
            ) : (
              habits.map((habit) => {
                const isDoneToday = habit.lastCompletedDate === today;

                return (
                  <div
                    key={habit.id}
                    className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200/60 flex items-center justify-between gap-3 hover:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        onClick={() => toggleHabitToday(habit.id)}
                        className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                          isDoneToday
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'border-2 border-neutral-300 hover:border-neutral-400 bg-white text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>

                      <div className="min-w-0">
                        <p className={`text-xs font-medium truncate ${isDoneToday ? 'text-neutral-400 line-through' : 'text-neutral-900'}`}>
                          {habit.name}
                        </p>
                        <div className="text-[11px] text-neutral-400 font-mono">
                          {isDoneToday ? (
                            <span className="text-emerald-700 font-semibold">Done today ✨</span>
                          ) : (
                            <span>Pending today</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-xs font-semibold font-mono tabular-nums text-neutral-900">
                        <span>🔥</span>
                        <span>{habit.currentStreak} Streak</span>
                      </div>
                      <div className="text-[10px] text-neutral-400 font-mono tabular-nums">
                        Best: {habit.bestStreak}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-2 border-t border-neutral-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-black rounded-xl shadow-xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
