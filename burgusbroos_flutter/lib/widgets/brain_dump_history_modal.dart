import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_provider.dart';
import '../models/models.dart';
import '../constants/theme.dart';

class BrainDumpHistoryModal extends StatelessWidget {
  const BrainDumpHistoryModal({Key? key}) : super(key: key);

  static Future<void> show(BuildContext context) {
    return showDialog(
      context: context,
      builder: (ctx) => const BrainDumpHistoryModal(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final records = app.dailyRecords.values.toList()
      ..sort((a, b) => b.date.compareTo(a.date));

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      backgroundColor: AppColors.surface,
      insetPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 580, maxHeight: 600),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Brain Dump Archive',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Revisit previous days and rescue open thoughts into tasks',
                        style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, size: 20, color: AppColors.textSecondary),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              const Divider(height: 1, color: AppColors.cardBorder),
              const SizedBox(height: 12),
              Expanded(
                child: records.isEmpty || records.every((r) => r.brainDump.trim().isEmpty)
                    ? const Center(
                        child: Text(
                          'No previous brain dumps recorded yet.',
                          style: TextStyle(color: AppColors.textMuted),
                        ),
                      )
                    : ListView.builder(
                        itemCount: records.length,
                        itemBuilder: (context, index) {
                          final rec = records[index];
                          if (rec.brainDump.trim().isEmpty) return const SizedBox.shrink();
                          final lines = rec.brainDump.split('\n').where((l) => l.trim().isNotEmpty).toList();

                          return Container(
                            margin: const EdgeInsets.only(bottom: 16),
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: AppColors.neutral50,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: AppColors.cardBorder),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      rec.date,
                                      style: const TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.textPrimary,
                                      ),
                                    ),
                                    TextButton(
                                      onPressed: () {
                                        app.setSelectedDate(rec.date);
                                        Navigator.of(context).pop();
                                      },
                                      child: const Text('Open Date', style: TextStyle(fontSize: 12)),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                ...lines.map((line) => Padding(
                                      padding: const EdgeInsets.symmetric(vertical: 4),
                                      child: Row(
                                        children: [
                                          const Text('• ', style: TextStyle(color: AppColors.textMuted)),
                                          Expanded(
                                            child: Text(
                                              line.replaceAll(RegExp(r'^[•\-\*\s]+'), ''),
                                              style: const TextStyle(fontSize: 13, color: AppColors.textPrimary),
                                            ),
                                          ),
                                          PopupMenuButton<BucketType>(
                                            tooltip: 'Promote to Task',
                                            icon: const Icon(Icons.arrow_upward_rounded, size: 16, color: AppColors.bucketMust),
                                            onSelected: (bucket) {
                                              app.promoteBrainDumpLine(line, bucket);
                                              ScaffoldMessenger.of(context).showSnackBar(
                                                SnackBar(
                                                  content: Text('Promoted to ${bucket.name.toUpperCase()}'),
                                                  duration: const Duration(seconds: 1),
                                                ),
                                              );
                                            },
                                            itemBuilder: (context) => [
                                              const PopupMenuItem(
                                                value: BucketType.must,
                                                child: Text('Must Do'),
                                              ),
                                              const PopupMenuItem(
                                                value: BucketType.should,
                                                child: Text('Should Do'),
                                              ),
                                              const PopupMenuItem(
                                                value: BucketType.could,
                                                child: Text('Could Do'),
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
                                    )),
                              ],
                            ),
                          );
                        },
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
