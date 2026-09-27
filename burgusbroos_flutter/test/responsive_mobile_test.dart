import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:burgusbroos_flutter/main.dart';
import 'package:burgusbroos_flutter/providers/app_provider.dart';
import 'package:burgusbroos_flutter/views/dashboard_view.dart';
import 'package:burgusbroos_flutter/views/tasks_view.dart';
import 'package:burgusbroos_flutter/views/sprint_view.dart';
import 'package:burgusbroos_flutter/views/projects_view.dart';
import 'package:burgusbroos_flutter/views/weekly_report_view.dart';

void main() {
  // Test on compact mobile screens (360x640)
  testWidgets('AC-1: App renders on 360x640 phone viewport without any pixel cutoffs', (tester) async {
    tester.view.physicalSize = const Size(360, 640);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);

    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => AppProvider()),
        ],
        child: const BurgusbroosApp(),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Burgusbroos'), findsOneWidget);
    expect(find.text('Today\'s Grounding'), findsOneWidget);
    expect(find.text('Daily Highlight'), findsOneWidget);
  });

  testWidgets('AC-2: Dashboard view renders without overflow on 360x640', (tester) async {
    tester.view.physicalSize = const Size(360, 640);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: ChangeNotifierProvider(
            create: (_) => AppProvider(),
            child: DashboardView(
              onLaunchSprint: (_) {},
              onNavigateToTab: (_) {},
            ),
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('DAILY GROUNDING'), findsOneWidget);
    expect(find.text('Reality Focus Time'), findsOneWidget);
    expect(find.text('Active Triage Board'), findsOneWidget);
  });

  testWidgets('AC-3: Tasks view renders without overflow on 360x640', (tester) async {
    tester.view.physicalSize = const Size(360, 640);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: ChangeNotifierProvider(
            create: (_) => AppProvider(),
            child: TasksView(
              onLaunchSprint: (_) {},
            ),
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Must Do'), findsOneWidget);
    expect(find.text('Should Do'), findsOneWidget);
    expect(find.text('Could Do'), findsOneWidget);
  });

  testWidgets('AC-4: Sprint view renders controls without overflow on 360x640', (tester) async {
    tester.view.physicalSize = const Size(360, 640);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);

    final provider = AppProvider();
    provider.startSprint(taskName: 'Test Mobile Sprint', plannedDurationSec: 1500);
    addTearDown(provider.cancelSprint);

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: ChangeNotifierProvider.value(
            value: provider,
            child: const SprintView(),
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Test Mobile Sprint'), findsOneWidget);
    expect(find.text('+5 Min'), findsOneWidget);
    expect(find.text('Complete'), findsOneWidget);

    provider.cancelSprint();
    await tester.pump();
  });

  testWidgets('AC-5: Projects view renders without overflow on 360x640', (tester) async {
    tester.view.physicalSize = const Size(360, 640);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: ChangeNotifierProvider(
            create: (_) => AppProvider(),
            child: ProjectsView(
              onLaunchSprint: (_) {},
            ),
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Project Containers'), findsOneWidget);
    expect(find.text('New Project'), findsOneWidget);
  });

  testWidgets('AC-6: Weekly Report view renders without overflow on 360x640', (tester) async {
    tester.view.physicalSize = const Size(360, 640);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: ChangeNotifierProvider(
            create: (_) => AppProvider(),
            child: const WeeklyReportView(),
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Weekly Reflection'), findsOneWidget);
    expect(find.text('Triage Allocation Reality'), findsOneWidget);
  });
}
