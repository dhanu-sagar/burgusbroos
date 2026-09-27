enum BucketType { must, should, could }

enum TaskStatus { not_started, in_progress, done, skipped }

enum TaskPriority { high, medium, low }

enum FocusQuality { locked_in, distracted, rough }

enum CreativeLogType { insight, idea, breakthrough, note }

class DailyHighlight {
  final String text;
  final bool done;
  final String? completedAt;

  DailyHighlight({
    required this.text,
    this.done = false,
    this.completedAt,
  });

  DailyHighlight copyWith({
    String? text,
    bool? done,
    String? completedAt,
  }) {
    return DailyHighlight(
      text: text ?? this.text,
      done: done ?? this.done,
      completedAt: completedAt ?? this.completedAt,
    );
  }

  Map<String, dynamic> toMap() => {
        'text': text,
        'done': done,
        'completedAt': completedAt,
      };

  factory DailyHighlight.fromMap(Map<String, dynamic> map) => DailyHighlight(
        text: map['text'] ?? '',
        done: map['done'] ?? false,
        completedAt: map['completedAt'],
      );
}

class MicroCommitment {
  final String text;
  final bool done;
  final String? habitId;
  final String? completedAt;

  MicroCommitment({
    required this.text,
    this.done = false,
    this.habitId,
    this.completedAt,
  });

  MicroCommitment copyWith({
    String? text,
    bool? done,
    String? habitId,
    String? completedAt,
  }) {
    return MicroCommitment(
      text: text ?? this.text,
      done: done ?? this.done,
      habitId: habitId ?? this.habitId,
      completedAt: completedAt ?? this.completedAt,
    );
  }

  Map<String, dynamic> toMap() => {
        'text': text,
        'done': done,
        'habitId': habitId,
        'completedAt': completedAt,
      };

  factory MicroCommitment.fromMap(Map<String, dynamic> map) => MicroCommitment(
        text: map['text'] ?? '',
        done: map['done'] ?? false,
        habitId: map['habitId'],
        completedAt: map['completedAt'],
      );
}

class DailyRecord {
  final String id;
  final String date; // YYYY-MM-DD
  final String brainDump;
  final DailyHighlight dailyHighlight;
  final MicroCommitment microCommitment;
  final String updatedAt;

  DailyRecord({
    required this.id,
    required this.date,
    this.brainDump = '',
    required this.dailyHighlight,
    required this.microCommitment,
    required this.updatedAt,
  });

  DailyRecord copyWith({
    String? brainDump,
    DailyHighlight? dailyHighlight,
    MicroCommitment? microCommitment,
    String? updatedAt,
  }) {
    return DailyRecord(
      id: id,
      date: date,
      brainDump: brainDump ?? this.brainDump,
      dailyHighlight: dailyHighlight ?? this.dailyHighlight,
      microCommitment: microCommitment ?? this.microCommitment,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  Map<String, dynamic> toMap() => {
        'id': id,
        'date': date,
        'brainDump': brainDump,
        'dailyHighlight': dailyHighlight.toMap(),
        'microCommitment': microCommitment.toMap(),
        'updatedAt': updatedAt,
      };

  factory DailyRecord.fromMap(Map<String, dynamic> map) => DailyRecord(
        id: map['id'] ?? '',
        date: map['date'] ?? '',
        brainDump: map['brainDump'] ?? '',
        dailyHighlight: DailyHighlight.fromMap(map['dailyHighlight'] ?? {}),
        microCommitment: MicroCommitment.fromMap(map['microCommitment'] ?? {}),
        updatedAt: map['updatedAt'] ?? DateTime.now().toIso8601String(),
      );

  factory DailyRecord.empty(String date) => DailyRecord(
        id: 'record-$date',
        date: date,
        brainDump: '',
        dailyHighlight: DailyHighlight(text: ''),
        microCommitment: MicroCommitment(text: ''),
        updatedAt: DateTime.now().toIso8601String(),
      );
}

class TaskItem {
  final String id;
  final String name;
  final BucketType bucket;
  final TaskStatus status;
  final TaskPriority priority;
  final String? dueDate;
  final String? projectId;
  final String? notes;
  final int? estimatedMinutes;
  final int order;
  final String createdAt;
  final String? completedAt;

  TaskItem({
    required this.id,
    required this.name,
    this.bucket = BucketType.must,
    this.status = TaskStatus.not_started,
    this.priority = TaskPriority.medium,
    this.dueDate,
    this.projectId,
    this.notes,
    this.estimatedMinutes,
    this.order = 0,
    required this.createdAt,
    this.completedAt,
  });

  TaskItem copyWith({
    String? name,
    BucketType? bucket,
    TaskStatus? status,
    TaskPriority? priority,
    String? dueDate,
    String? projectId,
    String? notes,
    int? estimatedMinutes,
    int? order,
    String? completedAt,
  }) {
    return TaskItem(
      id: id,
      name: name ?? this.name,
      bucket: bucket ?? this.bucket,
      status: status ?? this.status,
      priority: priority ?? this.priority,
      dueDate: dueDate ?? this.dueDate,
      projectId: projectId ?? this.projectId,
      notes: notes ?? this.notes,
      estimatedMinutes: estimatedMinutes ?? this.estimatedMinutes,
      order: order ?? this.order,
      createdAt: createdAt,
      completedAt: completedAt ?? this.completedAt,
    );
  }

  Map<String, dynamic> toMap() => {
        'id': id,
        'name': name,
        'bucket': bucket.name,
        'status': status.name,
        'priority': priority.name,
        'dueDate': dueDate,
        'projectId': projectId,
        'notes': notes,
        'estimatedMinutes': estimatedMinutes,
        'order': order,
        'createdAt': createdAt,
        'completedAt': completedAt,
      };

  factory TaskItem.fromMap(Map<String, dynamic> map) => TaskItem(
        id: map['id'] ?? '',
        name: map['name'] ?? '',
        bucket: BucketType.values.byName(map['bucket'] ?? 'must'),
        status: TaskStatus.values.byName(map['status'] ?? 'not_started'),
        priority: TaskPriority.values.byName(map['priority'] ?? 'medium'),
        dueDate: map['dueDate'] ?? map['due_date'],
        projectId: map['projectId'] ?? map['project_id'],
        notes: map['notes'],
        estimatedMinutes: map['estimatedMinutes'] ?? map['estimated_minutes'],
        order: map['order'] ?? 0,
        createdAt: map['createdAt'] ?? map['created_at'] ?? DateTime.now().toIso8601String(),
        completedAt: map['completedAt'] ?? map['completed_at'],
      );
}

class CreativeLogEntry {
  final String id;
  final String content;
  final CreativeLogType type;
  final int timestampSec;
  final String createdAt;

  CreativeLogEntry({
    required this.id,
    required this.content,
    this.type = CreativeLogType.note,
    required this.timestampSec,
    required this.createdAt,
  });

  Map<String, dynamic> toMap() => {
        'id': id,
        'content': content,
        'type': type.name,
        'timestampSec': timestampSec,
        'createdAt': createdAt,
      };

  factory CreativeLogEntry.fromMap(Map<String, dynamic> map) => CreativeLogEntry(
        id: map['id'] ?? '',
        content: map['content'] ?? '',
        type: CreativeLogType.values.byName(map['type'] ?? 'note'),
        timestampSec: map['timestampSec'] ?? 0,
        createdAt: map['createdAt'] ?? DateTime.now().toIso8601String(),
      );
}

class SprintSession {
  final String id;
  final String? taskId;
  final String? taskName;
  final BucketType? bucket;
  final String? projectId;
  final String startTime;
  final String endTime;
  final int plannedDurationSec;
  final int actualDurationSec;
  final FocusQuality? focusQuality;
  final bool endedEarly;
  final String? notes;
  final String? creativeTakeaway;
  final List<CreativeLogEntry> creativeLog;

  SprintSession({
    required this.id,
    this.taskId,
    this.taskName,
    this.bucket,
    this.projectId,
    required this.startTime,
    required this.endTime,
    this.plannedDurationSec = 1500,
    this.actualDurationSec = 0,
    this.focusQuality,
    this.endedEarly = false,
    this.notes,
    this.creativeTakeaway,
    this.creativeLog = const [],
  });

  Map<String, dynamic> toMap() => {
        'id': id,
        'taskId': taskId,
        'taskName': taskName,
        'bucket': bucket?.name,
        'projectId': projectId,
        'startTime': startTime,
        'endTime': endTime,
        'plannedDurationSec': plannedDurationSec,
        'actualDurationSec': actualDurationSec,
        'focusQuality': focusQuality?.name,
        'endedEarly': endedEarly,
        'notes': notes,
        'creativeTakeaway': creativeTakeaway,
        'creativeLog': creativeLog.map((e) => e.toMap()).toList(),
      };
}

class Project {
  final String id;
  final String name;
  final String? description;
  final String color;
  final String? targetDate;
  final String createdAt;

  Project({
    required this.id,
    required this.name,
    this.description,
    this.color = '#6366F1',
    this.targetDate,
    required this.createdAt,
  });

  Project copyWith({
    String? name,
    String? description,
    String? color,
    String? targetDate,
  }) =>
      Project(
        id: id,
        name: name ?? this.name,
        description: description ?? this.description,
        color: color ?? this.color,
        targetDate: targetDate ?? this.targetDate,
        createdAt: createdAt,
      );

  Map<String, dynamic> toMap() => {
        'id': id,
        'name': name,
        'description': description,
        'color': color,
        'targetDate': targetDate,
        'createdAt': createdAt,
      };

  factory Project.fromMap(Map<String, dynamic> map) => Project(
        id: map['id'] ?? '',
        name: map['name'] ?? '',
        description: map['description'],
        color: map['color'] ?? '#6366F1',
        targetDate: map['targetDate'] ?? map['target_date'],
        createdAt: map['createdAt'] ?? map['created_at'] ?? DateTime.now().toIso8601String(),
      );
}

class Habit {
  final String id;
  final String name;
  final int currentStreak;
  final int bestStreak;
  final String? lastCompletedDate;
  final String createdAt;

  Habit({
    required this.id,
    required this.name,
    this.currentStreak = 0,
    this.bestStreak = 0,
    this.lastCompletedDate,
    required this.createdAt,
  });

  Habit copyWith({
    String? name,
    int? currentStreak,
    int? bestStreak,
    String? lastCompletedDate,
  }) =>
      Habit(
        id: id,
        name: name ?? this.name,
        currentStreak: currentStreak ?? this.currentStreak,
        bestStreak: bestStreak ?? this.bestStreak,
        lastCompletedDate: lastCompletedDate ?? this.lastCompletedDate,
        createdAt: createdAt,
      );

  Map<String, dynamic> toMap() => {
        'id': id,
        'name': name,
        'currentStreak': currentStreak,
        'bestStreak': bestStreak,
        'lastCompletedDate': lastCompletedDate,
        'createdAt': createdAt,
      };

  factory Habit.fromMap(Map<String, dynamic> map) => Habit(
        id: map['id'] ?? '',
        name: map['name'] ?? '',
        currentStreak: map['currentStreak'] ?? map['current_streak'] ?? 0,
        bestStreak: map['bestStreak'] ?? map['best_streak'] ?? 0,
        lastCompletedDate: map['lastCompletedDate'] ?? map['last_completed_date'],
        createdAt: map['createdAt'] ?? map['created_at'] ?? DateTime.now().toIso8601String(),
      );
}

class UserSettings {
  final String mode; // 'simple' | 'advanced'
  final String weekStartDay; // 'monday' | 'sunday'
  final bool gentleNudgesEnabled;
  final bool soundEnabled;
  final Map<String, bool> dismissedHints;

  UserSettings({
    this.mode = 'simple',
    this.weekStartDay = 'monday',
    this.gentleNudgesEnabled = true,
    this.soundEnabled = false,
    this.dismissedHints = const {},
  });

  UserSettings copyWith({
    String? mode,
    String? weekStartDay,
    bool? gentleNudgesEnabled,
    bool? soundEnabled,
    Map<String, bool>? dismissedHints,
  }) =>
      UserSettings(
        mode: mode ?? this.mode,
        weekStartDay: weekStartDay ?? this.weekStartDay,
        gentleNudgesEnabled: gentleNudgesEnabled ?? this.gentleNudgesEnabled,
        soundEnabled: soundEnabled ?? this.soundEnabled,
        dismissedHints: dismissedHints ?? this.dismissedHints,
      );

  Map<String, dynamic> toMap() => {
        'mode': mode,
        'weekStartDay': weekStartDay,
        'gentleNudgesEnabled': gentleNudgesEnabled,
        'soundEnabled': soundEnabled,
        'dismissedHints': dismissedHints,
      };

  factory UserSettings.fromMap(Map<String, dynamic> map) => UserSettings(
        mode: map['mode'] ?? 'simple',
        weekStartDay: map['weekStartDay'] ?? map['week_start_day'] ?? 'monday',
        gentleNudgesEnabled: map['gentleNudgesEnabled'] ?? map['gentle_nudges_enabled'] ?? true,
        soundEnabled: map['soundEnabled'] ?? map['sound_enabled'] ?? false,
        dismissedHints: Map<String, bool>.from(map['dismissedHints'] ?? map['dismissed_hints'] ?? {}),
      );
}
