import { useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { BucketType } from '../types';

export function useTaskDragAndDrop() {
  const { moveTaskInBucket, moveTaskToBucket } = useApp();
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<'before' | 'after' | null>(null);
  const [dragOverBucket, setDragOverBucket] = useState<BucketType | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedTaskId(null);
    setDragOverTaskId(null);
    setDragOverPosition(null);
    setDragOverBucket(null);
  }, []);

  const handleTaskDragOver = useCallback(
    (e: React.DragEvent, taskId: string, bucket: BucketType) => {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'move';

      if (draggedTaskId === taskId) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const offset = e.clientY - rect.top;
      const position = offset < rect.height / 2 ? 'before' : 'after';

      setDragOverTaskId(taskId);
      setDragOverPosition(position);
      setDragOverBucket(bucket);
    },
    [draggedTaskId]
  );

  const handleTaskDrop = useCallback(
    (e: React.DragEvent, targetTaskId: string) => {
      e.preventDefault();
      e.stopPropagation();
      const sourceId = e.dataTransfer.getData('text/plain') || draggedTaskId;
      if (sourceId && sourceId !== targetTaskId) {
        moveTaskInBucket(sourceId, targetTaskId, dragOverPosition || 'before');
      }
      handleDragEnd();
    },
    [draggedTaskId, dragOverPosition, moveTaskInBucket, handleDragEnd]
  );

  const handleBucketDragOver = useCallback(
    (e: React.DragEvent, bucket: BucketType) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDragOverBucket(bucket);
    },
    []
  );

  const handleBucketDrop = useCallback(
    (e: React.DragEvent, bucket: BucketType) => {
      e.preventDefault();
      const sourceId = e.dataTransfer.getData('text/plain') || draggedTaskId;
      if (sourceId) {
        moveTaskToBucket(sourceId, bucket);
      }
      handleDragEnd();
    },
    [draggedTaskId, moveTaskToBucket, handleDragEnd]
  );

  return {
    draggedTaskId,
    dragOverTaskId,
    dragOverPosition,
    dragOverBucket,
    handleDragStart,
    handleDragEnd,
    handleTaskDragOver,
    handleTaskDrop,
    handleBucketDragOver,
    handleBucketDrop,
  };
}
