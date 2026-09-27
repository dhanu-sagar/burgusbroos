import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_provider.dart';
import '../constants/theme.dart';
import '../models/models.dart';
import '../widgets/task_modal.dart';

class ProjectsView extends StatefulWidget {
  final Function(TaskItem) onLaunchSprint;

  const ProjectsView({Key? key, required this.onLaunchSprint}) : super(key: key);

  @override
  State<ProjectsView> createState() => _ProjectsViewState();
}

class _ProjectsViewState extends State<ProjectsView> {
  String? _selectedProjectId;

  void _showProjectDialog(BuildContext context, {Project? projectToEdit}) {
    final nameController = TextEditingController(text: projectToEdit?.name ?? '');
    final descController = TextEditingController(text: projectToEdit?.description ?? '');
    final targetDateController = TextEditingController(text: projectToEdit?.targetDate ?? '');
    String selectedColor = projectToEdit?.color ?? '#6366F1';

    final colors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#06B6D4'];

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDlgState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Text(projectToEdit == null ? 'New Project Container' : 'Edit Project'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                TextField(
                  controller: nameController,
                  autofocus: true,
                  decoration: const InputDecoration(
                    labelText: 'Project Name *',
                    hintText: 'e.g., Deep Work System',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: descController,
                  decoration: const InputDecoration(
                    labelText: 'Description',
                    hintText: 'Brief summary of the outcome',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: targetDateController,
                  decoration: const InputDecoration(
                    labelText: 'Target Date (YYYY-MM-DD)',
                    hintText: '2026-10-15',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 16),
                const Text('Accent Color', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                const SizedBox(height: 8),
                Row(
                  children: colors.map((c) {
                    final isSel = selectedColor == c;
                    final colVal = Color(int.parse(c.replaceAll('#', '0xFF')));
                    return GestureDetector(
                      onTap: () => setDlgState(() => selectedColor = c),
                      child: Container(
                        margin: const EdgeInsets.only(right: 8),
                        width: 28,
                        height: 28,
                        decoration: BoxDecoration(
                          color: colVal,
                          shape: BoxShape.circle,
                          border: isSel ? Border.all(color: Colors.black87, width: 3) : null,
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                final name = nameController.text.trim();
                if (name.isEmpty) return;
                final app = context.read<AppProvider>();

                if (projectToEdit != null) {
                  app.updateProject(
                    projectToEdit.id,
                    name: name,
                    description: descController.text.trim().isEmpty ? null : descController.text.trim(),
                    targetDate: targetDateController.text.trim().isEmpty ? null : targetDateController.text.trim(),
                    color: selectedColor,
                  );
                } else {
                  app.addProject(
                    name,
                    description: descController.text.trim().isEmpty ? null : descController.text.trim(),
                    targetDate: targetDateController.text.trim().isEmpty ? null : targetDateController.text.trim(),
                    color: selectedColor,
                  );
                }
                Navigator.of(ctx).pop();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.bucketMust,
                foregroundColor: Colors.white,
              ),
              child: const Text('Save'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final projects = app.projects;

    if (projects.isNotEmpty && _selectedProjectId == null) {
      _selectedProjectId = projects.first.id;
    }

    final activeProject = projects.where((p) => p.id == _selectedProjectId).isNotEmpty
        ? projects.firstWhere((p) => p.id == _selectedProjectId)
        : (projects.isNotEmpty ? projects.first : null);

    final projectTasks = activeProject != null
        ? app.tasks.where((t) => t.projectId == activeProject.id).toList()
        : <TaskItem>[];

    final stats = activeProject != null ? app.getProjectStats(activeProject.id) : null;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 880),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header (Responsive Wrap)
              Wrap(
                alignment: WrapAlignment.spaceBetween,
                crossAxisAlignment: WrapCrossAlignment.center,
                spacing: 12,
                runSpacing: 10,
                children: [
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Project Containers',
                        style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Group actions into intentional momentum outcomes',
                        style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                  ElevatedButton.icon(
                    onPressed: () => _showProjectDialog(context),
                    icon: const Icon(Icons.add_rounded, size: 18),
                    label: const Text('New Project'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.bucketMust,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Project Cards Slider / List
              if (projects.isEmpty)
                Container(
                  padding: const EdgeInsets.all(32),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.cardBorder),
                  ),
                  child: const Center(
                    child: Text('No projects created yet. Tap "+ New Project" to get started.'),
                  ),
                )
              else
                SizedBox(
                  height: 125,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: projects.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 12),
                    itemBuilder: (context, index) {
                      final p = projects[index];
                      final isSelected = p.id == activeProject?.id;
                      final pStats = app.getProjectStats(p.id);
                      final pColor = Color(int.parse(p.color.replaceAll('#', '0xFF')));

                      return GestureDetector(
                        onTap: () => setState(() => _selectedProjectId = p.id),
                        child: Container(
                          width: 220,
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: isSelected ? pColor.withOpacity(0.08) : AppColors.surface,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: isSelected ? pColor : AppColors.cardBorder,
                              width: isSelected ? 2 : 1,
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    width: 10,
                                    height: 10,
                                    decoration: BoxDecoration(color: pColor, shape: BoxShape.circle),
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      p.name,
                                      style: TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w700,
                                        color: isSelected ? pColor : AppColors.textPrimary,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(4),
                                    child: LinearProgressIndicator(
                                      value: pStats['progress'] as double,
                                      backgroundColor: AppColors.neutral100,
                                      valueColor: AlwaysStoppedAnimation<Color>(pColor),
                                      minHeight: 5,
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        '${pStats['done']}/${pStats['total']} tasks',
                                        style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                                      ),
                                      Text(
                                        '${((pStats['progress'] as double) * 100).round()}%',
                                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: pColor),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
              const SizedBox(height: 24),

              // Active Project Detail & Tasks
              if (activeProject != null) ...[
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppColors.cardBorder),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  activeProject.name,
                                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                                ),
                                if (activeProject.description != null && activeProject.description!.isNotEmpty)
                                  Padding(
                                    padding: const EdgeInsets.only(top: 4),
                                    child: Text(
                                      activeProject.description!,
                                      style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                                    ),
                                  ),
                              ],
                            ),
                          ),
                          Row(
                            children: [
                              IconButton(
                                icon: const Icon(Icons.edit_outlined, size: 18, color: AppColors.textSecondary),
                                tooltip: 'Edit Project',
                                onPressed: () => _showProjectDialog(context, projectToEdit: activeProject),
                              ),
                              IconButton(
                                icon: const Icon(Icons.delete_outline, size: 18, color: Colors.redAccent),
                                tooltip: 'Delete Project',
                                onPressed: () {
                                  app.deleteProject(activeProject.id);
                                  setState(() => _selectedProjectId = null);
                                },
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Wrap(
                        spacing: 20,
                        runSpacing: 10,
                        children: [
                          _buildMetric('Total Tasks', '${stats!['total']}'),
                          _buildMetric('Completed', '${stats['done']}'),
                          _buildMetric('Focus Logged', '${stats['focusMinutes']} min'),
                        ],
                      ),
                      const SizedBox(height: 20),
                      const Divider(height: 1, color: AppColors.cardBorder),
                      const SizedBox(height: 16),

                      // Tasks in this project
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Expanded(
                            child: Text(
                              'Associated Tasks',
                              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 8),
                          TextButton.icon(
                            onPressed: () => TaskModal.show(context),
                            icon: const Icon(Icons.add_rounded, size: 16),
                            label: const Text('Add Task', style: TextStyle(fontSize: 12)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),

                      if (projectTasks.isEmpty)
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 24),
                          child: Center(
                            child: Text(
                              'No tasks linked to this project yet. Tap "+ Add Task" to link one!',
                              style: TextStyle(fontSize: 13, color: AppColors.textMuted),
                            ),
                          ),
                        )
                      else
                        ListView.separated(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: projectTasks.length,
                          separatorBuilder: (_, __) => const Divider(height: 1, color: AppColors.cardBorder),
                          itemBuilder: (context, index) {
                            final task = projectTasks[index];
                            return Padding(
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              child: Row(
                                children: [
                                  Checkbox(
                                    value: task.status == TaskStatus.done,
                                    activeColor: AppColors.bucketMust,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                                    onChanged: (val) {
                                      app.setTaskStatus(task.id, val == true ? TaskStatus.done : TaskStatus.not_started);
                                    },
                                  ),
                                  Expanded(
                                    child: GestureDetector(
                                      onTap: () => TaskModal.show(context, taskToEdit: task, defaultBucket: task.bucket),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            task.name,
                                            style: TextStyle(
                                              fontSize: 13,
                                              fontWeight: FontWeight.w600,
                                              decoration: task.status == TaskStatus.done ? TextDecoration.lineThrough : null,
                                              color: task.status == TaskStatus.done ? AppColors.textMuted : AppColors.textPrimary,
                                            ),
                                          ),
                                          Row(
                                            children: [
                                              Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                                decoration: BoxDecoration(
                                                  color: task.bucket == BucketType.must
                                                      ? AppColors.bucketMustBg
                                                      : (task.bucket == BucketType.should ? AppColors.bucketShouldBg : AppColors.bucketCouldBg),
                                                  borderRadius: BorderRadius.circular(4),
                                                ),
                                                child: Text(
                                                  task.bucket.name.toUpperCase(),
                                                  style: TextStyle(
                                                    fontSize: 9,
                                                    fontWeight: FontWeight.w700,
                                                    color: task.bucket == BucketType.must
                                                        ? AppColors.bucketMust
                                                        : (task.bucket == BucketType.should ? AppColors.bucketShould : AppColors.bucketCould),
                                                  ),
                                                ),
                                              ),
                                              if (task.estimatedMinutes != null) ...[
                                                const SizedBox(width: 8),
                                                Text(
                                                  '${task.estimatedMinutes}m',
                                                  style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                                                ),
                                              ],
                                            ],
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                  IconButton(
                                    icon: const Icon(Icons.play_circle_outline_rounded, color: AppColors.bucketMust),
                                    tooltip: 'Start Focus Sprint',
                                    onPressed: () => widget.onLaunchSprint(task),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMetric(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
        const SizedBox(height: 2),
        Text(value, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
      ],
    );
  }
}
