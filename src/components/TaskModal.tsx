import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Task, BucketType, TaskStatus, TaskPriority } from '../types';
import { X, Calendar, Flag, Folder, Check } from 'lucide-react';
import { getTodayDateString } from '../utils/dateUtils';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
  defaultBucket?: BucketType;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
  defaultBucket = 'must',
}) => {
  const { addTask, updateTask, projects } = useApp();

  const [name, setName] = useState('');
  const [bucket, setBucket] = useState<BucketType>(defaultBucket);
  const [status, setStatus] = useState<TaskStatus>('not_started');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState<string>(getTodayDateString());
  const [projectId, setProjectId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(25);

  useEffect(() => {
    if (taskToEdit) {
      setName(taskToEdit.name);
      setBucket(taskToEdit.bucket);
      setStatus(taskToEdit.status);
      setPriority(taskToEdit.priority || 'medium');
      setDueDate(taskToEdit.dueDate || '');
      setProjectId(taskToEdit.projectId || '');
      setNotes(taskToEdit.notes || '');
      setEstimatedMinutes(taskToEdit.estimatedMinutes || 25);
    } else {
      setName('');
      setBucket(defaultBucket);
      setStatus('not_started');
      setPriority(defaultBucket === 'must' ? 'high' : defaultBucket === 'should' ? 'medium' : 'low');
      setDueDate(getTodayDateString());
      setProjectId('');
      setNotes('');
      setEstimatedMinutes(25);
    }
  }, [taskToEdit, defaultBucket, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (taskToEdit) {
      updateTask(taskToEdit.id, {
        name: name.trim(),
        bucket,
        status,
        priority,
        dueDate: dueDate || undefined,
        projectId: projectId || undefined,
        notes: notes.trim() || undefined,
        estimatedMinutes: estimatedMinutes || undefined,
      });
    } else {
      addTask({
        name: name.trim(),
        bucket,
        status,
        priority,
        dueDate: dueDate || undefined,
        projectId: projectId || undefined,
        notes: notes.trim() || undefined,
        estimatedMinutes: estimatedMinutes || undefined,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
      <div className="bg-white rounded-3xl shadow-2xl border border-black/[0.08] w-full max-w-lg overflow-hidden animate-in fade-in duration-150">
        <div className="px-6 py-4 border-b border-black/[0.05] flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-neutral-900">
            {taskToEdit ? 'Edit Task' : 'New Task'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-900 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-900 mb-1">
              Task Title
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Finalize Q3 revenue presentation slides"
              className="w-full text-xs sm:text-sm px-4 py-3 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 font-medium"
              autoFocus
            />
          </div>

          {/* Three Buckets Selector with Clear Descriptions */}
          <div>
            <label className="block text-xs font-semibold text-neutral-900 mb-2">
              Select Priority Bucket
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setBucket('must')}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  bucket === 'must'
                    ? 'border-rose-500 bg-rose-50/70 ring-1 ring-rose-500 text-rose-900 shadow-xs'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center gap-1.5 font-display text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Must Do</span>
                </div>
                <div className="text-[10px] text-neutral-500 mt-1 leading-tight">
                  Deadlines & real consequences
                </div>
              </button>

              <button
                type="button"
                onClick={() => setBucket('should')}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  bucket === 'should'
                    ? 'border-amber-500 bg-amber-50/70 ring-1 ring-amber-500 text-amber-900 shadow-xs'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center gap-1.5 font-display text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Should Do</span>
                </div>
                <div className="text-[10px] text-neutral-500 mt-1 leading-tight">
                  Meaningful, joyful, enriches life
                </div>
              </button>

              <button
                type="button"
                onClick={() => setBucket('could')}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  bucket === 'could'
                    ? 'border-sky-500 bg-sky-50/70 ring-1 ring-sky-500 text-sky-900 shadow-xs'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center gap-1.5 font-display text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  <span>Could Do</span>
                </div>
                <div className="text-[10px] text-neutral-500 mt-1 leading-tight">
                  Curiosity & fun with extra bandwidth
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-900 mb-1">
                Estimated Minutes
              </label>
              <input
                type="number"
                min={5}
                max={480}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80 text-neutral-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-900 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80 text-neutral-900"
              />
            </div>
          </div>

          {projects.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-neutral-900 mb-1">
                Project Container (Optional)
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80 text-neutral-900"
              >
                <option value="">No Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-900 mb-1">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any context, sub-bullets, or links..."
              className="w-full text-xs p-3 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 font-sans leading-relaxed"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-black rounded-xl shadow-xs transition-all"
            >
              {taskToEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
