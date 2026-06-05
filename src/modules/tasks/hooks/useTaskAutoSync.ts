import { useEffect } from 'react';
import { useNetworkStatus } from '@core/hooks/useNetworkStatus';
import { syncQueueService, type PendingOperation } from '@core/services/syncQueue.service';
import { useSyncStore } from '@core/states/sync.store';
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

  if (operation.payload?.optimisticId) {
    await tasksCacheService.remove(operation.payload.optimisticId);
  }

  await tasksCacheService.upsert(createdTask);
};

export const useTaskAutoSync = () => {
  const { isOnline } = useNetworkStatus();
  const { isSyncing, pendingCount } = useSyncStore();

  useEffect(() => {
    if (isOnline && !isSyncing && pendingCount > 0) {
      void processQueue();
    }
  }, [isOnline, isSyncing, pendingCount]);

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
