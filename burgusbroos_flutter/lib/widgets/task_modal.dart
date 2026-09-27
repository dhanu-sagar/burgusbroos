import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:uuid/uuid.dart';
import '../providers/app_provider.dart';
import '../models/models.dart';
import '../constants/theme.dart';

class TaskModal extends StatefulWidget {
  final TaskItem? taskToEdit;
  final BucketType defaultBucket;

  const TaskModal({
    Key? key,
    this.taskToEdit,
    this.defaultBucket = BucketType.must,
  }) : super(key: key);

  static Future<void> show(
    BuildContext context, {
    TaskItem? taskToEdit,
    BucketType defaultBucket = BucketType.must,
  }) {
    return showDialog(
      context: context,
      builder: (ctx) => TaskModal(
        taskToEdit: taskToEdit,
        defaultBucket: defaultBucket,
      ),
    );
  }

  @override
  State<TaskModal> createState() => _TaskModalState();
}

class _TaskModalState extends State<TaskModal> {
  late TextEditingController _nameController;
  late TextEditingController _notesController;
  late TextEditingController _estimateController;
  late BucketType _bucket;
  late TaskPriority _priority;
  String? _projectId;

  @override
  void initState() {
    super.initState();
    final t = widget.taskToEdit;
    _nameController = TextEditingController(text: t?.name ?? '');
    _notesController = TextEditingController(text: t?.notes ?? '');
    _estimateController = TextEditingController(
      text: t?.estimatedMinutes != null ? t!.estimatedMinutes.toString() : '',
    );
    _bucket = t?.bucket ?? widget.defaultBucket;
    _priority = t?.priority ?? TaskPriority.medium;
    _projectId = t?.projectId;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _notesController.dispose();
    _estimateController.dispose();
    super.dispose();
  }

  void _save(BuildContext context) {
    final name = _nameController.text.trim();
    if (name.isEmpty) return;

    final app = context.read<AppProvider>();
    final minutes = int.tryParse(_estimateController.text.trim());

    if (widget.taskToEdit != null) {
      final updated = widget.taskToEdit!.copyWith(
        name: name,
        bucket: _bucket,
        priority: _priority,
        projectId: _projectId,
        notes: _notesController.text.trim().isEmpty ? null : _notesController.text.trim(),
        estimatedMinutes: minutes,
      );
      app.updateTask(updated);
    } else {
      final newTask = TaskItem(
        id: const Uuid().v4(),
        name: name,
        bucket: _bucket,
        priority: _priority,
        projectId: _projectId,
        notes: _notesController.text.trim().isEmpty ? null : _notesController.text.trim(),
        estimatedMinutes: minutes,
        status: TaskStatus.not_started,
        createdAt: DateTime.now().toIso8601String(),
      );
      app.addTask(newTask);
    }

    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final isEditing = widget.taskToEdit != null;

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      backgroundColor: AppColors.surface,
      insetPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 520),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    isEditing ? 'Edit Task' : 'New Action Item',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, size: 20, color: AppColors.textSecondary),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Task Name
              TextField(
                controller: _nameController,
                autofocus: true,
                decoration: InputDecoration(
                  labelText: 'Task Description *',
                  hintText: 'e.g., Draft weekly design sprint review',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  isDense: true,
                ),
              ),
              const SizedBox(height: 16),

              // Bucket Selector
              const Text(
                'Triage Bucket',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  _buildBucketOption(BucketType.must, 'Must', AppColors.bucketMust, AppColors.bucketMustBg),
                  const SizedBox(width: 8),
                  _buildBucketOption(BucketType.should, 'Should', AppColors.bucketShould, AppColors.bucketShouldBg),
                  const SizedBox(width: 8),
                  _buildBucketOption(BucketType.could, 'Could', AppColors.bucketCould, AppColors.bucketCouldBg),
                ],
              ),
              const SizedBox(height: 16),

              // Priority & Estimated Time Row
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Priority',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
                        ),
                        const SizedBox(height: 6),
                        DropdownButtonFormField<TaskPriority>(
                          value: _priority,
                          decoration: InputDecoration(
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                            isDense: true,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          ),
                          items: const [
                            DropdownMenuItem(value: TaskPriority.high, child: Text('High')),
                            DropdownMenuItem(value: TaskPriority.medium, child: Text('Medium')),
                            DropdownMenuItem(value: TaskPriority.low, child: Text('Low')),
                          ],
                          onChanged: (val) {
                            if (val != null) setState(() => _priority = val);
                          },
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Estimate (min)',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
                        ),
                        const SizedBox(height: 6),
                        TextField(
                          controller: _estimateController,
                          keyboardType: TextInputType.number,
                          decoration: InputDecoration(
                            hintText: '25',
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                            isDense: true,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Project Association
              const Text(
                'Container / Project',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
              ),
              const SizedBox(height: 6),
              DropdownButtonFormField<String?>(
                value: _projectId,
                decoration: InputDecoration(
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  isDense: true,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
                items: [
                  const DropdownMenuItem<String?>(
                    value: null,
                    child: Text('No Project (General)'),
                  ),
                  ...app.projects.map((p) => DropdownMenuItem<String?>(
                        value: p.id,
                        child: Row(
                          children: [
                            Container(
                              width: 10,
                              height: 10,
                              decoration: BoxDecoration(
                                color: Color(int.parse(p.color.replaceAll('#', '0xFF'))),
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(p.name, overflow: TextOverflow.ellipsis),
                          ],
                        ),
                      )),
                ],
                onChanged: (val) => setState(() => _projectId = val),
              ),
              const SizedBox(height: 16),

              // Notes
              TextField(
                controller: _notesController,
                maxLines: 3,
                decoration: InputDecoration(
                  labelText: 'Notes / Sub-steps',
                  hintText: 'Add context or key links...',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  alignLabelWithHint: true,
                ),
              ),
              const SizedBox(height: 24),

              // Actions
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  if (isEditing)
                    TextButton.icon(
                      onPressed: () {
                        app.deleteTask(widget.taskToEdit!.id);
                        Navigator.of(context).pop();
                      },
                      icon: const Icon(Icons.delete_outline, size: 18, color: Colors.redAccent),
                      label: const Text('Delete', style: TextStyle(color: Colors.redAccent)),
                    )
                  else
                    const SizedBox.shrink(),
                  Row(
                    children: [
                      TextButton(
                        onPressed: () => Navigator.of(context).pop(),
                        child: const Text('Cancel', style: TextStyle(color: AppColors.textSecondary)),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton(
                        onPressed: () => _save(context),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.bucketMust,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                        ),
                        child: Text(isEditing ? 'Save Changes' : 'Create Task'),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBucketOption(BucketType bucket, String label, Color color, Color bg) {
    final isSelected = _bucket == bucket;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _bucket = bucket),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? bg : AppColors.surface,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: isSelected ? color : AppColors.cardBorder,
              width: isSelected ? 2 : 1,
            ),
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: isSelected ? color : AppColors.textSecondary,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
