export const toDateString = (d: Date): string => d.toISOString().slice(0, 10);

export const todayString = (): string => toDateString(new Date());

export const getWeekDays = (around: Date): Date[] => {
  const day = around.getDay();
  const monday = new Date(around);
  monday.setDate(around.getDate() - ((day + 6) % 7));
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
};

export const isSameDay = (a: string, b: string): boolean => a === b;

export const toDueDateISO = (dateStr: string): string =>
  `${dateStr}T12:00:00.000Z`;

export const formatTime = (totalSeconds: number): string => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};
