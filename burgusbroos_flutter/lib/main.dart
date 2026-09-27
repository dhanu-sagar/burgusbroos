import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'constants/theme.dart';
import 'providers/app_provider.dart';
import 'services/supabase_service.dart';
import 'widgets/app_header.dart';
import 'widgets/active_sprint_overlay.dart';
import 'views/simple_mode_view.dart';
import 'views/dashboard_view.dart';
import 'views/tasks_view.dart';
import 'views/sprint_view.dart';
import 'views/projects_view.dart';
import 'views/weekly_report_view.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await FlutterSupabaseService.initialize();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AppProvider()),
      ],
      child: const BurgusbroosApp(),
    ),
  );
}

class BurgusbroosApp extends StatelessWidget {
  const BurgusbroosApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Burgusbroos',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const MainShell(),
    );
  }
}

class MainShell extends StatefulWidget {
  const MainShell({Key? key}) : super(key: key);

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentTabIndex = 0;

  void _showHabitsModal(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) {
        return Consumer<AppProvider>(
          builder: (context, app, _) {
            final controller = TextEditingController();
            return AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              title: const Text('Daily Compounding Habits'),
              content: SizedBox(
                width: 400,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextField(
                      controller: controller,
                      decoration: const InputDecoration(
                        hintText: 'New habit name...',
                        border: OutlineInputBorder(),
                        isDense: true,
                      ),
                      onSubmitted: (val) {
                        app.addHabit(val);
                        controller.clear();
                      },
                    ),
                    const SizedBox(height: 16),
                    if (app.habits.isEmpty)
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 12),
                        child: Text('No habits created yet.', style: TextStyle(color: AppColors.textMuted)),
                      )
                    else
                      ...app.habits.map((h) => ListTile(
                            contentPadding: EdgeInsets.zero,
                            title: Text(h.name),
                            subtitle: Text('Streak: ${h.currentStreak} days (Best: ${h.bestStreak})'),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.check_circle_outline, color: AppColors.bucketMust),
                                  onPressed: () => app.toggleHabitToday(h.id),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.delete_outline, size: 18, color: AppColors.textMuted),
                                  onPressed: () => app.deleteHabit(h.id),
                                ),
                              ],
                            ),
                          )),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Close'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  void _showSettingsModal(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Settings & Supabase Sync'),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Supabase Cloud Sync:', style: TextStyle(fontWeight: FontWeight.bold)),
            SizedBox(height: 4),
            Text(
              'Connect your Supabase project in lib/constants/supabase_config.dart to enable real-time multi-device cloud persistence.',
              style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
            ),
            SizedBox(height: 16),
            Text('Week Start:', style: TextStyle(fontWeight: FontWeight.bold)),
            Text('Monday', style: TextStyle(color: AppColors.textSecondary)),
            SizedBox(height: 16),
            Text('App Architecture:', style: TextStyle(fontWeight: FontWeight.bold)),
            Text('Offline-first with local fallback + PostgreSQL cloud sync', style: TextStyle(color: AppColors.textSecondary)),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Done')),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final isSimple = app.mode == 'simple';

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Stack(
          children: [
            Column(
              children: [
                // Top Navigation & Header
                AppHeader(
                  onOpenHabits: () => _showHabitsModal(context),
                  onOpenSettings: () => _showSettingsModal(context),
                ),

                // Tab bar for Advanced Mode (Horizontally scrollable for mobile)
                if (!isSimple)
                  Container(
                    width: double.infinity,
                    decoration: const BoxDecoration(
                      color: AppColors.surface,
                      border: Border(bottom: BorderSide(color: AppColors.cardBorder)),
                    ),
                    child: SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      child: Row(
                        children: [
                          _buildTabItem(0, 'Dashboard', Icons.dashboard_outlined),
                          _buildTabItem(1, 'Tasks', Icons.check_circle_outline),
                          _buildTabItem(2, 'Sprint', Icons.timer_outlined),
                          _buildTabItem(3, 'Projects', Icons.folder_open_rounded),
                          _buildTabItem(4, 'Weekly Report', Icons.insert_chart_outlined_rounded),
                        ],
                      ),
                    ),
                  ),

                // Main Body View
                Expanded(
                  child: isSimple
                      ? SimpleModeView(onOpenHabits: () => _showHabitsModal(context))
                      : IndexedStack(
                          index: _currentTabIndex,
                          children: [
                            // 0: Rich Dashboard View
                            DashboardView(
                              onLaunchSprint: (task) {
                                app.startSprint(
                                  taskId: task.id,
                                  taskName: task.name,
                                  bucket: task.bucket,
                                  projectId: task.projectId,
                                  plannedDurationSec: (task.estimatedMinutes != null ? task.estimatedMinutes! * 60 : 1500),
                                );
                                setState(() => _currentTabIndex = 2);
                              },
                              onNavigateToTab: (index) {
                                setState(() => _currentTabIndex = index);
                              },
                            ),

                            // 1: 3-Bucket Tasks Board
                            TasksView(
                              onLaunchSprint: (task) {
                                app.startSprint(
                                  taskId: task.id,
                                  taskName: task.name,
                                  bucket: task.bucket,
                                  projectId: task.projectId,
                                  plannedDurationSec: (task.estimatedMinutes != null ? task.estimatedMinutes! * 60 : 1500),
                                );
                                setState(() => _currentTabIndex = 2);
                              },
                            ),

                            // 2: Live Focus Sprint with Creative Log
                            const SprintView(),

                            // 3: Project Containers View
                            ProjectsView(
                              onLaunchSprint: (task) {
                                app.startSprint(
                                  taskId: task.id,
                                  taskName: task.name,
                                  bucket: task.bucket,
                                  projectId: task.projectId,
                                  plannedDurationSec: (task.estimatedMinutes != null ? task.estimatedMinutes! * 60 : 1500),
                                );
                                setState(() => _currentTabIndex = 2);
                              },
                            ),

                            // 4: Weekly Momentum Report View
                            const WeeklyReportView(),
                          ],
                        ),
                ),
              ],
            ),

            // Persistent Active Sprint Mini-Overlay Pill
            // Displayed whenever a sprint is running and user is not currently in the full Sprint tab
            if (isSimple || _currentTabIndex != 2)
              ActiveSprintOverlay(
                onOpenSprint: () {
                  app.setMode('advanced');
                  setState(() => _currentTabIndex = 2);
                },
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildTabItem(int index, String label, IconData icon) {
    final active = _currentTabIndex == index;
    return InkWell(
      onTap: () => setState(() => _currentTabIndex = index),
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(
              color: active ? AppColors.bucketMust : Colors.transparent,
              width: 2.5,
            ),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 16, color: active ? AppColors.bucketMust : AppColors.textSecondary),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: active ? FontWeight.w700 : FontWeight.w500,
                color: active ? AppColors.textPrimary : AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
