export const qk = {
  tasks: (userId: string, date: string) => ["tasks", userId, date] as const,
  subtasks: (parentId: string) => ["tasks", "sub", parentId] as const,
  habits: (userId: string) => ["habits", userId] as const,
  habitLogs: (userId: string, date: string) => ["habitLogs", userId, date] as const,
};
