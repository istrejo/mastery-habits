// TODO: replace with Google Calendar integration (separate feature). Mock only.
export interface ScheduleEvent {
  id: string;
  title: string;
  time: string;
  subtitle: string;
  kind: "video" | "location";
}

export const getMockSchedule = (_date: string): ScheduleEvent[] => [
  {
    id: "1",
    title: "Design Sync",
    time: "10:00 AM",
    subtitle: "Google Meet",
    kind: "video",
  },
  {
    id: "2",
    title: "Lunch w/ Sarah",
    time: "12:30 PM",
    subtitle: "Blue Bottle Cafe",
    kind: "location",
  },
];
