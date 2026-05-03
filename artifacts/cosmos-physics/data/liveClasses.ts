export type LiveClass = {
  createdBy?: string;
  id: string;
  title: string;
  topic: string;
  faculty: string;
  date: string;
  time: string;
  durationMinutes: number;
  enrolled: number;
  isLive: boolean;
  meetUrl: string;
  youtubeUrl?: string;
};

export const liveClasses: LiveClass[] = [
  {
    id: "lc1",
    title: "Rotational Dynamics — Master Class",
    topic: "Mechanics",
    faculty: "Md Zafar Alam",
    date: "Today",
    time: "7:30 PM IST",
    durationMinutes: 90,
    enrolled: 1248,
    isLive: true,
    meetUrl: "https://meet.google.com/cosmos-rot-dyn",
  },
  {
    id: "lc2",
    title: "Electrostatics: PYQ Marathon",
    topic: "Electricity & Magnetism",
    faculty: "Md Zafar Alam",
    date: "Tomorrow",
    time: "6:00 PM IST",
    durationMinutes: 120,
    enrolled: 982,
    isLive: false,
    meetUrl: "https://meet.google.com/cosmos-electro-pyq",
  },
  {
    id: "lc3",
    title: "Wave Optics Doubt Hour",
    topic: "Optics",
    faculty: "Md Zafar Alam",
    date: "Sat, May 02",
    time: "5:00 PM IST",
    durationMinutes: 60,
    enrolled: 612,
    isLive: false,
    meetUrl: "https://meet.google.com/cosmos-wave-doubt",
  },
  {
    id: "lc4",
    title: "Modern Physics Fast Revision",
    topic: "Modern Physics",
    faculty: "Md Zafar Alam",
    date: "Sun, May 03",
    time: "11:00 AM IST",
    durationMinutes: 90,
    enrolled: 1408,
    isLive: false,
    meetUrl: "https://meet.google.com/cosmos-modern-rev",
  },
];

export type LeaderboardEntry = {
  rank: number;
  name: string;
  city: string;
  score: number;
  avatar: string;
};

export const leaderboard: LeaderboardEntry[] = [
  { rank: 1, name: "Aarav Verma", city: "Patna", score: 9820, avatar: "AV" },
  { rank: 2, name: "Sneha Iyer", city: "Chennai", score: 9670, avatar: "SI" },
  { rank: 3, name: "Rohan Kapoor", city: "Delhi", score: 9540, avatar: "RK" },
  { rank: 4, name: "Priya Singh", city: "Lucknow", score: 9410, avatar: "PS" },
  { rank: 5, name: "Aditya Rao", city: "Hyderabad", score: 9280, avatar: "AR" },
  { rank: 6, name: "Meera Joshi", city: "Pune", score: 9120, avatar: "MJ" },
  { rank: 7, name: "Kabir Khan", city: "Mumbai", score: 8990, avatar: "KK" },
  { rank: 8, name: "Ananya Das", city: "Kolkata", score: 8840, avatar: "AD" },
];

export type Notification = {
  id: string;
  title: string;
  body: string;
  time: string;
  type: "live" | "exam" | "result" | "info";
};

export const notifications: Notification[] = [
  {
    id: "n1",
    title: "Live Now: Rotational Dynamics",
    body: "Md Zafar Alam is going live in 5 minutes. Join the master class.",
    time: "Just now",
    type: "live",
  },
  {
    id: "n2",
    title: "Quiz Result: Newton's Laws Sprint",
    body: "You scored 4/5. View detailed analysis on the leaderboard.",
    time: "1 h ago",
    type: "result",
  },
  {
    id: "n3",
    title: "Exam Reminder: Mechanics Mock",
    body: "Your full-length Mechanics test starts in 2 hours.",
    time: "Today, 4:30 PM",
    type: "exam",
  },
  {
    id: "n4",
    title: "New Notes Uploaded",
    body: "Wave Optics formula sheet & PYQ booklet are now available.",
    time: "Yesterday",
    type: "info",
  },
];
