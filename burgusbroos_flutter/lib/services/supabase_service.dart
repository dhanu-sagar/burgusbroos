import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/models.dart';
import '../constants/supabase_config.dart';

class FlutterSupabaseService {
  static final FlutterSupabaseService instance = FlutterSupabaseService._internal();
  FlutterSupabaseService._internal();

  SupabaseClient? get client =>
      SupabaseConfig.isConfigured ? Supabase.instance.client : null;

  String? get currentUserId => client?.auth.currentUser?.id;

  // Initialize Supabase in Flutter
  static Future<void> initialize() async {
    if (SupabaseConfig.isConfigured) {
      await Supabase.initialize(
        url: SupabaseConfig.url,
        anonKey: SupabaseConfig.anonKey,
      );
    }
  }

  // Fetch Tasks
  Future<List<TaskItem>> fetchTasks() async {
    final cli = client;
    final uid = currentUserId;
    if (cli == null || uid == null) return [];

    final response = await cli
        .from('tasks')
        .select()
        .eq('user_id', uid)
        .order('order', ascending: true);

    return (response as List).map((map) => TaskItem.fromMap(map)).toList();
  }

  // Upsert Task
  Future<void> upsertTask(TaskItem task) async {
    final cli = client;
    final uid = currentUserId;
    if (cli == null || uid == null) return;

    await cli.from('tasks').upsert({
      'id': task.id,
      'user_id': uid,
      'name': task.name,
      'bucket': task.bucket.name,
      'status': task.status.name,
      'priority': task.priority.name,
      'due_date': task.dueDate,
      'project_id': task.projectId,
      'notes': task.notes,
      'estimated_minutes': task.estimatedMinutes,
      'order': task.order,
      'completed_at': task.completedAt,
    });
  }

  // Delete Task
  Future<void> deleteTask(String taskId) async {
    final cli = client;
    if (cli == null) return;
    await cli.from('tasks').delete().eq('id', taskId);
  }

  // Fetch Daily Records
  Future<Map<String, DailyRecord>> fetchDailyRecords() async {
    final cli = client;
    final uid = currentUserId;
    if (cli == null || uid == null) return {};

    final response = await cli.from('daily_records').select().eq('user_id', uid);
    final map = <String, DailyRecord>{};

    for (var row in (response as List)) {
      final date = row['date'] as String;
      map[date] = DailyRecord(
        id: row['id'],
        date: date,
        brainDump: row['brain_dump'] ?? '',
        dailyHighlight: DailyHighlight(
          text: row['daily_highlight_text'] ?? '',
          done: row['daily_highlight_done'] ?? false,
          completedAt: row['daily_highlight_completed_at'],
        ),
        microCommitment: MicroCommitment(
          text: row['micro_commitment_text'] ?? '',
          done: row['micro_commitment_done'] ?? false,
          habitId: row['micro_commitment_habit_id'],
          completedAt: row['micro_commitment_completed_at'],
        ),
        updatedAt: row['updated_at'] ?? '',
      );
    }
    return map;
  }

  // Upsert Daily Record
  Future<void> upsertDailyRecord(DailyRecord record) async {
    final cli = client;
    final uid = currentUserId;
    if (cli == null || uid == null) return;

    await cli.from('daily_records').upsert({
      'user_id': uid,
      'date': record.date,
      'brain_dump': record.brainDump,
      'daily_highlight_text': record.dailyHighlight.text,
      'daily_highlight_done': record.dailyHighlight.done,
      'daily_highlight_completed_at': record.dailyHighlight.completedAt,
      'micro_commitment_text': record.microCommitment.text,
      'micro_commitment_done': record.microCommitment.done,
      'micro_commitment_habit_id': record.microCommitment.habitId,
      'micro_commitment_completed_at': record.microCommitment.completedAt,
    }, onConflict: 'user_id,date');
  }

  // Save Sprint Session
  Future<void> saveSprintSession(SprintSession sprint) async {
    final cli = client;
    final uid = currentUserId;
    if (cli == null || uid == null) return;

    await cli.from('sprint_sessions').insert({
      'id': sprint.id,
      'user_id': uid,
      'task_id': sprint.taskId,
      'task_name': sprint.taskName,
      'bucket': sprint.bucket?.name,
      'project_id': sprint.projectId,
      'start_time': sprint.startTime,
      'end_time': sprint.endTime,
      'planned_duration_sec': sprint.plannedDurationSec,
      'actual_duration_sec': sprint.actualDurationSec,
      'focus_quality': sprint.focusQuality?.name,
      'ended_early': sprint.endedEarly,
      'notes': sprint.notes,
      'creative_takeaway': sprint.creativeTakeaway,
      'creative_log': sprint.creativeLog.map((e) => e.toMap()).toList(),
    });
  }

  // Habits
  Future<List<Habit>> fetchHabits() async {
    final cli = client;
    final uid = currentUserId;
    if (cli == null || uid == null) return [];

    final response = await cli.from('habits').select().eq('user_id', uid).order('created_at');
    return (response as List).map((map) => Habit.fromMap(map)).toList();
  }

  Future<void> upsertHabit(Habit habit) async {
    final cli = client;
    final uid = currentUserId;
    if (cli == null || uid == null) return;

    await cli.from('habits').upsert({
      'id': habit.id,
      'user_id': uid,
      'name': habit.name,
      'current_streak': habit.currentStreak,
      'best_streak': habit.bestStreak,
      'last_completed_date': habit.lastCompletedDate,
    });
  }

  Future<void> deleteHabit(String habitId) async {
    final cli = client;
    if (cli == null) return;
    await cli.from('habits').delete().eq('id', habitId);
  }

  // Projects
  Future<List<Project>> fetchProjects() async {
    final cli = client;
    final uid = currentUserId;
    if (cli == null || uid == null) return [];

    final response = await cli.from('projects').select().eq('user_id', uid).order('created_at', ascending: false);
    return (response as List).map((map) => Project.fromMap(map)).toList();
  }

  Future<void> upsertProject(Project project) async {
    final cli = client;
    final uid = currentUserId;
    if (cli == null || uid == null) return;

    await cli.from('projects').upsert({
      'id': project.id,
      'user_id': uid,
      'name': project.name,
      'description': project.description,
      'color': project.color,
      'target_date': project.targetDate,
    });
  }

  Future<void> deleteProject(String projectId) async {
    final cli = client;
    if (cli == null) return;
    await cli.from('projects').delete().eq('id', projectId);
  }
}
