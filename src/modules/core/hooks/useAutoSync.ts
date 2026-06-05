import { useEffect } from 'react';
import { useNetworkStatus } from './useNetworkStatus';
import { useSyncStore } from '../states/sync.store';
import { syncQueueService, type PendingOperation } from '../services/syncQueue.service';
import { tasksService } from '@tasks/services/tasks.service';

export const useAutoSync = () => {
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
          if (operation.payload?.mode === 'plain') {
            await tasksService.create(operation.payload.input);
            break;
          }

          if (operation.payload?.mode === 'withSubtasks') {
            await tasksService.createWithSubtasks(operation.payload.input);
            break;
          }

          await tasksService.createWithSubtasks(operation.payload);
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
