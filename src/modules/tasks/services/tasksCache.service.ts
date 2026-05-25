import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TaskWithHabit } from '../types';

const CACHE_KEY = '@mastery_habits:tasks_cache';

export const tasksCacheService = {
  async save(tasks: TaskWithHabit[]): Promise<void> {
    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save tasks cache:', error);
    }
  },

  async load(): Promise<TaskWithHabit[]> {
    try {
      const data = await AsyncStorage.getItem(CACHE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load tasks cache:', error);
      return [];
    }
  },

  async upsert(task: TaskWithHabit): Promise<void> {
    const tasks = await this.load();
    const index = tasks.findIndex((t) => t.id === task.id);

    if (index >= 0) {
      tasks[index] = task;
    } else {
      tasks.unshift(task);
    }

    await this.save(tasks);
  },

  async remove(id: string): Promise<void> {
    const tasks = await this.load();
    const filtered = tasks.filter((t) => t.id !== id);
    await this.save(filtered);
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.error('Failed to clear tasks cache:', error);
    }
  },
};
