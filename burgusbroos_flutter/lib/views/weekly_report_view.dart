import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/app_provider.dart';
import '../constants/theme.dart';
import '../models/models.dart';

class WeeklyReportView extends StatefulWidget {
  const WeeklyReportView({Key? key}) : super(key: key);

  @override
  State<WeeklyReportView> createState() => _WeeklyReportViewState();
}

class _WeeklyReportViewState extends State<WeeklyReportView> {
  DateTime _currentWeekStart = _getMonday(DateTime.now());

  static DateTime _getMonday(DateTime d) {
    return DateTime(d.year, d.month, d.day).subtract(Duration(days: d.weekday - 1));
  }

  String _formatDuration(int totalSec) {
    final m = (totalSec / 60).round();
    if (m < 60) return '${m}m';
    final h = m ~/ 60;
    final remM = m % 60;
    return remM == 0 ? '${h}h' : '${h}h ${remM}m';
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final weekEnd = _currentWeekStart.add(const Duration(days: 6));
    final weekLabel = '${DateFormat('MMM d').format(_currentWeekStart)} – ${DateFormat('MMM d, yyyy').format(weekEnd)}';
    final isCurrentWeek = _getMonday(DateTime.now()).isAtSameMomentAs(_currentWeekStart);

    // Calculate week sprints
    final weekStartTs = _currentWeekStart.millisecondsSinceEpoch;
    final weekEndTs = weekEnd.add(const Duration(days: 1)).millisecondsSinceEpoch;

    final weekSprints = app.sprints.where((s) {
      final sTs = DateTime.tryParse(s.startTime)?.millisecondsSinceEpoch ?? 0;
      return sTs >= weekStartTs && sTs < weekEndTs;
    }).toList();

    int totalFocusSec = 0;
    int mustSec = 0;
    int shouldSec = 0;
    int couldSec = 0;

    for (final s in weekSprints) {
      totalFocusSec += s.actualDurationSec;
      if (s.bucket == BucketType.must) mustSec += s.actualDurationSec;
      if (s.bucket == BucketType.should) shouldSec += s.actualDurationSec;
      if (s.bucket == BucketType.could) couldSec += s.actualDurationSec;
    }

    final creativeTakeaways = weekSprints
        .where((s) => s.creativeTakeaway != null && s.creativeTakeaway!.trim().isNotEmpty)
        .map((s) => s.creativeTakeaway!.trim())
        .toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 880),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 1. Week Navigator & Header (Responsive Wrap)
              Wrap(
                alignment: WrapAlignment.spaceBetween,
                crossAxisAlignment: WrapCrossAlignment.center,
                spacing: 12,
                runSpacing: 12,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Wrap(
                        crossAxisAlignment: WrapCrossAlignment.center,
                        spacing: 8,
                        runSpacing: 4,
                        children: [
                          const Text(
                            'REALITY ANALYTICS',
                            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.textSecondary),
                          ),
                          if (isCurrentWeek)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: AppColors.bucketCould.withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(100),
                              ),
                              child: const Text(
                                'Current Week',
                                style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.bucketCould),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Weekly Reflection',
                        style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                      ),
                    ],
                  ),

                  // Navigator buttons
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.cardBorder),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.chevron_left, size: 18),
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                          onPressed: () {
                            setState(() {
                              _currentWeekStart = _currentWeekStart.subtract(const Duration(days: 7));
                            });
                          },
                        ),
                        Flexible(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 6),
                            child: Text(
                              weekLabel,
                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                              overflow: TextOverflow.ellipsis,
                              maxLines: 1,
                            ),
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.chevron_right, size: 18),
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                          onPressed: isCurrentWeek
                              ? null
                              : () {
                                  setState(() {
                                    _currentWeekStart = _currentWeekStart.add(const Duration(days: 7));
                                  });
                                },
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // 2. High Level Metric Cards
              Row(
                children: [
                  _buildStatCard('Total Focus', _formatDuration(totalFocusSec), Icons.timelapse_rounded, AppColors.bucketMust),
                  const SizedBox(width: 8),
                  _buildStatCard('Sprints', '${weekSprints.length}', Icons.bolt_rounded, AppColors.bucketShould),
                  const SizedBox(width: 8),
                  _buildStatCard('Takeaways', '${creativeTakeaways.length}', Icons.lightbulb_outline_rounded, Colors.purple),
                ],
              ),
              const SizedBox(height: 20),

              // 3. Focus Allocation Breakdown
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
                    const Text(
                      'Triage Allocation Reality',
                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Where your energy went across non-negotiable, important, and secondary buckets.',
                      style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                    ),
                    const SizedBox(height: 20),

                    _buildAllocationBar(
                      'Must Do Focus',
                      mustSec,
                      totalFocusSec,
                      AppColors.bucketMust,
                      AppColors.bucketMustBg,
                    ),
                    const SizedBox(height: 12),
                    _buildAllocationBar(
                      'Should Do Focus',
                      shouldSec,
                      totalFocusSec,
                      AppColors.bucketShould,
                      AppColors.bucketShouldBg,
                    ),
                    const SizedBox(height: 12),
                    _buildAllocationBar(
                      'Could Do Focus',
                      couldSec,
                      totalFocusSec,
                      AppColors.bucketCould,
                      AppColors.bucketCouldBg,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // 4. Creative Insights & Breakthroughs
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
                        const Expanded(
                          child: Text(
                            'Creative Takeaways & Insights',
                            style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.neutral100,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            '${creativeTakeaways.length} Logged',
                            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textSecondary),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    if (creativeTakeaways.isEmpty)
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 16),
                        child: Center(
                          child: Text(
                            'No creative takeaways recorded for this week yet. Log breakthroughs at the end of sprints!',
                            style: TextStyle(fontSize: 12, color: AppColors.textMuted),
                          ),
                        ),
                      )
                    else
                      ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: creativeTakeaways.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 8),
                        itemBuilder: (context, index) {
                          return Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: AppColors.neutral50,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppColors.cardBorder),
                            ),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Icon(Icons.format_quote_rounded, size: 18, color: AppColors.bucketMust),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    creativeTakeaways[index],
                                    style: const TextStyle(fontSize: 13, color: AppColors.textPrimary, height: 1.4),
                                  ),
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
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.cardBorder),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, size: 18, color: color),
            const SizedBox(height: 8),
            FittedBox(
              fit: BoxFit.scaleDown,
              child: Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
            ),
            const SizedBox(height: 2),
            Text(label, style: const TextStyle(fontSize: 10, color: AppColors.textSecondary), maxLines: 1, overflow: TextOverflow.ellipsis),
          ],
        ),
      ),
    );
  }

  Widget _buildAllocationBar(String label, int sec, int totalSec, Color color, Color bg) {
    final pct = totalSec > 0 ? (sec / totalSec) : 0.0;
    final mins = (sec / 60).round();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                label,
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                overflow: TextOverflow.ellipsis,
              ),
            ),
            const SizedBox(width: 8),
            Text(
              '$mins min (${(pct * 100).round()}%)',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: color),
            ),
          ],
        ),
        const SizedBox(height: 6),
        ClipRRect(
          borderRadius: BorderRadius.circular(6),
          child: LinearProgressIndicator(
            value: pct,
            minHeight: 8,
            backgroundColor: bg,
            valueColor: AlwaysStoppedAnimation<Color>(color),
          ),
        ),
      ],
    );
  }
}
