import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Task, BucketType, TaskStatus } from '../types';
import {
  Plus,
  Play,
  Check,
  Search,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Clock,
  Columns,
  List,
  GripVertical,
  ArrowRight,
  ArrowUpDown,
  MoveRight,
} from 'lucide-react';
import { getTodayDateString, formatDateLabel } from '../utils/dateUtils';
import { useTaskDragAndDrop } from '../hooks/useTaskDragAndDrop';
import { motion, AnimatePresence } from 'framer-motion';

interface TasksViewProps {
  onOpenTaskModal: (task?: Task | null, defaultBucket?: BucketType) => void;
  onLaunchSprint: (task: Task) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  onOpenTaskModal,
  onLaunchSprint,
}) => {
  const {
    tasks,
    addTask,
    deleteTask,
    setTaskStatus,
    updateTask,
    projects,
    settings,
    dismissHint,
  } = useApp();

  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'sprint' | 'completed'>('all');
  const [selectedBucketFilter, setSelectedBucketFilter] = useState<'all' | BucketType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Quick Task Creation state
  const [quickTaskName, setQuickTaskName] = useState('');
  const [quickBucket, setQuickBucket] = useState<BucketType>('must');
  const [quickDuration, setQuickDuration] = useState<number>(25);

  const [showExamples, setShowExamples] = useState<Record<BucketType, boolean>>({
    must: !settings.dismissedHints['must_examples'],
    should: !settings.dismissedHints['should_examples'],
    could: !settings.dismissedHints['could_examples'],
  });

  const today = getTodayDateString();

  // Drag and Drop hook
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

  const bucketDefinitions: Record<
    BucketType,
    { title: string; subtitle: string; color: string; badgeBg: string; textColor: string; examples: string[] }
  > = {
    must: {
      title: 'Must Do',
      subtitle: 'Clear deadlines and real consequences for inaction.',
      color: '#e11d48',
      badgeBg: 'bg-rose-50 border-rose-200/80 text-rose-800',
      textColor: 'text-rose-700',
      examples: [
        'Pay critical invoices before late fees',
        'Submit quarterly report before review meeting',
        'Doctor or urgent appointment confirmation',
      ],
    },
    should: {
      title: 'Should Do',
      subtitle: 'Meaningful, joyful, easy to postpone but makes life richer.',
      color: '#f59e0b',
      badgeBg: 'bg-amber-50 border-amber-200/80 text-amber-800',
      textColor: 'text-amber-700',
      examples: [
        'Write 500 words for the personal project or book',
        'Take a 30-minute nature walk or call an old friend',
        'Study the next chapter of that design or code course',
      ],
    },
    could: {
      title: 'Could Do',
      subtitle: 'Fun, interesting activities you’d enjoy with extra time.',
      color: '#0284c7',
      badgeBg: 'bg-sky-50 border-sky-200/80 text-sky-800',
      textColor: 'text-sky-700',
      examples: [
        'Organize digital desktop wallpaper & browser bookmarks',
        'Browse design galleries for typography inspiration',
        'Explore a new podcast episode or software utility',
      ],
    },
  };

  const handleDismissExample = (bucket: BucketType) => {
    setShowExamples((prev) => ({ ...prev, [bucket]: false }));
    dismissHint(`${bucket}_examples`);
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskName.trim()) return;
    addTask({
      name: quickTaskName.trim(),
      bucket: quickBucket,
      estimatedMinutes: quickDuration,
      status: 'not_started',
      priority: quickBucket === 'must' ? 'high' : quickBucket === 'should' ? 'medium' : 'low',
      dueDate: today,
    });
    setQuickTaskName('');
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = t.name.toLowerCase().includes(query);
        const matchesNotes = t.notes?.toLowerCase().includes(query);
        if (!matchesName && !matchesNotes) return false;
      }

      if (selectedBucketFilter !== 'all' && t.bucket !== selectedBucketFilter) {
        return false;
      }

      if (activeTab === 'today') {
        return t.dueDate === today || t.status === 'in_progress';
      }
      if (activeTab === 'sprint') {
        return t.status !== 'done' && t.status !== 'skipped';
      }
      if (activeTab === 'completed') {
        return t.status === 'done';
      }

      return true;
    });
  }, [tasks, activeTab, selectedBucketFilter, searchQuery, today]);

  const projectMap = useMemo(() => {
    const map = new Map<string, string>();
    projects.forEach((p) => map.set(p.id, p.name));
    return map;
  }, [projects]);

  return (
    <div className="space-y-6">
      {/* 1. Header with Quick Task Add Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-black/[0.07] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider font-mono">
                Visual Prioritization
              </span>
              <span className="text-[10px] font-semibold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full border border-neutral-200/60 font-mono">
                Drag & Drop Enabled
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-neutral-900">
              Tasks & Buckets
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
              Prioritize with intent. Drag tasks to reorder priority within buckets or shift urgency between Must, Should, and Could.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* View Mode Toggle: Board vs List */}
            <div className="flex items-center p-1 bg-neutral-100 rounded-2xl border border-neutral-200/60">
              <button
                type="button"
                onClick={() => setViewMode('board')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  viewMode === 'board'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
                title="Board Columns View (Drag & drop within and between buckets)"
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Bucket Board</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
                title="Table Inventory View"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Inventory List</span>
              </button>
            </div>

            <button
              onClick={() => onOpenTaskModal()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-black rounded-xl transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* Inline Quick Add Form */}
        <form onSubmit={handleQuickAdd} className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-2 border-t border-neutral-100">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              value={quickTaskName}
              onChange={(e) => setQuickTaskName(e.target.value)}
              placeholder="Quick add: Type task title and press Enter..."
              className="w-full pl-3.5 pr-3 py-2 text-xs sm:text-sm rounded-xl bg-neutral-50 border border-neutral-200/80 text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-all font-sans"
            />
          </div>

          {/* Bucket selection chips */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl">
            <button
              type="button"
              onClick={() => setQuickBucket('must')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                quickBucket === 'must'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Must
            </button>
            <button
              type="button"
              onClick={() => setQuickBucket('should')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                quickBucket === 'should'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Should
            </button>
            <button
              type="button"
              onClick={() => setQuickBucket('could')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                quickBucket === 'could'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Could
            </button>
          </div>

          {/* Duration select */}
          <select
            value={quickDuration}
            onChange={(e) => setQuickDuration(Number(e.target.value))}
            className="py-1.5 px-2.5 text-xs rounded-xl bg-neutral-50 border border-neutral-200/80 text-neutral-700 font-mono"
          >
            <option value={15}>15m</option>
            <option value={25}>25m</option>
            <option value={45}>45m</option>
            <option value={60}>60m</option>
          </select>

          <button
            type="submit"
            disabled={!quickTaskName.trim()}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-neutral-900 text-white hover:bg-black disabled:opacity-40 transition-all shrink-0"
          >
            Add
          </button>
        </form>
      </div>

      {/* 2. Top Filter Bar & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Segmented Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-black/[0.04] rounded-2xl border border-black/[0.04] overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-white text-neutral-900 shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            All Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab('today')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'today'
                ? 'bg-white text-neutral-900 shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Today's Focus
          </button>
          <button
            onClick={() => setActiveTab('sprint')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'sprint'
                ? 'bg-white text-neutral-900 shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Sprint Backlog
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'completed'
                ? 'bg-white text-neutral-900 shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="text-xs pl-8 pr-3.5 py-2 rounded-xl bg-white border border-neutral-200/80 text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-neutral-900/10 focus:outline-none w-full sm:w-56 transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Minimalist Hint Bar */}
      <div className="flex items-center justify-between text-[11px] text-neutral-500 px-2 py-1">
        <span className="flex items-center gap-1.5">
          <GripVertical className="w-3.5 h-3.5 text-neutral-400" />
          <span>
            {viewMode === 'board'
              ? 'Drag tasks vertically to reprioritize within a bucket, or drop across columns to change urgency.'
              : 'Drag tasks using the handle to adjust ordering priority.'}
          </span>
        </span>
        {draggedTaskId && (
          <span className="text-neutral-800 font-medium font-mono animate-pulse">
            Drop to reposition
          </span>
        )}
      </div>

      {/* 3. VIEW MODE A: 3-BUCKET BOARD VIEW (Visual Prioritization) */}
      <AnimatePresence mode="wait">
        {viewMode === 'board' ? (
          <motion.div
            key="board-view"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start"
          >
            {(['must', 'should', 'could'] as BucketType[]).map((bucketKey, bucketIdx) => {
              const def = bucketDefinitions[bucketKey];
              const bucketTasks = filteredTasks.filter((t) => t.bucket === bucketKey);
              const doneCount = bucketTasks.filter((t) => t.status === 'done').length;
              const isColumnDragOver = dragOverBucket === bucketKey && !dragOverTaskId;

              return (
                <motion.div
                  key={bucketKey}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.28,
                    delay: bucketIdx * 0.06,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  onDragOver={(e) => handleBucketDragOver(e, bucketKey)}
                  onDrop={(e) => handleBucketDrop(e, bucketKey)}
                  className={`rounded-3xl border transition-all flex flex-col min-h-[420px] bg-white ${
                    isColumnDragOver
                      ? 'border-neutral-900 ring-2 ring-neutral-900/10 shadow-[0_8px_30px_rgba(0,0,0,0.06)] bg-neutral-50/50'
                      : 'border-black/[0.07] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-black/[0.12]'
                  }`}
                >
                  {/* Column Header */}
                  <div className="p-5 border-b border-black/[0.05]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: def.color }}
                        />
                        <h2 className="font-display text-sm font-bold text-neutral-900">
                          {def.title}
                        </h2>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono tabular-nums">
                        <span className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-md font-medium text-[11px]">
                          {doneCount}/{bucketTasks.length}
                        </span>
                        <button
                          onClick={() => onOpenTaskModal(null, bucketKey)}
                          className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-700 transition-colors"
                          title={`Add ${def.title} task`}
                          aria-label={`Add ${def.title} task`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-500 leading-relaxed">
                      {def.subtitle}
                    </p>

                    {/* Collapsible Examples */}
                    {showExamples[bucketKey] ? (
                      <div className="mt-3 bg-neutral-50 p-3 rounded-2xl text-[11px] text-neutral-800 space-y-1 border border-neutral-200/60">
                        <div className="flex items-center justify-between font-semibold text-neutral-600 mb-1">
                          <span>Examples:</span>
                          <button
                            onClick={() => handleDismissExample(bucketKey)}
                            className="text-neutral-400 hover:text-neutral-900"
                          >
                            Hide
                          </button>
                        </div>
                        <ul className="space-y-1 text-neutral-600">
                          {def.examples.map((ex, idx) => (
                            <li key={idx} className="leading-snug">· {ex}</li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowExamples((prev) => ({ ...prev, [bucketKey]: true }))}
                        className="mt-2 text-[11px] text-neutral-400 hover:text-neutral-900 flex items-center gap-1 font-medium transition-colors"
                      >
                        <ChevronDown className="w-3 h-3" />
                        <span>Show examples</span>
                      </button>
                    )}
                  </div>

                  {/* Draggable Task Cards Container */}
                  <div className="p-3 sm:p-4 flex-1 space-y-2.5 overflow-y-auto max-h-[600px]">
                    {bucketTasks.length === 0 ? (
                      <div
                        onDragOver={(e) => handleBucketDragOver(e, bucketKey)}
                        onDrop={(e) => handleBucketDrop(e, bucketKey)}
                        className="h-36 border-2 border-dashed border-neutral-200 rounded-2xl flex flex-col items-center justify-center text-center p-4 text-xs text-neutral-400 hover:border-neutral-300 transition-colors"
                      >
                        <p className="font-medium text-neutral-600">No {def.title} tasks</p>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          Drop any task card here or click + above
                        </p>
                      </div>
                    ) : (
                      <AnimatePresence mode="popLayout">
                        {bucketTasks.map((task, taskIdx) => {
                          const isDone = task.status === 'done';
                          const isSkipped = task.status === 'skipped';
                          const isBeingDragged = draggedTaskId === task.id;
                          const isDragOverThis = dragOverTaskId === task.id;
                          const projectName = task.projectId ? projectMap.get(task.projectId) : undefined;

                          return (
                            <motion.div
                              key={task.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.96 }}
                              transition={{
                                duration: 0.22,
                                delay: Math.min(taskIdx * 0.03, 0.2),
                                ease: [0.16, 1, 0.3, 1],
                              }}
                            >
                              {/* Drop Indicator Line (Before) */}
                              {isDragOverThis && dragOverPosition === 'before' && (
                                <div className="h-1 bg-neutral-900 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.3)] transition-all animate-pulse my-1" />
                              )}

                              <div
                                draggable={true}
                                onDragStart={(e) => handleDragStart(e, task.id)}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) => handleTaskDragOver(e, task.id, task.bucket)}
                                onDrop={(e) => handleTaskDrop(e, task.id)}
                                className={`group relative rounded-2xl p-3.5 border transition-all ${
                                  isBeingDragged
                                    ? 'opacity-30 border-dashed border-neutral-400 scale-[0.98] bg-neutral-50'
                                    : isDone
                                    ? 'bg-neutral-50/60 border-neutral-200/60 opacity-60'
                                    : 'bg-white border-neutral-200/70 hover:border-black/[0.16] shadow-xs hover:shadow-sm'
                                }`}
                              >
                                <div className="flex items-start gap-2.5">
                                  {/* Grip Handle */}
                                  <div
                                    className="mt-0.5 text-neutral-300 group-hover:text-neutral-600 cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-neutral-100 transition-colors shrink-0"
                                    title="Drag to reorder or move bucket"
                                  >
                                    <GripVertical className="w-4 h-4" />
                                  </div>

                                  {/* Done Checkbox */}
                                  <button
                                    type="button"
                                    onClick={() => setTaskStatus(task.id, isDone ? 'not_started' : 'done')}
                                    className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                                      isDone
                                        ? 'bg-emerald-500 text-white shadow-xs'
                                        : 'border-2 border-neutral-300 hover:border-neutral-400 bg-white text-transparent'
                                    }`}
                                    aria-label="Toggle task done"
                                  >
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  </button>

                                  {/* Task Content */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <p
                                        className={`text-xs font-medium leading-snug break-words ${
                                          isDone ? 'line-through text-neutral-400' : 'text-neutral-900'
                                        }`}
                                      >
                                        {task.name}
                                      </p>

                                      {/* Quick sprint play button */}
                                      {!isDone && !isSkipped && (
                                        <button
                                          onClick={() => onLaunchSprint(task)}
                                          className="opacity-0 group-hover:opacity-100 p-1 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all shrink-0"
                                          title="Launch focus sprint"
                                          aria-label="Launch focus sprint"
                                        >
                                          <Play className="w-3 h-3 fill-emerald-600" />
                                        </button>
                                      )}
                                    </div>

                                    {/* Metadata Pill Row */}
                                    <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[10px] text-neutral-500 font-mono">
                                      {task.estimatedMinutes && (
                                        <span className="flex items-center gap-1 bg-neutral-100 px-2 py-0.5 rounded-md text-neutral-700 font-medium">
                                          <Clock className="w-2.5 h-2.5 text-neutral-400" />
                                          {task.estimatedMinutes}m
                                        </span>
                                      )}
                                      {projectName && (
                                        <span className="bg-neutral-100 px-2 py-0.5 rounded-md text-neutral-700 font-medium truncate max-w-[120px]">
                                          {projectName}
                                        </span>
                                      )}
                                      {task.dueDate && (
                                        <span className="text-neutral-500">
                                          {formatDateLabel(task.dueDate)}
                                        </span>
                                      )}
                                    </div>

                                    {task.notes && (
                                      <p className="text-[11px] text-neutral-400 italic line-clamp-2 mt-1.5 font-normal">
                                        {task.notes}
                                      </p>
                                    )}

                                    {/* Card Footer Actions */}
                                    <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px]">
                                      {/* Quick Move Bucket Dropdown */}
                                      <select
                                        value={task.bucket}
                                        onChange={(e) => updateTask(task.id, { bucket: e.target.value as BucketType })}
                                        className="text-[10px] py-0.5 px-1.5 rounded-md bg-neutral-50 border border-neutral-200/80 text-neutral-600 font-mono uppercase font-semibold hover:bg-neutral-100"
                                        title="Change bucket"
                                      >
                                        <option value="must">Must</option>
                                        <option value="should">Should</option>
                                        <option value="could">Could</option>
                                      </select>

                                      <div className="flex items-center gap-1 text-neutral-400">
                                        <button
                                          onClick={() => onOpenTaskModal(task)}
                                          className="p-1 hover:text-neutral-900 rounded hover:bg-neutral-100 transition-colors"
                                          title="Edit task"
                                        >
                                          <Edit2 className="w-3 h-3" />
                                        </button>
                                        <button
                                          onClick={() => deleteTask(task.id)}
                                          className="p-1 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                                          title="Delete task"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Drop Indicator Line (After) */}
                              {isDragOverThis && dragOverPosition === 'after' && (
                                <div className="h-1 bg-neutral-900 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.3)] transition-all animate-pulse my-1" />
                              )}
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          /* 4. VIEW MODE B: TASK INVENTORY LIST */
          <motion.div
            key="list-view"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-3xl border border-black/[0.07] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-black/[0.05] flex items-center justify-between text-xs text-neutral-500">
              <div className="flex items-center gap-2">
                <span className="font-display text-xs font-bold text-neutral-900">Task Inventory</span>
                <span>·</span>
                <span className="font-mono tabular-nums">{filteredTasks.length} task{filteredTasks.length === 1 ? '' : 's'}</span>
                {selectedBucketFilter !== 'all' && (
                  <>
                    <span>·</span>
                    <span className="capitalize font-semibold text-neutral-900">{selectedBucketFilter} Do only</span>
                    <button
                      onClick={() => setSelectedBucketFilter('all')}
                      className="text-neutral-900 underline font-medium ml-1"
                    >
                      Clear filter
                    </button>
                  </>
                )}
              </div>
              <span className="text-[11px] text-neutral-400 font-mono">
                Drag handles to reorder
              </span>
            </div>

            {filteredTasks.length === 0 ? (
              <div className="text-center py-16 px-4">
                <p className="font-display text-base font-bold text-neutral-900">No tasks in this view</p>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  Add a task with the quick entry bar above or launch a sprint with freeform focus.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-black/[0.04]">
                <AnimatePresence mode="popLayout">
                  {filteredTasks.map((task, taskIdx) => {
                    const isDone = task.status === 'done';
                    const isSkipped = task.status === 'skipped';
                    const isBeingDragged = draggedTaskId === task.id;
                    const isDragOverThis = dragOverTaskId === task.id;
                    const projectName = task.projectId ? projectMap.get(task.projectId) : undefined;
                    const bucketDef = bucketDefinitions[task.bucket];

                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{
                          duration: 0.2,
                          delay: Math.min(taskIdx * 0.02, 0.15),
                          ease: [0.16, 1, 0.3, 1],
                        }}
                      >
                        {/* Drop Indicator (Before) */}
                        {isDragOverThis && dragOverPosition === 'before' && (
                          <div className="h-1 bg-neutral-900 mx-4 rounded-full shadow-xs transition-all animate-pulse" />
                        )}

                        <div
                          draggable={true}
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onDragEnd={handleDragEnd}
                          onDragOver={(e) => handleTaskDragOver(e, task.id, task.bucket)}
                          onDrop={(e) => handleTaskDrop(e, task.id)}
                          className={`px-5 sm:px-6 py-3.5 flex items-center justify-between gap-3 hover:bg-neutral-50/80 transition-colors ${
                            isBeingDragged
                              ? 'opacity-30 border-dashed border-neutral-400 bg-neutral-50'
                              : isDone
                              ? 'opacity-50 bg-neutral-50/40'
                              : ''
                          }`}
                        >
                          {/* Left: Drag Handle, Status Check & Name */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div
                              className="text-neutral-300 hover:text-neutral-700 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-neutral-100 transition-colors shrink-0"
                              title="Drag to reorder"
                            >
                              <GripVertical className="w-4 h-4" />
                            </div>

                            <button
                              type="button"
                              onClick={() => setTaskStatus(task.id, isDone ? 'not_started' : 'done')}
                              className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                                isDone
                                  ? 'bg-emerald-500 text-white shadow-xs'
                                  : 'border-2 border-neutral-300 hover:border-neutral-400 bg-white text-transparent'
                              }`}
                              aria-label="Toggle task status"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </button>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-sm font-medium leading-snug truncate ${
                                    isDone ? 'text-neutral-400 line-through' : 'text-neutral-900'
                                  }`}
                                >
                                  {task.name}
                                </span>

                                {/* Bucket badge */}
                                <span className={`text-[10px] font-semibold font-mono uppercase px-2 py-0.5 rounded-md border shrink-0 ${bucketDef.badgeBg}`}>
                                  {task.bucket}
                                </span>

                                {isSkipped && (
                                  <span className="text-[11px] text-neutral-500 italic">
                                    (Skipped)
                                  </span>
                                )}
                              </div>

                              {/* Metadata row */}
                              <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-1 truncate">
                                {task.estimatedMinutes && (
                                  <span className="font-mono tabular-nums flex items-center gap-1 text-neutral-600">
                                    <Clock className="w-3 h-3 text-neutral-400" />
                                    {task.estimatedMinutes}m est
                                  </span>
                                )}
                                {task.dueDate && (
                                  <>
                                    <span aria-hidden="true" className="text-black/20">·</span>
                                    <span>Due {formatDateLabel(task.dueDate)}</span>
                                  </>
                                )}
                                {projectName && (
                                  <>
                                    <span aria-hidden="true" className="text-black/20">·</span>
                                    <span className="text-neutral-800 font-medium">{projectName}</span>
                                  </>
                                )}
                                {task.notes && (
                                  <>
                                    <span aria-hidden="true" className="text-black/20">·</span>
                                    <span className="italic text-neutral-400 truncate max-w-[200px]">
                                      {task.notes}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            {!isDone && !isSkipped && (
                              <button
                                onClick={() => onLaunchSprint(task)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200/60"
                                title="Start focus sprint with this task"
                              >
                                <Play className="w-3 h-3 fill-emerald-800" />
                                <span className="hidden sm:inline">Sprint</span>
                              </button>
                            )}

                            <select
                              value={task.status}
                              onChange={(e) => setTaskStatus(task.id, e.target.value as TaskStatus)}
                              className="text-xs bg-neutral-100 text-neutral-800 border-0 rounded-xl px-2.5 py-1.5 font-medium focus:ring-1 focus:ring-neutral-400"
                            >
                              <option value="not_started">Not started</option>
                              <option value="in_progress">In progress</option>
                              <option value="done">Done</option>
                              <option value="skipped">Skipped</option>
                            </select>

                            <button
                              onClick={() => onOpenTaskModal(task)}
                              className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
                              title="Edit task"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => deleteTask(task.id)}
                              className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                              title="Delete task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Drop Indicator (After) */}
                        {isDragOverThis && dragOverPosition === 'after' && (
                          <div className="h-1 bg-neutral-900 mx-4 rounded-full shadow-xs transition-all animate-pulse" />
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
