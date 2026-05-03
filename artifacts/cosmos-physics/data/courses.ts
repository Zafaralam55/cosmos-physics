export type Chapter = {
  id: string;
  title: string;
  duration: string;
  videoCount: number;
  youtubeUrl?: string;
};

export type Course = {
  createdBy?: string;
  id: string;
  title: string;
  subtitle: string;
  level: "Class 9-10" | "Class 11-12" | "JEE/NEET" | "Engineering";
  icon: string;
  gradient: [string, string];
  rating: number;
  students: number;
  lessons: number;
  hours: number;
  price: number;
  description: string;
  youtubePlaylistUrl?: string;
  chapters: Chapter[];
};

export const courses: Course[] = [
  {
    id: "mechanics",
    title: "Mechanics",
    subtitle: "Motion, Force, Energy & Rotation",
    level: "JEE/NEET",
    icon: "activity",
    gradient: ["#5B8CFF", "#8B5CF6"],
    rating: 4.9,
    students: 12480,
    lessons: 84,
    hours: 42,
    price: 1499,
    description:
      "Master Newtonian mechanics from kinematics to rotational dynamics with deep conceptual clarity and JEE-level numericals.",
    chapters: [
      { id: "m1", title: "Units and Measurements", duration: "1h 20m", videoCount: 6 },
      { id: "m2", title: "Kinematics", duration: "3h 10m", videoCount: 12 },
      { id: "m3", title: "Laws of Motion", duration: "2h 45m", videoCount: 10 },
      { id: "m4", title: "Work, Energy & Power", duration: "2h 30m", videoCount: 9 },
      { id: "m5", title: "System of Particles", duration: "2h 15m", videoCount: 8 },
      { id: "m6", title: "Rotational Motion", duration: "3h 50m", videoCount: 14 },
      { id: "m7", title: "Gravitation", duration: "2h 40m", videoCount: 10 },
    ],
  },
  {
    id: "thermodynamics",
    title: "Thermodynamics",
    subtitle: "Heat, Temperature & Kinetic Theory",
    level: "JEE/NEET",
    icon: "thermometer",
    gradient: ["#FF8A4C", "#FF5470"],
    rating: 4.8,
    students: 8120,
    lessons: 52,
    hours: 28,
    price: 1199,
    description:
      "Build intuition for the laws of thermodynamics, kinetic theory and heat transfer with engineering-grade rigor.",
    chapters: [
      { id: "t1", title: "Thermal Properties of Matter", duration: "2h", videoCount: 8 },
      { id: "t2", title: "Kinetic Theory of Gases", duration: "2h 30m", videoCount: 9 },
      { id: "t3", title: "First Law of Thermodynamics", duration: "2h 15m", videoCount: 8 },
      { id: "t4", title: "Second Law & Entropy", duration: "2h 40m", videoCount: 10 },
      { id: "t5", title: "Heat Engines & Refrigerators", duration: "2h", videoCount: 7 },
    ],
  },
  {
    id: "waves",
    title: "Waves & Oscillations",
    subtitle: "SHM, Sound & Wave Motion",
    level: "Class 11-12",
    icon: "activity",
    gradient: ["#22D3EE", "#5B8CFF"],
    rating: 4.7,
    students: 6940,
    lessons: 46,
    hours: 24,
    price: 999,
    description:
      "From simple harmonic motion to standing waves and Doppler — visualise oscillations like never before.",
    chapters: [
      { id: "w1", title: "Simple Harmonic Motion", duration: "2h 50m", videoCount: 10 },
      { id: "w2", title: "Wave Motion", duration: "2h 20m", videoCount: 9 },
      { id: "w3", title: "Sound Waves", duration: "2h 10m", videoCount: 8 },
      { id: "w4", title: "Superposition & Beats", duration: "2h", videoCount: 7 },
      { id: "w5", title: "Doppler Effect", duration: "1h 40m", videoCount: 6 },
    ],
  },
  {
    id: "optics",
    title: "Optics",
    subtitle: "Ray, Wave & Modern Optics",
    level: "JEE/NEET",
    icon: "eye",
    gradient: ["#A78BFA", "#EC4899"],
    rating: 4.8,
    students: 7320,
    lessons: 58,
    hours: 30,
    price: 1199,
    description:
      "Reflection, refraction, interference, diffraction and polarization explained with crystal-clear diagrams.",
    chapters: [
      { id: "o1", title: "Reflection of Light", duration: "1h 50m", videoCount: 7 },
      { id: "o2", title: "Refraction & Lenses", duration: "3h", videoCount: 12 },
      { id: "o3", title: "Optical Instruments", duration: "1h 40m", videoCount: 6 },
      { id: "o4", title: "Wave Optics", duration: "3h 20m", videoCount: 13 },
      { id: "o5", title: "Polarization", duration: "1h 30m", videoCount: 5 },
    ],
  },
  {
    id: "em",
    title: "Electricity & Magnetism",
    subtitle: "Circuits, Fields & Induction",
    level: "JEE/NEET",
    icon: "zap",
    gradient: ["#FACC15", "#F97316"],
    rating: 4.9,
    students: 10850,
    lessons: 72,
    hours: 38,
    price: 1499,
    description:
      "Electrostatics, current electricity, magnetic effects and electromagnetic induction with deep problem solving.",
    chapters: [
      { id: "e1", title: "Electrostatics", duration: "3h 10m", videoCount: 12 },
      { id: "e2", title: "Capacitance", duration: "2h", videoCount: 8 },
      { id: "e3", title: "Current Electricity", duration: "2h 50m", videoCount: 11 },
      { id: "e4", title: "Magnetic Effects", duration: "3h", videoCount: 11 },
      { id: "e5", title: "Electromagnetic Induction", duration: "2h 30m", videoCount: 9 },
      { id: "e6", title: "Alternating Current", duration: "2h 10m", videoCount: 8 },
    ],
  },
  {
    id: "modern",
    title: "Modern Physics",
    subtitle: "Quantum, Atoms & Nuclei",
    level: "JEE/NEET",
    icon: "compass",
    gradient: ["#34D399", "#22D3EE"],
    rating: 4.9,
    students: 9210,
    lessons: 48,
    hours: 26,
    price: 1299,
    description:
      "Photoelectric effect, atomic models, nuclear physics and semiconductors — high-weightage topics, fully covered.",
    chapters: [
      { id: "mp1", title: "Dual Nature of Radiation", duration: "2h", videoCount: 8 },
      { id: "mp2", title: "Atomic Structure", duration: "2h 20m", videoCount: 9 },
      { id: "mp3", title: "Nuclear Physics", duration: "2h 30m", videoCount: 10 },
      { id: "mp4", title: "Semiconductors", duration: "2h 10m", videoCount: 8 },
    ],
  },
  {
    id: "engphys",
    title: "Engineering Physics",
    subtitle: "B.Tech First-Year Curriculum",
    level: "Engineering",
    icon: "cpu",
    gradient: ["#F472B6", "#8B5CF6"],
    rating: 4.7,
    students: 4180,
    lessons: 64,
    hours: 34,
    price: 1799,
    description:
      "Crystal structure, lasers, fiber optics, quantum mechanics and superconductivity for B.Tech first-year students.",
    chapters: [
      { id: "ep1", title: "Crystal Structure", duration: "2h 30m", videoCount: 9 },
      { id: "ep2", title: "Lasers & Holography", duration: "2h", videoCount: 7 },
      { id: "ep3", title: "Fiber Optics", duration: "1h 50m", videoCount: 6 },
      { id: "ep4", title: "Quantum Mechanics Intro", duration: "2h 40m", videoCount: 10 },
      { id: "ep5", title: "Superconductivity", duration: "1h 40m", videoCount: 6 },
    ],
  },
];

export function getCourse(id: string): Course | undefined {
  return courses.find((c) => c.id === id);
}
