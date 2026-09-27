import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:intl/intl.dart';
import 'package:uuid/uuid.dart';
import '../models/models.dart';
import '../services/supabase_service.dart';

class ActiveSprint {
  bool isRunning;
  bool isPaused;
  String? taskId;
  String? taskName;
  BucketType? bucket;
  String? projectId;
  int startTimestamp;
  int accumulatedSec;
  int plannedDurationSec;
  List<CreativeLogEntry> creativeLog;

  ActiveSprint({
    this.isRunning = true,
    this.isPaused = false,
    this.taskId,
    this.taskName,
    this.bucket,
    this.projectId,
    required this.startTimestamp,
    this.accumulatedSec = 0,
    this.plannedDurationSec = 1500,
    this.creativeLog = const [],
  });
}

class AppProvider extends ChangeNotifier {
  final _uuid = const Uuid();
  final _supabase = FlutterSupabaseService.instance;

  // Mode & navigation
  String _mode = 'simple'; // 'simple' | 'advanced'
  String get mode => _mode;

  String _currentTab = 'dashboard'; // 'dashboard' | 'tasks' | 'sprint' | 'projects' | 'report'
  String get currentTab => _currentTab;

  String _selectedDate = DateFormat('yyyy-MM-dd').format(DateTime.now());
  String get selectedDate => _selectedDate;

  // Data Collections
  Map<String, DailyRecord> _dailyRecords = {};
  List<TaskItem> _tasks = [];
  List<SprintSession> _sprints = [];
  List<Project> _projects = [];
  List<Habit> _habits = [];
  UserSettings _settings = UserSettings();

  // Active Sprint
  ActiveSprint? _activeSprint;
  ActiveSprint? get activeSprint => _activeSprint;
  int _activeSprintElapsedSec = 0;
  int get activeSprintElapsedSec => _activeSprintElapsedSec;
  Timer? _sprintTicker;

  // Getters
  Map<String, DailyRecord> get dailyRecords => _dailyRecords;
  List<TaskItem> get tasks => _tasks;
  List<SprintSession> get sprints => _sprints;
  List<Project> get projects => _projects;
  List<Habit> get habits => _habits;
  UserSettings get settings => _settings;

  DailyRecord get currentRecord {
    if (_dailyRecords.containsKey(_selectedDate)) {
      return _dailyRecords[_selectedDate]!;
    }
    return DailyRecord.empty(_selectedDate);
  }

  // Filter tasks by bucket
  List<TaskItem> tasksInBucket(BucketType bucket) {
    return _tasks.where((t) => t.bucket == bucket).toList()
      ..sort((a, b) => a.order.compareTo(b.order));
  }

  AppProvider() {
    _initDefaults();
  }

  void _initDefaults() {
    // Starter seed data matching web app defaults
    _projects = [
      Project(
        id: 'proj-1',
        name: 'Deep Work & Systems',
        description: 'Focus workflows and cognitive performance architectures',
        color: '#6366F1',
        createdAt: DateTime.now().toIso8601String(),
      ),
      Project(
        id: 'proj-2',
        name: 'Burgusbroos Cross-Platform',
        description: 'Flutter + Supabase multi-device release',
        color: '#10B981',
        createdAt: DateTime.now().toIso8601String(),
      ),
    ];

    _habits = [
      Habit(
        id: 'habit-1',
        name: 'Morning Brain Dump',
        currentStreak: 4,
        bestStreak: 12,
        createdAt: DateTime.now().toIso8601String(),
      ),
      Habit(
        id: 'habit-2',
        name: '25m Focus Block',
        currentStreak: 2,
        bestStreak: 7,
        createdAt: DateTime.now().toIso8601String(),
      ),
    ];

    _tasks = [
      TaskItem(
        id: 'task-1',
        name: 'Review Supabase PostgreSQL Schema',
        bucket: BucketType.must,
        status: TaskStatus.in_progress,
        priority: TaskPriority.high,
        estimatedMinutes: 25,
        projectId: 'proj-2',
        createdAt: DateTime.now().toIso8601String(),
      ),
      TaskItem(
        id: 'task-2',
        name: 'Verify cross-platform Flutter UI parity',
        bucket: BucketType.should,
        status: TaskStatus.not_started,
        priority: TaskPriority.medium,
        estimatedMinutes: 30,
        projectId: 'proj-2',
        createdAt: DateTime.now().toIso8601String(),
      ),
      TaskItem(
        id: 'task-3',
        name: 'Export weekly report summary',
        bucket: BucketType.could,
        status: TaskStatus.not_started,
        priority: TaskPriority.low,
        estimatedMinutes: 15,
        createdAt: DateTime.now().toIso8601String(),
      ),
    ];

    _dailyRecords[_selectedDate] = DailyRecord(
      id: 'record-$_selectedDate',
      date: _selectedDate,
      brainDump: '• Focus on high-leverage compound actions\n• Maintain clean UI architecture\n• Ship cross-platform release',
      dailyHighlight: DailyHighlight(text: 'Complete Flutter + Supabase integration'),
      microCommitment: MicroCommitment(text: 'Log 2 creative takeaways during sprints', habitId: 'habit-2'),
      updatedAt: DateTime.now().toIso8601String(),
    );
  }

  // Navigation & Mode
  void setMode(String newMode) {
    _mode = newMode;
    _settings = _settings.copyWith(mode: newMode);
    notifyListeners();
  }

  void setCurrentTab(String tab) {
    _currentTab = tab;
    notifyListeners();
  }

  void setSelectedDate(String date) {
    _selectedDate = date;
    notifyListeners();
  }

  // Daily Record Actions
  void updateBrainDump(String date, String text) {
    final existing = _dailyRecords[date] ?? DailyRecord.empty(date);
    _dailyRecords[date] = existing.copyWith(
      brainDump: text,
      updatedAt: DateTime.now().toIso8601String(),
    );
    _supabase.upsertDailyRecord(_dailyRecords[date]!);
    notifyListeners();
  }

  void updateDailyHighlight(String date, String text, {bool? done}) {
    final existing = _dailyRecords[date] ?? DailyRecord.empty(date);
    _dailyRecords[date] = existing.copyWith(
      dailyHighlight: existing.dailyHighlight.copyWith(
        text: text,
        done: done,
        completedAt: done == true ? DateTime.now().toIso8601String() : null,
      ),
      updatedAt: DateTime.now().toIso8601String(),
    );
    _supabase.upsertDailyRecord(_dailyRecords[date]!);
    notifyListeners();
  }

  void toggleDailyHighlight(String date) {
    final existing = _dailyRecords[date] ?? DailyRecord.empty(date);
    final newDone = !existing.dailyHighlight.done;
    updateDailyHighlight(date, existing.dailyHighlight.text, done: newDone);
  }

  void updateMicroCommitment(String date, String text, {bool? done, String? habitId}) {
    final existing = _dailyRecords[date] ?? DailyRecord.empty(date);
    _dailyRecords[date] = existing.copyWith(
      microCommitment: existing.microCommitment.copyWith(
        text: text,
        done: done,
        habitId: habitId,
        completedAt: done == true ? DateTime.now().toIso8601String() : null,
      ),
      updatedAt: DateTime.now().toIso8601String(),
    );
    _supabase.upsertDailyRecord(_dailyRecords[date]!);
    notifyListeners();
  }

  void toggleMicroCommitment(String date) {
    final existing = _dailyRecords[date] ?? DailyRecord.empty(date);
    final newDone = !existing.microCommitment.done;
    updateMicroCommitment(date, existing.microCommitment.text, done: newDone, habitId: existing.microCommitment.habitId);
  }

  void promoteBrainDumpLine(String lineText, BucketType bucket) {
    final clean = lineText.replaceAll(RegExp(r'^[•\-\*\d\.\s]+'), '').trim();
    if (clean.isEmpty) return;
    addTask(TaskItem(
      id: _uuid.v4(),
      name: clean,
      bucket: bucket,
      status: TaskStatus.not_started,
      priority: TaskPriority.high,
      createdAt: DateTime.now().toIso8601String(),
    ));
  }

  // Task Actions
  void addTask(TaskItem task) {
    _tasks.add(task);
    _supabase.upsertTask(task);
    notifyListeners();
  }

  void updateTask(TaskItem updatedTask) {
    final index = _tasks.indexWhere((t) => t.id == updatedTask.id);
    if (index != -1) {
      _tasks[index] = updatedTask;
      _supabase.upsertTask(updatedTask);
      notifyListeners();
    }
  }

  void deleteTask(String taskId) {
    _tasks.removeWhere((t) => t.id == taskId);
    _supabase.deleteTask(taskId);
    notifyListeners();
  }

  void setTaskStatus(String taskId, TaskStatus status) {
    final index = _tasks.indexWhere((t) => t.id == taskId);
    if (index != -1) {
      final t = _tasks[index];
      final updated = t.copyWith(
        status: status,
        completedAt: status == TaskStatus.done ? DateTime.now().toIso8601String() : null,
      );
      _tasks[index] = updated;
      _supabase.upsertTask(updated);
      notifyListeners();
    }
  }

  void moveTaskToBucket(String taskId, BucketType bucket) {
    final index = _tasks.indexWhere((t) => t.id == taskId);
    if (index != -1) {
      final updated = _tasks[index].copyWith(bucket: bucket);
      _tasks[index] = updated;
      _supabase.upsertTask(updated);
      notifyListeners();
    }
  }

  // Sprint Session Controls
  void startSprint({
    String? taskId,
    String? taskName,
    BucketType? bucket,
    String? projectId,
    int plannedDurationSec = 1500,
  }) {
    _sprintTicker?.cancel();
    _activeSprint = ActiveSprint(
      taskId: taskId,
      taskName: taskName ?? 'Quick Focus Sprint',
      bucket: bucket ?? BucketType.must,
      projectId: projectId,
      startTimestamp: DateTime.now().millisecondsSinceEpoch,
      plannedDurationSec: plannedDurationSec,
    );
    _activeSprintElapsedSec = 0;

    _sprintTicker = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_activeSprint != null && !_activeSprint!.isPaused) {
        _activeSprintElapsedSec++;
        notifyListeners();
      }
    });

    notifyListeners();
  }

  void pauseSprint() {
    if (_activeSprint != null && !_activeSprint!.isPaused) {
      _activeSprint!.isPaused = true;
      _activeSprint!.accumulatedSec = _activeSprintElapsedSec;
      notifyListeners();
    }
  }

  void resumeSprint() {
    if (_activeSprint != null && _activeSprint!.isPaused) {
      _activeSprint!.isPaused = false;
      _activeSprint!.startTimestamp = DateTime.now().millisecondsSinceEpoch;
      notifyListeners();
    }
  }

  void extendSprint(int extraSec) {
    if (_activeSprint != null) {
      _activeSprint!.plannedDurationSec += extraSec;
      notifyListeners();
    }
  }

  void addSprintCreativeEntry(String content, CreativeLogType type) {
    if (_activeSprint != null && content.trim().isNotEmpty) {
      final entry = CreativeLogEntry(
        id: _uuid.v4(),
        content: content.trim(),
        type: type,
        timestampSec: _activeSprintElapsedSec,
        createdAt: DateTime.now().toIso8601String(),
      );
      _activeSprint!.creativeLog = [..._activeSprint!.creativeLog, entry];
      notifyListeners();
    }
  }

  void endSprint({
    FocusQuality? focusQuality,
    String? notes,
    bool markTaskDone = false,
    String? creativeTakeaway,
  }) {
    if (_activeSprint == null) return;

    final sprint = SprintSession(
      id: _uuid.v4(),
      taskId: _activeSprint!.taskId,
      taskName: _activeSprint!.taskName,
      bucket: _activeSprint!.bucket,
      projectId: _activeSprint!.projectId,
      startTime: DateTime.fromMillisecondsSinceEpoch(
        DateTime.now().millisecondsSinceEpoch - (_activeSprintElapsedSec * 1000),
      ).toIso8601String(),
      endTime: DateTime.now().toIso8601String(),
      plannedDurationSec: _activeSprint!.plannedDurationSec,
      actualDurationSec: _activeSprintElapsedSec,
      focusQuality: focusQuality ?? FocusQuality.locked_in,
      endedEarly: _activeSprintElapsedSec < _activeSprint!.plannedDurationSec,
      notes: notes,
      creativeTakeaway: creativeTakeaway,
      creativeLog: _activeSprint!.creativeLog,
    );

    _sprints.insert(0, sprint);
    _supabase.saveSprintSession(sprint);

    if (markTaskDone && _activeSprint!.taskId != null) {
      setTaskStatus(_activeSprint!.taskId!, TaskStatus.done);
    }

    cancelSprint();
  }

  void cancelSprint() {
    _sprintTicker?.cancel();
    _sprintTicker = null;
    _activeSprint = null;
    _activeSprintElapsedSec = 0;
    notifyListeners();
  }

  // Habits
  void addHabit(String name) {
    if (name.trim().isEmpty) return;
    final habit = Habit(
      id: _uuid.v4(),
      name: name.trim(),
      createdAt: DateTime.now().toIso8601String(),
    );
    _habits.add(habit);
    _supabase.upsertHabit(habit);
    notifyListeners();
  }

  void toggleHabitToday(String habitId) {
    final today = DateFormat('yyyy-MM-dd').format(DateTime.now());
    final index = _habits.indexWhere((h) => h.id == habitId);
    if (index == -1) return;

    final h = _habits[index];
    final isDoneToday = h.lastCompletedDate == today;

    final newStreak = isDoneToday ? (h.currentStreak > 0 ? h.currentStreak - 1 : 0) : h.currentStreak + 1;
    final newBest = newStreak > h.bestStreak ? newStreak : h.bestStreak;

    final updated = h.copyWith(
      currentStreak: newStreak,
      bestStreak: newBest,
      lastCompletedDate: isDoneToday ? null : today,
    );
    _habits[index] = updated;
    _supabase.upsertHabit(updated);
    notifyListeners();
  }

  // Projects
  void addProject(String name, {String? description, String color = '#6366F1', String? targetDate}) {
    final p = Project(
      id: _uuid.v4(),
      name: name.trim(),
      description: description,
      color: color,
      targetDate: targetDate,
      createdAt: DateTime.now().toIso8601String(),
    );
    _projects.add(p);
    _supabase.upsertProject(p);
    notifyListeners();
  }

  void updateProject(String id, {String? name, String? description, String? color, String? targetDate}) {
    final index = _projects.indexWhere((p) => p.id == id);
    if (index != -1) {
      final updated = _projects[index].copyWith(
        name: name,
        description: description,
        color: color,
        targetDate: targetDate,
      );
      _projects[index] = updated;
      _supabase.upsertProject(updated);
      notifyListeners();
    }
  }

  void deleteProject(String projectId) {
    _projects.removeWhere((p) => p.id == projectId);
    // Unlink tasks
    for (var i = 0; i < _tasks.length; i++) {
      if (_tasks[i].projectId == projectId) {
        final updated = _tasks[i].copyWith(projectId: null);
        _tasks[i] = updated;
        _supabase.upsertTask(updated);
      }
    }
    _supabase.deleteProject(projectId);
    notifyListeners();
  }

  void deleteHabit(String habitId) {
    _habits.removeWhere((h) => h.id == habitId);
    _supabase.deleteHabit(habitId);
    notifyListeners();
  }

  // Today Focus Calculations
  Map<BucketType, int> get todayFocusSecByBucket {
    final today = DateFormat('yyyy-MM-dd').format(DateTime.now());
    final result = <BucketType, int>{
      BucketType.must: 0,
      BucketType.should: 0,
      BucketType.could: 0,
    };

    for (final s in _sprints) {
      if (s.startTime.startsWith(today)) {
        final b = s.bucket ?? BucketType.must;
        result[b] = (result[b] ?? 0) + s.actualDurationSec;
      }
    }
    return result;
  }

  int get todayTotalFocusSec {
    final byBucket = todayFocusSecByBucket;
    return (byBucket[BucketType.must] ?? 0) +
        (byBucket[BucketType.should] ?? 0) +
        (byBucket[BucketType.could] ?? 0);
  }

  Map<String, dynamic> getProjectStats(String projectId) {
    final projectTasks = _tasks.where((t) => t.projectId == projectId).toList();
    final total = projectTasks.length;
    final done = projectTasks.where((t) => t.status == TaskStatus.done).length;
    final progress = total > 0 ? (done / total) : 0.0;

    int totalTimeSec = 0;
    for (final s in _sprints) {
      if (s.projectId == projectId) {
        totalTimeSec += s.actualDurationSec;
      }
    }

    return {
      'total': total,
      'done': done,
      'progress': progress,
      'focusMinutes': (totalTimeSec / 60).round(),
    };
  }

  @override
  void dispose() {
    _sprintTicker?.cancel();
    super.dispose();
  }
}
