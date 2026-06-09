export const toDateString = (d: Date): string => d.toISOString().slice(0, 10);

export const todayString = (): string => toDateString(new Date());

export const getWeekDays = (around: Date): Date[] => {
  const day = around.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const mondayOffset = day === 0 ? -6 : 1 - day; // distance from Monday
  const monday = new Date(around);
  monday.setDate(around.getDate() + mondayOffset);

  const days: Date[] = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
};

export const isSameDay = (a: string, b: string): boolean => a === b;
