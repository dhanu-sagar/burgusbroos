import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:uuid/uuid.dart';
import '../providers/app_provider.dart';
import '../constants/theme.dart';
import '../models/models.dart';
import '../widgets/task_modal.dart';

class TasksView extends StatefulWidget {
  final Function(TaskItem) onLaunchSprint;

  const TasksView({Key? key, required this.onLaunchSprint}) : super(key: key);

  @override
  State<TasksView> createState() => _TasksViewState();
}

class _TasksViewState extends State<TasksView> {
  final Map<BucketType, TextEditingController> _quickControllers = {
    BucketType.must: TextEditingController(),
    BucketType.should: TextEditingController(),
    BucketType.could: TextEditingController(),
  };

  @override
  void dispose() {
    for (var c in _quickControllers.values) {
      c.dispose();
    }
    super.dispose();
  }

  void _handleQuickAdd(BuildContext context, BucketType bucket) {
    final text = _quickControllers[bucket]?.text.trim() ?? '';
    if (text.isEmpty) return;

    final app = context.read<AppProvider>();
    app.addTask(TaskItem(
      id: const Uuid().v4(),
      name: text,
      bucket: bucket,
      status: TaskStatus.not_started,
      priority: bucket == BucketType.must ? TaskPriority.high : TaskPriority.medium,
      createdAt: DateTime.now().toIso8601String(),
    ));

    _quickControllers[bucket]?.clear();
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 16.0),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final isNarrow = constraints.maxWidth < 900;
          final columns = [
            _buildBucketColumn(
              context,
              bucket: BucketType.must,
              title: 'Must Do',
              subtitle: 'Non-negotiable high leverage tasks',
              color: AppColors.bucketMust,
              bg: AppColors.bucketMustBg,
              tasks: app.tasksInBucket(BucketType.must),
            ),
            _buildBucketColumn(
              context,
              bucket: BucketType.should,
              title: 'Should Do',
              subtitle: 'Important progress makers',
              color: AppColors.bucketShould,
              bg: AppColors.bucketShouldBg,
              tasks: app.tasksInBucket(BucketType.should),
            ),
            _buildBucketColumn(
              context,
              bucket: BucketType.could,
              title: 'Could Do',
              subtitle: 'Optional if energy & time permit',
              color: AppColors.bucketCould,
              bg: AppColors.bucketCouldBg,
              tasks: app.tasksInBucket(BucketType.could),
            ),
          ];

          if (isNarrow) {
            return SingleChildScrollView(
              child: Column(
                children: columns.map((col) => Padding(
                  padding: const EdgeInsets.only(bottom: 24),
                  child: col,
                )).toList(),
              ),
            );
          }

          return Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: columns.map((col) => Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8.0),
                child: col,
              ),
            )).toList(),
          );
        },
      ),
    );
  }

  Widget _buildBucketColumn(
    BuildContext context, {
    required BucketType bucket,
    required String title,
    required String subtitle,
    required Color color,
    required Color bg,
    required List<TaskItem> tasks,
  }) {
    final app = context.read<AppProvider>();

    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder),
        boxShadow: AppTheme.cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              border: const Border(bottom: BorderSide(color: AppColors.cardBorder)),
            ),
            child: Row(
              children: [
                Container(
                  width: 10,
                  height: 10,
                  decoration: BoxDecoration(color: color, shape: BoxShape.circle),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    title,
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 16),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  icon: const Icon(Icons.add_rounded, size: 18, color: AppColors.textSecondary),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                  tooltip: 'Detailed New Task',
                  onPressed: () => TaskModal.show(context, defaultBucket: bucket),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: bg,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    '${tasks.length}',
                    style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 12),
                  ),
                ),
              ],
            ),
          ),

          // Quick Add Input
          Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _quickControllers[bucket],
                    decoration: InputDecoration(
                      hintText: 'Add task to $title...',
                      hintStyle: const TextStyle(fontSize: 13, color: AppColors.textMuted),
                      isDense: true,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: const BorderSide(color: AppColors.cardBorder),
                      ),
                    ),
                    onSubmitted: (_) => _handleQuickAdd(context, bucket),
                  ),
                ),
                const SizedBox(width: 6),
                IconButton(
                  icon: const Icon(Icons.add_circle, color: AppColors.textPrimary),
                  onPressed: () => _handleQuickAdd(context, bucket),
                ),
              ],
            ),
          ),

          // Task List
          if (tasks.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 36),
              child: Center(
                child: Text(
                  'No tasks in this bucket',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textMuted),
                ),
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              itemCount: tasks.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (context, index) {
                final task = tasks[index];
                final isDone = task.status == TaskStatus.done;
                final project = task.projectId != null
                    ? app.projects.where((p) => p.id == task.projectId).firstOrNull
                    : null;

                return Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isDone ? AppColors.neutral50 : AppColors.surface,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.cardBorder),
                  ),
                  child: Row(
                    children: [
                      // Checkbox
                      Checkbox(
                        value: isDone,
                        activeColor: color,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                        onChanged: (val) {
                          app.setTaskStatus(
                            task.id,
                            val == true ? TaskStatus.done : TaskStatus.not_started,
                          );
                        },
                      ),
                      const SizedBox(width: 6),

                      // Task Title & Metadata (tappable to edit)
                      Expanded(
                        child: GestureDetector(
                          onTap: () => TaskModal.show(context, taskToEdit: task, defaultBucket: bucket),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                task.name,
                                style: TextStyle(
                                  fontSize: 14,
                                  decoration: isDone ? TextDecoration.lineThrough : null,
                                  color: isDone ? AppColors.textMuted : AppColors.textPrimary,
                                ),
                              ),
                              if (project != null || task.estimatedMinutes != null)
                                Padding(
                                  padding: const EdgeInsets.only(top: 4),
                                  child: Row(
                                    children: [
                                      if (project != null) ...[
                                        Container(
                                          width: 8,
                                          height: 8,
                                          decoration: BoxDecoration(
                                            color: Color(int.parse(project.color.replaceAll('#', '0xFF'))),
                                            shape: BoxShape.circle,
                                          ),
                                        ),
                                        Flexible(
                                          child: Text(
                                            project.name,
                                            style: const TextStyle(fontSize: 10, color: AppColors.textSecondary, fontWeight: FontWeight.w600),
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                      ],
                                      if (task.estimatedMinutes != null)
                                        Text(
                                          '${task.estimatedMinutes}m',
                                          style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
                                        ),
                                    ],
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ),

                      // Focus Sprint Button
                      if (!isDone)
                        IconButton(
                          icon: const Icon(Icons.play_arrow_rounded, color: AppColors.bucketMust, size: 20),
                          tooltip: 'Launch 25m Focus Sprint',
                          onPressed: () => widget.onLaunchSprint(task),
                        ),

                      // Delete
                      IconButton(
                        icon: const Icon(Icons.close, size: 16, color: AppColors.textMuted),
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                        onPressed: () => app.deleteTask(task.id),
                      ),
                    ],
                  ),
                );
              },
            ),
          const SizedBox(height: 12),
        ],
      ),
    );
  }
}
