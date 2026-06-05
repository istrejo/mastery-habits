import { useEffect } from 'react';
import { useNetworkStatus } from '@core/hooks/useNetworkStatus';
import { syncQueueService, type PendingOperation } from '@core/services/syncQueue.service';
import { useSyncStore } from '@core/states/sync.store';
import { useSessionStore } from '@core/states/session.store';
import { tasksCacheService } from '../services/tasksCache.service';
import { tasksService } from '../services/tasks.service';

const syncCreateOperation = async (operation: PendingOperation) => {
  let createdTask;

  if (operation.payload?.mode === 'plain') {
    createdTask = await tasksService.create(operation.payload.input);
  } else if (operation.payload?.mode === 'withSubtasks') {
    createdTask = await tasksService.createWithSubtasks(operation.payload.input);
  } else {
    createdTask = await tasksService.createWithSubtasks(operation.payload);
  }

  const taskIdMap = operation.payload?.optimisticId
    ? { [operation.payload.optimisticId]: createdTask.id }
    : {};
  const optimisticSubtaskIds = operation.payload?.optimisticSubtaskIds ?? [];
  const subtaskIdMap = Object.fromEntries(
    optimisticSubtaskIds
      .map((tempId: string, index: number) => {
        const createdSubtask = createdTask.task_subtasks[index];
        return createdSubtask ? [tempId, createdSubtask.id] : null;
      })
      .filter(
        (entry: [string, string] | null): entry is [string, string] =>
          entry !== null
      )
  );

  await syncQueueService.replaceEntityReferences(taskIdMap, subtaskIdMap);

  if (operation.payload?.optimisticId) {
    await tasksCacheService.remove(operation.payload.optimisticId);
  }

  await tasksCacheService.upsert(createdTask);
};

export const useTaskAutoSync = () => {
  const { isOnline } = useNetworkStatus();
  const { isSyncing, pendingCount } = useSyncStore();
  const userId = useSessionStore((state) => state.user?.id ?? null);

  useEffect(() => {
    void syncQueueService.hydratePendingCount();
  }, []);

  useEffect(() => {
    if (isOnline && userId && !isSyncing && pendingCount > 0) {
      void processQueue();
    }
  }, [isOnline, isSyncing, pendingCount, userId]);

  const processQueue = async () => {
    await syncQueueService.processQueue(async (operation: PendingOperation) => {
      switch (operation.type) {
        case 'task_complete':
          await tasksService.complete(operation.payload.id);
          break;
        case 'task_uncomplete':
          await tasksService.uncomplete(operation.payload.id);
          break;
        case 'task_create':
          await syncCreateOperation(operation);
          break;
        case 'task_update':
          await tasksService.updateWithSubtasks(operation.payload.id, operation.payload);
          break;
        case 'task_delete':
          await tasksService.delete(operation.payload.id);
          break;
        case 'subtask_toggle':
          await tasksService.toggleSubtask(operation.payload.taskId, operation.payload.subtaskId);
          break;
      }
    });
  };

  return { isSyncing, isOnline, pendingCount };
};
