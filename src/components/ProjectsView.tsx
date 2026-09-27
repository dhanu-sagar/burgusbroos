import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Project, Task, BucketType } from '../types';
import {
  Plus,
  Folder,
  Check,
  Play,
  X,
  Edit2,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import { formatDateLabel } from '../utils/dateUtils';

interface ProjectsViewProps {
  onOpenTaskModal: (task?: Task | null, defaultBucket?: BucketType) => void;
  onLaunchSprint: (task?: Task) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  onOpenTaskModal,
  onLaunchSprint,
}) => {
  const {
    projects,
    tasks,
    addProject,
    updateProject,
    deleteProject,
    getProjectStats,
    setTaskStatus,
  } = useApp();

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    projects.length > 0 ? projects[0].id : null
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [color, setColor] = useState('#0284c7');

  const handleOpenAdd = () => {
    setEditingProject(null);
    setName('');
    setDescription('');
    setTargetDate('');
    setColor('#0284c7');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(p);
    setName(p.name);
    setDescription(p.description || '');
    setTargetDate(p.targetDate || '');
    setColor(p.color || '#0284c7');
    setIsModalOpen(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingProject) {
      updateProject(editingProject.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        targetDate: targetDate || undefined,
        color,
      });
    } else {
      addProject({
        name: name.trim(),
        description: description.trim() || undefined,
        targetDate: targetDate || undefined,
        color,
      });
    }
    setIsModalOpen(false);
  };

  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const activeStats = activeProject ? getProjectStats(activeProject.id) : null;
  const activeTasks = activeProject ? tasks.filter((t) => t.projectId === activeProject.id) : [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-black/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider font-mono">
              Auto-Updating Containers
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-[#111111]">
            Projects
          </h1>
          <p className="text-xs sm:text-sm text-[#737373] mt-1 font-normal leading-relaxed">
            Progress and focus duration calculate automatically from your sprint logs and task completion.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#111111] hover:bg-black rounded-full transition-all shadow-xs self-start sm:self-auto hover:scale-[1.01]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Project</span>
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-3xl border border-black/[0.06] p-16 text-center shadow-[0_2px_16px_rgba(0,0,0,0.02)]">
          <Folder className="w-10 h-10 text-[#737373] mx-auto mb-3 opacity-40" />
          <p className="font-display text-base font-bold text-[#111111]">No projects created yet</p>
          <p className="text-xs text-[#737373] mt-1 max-w-sm mx-auto">
            Group tasks across Must, Should, and Could Do buckets under clean project umbrellas.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 px-5 py-2 text-xs font-semibold text-white bg-[#111111] hover:bg-black rounded-full"
          >
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Projects Sidebar */}
          <div className="space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#737373] px-1 font-semibold">
              Project Containers ({projects.length})
            </div>

            <div className="space-y-2.5">
              {projects.map((proj) => {
                const stats = getProjectStats(proj.id);
                const isSelected = activeProject?.id === proj.id;

                return (
                  <div
                    key={proj.id}
                    onClick={() => setSelectedProjectId(proj.id)}
                    className={`cursor-pointer rounded-3xl p-4 sm:p-5 transition-all text-left group border ${
                      isSelected
                        ? 'border-black/30 bg-white ring-2 ring-black/10 shadow-[0_4px_24px_rgba(0,0,0,0.06)]'
                        : 'border-black/[0.06] bg-white shadow-[0_2px_16px_rgba(0,0,0,0.02)] hover:border-black/[0.12]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: proj.color || '#0284c7' }}
                        />
                        <h3 className="font-display text-sm font-bold text-[#111111] truncate">
                          {proj.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleOpenEdit(proj, e)}
                          className="p-1 text-[#737373] hover:text-[#111111] rounded-full hover:bg-black/[0.04]"
                          title="Edit"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteProject(proj.id);
                          }}
                          className="p-1 text-[#737373] hover:text-rose-600 rounded-full hover:bg-black/[0.04]"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {proj.description && (
                      <p className="text-xs text-[#737373] line-clamp-1 mb-3 font-normal">
                        {proj.description}
                      </p>
                    )}

                    <div className="space-y-1.5 mt-2">
                      <div className="h-1.5 w-full bg-black/[0.05] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#111111] transition-all duration-300"
                          style={{ width: `${stats.progressPercent}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#737373] font-mono tabular-nums">
                        <span>{stats.completedTasks}/{stats.totalTasks} tasks</span>
                        <span>{stats.progressPercent}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Project Detail */}
          {activeProject && activeStats && (
            <div className="lg:col-span-2 bg-white rounded-3xl border border-black/[0.06] p-6 sm:p-7 shadow-[0_2px_16px_rgba(0,0,0,0.02)] space-y-6">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: activeProject.color || '#0284c7' }}
                    />
                    <h2 className="font-display text-xl font-bold text-[#111111] tracking-tight">
                      {activeProject.name}
                    </h2>
                  </div>

                  <button
                    onClick={() => onOpenTaskModal(null, 'must')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#111111] bg-[#f5f5f5] hover:bg-black/[0.08] rounded-full transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Task</span>
                  </button>
                </div>

                {activeProject.description && (
                  <p className="text-xs text-[#737373] mt-2 leading-relaxed font-normal">
                    {activeProject.description}
                  </p>
                )}

                {/* Auto Status Line */}
                <div className="mt-4 p-4 bg-[#fafafa] rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs text-[#111111] border border-black/[0.03]">
                  <span>
                    <strong>Computed Status:</strong> {activeStats.statusLine}
                  </span>
                  {activeProject.targetDate && (
                    <span className="text-[#737373] font-mono">
                      Target: {formatDateLabel(activeProject.targetDate)}
                    </span>
                  )}
                </div>
              </div>

              {/* Tasks List for Project */}
              <div>
                <div className="flex items-center justify-between mb-3 text-xs text-[#737373]">
                  <span className="font-display text-xs font-bold text-[#111111] uppercase tracking-wider">
                    Linked Tasks ({activeTasks.length})
                  </span>
                  <span>Across all buckets</span>
                </div>

                {activeTasks.length === 0 ? (
                  <div className="text-center py-10 bg-[#fafafa] rounded-2xl text-xs text-[#737373]">
                    No tasks linked to this project yet. Add one above to start tracking.
                  </div>
                ) : (
                  <div className="divide-y divide-black/[0.03] border border-black/[0.04] rounded-2xl overflow-hidden">
                    {activeTasks.map((task) => {
                      const isDone = task.status === 'done';
                      return (
                        <div
                          key={task.id}
                          className="px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-[#fafafa]/80 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <button
                              onClick={() => setTaskStatus(task.id, isDone ? 'not_started' : 'done')}
                              className={`w-5 h-5 rounded-full flex items-center justify-center transition-all shrink-0 ${
                                isDone
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'border-2 border-black/20 hover:border-black/50 bg-white'
                              }`}
                            >
                              {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                            </button>
                            <span
                              className={`text-xs sm:text-sm font-medium truncate ${
                                isDone ? 'text-[#a3a3a3] line-through' : 'text-[#111111]'
                              }`}
                            >
                              {task.name}
                            </span>
                            <span className="text-[11px] text-[#737373] capitalize shrink-0 font-normal">
                              · {task.bucket} Do
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {!isDone && (
                              <button
                                onClick={() => onLaunchSprint(task)}
                                className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-500/10 px-3 py-1 rounded-full transition-colors"
                              >
                                <Play className="w-2.5 h-2.5 fill-emerald-800" />
                                <span>Sprint</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl border border-black/[0.06] w-full max-w-md overflow-hidden animate-in fade-in duration-150">
            <div className="px-6 py-4 border-b border-black/[0.04] flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-[#111111]">
                {editingProject ? 'Edit Project' : 'New Project'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#737373] hover:text-[#111111] rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Design System Overhaul"
                  className="w-full text-xs sm:text-sm px-4 py-3 rounded-2xl bg-[#fafafa] border border-black/[0.04] text-[#111111] focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 font-medium"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this container aimed at accomplishing?"
                  className="w-full text-xs sm:text-sm px-4 py-3 rounded-2xl bg-[#fafafa] border border-black/[0.04] text-[#111111] focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 leading-relaxed font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Target Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-2xl bg-[#fafafa] border border-black/[0.04] text-[#111111]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-2 pt-1.5">
                    {['#0284c7', '#16a34a', '#d97706', '#9333ea', '#e11d48'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-6 h-6 rounded-full transition-transform ${
                          color === c ? 'scale-125 ring-2 ring-black/20 ring-offset-2' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#737373] hover:text-[#111111]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#111111] hover:bg-black rounded-full"
                >
                  {editingProject ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
