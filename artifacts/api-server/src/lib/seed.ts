import { db } from "@workspace/db";
import { appConfigTable, usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "./auth.js";
import { logger } from "./logger.js";

const DEFAULT_SETTINGS = {
  appName: "Cosmos Physics Academy",
  tagline: "Explore the Universe of Physics",
  founderName: "Md Zafar Alam",
  founderRole: "Founder · Cosmos Physics Academy",
  founderBio:
    "To build the best online physics learning experience in India — premium content, crystal-clear conceptual teaching, and a supportive community for every aspiring physicist, engineer and JEE/NEET candidate.",
  primaryColor: "#5B8CFF",
  accentColor: "#8B5CF6",
  pricing: { free: 0, pro: 499, lifetime: 14999 },
};

const DEMO_STUDENT = {
  id: "student-demo-arjun",
  email: "arjun.sharma@cosmos.in",
  name: "Arjun Sharma",
  password: "Cosmos@2026",
  phone: "9876543210",
  level: "JEE Advanced",
  subscriptionTier: "Pro",
};

const DEMO_TEACHER = {
  id: "teacher-demo-priya",
  email: "priya.teacher@cosmos.in",
  name: "Priya Singh",
  password: "Teacher@2026",
  phone: "9123456789",
  subject: "Mechanics & Waves",
};

export async function seedDatabase(): Promise<void> {
  try {
    const existing = await db.select().from(appConfigTable).where(eq(appConfigTable.id, 1));
    if (existing.length === 0) {
      const hash = await hashPassword("Cosmos@2026");
      await db.insert(appConfigTable).values({
        id: 1,
        adminEmail: "zafar@cosmos.in",
        adminPasswordHash: hash,
        settings: DEFAULT_SETTINGS as unknown as Record<string, unknown>,
      });
      logger.info("Seeded initial admin config");
    } else {
      logger.info("Admin config already exists, skipping seed");
    }

    const demoStudent = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, DEMO_STUDENT.id));
    if (demoStudent.length === 0) {
      await db.insert(usersTable).values({
        id: DEMO_STUDENT.id,
        email: DEMO_STUDENT.email,
        passwordHash: await hashPassword(DEMO_STUDENT.password),
        role: "student",
        name: DEMO_STUDENT.name,
        phone: DEMO_STUDENT.phone,
        level: DEMO_STUDENT.level,
        subscriptionTier: DEMO_STUDENT.subscriptionTier,
      });
      logger.info("Seeded demo student account");
    }

    const demoTeacher = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, DEMO_TEACHER.id));
    if (demoTeacher.length === 0) {
      await db.insert(usersTable).values({
        id: DEMO_TEACHER.id,
        email: DEMO_TEACHER.email,
        passwordHash: await hashPassword(DEMO_TEACHER.password),
        role: "teacher",
        name: DEMO_TEACHER.name,
        phone: DEMO_TEACHER.phone,
        subject: DEMO_TEACHER.subject,
      });
      logger.info("Seeded demo teacher account");
    }
  } catch (err) {
    logger.error({ err }, "Failed to seed database");
  }
}
