import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncStore } from '../states/sync.store';

export interface PendingOperation {
  id: string;
  type: 'task_complete' | 'task_uncomplete' | 'task_create' | 'task_update' | 'task_delete' | 'subtask_toggle';
  payload: any;
  timestamp: number;
  retries: number;
}

const QUEUE_KEY = '@mastery_habits:sync_queue';
const MAX_RETRIES = 5;

export const syncQueueService = {
  async enqueue(operation: Omit<PendingOperation, 'id' | 'timestamp' | 'retries'>): Promise<string> {
    const queue = await this.getAll();
    const newOp: PendingOperation = {
      ...operation,
      id: `${operation.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retries: 0,
    };

    queue.push(newOp);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    useSyncStore.getState().setPendingCount(queue.length);

    return newOp.id;
  },

  async dequeue(operationId: string): Promise<void> {
    const queue = await this.getAll();
    const filtered = queue.filter((op) => op.id !== operationId);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
    useSyncStore.getState().setPendingCount(filtered.length);
  },

  async getAll(): Promise<PendingOperation[]> {
    try {
      const data = await AsyncStorage.getItem(QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async incrementRetry(operationId: string): Promise<void> {
    const queue = await this.getAll();
    const updated = queue.map((op) =>
      op.id === operationId ? { ...op, retries: op.retries + 1 } : op
    );
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(updated));
  },

  async removeFailedOperations(): Promise<void> {
    const queue = await this.getAll();
    const filtered = queue.filter((op) => op.retries < MAX_RETRIES);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
    useSyncStore.getState().setPendingCount(filtered.length);
  },

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(QUEUE_KEY);
    useSyncStore.getState().setPendingCount(0);
  },

  async processQueue(executor: (op: PendingOperation) => Promise<void>): Promise<void> {
    const queue = await this.getAll();
    if (queue.length === 0) return;

    useSyncStore.getState().setSyncing(true);

    for (const operation of queue) {
      try {
        await executor(operation);
        await this.dequeue(operation.id);
      } catch (error) {
        await this.incrementRetry(operation.id);
      }
    }

    await this.removeFailedOperations();
    useSyncStore.getState().setSyncing(false);
    useSyncStore.getState().setLastSyncAt(new Date());
  },
};
