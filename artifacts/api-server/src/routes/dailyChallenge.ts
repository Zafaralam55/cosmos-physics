import { db } from "@workspace/db";
import {
  dailyChallengeAnswersTable,
  dailyChallengesTable,
  studyStreaksTable,
} from "@workspace/db/schema";
import { and, eq } from "drizzle-orm";
import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

// Curated pool of JEE/NEET-level daily challenge questions
const QUESTION_POOL = [
  {
    question: "A ball is thrown vertically upward with velocity 20 m/s. Time to reach maximum height (g = 10 m/s²):",
    options: ["1 s", "2 s", "4 s", "0.5 s"],
    correctIndex: 1,
    explanation: "t = u/g = 20/10 = 2 s.",
    topic: "Mechanics",
    difficulty: "Easy",
  },
  {
    question: "The work done in moving a charge q through a potential difference V is:",
    options: ["q/V", "V/q", "qV", "q²V"],
    correctIndex: 2,
    explanation: "W = qV by definition of electric potential.",
    topic: "Electrostatics",
    difficulty: "Easy",
  },
  {
    question: "A photon has energy 3.3 eV. Its frequency is (h = 6.6 × 10⁻³⁴ J·s, 1 eV = 1.6 × 10⁻¹⁹ J):",
    options: ["8 × 10¹⁴ Hz", "4 × 10¹⁴ Hz", "2 × 10¹⁵ Hz", "1.6 × 10¹⁵ Hz"],
    correctIndex: 0,
    explanation: "E = hf → f = E/h = (3.3×1.6×10⁻¹⁹)/(6.6×10⁻³⁴) = 8×10¹⁴ Hz.",
    topic: "Modern Physics",
    difficulty: "Medium",
  },
  {
    question: "In simple harmonic motion, the restoring force is proportional to:",
    options: ["Velocity", "Displacement", "Acceleration²", "Time"],
    correctIndex: 1,
    explanation: "F = −kx. Restoring force is directly proportional to displacement.",
    topic: "Oscillations",
    difficulty: "Easy",
  },
  {
    question: "The refractive index of glass is 1.5. Speed of light in glass is:",
    options: ["3 × 10⁸ m/s", "2 × 10⁸ m/s", "1.5 × 10⁸ m/s", "4.5 × 10⁸ m/s"],
    correctIndex: 1,
    explanation: "v = c/n = 3×10⁸/1.5 = 2×10⁸ m/s.",
    topic: "Optics",
    difficulty: "Easy",
  },
  {
    question: "An ideal gas at constant temperature is compressed to half its volume. Pressure becomes:",
    options: ["Same", "Half", "Double", "Four times"],
    correctIndex: 2,
    explanation: "Boyle's law: PV = const. Halving volume doubles pressure.",
    topic: "Thermodynamics",
    difficulty: "Easy",
  },
  {
    question: "The dimension of Planck's constant h is:",
    options: ["[ML²T⁻²]", "[ML²T⁻¹]", "[MLT⁻¹]", "[ML²T⁻³]"],
    correctIndex: 1,
    explanation: "E = hf → [h] = [E]/[f] = ML²T⁻²/T⁻¹ = ML²T⁻¹.",
    topic: "Modern Physics",
    difficulty: "Medium",
  },
  {
    question: "Moment of inertia of a uniform disc of mass M and radius R about its axis is:",
    options: ["MR²", "MR²/2", "2MR²/3", "MR²/4"],
    correctIndex: 1,
    explanation: "I = MR²/2 for a uniform solid disc about its central axis.",
    topic: "Rotational Motion",
    difficulty: "Medium",
  },
  {
    question: "Escape velocity from Earth's surface (R = 6400 km, g = 10 m/s²) is approximately:",
    options: ["8 km/s", "11.2 km/s", "16 km/s", "4 km/s"],
    correctIndex: 1,
    explanation: "v_e = √(2gR) = √(2×10×6.4×10⁶) ≈ 11.2 km/s.",
    topic: "Gravitation",
    difficulty: "Medium",
  },
  {
    question: "In a series LCR circuit at resonance, the impedance is:",
    options: ["Maximum", "Zero", "Equal to R", "Equal to L/C"],
    correctIndex: 2,
    explanation: "At resonance X_L = X_C cancel; Z = R.",
    topic: "Electricity & Magnetism",
    difficulty: "Medium",
  },
  {
    question: "Half-life of a radioactive substance is 20 minutes. Fraction remaining after 1 hour:",
    options: ["1/4", "1/8", "1/16", "1/2"],
    correctIndex: 1,
    explanation: "1 hour = 3 half-lives. Remaining = (1/2)³ = 1/8.",
    topic: "Modern Physics",
    difficulty: "Medium",
  },
  {
    question: "A wire carries current I in a magnetic field B perpendicular to it. Force per unit length is:",
    options: ["IB²", "I/B", "IB", "B/I"],
    correctIndex: 2,
    explanation: "F/L = BIsinθ = BI (θ = 90°).",
    topic: "Electricity & Magnetism",
    difficulty: "Easy",
  },
  {
    question: "In a Carnot engine operating between 500 K and 300 K, the efficiency is:",
    options: ["40%", "60%", "50%", "30%"],
    correctIndex: 0,
    explanation: "η = 1 − T_cold/T_hot = 1 − 300/500 = 0.4 = 40%.",
    topic: "Thermodynamics",
    difficulty: "Medium",
  },
  {
    question: "Which phenomenon proves the wave nature of light?",
    options: ["Photoelectric effect", "Compton scattering", "Diffraction", "Pair production"],
    correctIndex: 2,
    explanation: "Diffraction is a wave phenomenon and demonstrates light's wave nature.",
    topic: "Optics",
    difficulty: "Easy",
  },
  {
    question: "Two capacitors 3 µF and 6 µF are connected in series. Equivalent capacitance:",
    options: ["9 µF", "2 µF", "4.5 µF", "18 µF"],
    correctIndex: 1,
    explanation: "1/C = 1/3 + 1/6 = 1/2. C = 2 µF.",
    topic: "Electrostatics",
    difficulty: "Medium",
  },
  {
    question: "The de Broglie wavelength of a particle of mass m moving with velocity v is:",
    options: ["mv/h", "h/(mv)", "h·mv", "m/(hv)"],
    correctIndex: 1,
    explanation: "λ = h/p = h/(mv).",
    topic: "Modern Physics",
    difficulty: "Easy",
  },
  {
    question: "A spring of force constant k is compressed by x. Elastic PE stored is:",
    options: ["kx", "kx²", "kx²/2", "2kx²"],
    correctIndex: 2,
    explanation: "PE = ½kx².",
    topic: "Mechanics",
    difficulty: "Easy",
  },
  {
    question: "Bernoulli's theorem is based on conservation of:",
    options: ["Mass", "Momentum", "Energy", "Angular momentum"],
    correctIndex: 2,
    explanation: "Bernoulli's theorem is a statement of conservation of mechanical energy for fluids.",
    topic: "Fluid Mechanics",
    difficulty: "Easy",
  },
  {
    question: "The magnetic field at the centre of a circular loop of radius r carrying current I is:",
    options: ["μ₀I/r", "μ₀I/(2r)", "μ₀I/(4πr)", "2μ₀I/r"],
    correctIndex: 1,
    explanation: "B = μ₀I/(2r) at the centre of a circular loop.",
    topic: "Electricity & Magnetism",
    difficulty: "Medium",
  },
  {
    question: "A body in uniform circular motion has:",
    options: [
      "Constant velocity and constant speed",
      "Constant speed but changing velocity",
      "Changing speed and changing velocity",
      "Zero acceleration",
    ],
    correctIndex: 1,
    explanation: "Speed is constant but direction changes, so velocity (vector) changes, meaning centripetal acceleration exists.",
    topic: "Mechanics",
    difficulty: "Easy",
  },
];

async function getOrCreateTodayChallenge() {
  const today = todayDate();
  const existing = await db
    .select()
    .from(dailyChallengesTable)
    .where(eq(dailyChallengesTable.challengeDate, today));

  if (existing.length > 0) return existing[0]!;

  // Pick deterministically by day-of-year so all users see the same question
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000,
  );
  const q = QUESTION_POOL[dayOfYear % QUESTION_POOL.length]!;

  const [row] = await db
    .insert(dailyChallengesTable)
    .values({
      challengeDate: today,
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      topic: q.topic,
      difficulty: q.difficulty,
    })
    .returning();

  return row!;
}

// GET /api/daily-challenge — public, returns today's challenge (hides correct answer)
router.get("/", async (req, res) => {
  const challenge = await getOrCreateTodayChallenge();

  // Check if the requesting user already answered
  let userAnswer: {
    chosenIndex: number;
    isCorrect: boolean;
    streakBonus: number;
  } | null = null;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    // Optionally peek at auth to show answered state — but don't require it
    try {
      const { verifyToken } = await import("../lib/jwt.js");
      const token = authHeader.slice(7);
      const payload = verifyToken(token);
      const answers = await db
        .select()
        .from(dailyChallengeAnswersTable)
        .where(
          and(
            eq(dailyChallengeAnswersTable.userId, payload.sub),
            eq(dailyChallengeAnswersTable.challengeDate, challenge.challengeDate),
          ),
        );
      if (answers.length > 0) {
        const a = answers[0]!;
        userAnswer = {
          chosenIndex: a.chosenIndex,
          isCorrect: a.isCorrect,
          streakBonus: a.streakBonus,
        };
      }
    } catch {
      // unauthenticated — fine
    }
  }

  res.json({
    date: challenge.challengeDate,
    question: challenge.question,
    options: challenge.options,
    topic: challenge.topic,
    difficulty: challenge.difficulty,
    // Only reveal answer if already answered
    correctIndex: userAnswer !== null ? challenge.correctIndex : null,
    explanation: userAnswer !== null ? challenge.explanation : null,
    userAnswer,
  });
});

// POST /api/daily-challenge/answer — student submits answer
router.post("/answer", requireAuth, async (req, res) => {
  const userId = req.auth!.sub;
  const today = todayDate();
  const { chosenIndex } = req.body as { chosenIndex?: number };

  if (chosenIndex === undefined || chosenIndex === null) {
    res.status(400).json({ error: "chosenIndex required" });
    return;
  }

  // Check not already answered
  const existing = await db
    .select()
    .from(dailyChallengeAnswersTable)
    .where(
      and(
        eq(dailyChallengeAnswersTable.userId, userId),
        eq(dailyChallengeAnswersTable.challengeDate, today),
      ),
    );

  if (existing.length > 0) {
    res.status(409).json({ error: "Already answered today", answer: existing[0] });
    return;
  }

  const challenge = await getOrCreateTodayChallenge();
  const isCorrect = chosenIndex === challenge.correctIndex;

  // Get current streak for bonus calculation
  const streakRows = await db
    .select()
    .from(studyStreaksTable)
    .where(eq(studyStreaksTable.userId, userId));

  const currentStreak = streakRows[0]?.currentStreak ?? 0;

  // Streak bonus: +1 for streak ≥ 3, +2 for ≥ 7, +3 for ≥ 14
  let streakBonus = 0;
  if (isCorrect) {
    if (currentStreak >= 14) streakBonus = 3;
    else if (currentStreak >= 7) streakBonus = 2;
    else if (currentStreak >= 3) streakBonus = 1;
  }

  await db.insert(dailyChallengeAnswersTable).values({
    userId,
    challengeDate: today,
    chosenIndex,
    isCorrect,
    streakAtAnswer: currentStreak,
    streakBonus,
  });

  res.json({
    isCorrect,
    correctIndex: challenge.correctIndex,
    explanation: challenge.explanation,
    streakBonus,
    currentStreak,
  });
});

// GET /api/daily-challenge/stats — today's participation stats (public)
router.get("/stats", async (_req, res) => {
  const today = todayDate();
  const answers = await db
    .select()
    .from(dailyChallengeAnswersTable)
    .where(eq(dailyChallengeAnswersTable.challengeDate, today));

  const total = answers.length;
  const correct = answers.filter((a) => a.isCorrect).length;

  res.json({
    totalParticipants: total,
    correctAnswers: correct,
    accuracy: total > 0 ? Math.round((correct / total) * 100) : null,
  });
});

export default router;
