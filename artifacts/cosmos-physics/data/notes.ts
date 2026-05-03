export type StudyResource = {
  createdBy?: string;
  id: string;
  title: string;
  category: "Notes" | "Formula Sheet" | "PYQ" | "Numerical Sheet";
  pages: number;
  size: string;
  topic: string;
  pdfObjectPath?: string;
  driveUrl?: string;
};

export const resources: StudyResource[] = [
  {
    id: "r1",
    title: "Mechanics — Complete Class Notes",
    category: "Notes",
    pages: 84,
    size: "6.2 MB",
    topic: "Mechanics",
  },
  {
    id: "r2",
    title: "Electrostatics Formula Sheet",
    category: "Formula Sheet",
    pages: 6,
    size: "0.4 MB",
    topic: "Electricity & Magnetism",
  },
  {
    id: "r3",
    title: "JEE Main Physics PYQ (2014–2024)",
    category: "PYQ",
    pages: 168,
    size: "12.4 MB",
    topic: "All Chapters",
  },
  {
    id: "r4",
    title: "Optics — 200 Numericals",
    category: "Numerical Sheet",
    pages: 32,
    size: "1.8 MB",
    topic: "Optics",
  },
  {
    id: "r5",
    title: "Modern Physics Master Notes",
    category: "Notes",
    pages: 48,
    size: "3.6 MB",
    topic: "Modern Physics",
  },
  {
    id: "r6",
    title: "Thermodynamics Formula Sheet",
    category: "Formula Sheet",
    pages: 5,
    size: "0.3 MB",
    topic: "Thermodynamics",
  },
  {
    id: "r7",
    title: "NEET Physics PYQ Booklet",
    category: "PYQ",
    pages: 96,
    size: "7.1 MB",
    topic: "All Chapters",
  },
  {
    id: "r8",
    title: "Waves & SHM — 150 Numericals",
    category: "Numerical Sheet",
    pages: 24,
    size: "1.4 MB",
    topic: "Waves",
  },
];

export const formulas: { id: string; topic: string; name: string; expression: string }[] = [
  { id: "f1", topic: "Mechanics", name: "Newton's Second Law", expression: "F = m · a" },
  { id: "f2", topic: "Mechanics", name: "Kinetic Energy", expression: "KE = ½ · m · v²" },
  { id: "f3", topic: "Mechanics", name: "Work–Energy Theorem", expression: "W = ΔKE" },
  { id: "f4", topic: "Gravitation", name: "Gravitational Force", expression: "F = G · m₁m₂ / r²" },
  { id: "f5", topic: "Electricity", name: "Coulomb's Law", expression: "F = k · q₁q₂ / r²" },
  { id: "f6", topic: "Electricity", name: "Ohm's Law", expression: "V = I · R" },
  { id: "f7", topic: "Electricity", name: "Power", expression: "P = V · I = I² · R" },
  { id: "f8", topic: "Optics", name: "Lens Formula", expression: "1/v − 1/u = 1/f" },
  { id: "f9", topic: "Optics", name: "Fringe Width (YDSE)", expression: "β = λ · D / d" },
  { id: "f10", topic: "Modern", name: "Einstein Photoelectric", expression: "KE_max = hν − φ" },
  { id: "f11", topic: "Modern", name: "de Broglie Wavelength", expression: "λ = h / p" },
  { id: "f12", topic: "Thermodynamics", name: "First Law", expression: "ΔU = Q − W" },
  { id: "f13", topic: "Thermodynamics", name: "Ideal Gas", expression: "PV = nRT" },
  { id: "f14", topic: "Waves", name: "Wave Equation", expression: "v = f · λ" },
];
