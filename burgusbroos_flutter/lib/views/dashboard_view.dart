import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_provider.dart';
import '../constants/theme.dart';
import '../models/models.dart';
import '../widgets/task_modal.dart';
import '../widgets/brain_dump_history_modal.dart';

class DashboardView extends StatelessWidget {
  final Function(TaskItem) onLaunchSprint;
  final Function(int) onNavigateToTab;

  const DashboardView({
    Key? key,
    required this.onLaunchSprint,
    required this.onNavigateToTab,
  }) : super(key: key);

  String _formatMinutes(int minutes) {
    if (minutes < 60) return '${minutes}m';
    final h = minutes ~/ 60;
    final m = minutes % 60;
    return m == 0 ? '${h}h' : '${h}h ${m}m';
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final record = app.currentRecord;
    final todayFocusSec = app.todayFocusSecByBucket;
    final totalFocusMin = (app.todayTotalFocusSec / 60).round();

    final mustTasks = app.tasksInBucket(BucketType.must).where((t) => t.status != TaskStatus.done).take(4).toList();
    final shouldTasks = app.tasksInBucket(BucketType.should).where((t) => t.status != TaskStatus.done).take(4).toList();
    final couldTasks = app.tasksInBucket(BucketType.could).where((t) => t.status != TaskStatus.done).take(4).toList();

    int completedPractices = 0;
    if (record.dailyHighlight.done) completedPractices++;
    if (record.microCommitment.done) completedPractices++;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 16),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 880),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 1. TODAY'S PRACTICES TOP CARD
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.cardBorder),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x06000000),
                      blurRadius: 10,
                      offset: Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Wrap(
                      alignment: WrapAlignment.spaceBetween,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.neutral100,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text(
                            'DAILY GROUNDING',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 0.5,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ),
                        Text(
                          '$completedPractices of 2 Complete',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
                        ),
                        TextButton.icon(
                          onPressed: () => BrainDumpHistoryModal.show(context),
                          icon: const Icon(Icons.history_rounded, size: 16),
                          label: const Text('Dump Archive', style: TextStyle(fontSize: 12)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Highlight Checkbox
                    InkWell(
                      onTap: () => app.toggleDailyHighlight(app.selectedDate),
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: record.dailyHighlight.done ? AppColors.bucketMustBg.withOpacity(0.5) : AppColors.neutral50,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: record.dailyHighlight.done ? AppColors.bucketMust.withOpacity(0.3) : AppColors.cardBorder,
                          ),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              record.dailyHighlight.done ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded,
                              color: record.dailyHighlight.done ? AppColors.bucketMust : AppColors.textMuted,
                              size: 22,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    'DAILY HIGHLIGHT',
                                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.bucketMust),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    record.dailyHighlight.text.isEmpty
                                        ? 'Set your daily non-negotiable in Simple Mode'
                                        : record.dailyHighlight.text,
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                      decoration: record.dailyHighlight.done ? TextDecoration.lineThrough : null,
                                      color: record.dailyHighlight.done ? AppColors.textMuted : AppColors.textPrimary,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),

                    // Micro-commitment Checkbox
                    InkWell(
                      onTap: () => app.toggleMicroCommitment(app.selectedDate),
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: record.microCommitment.done ? AppColors.bucketMustBg.withOpacity(0.5) : AppColors.neutral50,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: record.microCommitment.done ? AppColors.bucketMust.withOpacity(0.3) : AppColors.cardBorder,
                          ),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              record.microCommitment.done ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded,
                              color: record.microCommitment.done ? AppColors.bucketMust : AppColors.textMuted,
                              size: 22,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    'MICRO-COMMITMENT',
                                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.bucketShould),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    record.microCommitment.text.isEmpty
                                        ? 'Tie an atomic action to a streak in Simple Mode'
                                        : record.microCommitment.text,
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                      decoration: record.microCommitment.done ? TextDecoration.lineThrough : null,
                                      color: record.microCommitment.done ? AppColors.textMuted : AppColors.textPrimary,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // 2. FOCUS METRICS & QUICK SPRINT ROW
              LayoutBuilder(
                builder: (context, constraints) {
                  final isWide = constraints.maxWidth > 640;
                  final timeCard = Container(
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
                            const Expanded(
                              child: Row(
                                children: [
                                  Icon(Icons.timer_outlined, size: 18, color: AppColors.bucketMust),
                                  SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      'Reality Focus Time',
                                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              _formatMinutes(totalFocusMin),
                              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'Automatically logged from live focus sprints',
                          style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                        ),
                        const SizedBox(height: 16),
                        // Mini breakdown pills
                        Row(
                          children: [
                            _buildBucketTimePill('Must', (todayFocusSec[BucketType.must]! / 60).round(), AppColors.bucketMust, AppColors.bucketMustBg),
                            const SizedBox(width: 8),
                            _buildBucketTimePill('Should', (todayFocusSec[BucketType.should]! / 60).round(), AppColors.bucketShould, AppColors.bucketShouldBg),
                            const SizedBox(width: 8),
                            _buildBucketTimePill('Could', (todayFocusSec[BucketType.could]! / 60).round(), AppColors.bucketCould, AppColors.bucketCouldBg),
                          ],
                        ),
                      ],
                    ),
                  );

                  final sprintCard = Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [AppColors.bucketMust.withOpacity(0.08), AppColors.surface],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.bucketMust.withOpacity(0.2)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Expanded(
                                  child: Text(
                                    'Ready to Sprint?',
                                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: AppColors.bucketMustBg,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: const Text('25 MIN', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppColors.bucketMust)),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            const Text(
                              'Eliminate context switching with an uninterrupted block.',
                              style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: () {
                              app.startSprint(
                                taskName: 'Quick Focus Sprint',
                                bucket: BucketType.must,
                                plannedDurationSec: 1500,
                              );
                              onNavigateToTab(2); // Go to Sprint tab
                            },
                            icon: const Icon(Icons.play_arrow_rounded, size: 20),
                            label: const Text('Launch 25m Sprint'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.bucketMust,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                          ),
                        ),
                      ],
                    ),
                  );

                  if (isWide) {
                    return Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(flex: 3, child: timeCard),
                        const SizedBox(width: 16),
                        Expanded(flex: 2, child: sprintCard),
                      ],
                    );
                  } else {
                    return Column(
                      children: [
                        timeCard,
                        const SizedBox(height: 14),
                        sprintCard,
                      ],
                    );
                  }
                },
              ),
              const SizedBox(height: 24),

              // 3. 3-BUCKET TRIAGE PREVIEW (MUST / SHOULD / COULD)
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Expanded(
                    child: Text(
                      'Active Triage Board',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 8),
                  TextButton.icon(
                    onPressed: () => onNavigateToTab(1), // Go to Tasks tab
                    icon: const Icon(Icons.arrow_forward, size: 14),
                    label: const Text('Full Board', style: TextStyle(fontSize: 12)),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              _buildTriageBucketSection(
                context,
                title: 'Must Do',
                bucket: BucketType.must,
                color: AppColors.bucketMust,
                bg: AppColors.bucketMustBg,
                tasks: mustTasks,
              ),
              const SizedBox(height: 12),

              _buildTriageBucketSection(
                context,
                title: 'Should Do',
                bucket: BucketType.should,
                color: AppColors.bucketShould,
                bg: AppColors.bucketShouldBg,
                tasks: shouldTasks,
              ),
              const SizedBox(height: 12),

              _buildTriageBucketSection(
                context,
                title: 'Could Do',
                bucket: BucketType.could,
                color: AppColors.bucketCould,
                bg: AppColors.bucketCouldBg,
                tasks: couldTasks,
              ),
              const SizedBox(height: 24),

              // 4. RECENT SPRINTS & CREATIVE LOG
              if (app.sprints.isNotEmpty) ...[
                const Text(
                  'Recent Focus Sprints & Creative Takeaways',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                ),
                const SizedBox(height: 12),
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: app.sprints.take(3).length,
                  itemBuilder: (context, index) {
                    final s = app.sprints[index];
                    return Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppColors.cardBorder),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: AppColors.neutral100,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(Icons.check_circle_outline, size: 18, color: AppColors.bucketMust),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  s.taskName ?? 'Focus Sprint',
                                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                                ),
                                if (s.creativeTakeaway != null && s.creativeTakeaway!.isNotEmpty)
                                  Padding(
                                    padding: const EdgeInsets.only(top: 2),
                                    child: Text(
                                      'Takeaway: "${s.creativeTakeaway}"',
                                      style: const TextStyle(fontSize: 12, fontStyle: FontStyle.italic, color: AppColors.textSecondary),
                                    ),
                                  ),
                              ],
                            ),
                          ),
                          Text(
                            _formatMinutes((s.actualDurationSec / 60).round()),
                            style: const TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.w700, fontSize: 13),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBucketTimePill(String label, int minutes, Color color, Color bg) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(10)),
        child: Column(
          children: [
            Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: color)),
            const SizedBox(height: 2),
            Text(
              '${minutes}m',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: color),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTriageBucketSection(
    BuildContext context, {
    required String title,
    required BucketType bucket,
    required Color color,
    required Color bg,
    required List<TaskItem> tasks,
  }) {
    final app = context.read<AppProvider>();

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(color: color, shape: BoxShape.circle),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        title,
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(6)),
                      child: Text('${tasks.length}', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: color)),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              IconButton(
                icon: const Icon(Icons.add_rounded, size: 18, color: AppColors.textSecondary),
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
                tooltip: 'Add $title',
                onPressed: () => TaskModal.show(context, defaultBucket: bucket),
              ),
            ],
          ),
          const SizedBox(height: 8),
          if (tasks.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 6),
              child: Text('No active tasks in this bucket.', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
            )
          else
            ...tasks.map((t) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  child: Row(
                    children: [
                      Checkbox(
                        value: t.status == TaskStatus.done,
                        activeColor: color,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                        onChanged: (val) {
                          app.setTaskStatus(t.id, val == true ? TaskStatus.done : TaskStatus.not_started);
                        },
                      ),
                      Expanded(
                        child: GestureDetector(
                          onTap: () => TaskModal.show(context, taskToEdit: t, defaultBucket: t.bucket),
                          child: Text(
                            t.name,
                            style: TextStyle(
                              fontSize: 13,
                              color: AppColors.textPrimary,
                              decoration: t.status == TaskStatus.done ? TextDecoration.lineThrough : null,
                            ),
                          ),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.play_circle_outline_rounded, size: 20, color: AppColors.bucketMust),
                        tooltip: 'Start Sprint',
                        onPressed: () => onLaunchSprint(t),
                      ),
                    ],
                  ),
                )),
        ],
      ),
    );
  }
}
