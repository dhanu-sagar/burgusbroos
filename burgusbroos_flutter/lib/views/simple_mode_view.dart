import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_provider.dart';
import '../constants/theme.dart';
import '../models/models.dart';
import '../widgets/brain_dump_history_modal.dart';

class SimpleModeView extends StatefulWidget {
  final VoidCallback onOpenHabits;

  const SimpleModeView({Key? key, required this.onOpenHabits}) : super(key: key);

  @override
  State<SimpleModeView> createState() => _SimpleModeViewState();
}

class _SimpleModeViewState extends State<SimpleModeView> {
  late TextEditingController _brainDumpController;
  late TextEditingController _highlightController;
  late TextEditingController _microController;

  @override
  void initState() {
    super.initState();
    final app = context.read<AppProvider>();
    _brainDumpController = TextEditingController(text: app.currentRecord.brainDump);
    _highlightController = TextEditingController(text: app.currentRecord.dailyHighlight.text);
    _microController = TextEditingController(text: app.currentRecord.microCommitment.text);
  }

  @override
  void didUpdateWidget(covariant SimpleModeView oldWidget) {
    super.didUpdateWidget(oldWidget);
    final app = context.read<AppProvider>();
    if (_brainDumpController.text != app.currentRecord.brainDump) {
      _brainDumpController.text = app.currentRecord.brainDump;
    }
  }

  @override
  void dispose() {
    _brainDumpController.dispose();
    _highlightController.dispose();
    _microController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final record = app.currentRecord;

    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 720),
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Headline
              Text(
                'Today\'s Grounding',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.5,
                    ),
              ),
              const SizedBox(height: 6),
              Text(
                'Clarify your non-negotiable focus and clear cognitive load before diving into sprints.',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppColors.textSecondary,
                    ),
              ),
              const SizedBox(height: 20),

              // CARD 1: DAILY HIGHLIGHT
              _buildCard(
                context,
                title: 'Daily Highlight',
                badgeText: 'NON-NEGOTIABLE',
                badgeColor: AppColors.bucketMust,
                badgeBg: AppColors.bucketMustBg,
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Checkbox(
                      value: record.dailyHighlight.done,
                      activeColor: AppColors.bucketMust,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                      onChanged: (val) {
                        app.toggleDailyHighlight(app.selectedDate);
                      },
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: TextField(
                        controller: _highlightController,
                        minLines: 1,
                        maxLines: 3,
                        style: TextStyle(
                          decoration: record.dailyHighlight.done ? TextDecoration.lineThrough : null,
                          color: record.dailyHighlight.done ? AppColors.textMuted : AppColors.textPrimary,
                        ),
                        decoration: const InputDecoration(
                          hintText: 'What is the one thing that will make today a victory?',
                          border: InputBorder.none,
                          isDense: true,
                        ),
                        onChanged: (val) {
                          app.updateDailyHighlight(app.selectedDate, val);
                        },
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // CARD 2: MICRO COMMITMENT
              _buildCard(
                context,
                title: 'Micro-Commitment',
                badgeText: 'COMPOUND HABIT',
                badgeColor: AppColors.bucketShould,
                badgeBg: AppColors.bucketShouldBg,
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Checkbox(
                      value: record.microCommitment.done,
                      activeColor: AppColors.bucketShould,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                      onChanged: (val) {
                        app.toggleMicroCommitment(app.selectedDate);
                      },
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: TextField(
                        controller: _microController,
                        minLines: 1,
                        maxLines: 3,
                        style: TextStyle(
                          decoration: record.microCommitment.done ? TextDecoration.lineThrough : null,
                          color: record.microCommitment.done ? AppColors.textMuted : AppColors.textPrimary,
                        ),
                        decoration: const InputDecoration(
                          hintText: 'A tiny action taking under 5 minutes...',
                          border: InputBorder.none,
                          isDense: true,
                        ),
                        onChanged: (val) {
                          app.updateMicroCommitment(app.selectedDate, val);
                        },
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // CARD 3: BRAIN DUMP & PROMOTION
              _buildCard(
                context,
                title: 'Brain Dump',
                badgeText: 'UNCLUTTER MIND',
                badgeColor: AppColors.bucketCould,
                badgeBg: AppColors.bucketCouldBg,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        TextButton.icon(
                          onPressed: () => BrainDumpHistoryModal.show(context),
                          icon: const Icon(Icons.history_rounded, size: 16),
                          label: const Text('Past Dumps', style: TextStyle(fontSize: 12)),
                        ),
                      ],
                    ),
                    TextField(
                      controller: _brainDumpController,
                      maxLines: 6,
                      decoration: const InputDecoration(
                        hintText: 'Dump any tasks, open loops, or wandering ideas here (one per line)...',
                        border: InputBorder.none,
                      ),
                      onChanged: (val) {
                        app.updateBrainDump(app.selectedDate, val);
                      },
                    ),
                    const Divider(),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: record.brainDump
                          .split('\n')
                          .where((l) => l.trim().isNotEmpty)
                          .map((line) => ActionChip(
                                label: ConstrainedBox(
                                  constraints: BoxConstraints(
                                    maxWidth: MediaQuery.of(context).size.width * 0.55,
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Flexible(
                                        child: Text(
                                          line.trim(),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      const SizedBox(width: 4),
                                      const Icon(Icons.arrow_forward_outlined, size: 14),
                                    ],
                                  ),
                                ),
                                tooltip: 'Promote to Must Task Bucket',
                                backgroundColor: AppColors.neutral100,
                                onPressed: () {
                                  app.promoteBrainDumpLine(line, BucketType.must);
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(content: Text('Promoted to Must bucket: "$line"')),
                                  );
                                },
                              ))
                          .toList(),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 32),

              // SWITCH TO ADVANCED BUTTON
              Center(
                child: TextButton.icon(
                  icon: const Icon(Icons.dashboard_customize_outlined, size: 18),
                  label: const Text('Open Advanced Mode (Tasks & Sprints)'),
                  style: TextButton.styleFrom(
                    foregroundColor: AppColors.textPrimary,
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  ),
                  onPressed: () => app.setMode('advanced'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCard(
    BuildContext context, {
    required String title,
    required String badgeText,
    required Color badgeColor,
    required Color badgeBg,
    required Widget child,
  }) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder),
        boxShadow: AppTheme.cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  title,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 16),
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: badgeBg,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  badgeText,
                  style: TextStyle(
                    color: badgeColor,
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }
}
