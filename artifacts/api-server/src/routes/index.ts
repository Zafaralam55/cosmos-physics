import { Router, type IRouter } from "express";
import adminRouter from "./admin.js";
import authRouter from "./auth.js";
import courseAccessRouter from "./courseAccess.js";
import enrollmentsRouter from "./enrollments.js";
import healthRouter from "./health.js";
import leaderboardRouter from "./leaderboard.js";
import otpRouter from "./otp.js";
import streaksRouter from "./streaks.js";
import dailyChallengeRouter from "./dailyChallenge.js";
import courseProgressRouter from "./courseProgress.js";
import publicRouter from "./public.js";
import pushNotificationsRouter from "./pushNotifications.js";
import storageRouter from "./storage.js";
import historyRouter from "./history.js";
import doubtsRouter from "./doubts.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/auth/otp", otpRouter);
router.use("/public", publicRouter);
router.use("/admin", adminRouter);
router.use("/enrollments", enrollmentsRouter);
router.use("/course-access", courseAccessRouter);
router.use("/notifications", pushNotificationsRouter);
router.use("/quiz", leaderboardRouter);
router.use("/leaderboard", leaderboardRouter);
router.use("/streaks", streaksRouter);
router.use("/daily-challenge", dailyChallengeRouter);
router.use("/progress", courseProgressRouter);
router.use(storageRouter);
router.use("/history", historyRouter);
router.use("/doubts", doubtsRouter);

export default router;
