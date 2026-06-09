// TODO: replace with Google Calendar integration

export interface ScheduleEvent {
  id: string;
  title: string;
  time: string; // e.g. "10:00 AM"
  subtitle: string; // e.g. "Google Meet"
  kind: "video" | "location";
}

const MOCK_EVENTS: Record<string, ScheduleEvent[]> = {
  "2026-06-08": [
    {
      id: "mock-1",
      title: "Team Standup",
      time: "09:30 AM",
      subtitle: "Google Meet",
      kind: "video",
    },
    {
      id: "mock-2",
      title: "Coffee at Blue Bottle",
      time: "03:00 PM",
      subtitle: "123 Main St",
      kind: "location",
    },
  ],
  "2026-06-09": [
    {
      id: "mock-3",
      title: "Design Review",
      time: "10:00 AM",
      subtitle: "Google Meet",
      kind: "video",
    },
    {
      id: "mock-4",
      title: "Lunch with Alex",
      time: "12:30 PM",
      subtitle: "Chipotle",
      kind: "location",
    },
    {
      id: "mock-5",
      title: "Sprint Retro",
      time: "04:00 PM",
      subtitle: "Zoom",
      kind: "video",
    },
  ],
  "2026-06-10": [
    {
      id: "mock-6",
      title: "Code Review",
      time: "11:00 AM",
      subtitle: "Google Meet",
      kind: "video",
    },
    {
      id: "mock-7",
      title: "Dentist Appointment",
      time: "02:00 PM",
      subtitle: "123 Health Ave",
      kind: "location",
    },
  ],
};

const DEFAULT_EVENTS: ScheduleEvent[] = [
  {
    id: "mock-default-1",
    title: "Morning Standup",
    time: "09:00 AM",
    subtitle: "Google Meet",
    kind: "video",
  },
  {
    id: "mock-default-2",
    title: "Gym Session",
    time: "06:00 PM",
    subtitle: "FitLife Gym",
    kind: "location",
  },
];

export function getMockSchedule(date: string): ScheduleEvent[] {
  if (MOCK_EVENTS[date]) {
    return MOCK_EVENTS[date];
  }
  return DEFAULT_EVENTS;
}
