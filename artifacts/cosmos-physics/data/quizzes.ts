export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type Quiz = {
  createdBy?: string;
  id: string;
  title: string;
  topic: string;
  courseId: string;
  difficulty: "Easy" | "Medium" | "Hard";
  durationMinutes: number;
  questions: QuizQuestion[];
};

export const quizzes: Quiz[] = [
  {
    id: "qz-mech-1",
    title: "Newton's Laws Sprint",
    topic: "Mechanics",
    courseId: "mechanics",
    difficulty: "Medium",
    durationMinutes: 10,
    questions: [
      {
        id: "q1",
        question:
          "A 2 kg body moves with an acceleration of 5 m/s^2. The net force acting on it is:",
        options: ["2.5 N", "10 N", "7 N", "0.4 N"],
        correctIndex: 1,
        explanation: "F = ma = 2 × 5 = 10 N.",
      },
      {
        id: "q2",
        question: "Newton's third law is best described as:",
        options: [
          "Force equals mass times acceleration",
          "An object stays at rest unless acted upon",
          "Every action has an equal and opposite reaction",
          "Momentum is conserved",
        ],
        correctIndex: 2,
        explanation: "Action and reaction are equal in magnitude and opposite in direction.",
      },
      {
        id: "q3",
        question:
          "A body of mass 5 kg slides on a frictionless incline of 30°. Acceleration along the incline is (g = 10 m/s^2):",
        options: ["10 m/s^2", "5 m/s^2", "2.5 m/s^2", "8.66 m/s^2"],
        correctIndex: 1,
        explanation: "a = g sin θ = 10 × 0.5 = 5 m/s^2.",
      },
      {
        id: "q4",
        question: "Impulse is the rate of change of:",
        options: ["Force", "Velocity", "Momentum", "Displacement"],
        correctIndex: 2,
        explanation: "Impulse = change in momentum (J = Δp).",
      },
      {
        id: "q5",
        question:
          "A car of mass 1000 kg moving at 20 m/s is brought to rest in 5 s. The retarding force is:",
        options: ["2000 N", "4000 N", "8000 N", "10000 N"],
        correctIndex: 1,
        explanation: "F = m × a = 1000 × (20/5) = 4000 N.",
      },
    ],
  },
  {
    id: "qz-em-1",
    title: "Electrostatics Daily",
    topic: "Electricity & Magnetism",
    courseId: "em",
    difficulty: "Hard",
    durationMinutes: 12,
    questions: [
      {
        id: "q1",
        question:
          "Two point charges +q and +q are separated by distance r. The force between them is:",
        options: [
          "kq^2 / r",
          "kq^2 / r^2",
          "kq / r^2",
          "kq^2 r^2",
        ],
        correctIndex: 1,
        explanation: "Coulomb's law: F = kq^2 / r^2.",
      },
      {
        id: "q2",
        question: "Electric field inside a charged conductor in equilibrium is:",
        options: ["Maximum", "Zero", "Constant non-zero", "Infinite"],
        correctIndex: 1,
        explanation: "Inside a conductor in electrostatic equilibrium, E = 0.",
      },
      {
        id: "q3",
        question: "Capacitance of a parallel plate capacitor depends on:",
        options: [
          "Charge on plates",
          "Voltage across plates",
          "Area and separation of plates",
          "Material of wire connecting",
        ],
        correctIndex: 2,
        explanation: "C = ε₀A/d — depends only on geometry and dielectric.",
      },
      {
        id: "q4",
        question: "SI unit of electric flux is:",
        options: ["N/C", "V·m", "C/m^2", "A·s"],
        correctIndex: 1,
        explanation: "Flux Φ = E·A, units = (N/C)·m^2 = V·m.",
      },
    ],
  },
  {
    id: "qz-modern-1",
    title: "Photoelectric Effect Quiz",
    topic: "Modern Physics",
    courseId: "modern",
    difficulty: "Medium",
    durationMinutes: 8,
    questions: [
      {
        id: "q1",
        question: "The photoelectric effect was explained by:",
        options: ["Newton", "Einstein", "Maxwell", "Bohr"],
        correctIndex: 1,
        explanation: "Einstein explained it using the quantum theory of light (1905).",
      },
      {
        id: "q2",
        question: "The maximum kinetic energy of photoelectrons depends on:",
        options: [
          "Intensity of light",
          "Frequency of light",
          "Angle of incidence",
          "Time of exposure",
        ],
        correctIndex: 1,
        explanation: "KE_max = hν − φ. It depends on frequency, not intensity.",
      },
      {
        id: "q3",
        question: "Threshold frequency is the:",
        options: [
          "Frequency at which intensity becomes zero",
          "Minimum frequency for emission of photoelectrons",
          "Maximum frequency a metal can absorb",
          "Frequency of incident light at saturation current",
        ],
        correctIndex: 1,
        explanation: "Below threshold frequency, no photoelectrons are emitted.",
      },
    ],
  },
  {
    id: "qz-optics-1",
    title: "Wave Optics Challenge",
    topic: "Optics",
    courseId: "optics",
    difficulty: "Hard",
    durationMinutes: 10,
    questions: [
      {
        id: "q1",
        question: "In Young's double slit experiment, fringe width is:",
        options: ["λD/d", "λd/D", "Dd/λ", "λ/Dd"],
        correctIndex: 0,
        explanation: "Fringe width β = λD/d.",
      },
      {
        id: "q2",
        question: "Light shows polarization because it is a:",
        options: [
          "Longitudinal wave",
          "Transverse wave",
          "Mechanical wave",
          "Stationary wave",
        ],
        correctIndex: 1,
        explanation: "Only transverse waves can be polarized.",
      },
      {
        id: "q3",
        question: "The phenomenon of bending of light around obstacles is called:",
        options: ["Refraction", "Reflection", "Diffraction", "Dispersion"],
        correctIndex: 2,
        explanation: "Diffraction is the bending of waves around edges.",
      },
    ],
  },
];

export function getQuiz(id: string): Quiz | undefined {
  return quizzes.find((q) => q.id === id);
}
