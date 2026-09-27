import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_provider.dart';
import '../constants/theme.dart';
import '../models/models.dart';

class SprintView extends StatefulWidget {
  const SprintView({Key? key}) : super(key: key);

  @override
  State<SprintView> createState() => _SprintViewState();
}

class _SprintViewState extends State<SprintView> {
  final TextEditingController _creativeController = TextEditingController();
  final TextEditingController _takeawayController = TextEditingController();
  CreativeLogType _selectedCreativeType = CreativeLogType.insight;

  @override
  void dispose() {
    _creativeController.dispose();
    _takeawayController.dispose();
    super.dispose();
  }

  String _formatTime(int totalSec) {
    final m = totalSec ~/ 60;
    final s = totalSec % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final activeSprint = app.activeSprint;

    if (activeSprint == null) {
      return Center(
        child: Container(
          constraints: const BoxConstraints(maxWidth: 480),
          padding: const EdgeInsets.all(32),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.cardBorder),
            boxShadow: AppTheme.cardShadow,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.timer_outlined, size: 48, color: AppColors.bucketMust),
              const SizedBox(height: 16),
              Text(
                'Ready to Deep Work?',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 20),
              ),
              const SizedBox(height: 8),
              Text(
                'Focus sprints protect your cognitive momentum. Work in pure distraction-free blocks with live creative logging.',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                icon: const Icon(Icons.play_arrow_rounded, color: Colors.white),
                label: const Text('Start 25-Min Sprint'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.textPrimary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                onPressed: () {
                  app.startSprint(plannedDurationSec: 1500, taskName: 'Deep Work Block');
                },
              ),
            ],
          ),
        ),
      );
    }

    final elapsed = app.activeSprintElapsedSec;
    final remaining = (activeSprint.plannedDurationSec - elapsed).clamp(0, 99999);
    final progress = (elapsed / activeSprint.plannedDurationSec).clamp(0.0, 1.0);

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 680),
          child: Column(
            children: [
              // Main Timer Card
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: AppColors.cardBorder),
                  boxShadow: AppTheme.cardShadow,
                ),
                child: Column(
                  children: [
                    // Task label
                    Text(
                      activeSprint.taskName ?? 'Focus Sprint',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            color: AppColors.textPrimary,
                            fontWeight: FontWeight.w600,
                          ),
                    ),
                    const SizedBox(height: 24),

                    // Circular Progress & Countdown
                    Stack(
                      alignment: Alignment.center,
                      children: [
                        SizedBox(
                          width: 220,
                          height: 220,
                          child: CircularProgressIndicator(
                            value: progress,
                            strokeWidth: 8,
                            backgroundColor: AppColors.neutral100,
                            valueColor: const AlwaysStoppedAnimation<Color>(AppColors.bucketMust),
                          ),
                        ),
                        Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              _formatTime(remaining),
                              style: Theme.of(context).textTheme.labelMedium?.copyWith(
                                    fontSize: 48,
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: -1.5,
                                  ),
                            ),
                            Text(
                              activeSprint.isPaused ? 'PAUSED' : 'LOCKED IN',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: activeSprint.isPaused ? AppColors.warning : AppColors.success,
                                letterSpacing: 1.0,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 32),

                    // Controls Row (Wrapped for mobile screens)
                    Wrap(
                      alignment: WrapAlignment.center,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      spacing: 12,
                      runSpacing: 12,
                      children: [
                        IconButton.filledTonal(
                          icon: Icon(activeSprint.isPaused ? Icons.play_arrow : Icons.pause),
                          tooltip: activeSprint.isPaused ? 'Resume' : 'Pause',
                          onPressed: () {
                            if (activeSprint.isPaused) {
                              app.resumeSprint();
                            } else {
                              app.pauseSprint();
                            }
                          },
                        ),
                        OutlinedButton(
                          onPressed: () => app.extendSprint(300),
                          child: const Text('+5 Min'),
                        ),
                        ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.success,
                            foregroundColor: Colors.white,
                          ),
                          icon: const Icon(Icons.check, size: 16),
                          label: const Text('Complete'),
                          onPressed: () {
                            app.endSprint(
                              focusQuality: FocusQuality.locked_in,
                              markTaskDone: true,
                              creativeTakeaway: _takeawayController.text,
                            );
                          },
                        ),
                        IconButton(
                          icon: const Icon(Icons.close, color: AppColors.danger),
                          tooltip: 'Cancel Sprint',
                          onPressed: () => app.cancelSprint(),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Creative Log Drawer
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      'Log Quick Insight / Idea',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 16),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _creativeController,
                            decoration: const InputDecoration(
                              hintText: 'Record a breakthrough or fleeting thought...',
                              border: OutlineInputBorder(),
                              isDense: true,
                            ),
                            onSubmitted: (val) {
                              if (val.trim().isNotEmpty) {
                                app.addSprintCreativeEntry(val, _selectedCreativeType);
                                _creativeController.clear();
                              }
                            },
                          ),
                        ),
                        const SizedBox(width: 8),
                        IconButton.filled(
                          icon: const Icon(Icons.send, size: 16),
                          onPressed: () {
                            final val = _creativeController.text;
                            if (val.trim().isNotEmpty) {
                              app.addSprintCreativeEntry(val, _selectedCreativeType);
                              _creativeController.clear();
                            }
                          },
                        ),
                      ],
                    ),
                    if (activeSprint.creativeLog.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      const Divider(),
                      ...activeSprint.creativeLog.map(
                        (log) => Padding(
                          padding: const EdgeInsets.symmetric(vertical: 4.0),
                          child: Row(
                            children: [
                              const Icon(Icons.lightbulb_outline, size: 14, color: AppColors.warning),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(log.content, style: const TextStyle(fontSize: 13)),
                              ),
                              Text(
                                _formatTime(log.timestampSec),
                                style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
