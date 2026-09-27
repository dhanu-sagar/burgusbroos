import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_provider.dart';
import '../constants/theme.dart';
import '../models/models.dart';

class ActiveSprintOverlay extends StatelessWidget {
  final VoidCallback onOpenSprint;

  const ActiveSprintOverlay({Key? key, required this.onOpenSprint}) : super(key: key);

  String _formatTime(int totalSec) {
    final m = (totalSec ~/ 60).toString().padLeft(2, '0');
    final s = (totalSec % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final sprint = app.activeSprint;

    if (sprint == null) return const SizedBox.shrink();

    final remainingSec = (sprint.plannedDurationSec - app.activeSprintElapsedSec).clamp(0, 99999);
    final isPaused = sprint.isPaused;

    Color bucketColor = AppColors.bucketMust;
    if (sprint.bucket == BucketType.should) bucketColor = AppColors.bucketShould;
    if (sprint.bucket == BucketType.could) bucketColor = AppColors.bucketCould;

    return Positioned(
      bottom: 24,
      left: 16,
      right: 16,
      child: Center(
        child: Material(
          elevation: 12,
          shadowColor: Colors.black26,
          borderRadius: BorderRadius.circular(100),
          color: Colors.white,
          child: InkWell(
            onTap: onOpenSprint,
            borderRadius: BorderRadius.circular(100),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(100),
                border: Border.all(color: bucketColor.withOpacity(0.4), width: 1.5),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 10,
                    height: 10,
                    decoration: BoxDecoration(
                      color: isPaused ? Colors.amber : bucketColor,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 10),
                  ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 160),
                    child: Text(
                      sprint.taskName ?? 'Active Sprint',
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 13,
                        color: AppColors.textPrimary,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppColors.neutral100,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      _formatTime(remainingSec),
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        fontWeight: FontWeight.w700,
                        fontSize: 12,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    icon: Icon(isPaused ? Icons.play_arrow_rounded : Icons.pause_rounded, size: 20),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                    color: bucketColor,
                    onPressed: () {
                      if (isPaused) {
                        app.resumeSprint();
                      } else {
                        app.pauseSprint();
                      }
                    },
                  ),
                  const SizedBox(width: 4),
                  const Icon(Icons.arrow_forward_ios_rounded, size: 12, color: AppColors.textMuted),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
