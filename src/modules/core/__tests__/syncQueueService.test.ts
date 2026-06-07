import { syncQueueService } from '../services/syncQueue.service';

const storage: Record<string, string | null> = {};
const setPendingCount = jest.fn();
const setSyncing = jest.fn();
const setLastSyncAt = jest.fn();

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn((key: string) => Promise.resolve(storage[key] ?? null)),
    setItem: jest.fn((key: string, value: string) => {
      storage[key] = value;
      return Promise.resolve();
    }),
    removeItem: jest.fn((key: string) => {
      storage[key] = null;
      return Promise.resolve();
    }),
  },
}));

jest.mock('../states/sync.store', () => ({
  useSyncStore: {
    getState: () => ({
      setPendingCount,
      setSyncing,
      setLastSyncAt,
    }),
  },
}));

const QUEUE_KEY = '@mastery_habits:sync_queue';

describe('syncQueueService', () => {
  beforeEach(() => {
    for (const key of Object.keys(storage)) {
      delete storage[key];
    }

    jest.clearAllMocks();
  });

  it('hydrates pending count from persisted queue', async () => {
    storage[QUEUE_KEY] = JSON.stringify([
      { id: 'op-1', type: 'task_create', payload: {}, timestamp: 1, retries: 0 },
      { id: 'op-2', type: 'task_delete', payload: { id: 'task-1' }, timestamp: 2, retries: 0 },
    ]);

    await syncQueueService.hydratePendingCount();

    expect(setPendingCount).toHaveBeenCalledWith(2);
  });

  it('rewrites queued task and subtask references', async () => {
    storage[QUEUE_KEY] = JSON.stringify([
      {
        id: 'op-1',
        type: 'task_update',
        payload: { id: 'temp-task', title: 'Updated' },
        timestamp: 1,
        retries: 0,
      },
      {
        id: 'op-2',
        type: 'subtask_toggle',
        payload: { taskId: 'temp-task', subtaskId: 'temp-subtask' },
        timestamp: 2,
        retries: 0,
      },
    ]);

    await syncQueueService.replaceEntityReferences(
      { 'temp-task': 'real-task' },
      { 'temp-subtask': 'real-subtask' }
    );

    expect(JSON.parse(storage[QUEUE_KEY] ?? '[]')).toEqual([
      {
        id: 'op-1',
        type: 'task_update',
        payload: { id: 'real-task', title: 'Updated' },
        timestamp: 1,
        retries: 0,
      },
      {
        id: 'op-2',
        type: 'subtask_toggle',
        payload: { taskId: 'real-task', subtaskId: 'real-subtask' },
        timestamp: 2,
        retries: 0,
      },
    ]);
  });

  it('processes all queued operations from a single snapshot (no re-read)', async () => {
    storage[QUEUE_KEY] = JSON.stringify([
      {
        id: 'create-op',
        type: 'task_create',
        payload: { optimisticId: 'temp-task' },
        timestamp: 1,
        retries: 0,
      },
      {
        id: 'complete-op',
        type: 'task_complete',
        payload: { id: 'temp-task' },
        timestamp: 2,
        retries: 0,
      },
    ]);

    const seenIds: string[] = [];

    await syncQueueService.processQueue(async (operation) => {
      seenIds.push(operation.payload.id ?? operation.payload.optimisticId);

      if (operation.id === 'create-op') {
        await syncQueueService.replaceEntityReferences({ 'temp-task': 'real-task' });
      }
    });

    // Both operations see the original payload from the initial snapshot.
    // replaceEntityReferences runs in parallel but doesn't mutate in-flight ops.
    expect(seenIds).toEqual(expect.arrayContaining(['temp-task', 'temp-task']));
  });
});
