import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/app_provider.dart';
import '../constants/theme.dart';

class AppHeader extends StatelessWidget {
  final VoidCallback onOpenHabits;
  final VoidCallback onOpenSettings;

  const AppHeader({
    Key? key,
    required this.onOpenHabits,
    required this.onOpenSettings,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final isSimple = app.mode == 'simple';
    final nowStr = DateFormat('yyyy-MM-dd').format(DateTime.now());
    final isToday = app.selectedDate == nowStr;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        border: Border(
          bottom: BorderSide(color: AppColors.cardBorder, width: 1),
        ),
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final isNarrow = constraints.maxWidth < 850;

          final modeSwitch = Container(
            padding: const EdgeInsets.all(3),
            decoration: BoxDecoration(
              color: AppColors.neutral100,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.cardBorder),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildModeBtn(
                  context,
                  title: 'Simple',
                  active: isSimple,
                  onTap: () => app.setMode('simple'),
                ),
                _buildModeBtn(
                  context,
                  title: 'Advanced',
                  active: !isSimple,
                  onTap: () => app.setMode('advanced'),
                ),
              ],
            ),
          );

          final dateNav = Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: AppColors.neutral50,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.cardBorder),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                IconButton(
                  icon: const Icon(Icons.chevron_left, size: 16),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                  onPressed: () {
                    final curr = DateTime.parse(app.selectedDate);
                    final prev = curr.subtract(const Duration(days: 1));
                    app.setSelectedDate(DateFormat('yyyy-MM-dd').format(prev));
                  },
                ),
                const SizedBox(width: 6),
                Text(
                  isToday ? 'Today' : app.selectedDate,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                        fontSize: 12,
                      ),
                ),
                const SizedBox(width: 6),
                IconButton(
                  icon: const Icon(Icons.chevron_right, size: 16),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                  onPressed: () {
                    final curr = DateTime.parse(app.selectedDate);
                    final next = curr.add(const Duration(days: 1));
                    app.setSelectedDate(DateFormat('yyyy-MM-dd').format(next));
                  },
                ),
              ],
            ),
          );

          final actionButtons = Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              IconButton(
                icon: const Icon(Icons.local_fire_department_outlined, size: 20, color: AppColors.bucketMust),
                tooltip: 'Habits & Streaks',
                padding: const EdgeInsets.all(6),
                constraints: const BoxConstraints(),
                onPressed: onOpenHabits,
              ),
              const SizedBox(width: 6),
              IconButton(
                icon: const Icon(Icons.tune, size: 20, color: AppColors.textSecondary),
                tooltip: 'Settings',
                padding: const EdgeInsets.all(6),
                constraints: const BoxConstraints(),
                onPressed: onOpenSettings,
              ),
            ],
          );

          if (isNarrow) {
            return Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Burgusbroos',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w800,
                            letterSpacing: -0.5,
                          ),
                    ),
                    actionButtons,
                  ],
                ),
                const SizedBox(height: 8),
                Wrap(
                  alignment: WrapAlignment.spaceBetween,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    modeSwitch,
                    dateNav,
                  ],
                ),
              ],
            );
          }

          return Row(
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'Burgusbroos',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w700,
                          letterSpacing: -0.5,
                        ),
                  ),
                  Text(
                    'Tiny compounding actions',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.textSecondary,
                          fontSize: 12,
                        ),
                  ),
                ],
              ),
              const SizedBox(width: 20),
              modeSwitch,
              const Spacer(),
              dateNav,
              const SizedBox(width: 8),
              actionButtons,
            ],
          );
        },
      ),
    );
  }

  Widget _buildModeBtn(
    BuildContext context, {
    required String title,
    required bool active,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: active ? AppColors.surface : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
          boxShadow: active
              ? [
                  const BoxShadow(
                    color: Color(0x0A000000),
                    blurRadius: 4,
                    offset: Offset(0, 1),
                  )
                ]
              : null,
        ),
        child: Text(
          title,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                fontWeight: active ? FontWeight.w600 : FontWeight.w500,
                color: active ? AppColors.textPrimary : AppColors.textSecondary,
              ),
        ),
      ),
    );
  }
}
