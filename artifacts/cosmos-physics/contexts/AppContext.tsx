import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { courses as seedCourses, type Course } from "@/data/courses";
import {
  leaderboard,
  liveClasses as seedLiveClasses,
  notifications as seedNotifications,
  type LiveClass,
  type Notification,
} from "@/data/liveClasses";
import { resources as seedResources, type StudyResource } from "@/data/notes";
import { quizzes as seedQuizzes, type Quiz } from "@/data/quizzes";
import {
  apiAddOverride,
  apiCreateUser,
  apiDeleteOverride,
  apiDeleteUser,
  apiEnrollCourse,
  apiGetConfig,
  apiGetEnrollments,
  apiGetMe,
  apiGetMyStreak,
  apiGetProgress,
  apiMarkChapterComplete,
  apiRecordActivity,
  apiGetOverrides,
  apiGetPublicConfig,
  apiGetPublicOverrides,
  apiGetUsers,
  apiLogin,
  apiResetAdminCredentials,
  apiSubmitQuizScore,
  apiUnenrollCourse,
  apiUnmarkChapterComplete,
  apiUpdateConfig,
  apiUpdateOverride,
  apiUpdateUser,
  clearToken,
  getToken,
  setToken,
  type ApiOverride,
  type ChapterProgress,
} from "@/lib/apiClient";

const LOCAL_KEY = "@cosmos-physics-session-v7";

export const ADMIN_CREDENTIALS = {
  email: "zafar@cosmos.in",
};

export type AdminCredentials = { email: string };

export type Student = {
  id: string;
  name: string;
  email: string;
  phone: string;
  level: string;
  joinDate: string;
  password: string;
};

export type Teacher = {
  id: string;
  name: string;
  email: string;
  password: string;
  subject: string;
  joinDate: string;
};

export type QuizScore = {
  quizId: string;
  title: string;
  score: number;
  total: number;
  takenAt: string;
};

export type AppSettings = {
  appName: string;
  tagline: string;
  founderName: string;
  founderRole: string;
  founderBio: string;
  primaryColor: string;
  accentColor: string;
  pricing: {
    free: number;
    pro: number;
    lifetime: number;
  };
};

const DEFAULT_SETTINGS: AppSettings = {
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

export type StreakState = {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
};

export type AppState = {
  student: Student | null;
  students: Student[];
  isAdmin: boolean;
  teachers: Teacher[];
  currentTeacherId: string | null;
  enrolledCourses: string[];
  watchHistory: string[];
  quizScores: QuizScore[];
  attendance: string[];
  doubts: { id: string; text: string; status: "open" | "answered"; askedAt: string }[];
  notificationsRead: string[];
  subscriptionTier: "Free" | "Pro" | "Lifetime";
  streak: StreakState;
  courseProgress: ChapterProgress[];
  customCourses: Course[];
  hiddenCourses: string[];
  customLiveClasses: LiveClass[];
  hiddenLiveClasses: string[];
  customQuizzes: Quiz[];
  hiddenQuizzes: string[];
  customResources: StudyResource[];
  hiddenResources: string[];
  customNotifications: Notification[];
  hiddenNotifications: string[];
  appSettings: AppSettings;
  adminCredentials: AdminCredentials;
  backendReady: boolean;
};

const defaultState: AppState = {
  student: null,
  students: [],
  isAdmin: false,
  teachers: [],
  currentTeacherId: null,
  enrolledCourses: [],
  watchHistory: [],
  quizScores: [],
  attendance: [],
  doubts: [],
  notificationsRead: [],
  subscriptionTier: "Free",
  streak: { currentStreak: 0, longestStreak: 0, lastActivityDate: null },
  courseProgress: [],
  customCourses: [],
  hiddenCourses: [],
  customLiveClasses: [],
  hiddenLiveClasses: [],
  customQuizzes: [],
  hiddenQuizzes: [],
  customResources: [],
  hiddenResources: [],
  customNotifications: [],
  hiddenNotifications: [],
  appSettings: DEFAULT_SETTINGS,
  adminCredentials: { ...ADMIN_CREDENTIALS },
  backendReady: false,
};

type Ctx = {
  state: AppState;
  enrollCourse: (id: string) => void;
  addWatchHistory: (id: string) => void;
  addQuizScore: (s: QuizScore) => void;
  markChapterComplete: (courseId: string, chapterId: string) => Promise<void>;
  unmarkChapterComplete: (courseId: string, chapterId: string) => Promise<void>;
  refreshProgress: () => Promise<void>;
  markAttendance: (id: string) => void;
  addDoubt: (text: string) => void;
  setStudent: (s: Student) => void;
  logout: () => void;
  signIn: (s: Student) => void;
  studentLogin: (email: string, password: string) => Promise<Student | null>;
  loadStudentFromApi: (user: import("@/lib/apiClient").ApiUser) => Promise<void>;
  addStudent: (s: Omit<Student, "id" | "joinDate"> & { id?: string }) => Promise<void>;
  updateStudent: (id: string, partial: Partial<Student>) => Promise<void>;
  removeStudent: (id: string) => Promise<void>;
  upgrade: (tier: AppState["subscriptionTier"]) => void;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
  updateAdminCredentials: (opts: { email: string; password?: string; currentPassword: string }) => Promise<void>;
  resetAdminCredentials: () => Promise<void>;
  teacherLogin: (email: string, password: string) => Promise<Teacher | null>;
  teacherLogout: () => void;
  currentTeacher: Teacher | null;
  addTeacher: (t: Omit<Teacher, "id" | "joinDate"> & { id?: string }) => Promise<void>;
  updateTeacher: (id: string, partial: Partial<Teacher>) => Promise<void>;
  removeTeacher: (id: string) => Promise<void>;
  addCourse: (c: Omit<Course, "id"> & { id?: string }) => Promise<void>;
  updateCourse: (id: string, partial: Partial<Course>) => void;
  removeCourse: (id: string) => void;
  addLiveClass: (c: Omit<LiveClass, "id"> & { id?: string }) => Promise<void>;
  updateLiveClass: (id: string, partial: Partial<LiveClass>) => void;
  removeLiveClass: (id: string) => void;
  addQuiz: (q: Omit<Quiz, "id"> & { id?: string }) => Promise<void>;
  updateQuiz: (id: string, partial: Partial<Quiz>) => void;
  removeQuiz: (id: string) => void;
  addResource: (r: Omit<StudyResource, "id"> & { id?: string }) => Promise<void>;
  updateResource: (id: string, partial: Partial<StudyResource>) => void;
  removeResource: (id: string) => void;
  sendNotification: (n: Omit<Notification, "id" | "time"> & { id?: string }) => Promise<void>;
  updateNotification: (id: string, partial: Partial<Notification>) => void;
  removeNotification: (id: string) => void;
  updateSettings: (partial: Partial<AppSettings>) => void;
  resetSettings: () => void;
  allCourses: Course[];
  allLiveClasses: LiveClass[];
  allQuizzes: Quiz[];
  allResources: StudyResource[];
  allNotifications: Notification[];
  leaderboard: typeof leaderboard;
  refreshStreak: () => Promise<void>;
};

export const AppContext = createContext<Ctx | null>(null);

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function applyOverridesToContent<T extends { id: string }>(
  seeds: T[],
  overrides: ApiOverride[],
  type: string,
): { items: T[]; hidden: string[]; customs: T[] } {
  const hidden = overrides
    .filter((o) => o.type === type && o.action === "hide" && o.sourceId)
    .map((o) => o.sourceId!);
  const customs = overrides
    .filter((o) => o.type === type && o.action === "custom" && o.data)
    .map((o) => o.data as T);
  const items = [...customs, ...seeds.filter((s) => !hidden.includes(s.id))];
  return { items, hidden, customs };
}

function upsertEdit<T extends { id: string }>(
  customs: T[],
  hidden: string[],
  seeds: T[],
  id: string,
  partial: Partial<T>,
): { customs: T[]; hidden: string[] } {
  const idx = customs.findIndex((c) => c.id === id);
  if (idx >= 0) {
    const next = [...customs];
    next[idx] = { ...next[idx], ...partial, id: next[idx].id } as T;
    return { customs: next, hidden };
  }
  const seed = seeds.find((c) => c.id === id);
  if (seed) {
    const cloned = { ...seed, ...partial, id: seed.id } as T;
    return {
      customs: [cloned, ...customs],
      hidden: hidden.includes(id) ? hidden : [...hidden, id],
    };
  }
  return { customs, hidden };
}

function settingsFromApi(raw: Record<string, unknown>): AppSettings {
  const pricing = (raw["pricing"] as AppSettings["pricing"]) ?? DEFAULT_SETTINGS.pricing;
  return {
    appName: (raw["appName"] as string) ?? DEFAULT_SETTINGS.appName,
    tagline: (raw["tagline"] as string) ?? DEFAULT_SETTINGS.tagline,
    founderName: (raw["founderName"] as string) ?? DEFAULT_SETTINGS.founderName,
    founderRole: (raw["founderRole"] as string) ?? DEFAULT_SETTINGS.founderRole,
    founderBio: (raw["founderBio"] as string) ?? DEFAULT_SETTINGS.founderBio,
    primaryColor: (raw["primaryColor"] as string) ?? DEFAULT_SETTINGS.primaryColor,
    accentColor: (raw["accentColor"] as string) ?? DEFAULT_SETTINGS.accentColor,
    pricing: {
      free: pricing.free ?? 0,
      pro: pricing.pro ?? 499,
      lifetime: pricing.lifetime ?? 14999,
    },
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [hydrated, setHydrated] = useState(false);
  const overrideIdMap = useRef<Map<string, string>>(new Map());
  // Tracks which role token to use when saving content overrides
  const activeContentRoleRef = useRef<"admin" | "teacher">("admin");

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(LOCAL_KEY);
        if (raw) {
          const cached = JSON.parse(raw) as Partial<AppState>;
          setState((s) => ({
            ...s,
            watchHistory: cached.watchHistory ?? s.watchHistory,
            quizScores: cached.quizScores ?? s.quizScores,
            attendance: cached.attendance ?? s.attendance,
            doubts: cached.doubts ?? s.doubts,
            notificationsRead: cached.notificationsRead ?? s.notificationsRead,
          }));
        }
      } catch {}

      await syncFromBackend();
      setHydrated(true);
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(
      LOCAL_KEY,
      JSON.stringify({
        watchHistory: state.watchHistory,
        quizScores: state.quizScores,
        attendance: state.attendance,
        doubts: state.doubts,
        notificationsRead: state.notificationsRead,
      }),
    ).catch(() => {});
  }, [
    state.watchHistory,
    state.quizScores,
    state.attendance,
    state.doubts,
    state.notificationsRead,
    hydrated,
  ]);

  async function syncFromBackend() {
    const updates: Partial<AppState> = {};

    const [adminTok, teacherTok, studentTok] = await Promise.all([
      getToken("admin"),
      getToken("teacher"),
      getToken("student"),
    ]);

    const jobs: Promise<void>[] = [];

    if (adminTok) {
      jobs.push(
        (async () => {
          try {
            await apiGetMe("admin");
            updates.isAdmin = true;
            const [cfg, users, overrides] = await Promise.all([
              apiGetConfig(),
              apiGetUsers(),
              apiGetOverrides("admin"),
            ]);
            updates.appSettings = settingsFromApi(cfg.settings);
            updates.adminCredentials = { email: cfg.adminEmail };
            updates.teachers = users
              .filter((u) => u.role === "teacher")
              .map((u) => ({
                id: u.id,
                name: u.name,
                email: u.email,
                password: "",
                subject: u.subject ?? "",
                joinDate: new Date(u.createdAt ?? Date.now()).toLocaleDateString("en-IN", {
                  month: "short",
                  year: "numeric",
                }),
              }));
            updates.students = users
              .filter((u) => u.role === "student")
              .map((u) => ({
                id: u.id,
                name: u.name,
                email: u.email,
                phone: u.phone ?? "",
                level: u.level ?? "",
                joinDate: new Date(u.createdAt ?? Date.now()).toLocaleDateString("en-IN", {
                  month: "short",
                  year: "numeric",
                }),
                password: "",
              }));
            const courseOvr = applyOverridesToContent(seedCourses, overrides, "course");
            const liveOvr = applyOverridesToContent(seedLiveClasses, overrides, "liveClass");
            const quizOvr = applyOverridesToContent(seedQuizzes, overrides, "quiz");
            const resOvr = applyOverridesToContent(seedResources, overrides, "resource");
            const notifOvr = applyOverridesToContent(
              seedNotifications,
              overrides,
              "notification",
            );
            updates.hiddenCourses = courseOvr.hidden;
            updates.customCourses = courseOvr.customs;
            updates.hiddenLiveClasses = liveOvr.hidden;
            updates.customLiveClasses = liveOvr.customs;
            updates.hiddenQuizzes = quizOvr.hidden;
            updates.customQuizzes = quizOvr.customs;
            updates.hiddenResources = resOvr.hidden;
            updates.customResources = resOvr.customs;
            updates.hiddenNotifications = notifOvr.hidden;
            updates.customNotifications = notifOvr.customs;
            overrideIdMap.current = new Map(
              overrides.map((o) => [
                `${o.type}:${o.action === "hide" ? o.sourceId : o.data && (o.data as { id: string }).id}`,
                o.id,
              ]),
            );
            updates.backendReady = true;
          } catch {
            updates.isAdmin = false;
            await clearToken("admin");
          }
        })(),
      );
    } else {
      try {
        const [cfg, overrides] = await Promise.all([
          apiGetPublicConfig(),
          apiGetPublicOverrides(),
        ]);
        updates.appSettings = settingsFromApi(cfg.settings);
        const courseOvr = applyOverridesToContent(seedCourses, overrides, "course");
        const liveOvr = applyOverridesToContent(seedLiveClasses, overrides, "liveClass");
        const quizOvr = applyOverridesToContent(seedQuizzes, overrides, "quiz");
        const resOvr = applyOverridesToContent(seedResources, overrides, "resource");
        const notifOvr = applyOverridesToContent(seedNotifications, overrides, "notification");
        updates.hiddenCourses = courseOvr.hidden;
        updates.customCourses = courseOvr.customs;
        updates.hiddenLiveClasses = liveOvr.hidden;
        updates.customLiveClasses = liveOvr.customs;
        updates.hiddenQuizzes = quizOvr.hidden;
        updates.customQuizzes = quizOvr.customs;
        updates.hiddenResources = resOvr.hidden;
        updates.customResources = resOvr.customs;
        updates.hiddenNotifications = notifOvr.hidden;
        updates.customNotifications = notifOvr.customs;
        overrideIdMap.current = new Map(
          overrides.map((o) => [
            `${o.type}:${o.action === "hide" ? o.sourceId : o.data && (o.data as { id: string }).id}`,
            o.id,
          ]),
        );
        updates.backendReady = true;
      } catch {
        updates.backendReady = false;
      }
    }

    if (teacherTok && !adminTok) {
      activeContentRoleRef.current = "teacher";
    } else if (adminTok) {
      activeContentRoleRef.current = "admin";
    }

    if (teacherTok) {
      jobs.push(
        (async () => {
          try {
            const me = await apiGetMe("teacher");
            updates.currentTeacherId = me.id;
            const teacherObj: Teacher = {
              id: me.id,
              name: me.name,
              email: me.email,
              password: "",
              subject: me.subject ?? "",
              joinDate: "",
            };
            updates.teachers = [
              teacherObj,
              ...(updates.teachers ?? []).filter((t) => t.id !== me.id),
            ];
          } catch {
            await clearToken("teacher");
          }
        })(),
      );
    }

    if (studentTok) {
      jobs.push(
        (async () => {
          try {
            const me = await apiGetMe("student");
            const student: Student = {
              id: me.id,
              name: me.name,
              email: me.email,
              phone: me.phone ?? "",
              level: me.level ?? "",
              joinDate: "",
              password: "",
            };
            updates.student = student;
            updates.subscriptionTier =
              (me.subscriptionTier as AppState["subscriptionTier"]) ?? "Free";
            const [enrollments, streakData, progressData] = await Promise.all([
              apiGetEnrollments(),
              apiRecordActivity().catch(() => apiGetMyStreak().catch(() => null)),
              apiGetProgress().catch(() => [] as ChapterProgress[]),
            ]);
            updates.enrolledCourses = enrollments.map((e) => e.courseId);
            updates.courseProgress = progressData;
            if (streakData) {
              updates.streak = {
                currentStreak: streakData.currentStreak,
                longestStreak: streakData.longestStreak,
                lastActivityDate: streakData.lastActivityDate,
              };
            }
          } catch {
            await clearToken("student");
          }
        })(),
      );
    }

    await Promise.all(jobs);
    setState((s) => ({ ...s, ...updates }));
  }

  // ── Student ────────────────────────────────────────────────────────────────

  const enrollCourse = useCallback((id: string) => {
    setState((s) =>
      s.enrolledCourses.includes(id) ? s : { ...s, enrolledCourses: [...s.enrolledCourses, id] },
    );
    apiEnrollCourse(id).catch(() => {});
  }, []);

  const addWatchHistory = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      watchHistory: [id, ...s.watchHistory.filter((x) => x !== id)].slice(0, 12),
    }));
  }, []);

  const refreshProgress = useCallback(async () => {
    try {
      const rows = await apiGetProgress();
      setState((s) => ({ ...s, courseProgress: rows }));
    } catch {}
  }, []);

  const markChapterComplete = useCallback(async (courseId: string, chapterId: string) => {
    // Optimistic update
    setState((s) => {
      const already = s.courseProgress.some(
        (p) => p.courseId === courseId && p.chapterId === chapterId,
      );
      if (already) return s;
      const optimistic: ChapterProgress = {
        id: `tmp-${Date.now()}`,
        userId: s.student?.id ?? "",
        courseId,
        chapterId,
        completedAt: new Date().toISOString(),
      };
      return { ...s, courseProgress: [...s.courseProgress, optimistic] };
    });
    try {
      const rows = await apiMarkChapterComplete(courseId, chapterId);
      setState((s) => ({ ...s, courseProgress: rows }));
    } catch {
      await refreshProgress();
    }
  }, [refreshProgress]);

  const unmarkChapterComplete = useCallback(async (courseId: string, chapterId: string) => {
    // Optimistic update
    setState((s) => ({
      ...s,
      courseProgress: s.courseProgress.filter(
        (p) => !(p.courseId === courseId && p.chapterId === chapterId),
      ),
    }));
    try {
      const rows = await apiUnmarkChapterComplete(courseId, chapterId);
      setState((s) => ({ ...s, courseProgress: rows }));
    } catch {
      await refreshProgress();
    }
  }, [refreshProgress]);

  const addQuizScore = useCallback((sc: QuizScore) => {
    setState((s) => ({ ...s, quizScores: [sc, ...s.quizScores].slice(0, 30) }));
    getToken("student").then((tok) => {
      if (!tok) return;
      apiSubmitQuizScore(
        { quizId: sc.quizId, quizTitle: sc.title, score: sc.score, total: sc.total },
        "student",
      ).catch(() => {});
    }).catch(() => {});
  }, []);

  const markAttendance = useCallback((id: string) => {
    setState((s) => (s.attendance.includes(id) ? s : { ...s, attendance: [...s.attendance, id] }));
  }, []);

  const addDoubt = useCallback((text: string) => {
    setState((s) => ({
      ...s,
      doubts: [{ id: newId(), text, status: "open", askedAt: "Just now" }, ...s.doubts],
    }));
  }, []);

  const setStudent = useCallback((st: Student) => setState((s) => ({ ...s, student: st })), []);

  const logout = useCallback(() => {
    setState((s) => ({ ...s, student: null, enrolledCourses: [] }));
    clearToken("student").catch(() => {});
  }, []);

  const signIn = useCallback((st: Student) => setState((s) => ({ ...s, student: st })), []);

  const loadStudentFromApi = useCallback(async (user: import("@/lib/apiClient").ApiUser) => {
    const student: Student = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone ?? "",
      level: user.level ?? "",
      joinDate: "",
      password: "",
    };
    const [enrollments, streakData] = await Promise.all([
      apiGetEnrollments().catch(() => [] as { courseId: string }[]),
      apiRecordActivity().catch(() => apiGetMyStreak().catch(() => null)),
    ]);
    setState((s) => ({
      ...s,
      student,
      subscriptionTier: (user.subscriptionTier as AppState["subscriptionTier"]) ?? "Free",
      enrolledCourses: enrollments.map((e) => e.courseId),
      ...(streakData ? { streak: { currentStreak: streakData.currentStreak, longestStreak: streakData.longestStreak, lastActivityDate: streakData.lastActivityDate } } : {}),
    }));
  }, []);

  const studentLogin = useCallback(async (email: string, password: string): Promise<Student | null> => {
    try {
      const { token, user } = await apiLogin(email, password, "student");
      await setToken("student", token);
      const student: Student = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone ?? "",
        level: user.level ?? "",
        joinDate: "",
        password: "",
      };
      const [enrollments, streakData] = await Promise.all([
        apiGetEnrollments().catch(() => [] as { courseId: string }[]),
        apiRecordActivity().catch(() => null),
      ]);
      setState((s) => ({
        ...s,
        student,
        subscriptionTier: (user.subscriptionTier as AppState["subscriptionTier"]) ?? "Free",
        enrolledCourses: enrollments.map((e) => e.courseId),
        ...(streakData ? { streak: { currentStreak: streakData.currentStreak, longestStreak: streakData.longestStreak, lastActivityDate: streakData.lastActivityDate } } : {}),
      }));
      return student;
    } catch {
      return null;
    }
  }, []);

  const addStudent = useCallback(async (st: Omit<Student, "id" | "joinDate"> & { id?: string }) => {
    const { id } = await apiCreateUser({
      email: st.email,
      password: st.password,
      role: "student",
      name: st.name,
      phone: st.phone,
      level: st.level,
    });
    const student: Student = {
      ...st,
      id,
      joinDate: new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
    };
    setState((s) => ({ ...s, students: [...s.students, student] }));
  }, []);

  const updateStudent = useCallback(async (id: string, partial: Partial<Student>) => {
    await apiUpdateUser(id, {
      name: partial.name,
      email: partial.email,
      phone: partial.phone,
      level: partial.level,
      ...(partial.password ? { password: partial.password } : {}),
    });
    setState((s) => {
      const students = s.students.map((st) =>
        st.id === id ? { ...st, ...partial, id: st.id } : st,
      );
      const student =
        s.student?.id === id ? { ...s.student, ...partial, id: s.student.id } : s.student;
      return { ...s, students, student };
    });
  }, []);

  const removeStudent = useCallback(async (id: string) => {
    await apiDeleteUser(id);
    setState((s) => ({
      ...s,
      students: s.students.filter((st) => st.id !== id),
      student: s.student?.id === id ? null : s.student,
    }));
  }, []);

  const upgrade = useCallback(
    (tier: AppState["subscriptionTier"]) => setState((s) => ({ ...s, subscriptionTier: tier })),
    [],
  );

  // ── Admin ──────────────────────────────────────────────────────────────────

  const adminLogin = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const { token } = await apiLogin(email, password, "admin");
      await setToken("admin", token);
      activeContentRoleRef.current = "admin";
      const [cfg, users, overrides] = await Promise.all([
        apiGetConfig(),
        apiGetUsers(),
        apiGetOverrides("admin"),
      ]);
      const settings = settingsFromApi(cfg.settings);
      const teachers = users
        .filter((u) => u.role === "teacher")
        .map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          password: "",
          subject: u.subject ?? "",
          joinDate: new Date(u.createdAt ?? Date.now()).toLocaleDateString("en-IN", {
            month: "short",
            year: "numeric",
          }),
        }));
      const students = users
        .filter((u) => u.role === "student")
        .map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone ?? "",
          level: u.level ?? "",
          joinDate: new Date(u.createdAt ?? Date.now()).toLocaleDateString("en-IN", {
            month: "short",
            year: "numeric",
          }),
          password: "",
        }));
      const courseOvr = applyOverridesToContent(seedCourses, overrides, "course");
      const liveOvr = applyOverridesToContent(seedLiveClasses, overrides, "liveClass");
      const quizOvr = applyOverridesToContent(seedQuizzes, overrides, "quiz");
      const resOvr = applyOverridesToContent(seedResources, overrides, "resource");
      const notifOvr = applyOverridesToContent(seedNotifications, overrides, "notification");
      overrideIdMap.current = new Map(
        overrides.map((o) => [
          `${o.type}:${o.action === "hide" ? o.sourceId : o.data && (o.data as { id: string }).id}`,
          o.id,
        ]),
      );
      setState((s) => ({
        ...s,
        isAdmin: true,
        appSettings: settings,
        adminCredentials: { email: cfg.adminEmail },
        teachers,
        students,
        hiddenCourses: courseOvr.hidden,
        customCourses: courseOvr.customs,
        hiddenLiveClasses: liveOvr.hidden,
        customLiveClasses: liveOvr.customs,
        hiddenQuizzes: quizOvr.hidden,
        customQuizzes: quizOvr.customs,
        hiddenResources: resOvr.hidden,
        customResources: resOvr.customs,
        hiddenNotifications: notifOvr.hidden,
        customNotifications: notifOvr.customs,
        backendReady: true,
      }));
      return true;
    } catch {
      return false;
    }
  }, []);

  const adminLogout = useCallback(() => {
    setState((s) => ({ ...s, isAdmin: false }));
    clearToken("admin").catch(() => {});
  }, []);

  const updateAdminCredentials = useCallback(
    async (opts: { email: string; password?: string; currentPassword: string }) => {
      await apiUpdateConfig({
        adminEmail: opts.email,
        adminPassword: opts.password,
        currentPassword: opts.currentPassword,
      });
      setState((s) => ({
        ...s,
        adminCredentials: { email: opts.email },
      }));
    },
    [],
  );

  const resetAdminCredentials = useCallback(async () => {
    await apiResetAdminCredentials();
    setState((s) => ({ ...s, adminCredentials: { ...ADMIN_CREDENTIALS } }));
  }, []);

  // ── Teacher ────────────────────────────────────────────────────────────────

  const teacherLogin = useCallback(async (email: string, password: string): Promise<Teacher | null> => {
    try {
      const { token, user } = await apiLogin(email, password, "teacher");
      await setToken("teacher", token);
      activeContentRoleRef.current = "teacher";
      const teacher: Teacher = {
        id: user.id,
        name: user.name,
        email: user.email,
        password: "",
        subject: user.subject ?? "",
        joinDate: "",
      };
      setState((s) => ({
        ...s,
        currentTeacherId: user.id,
        teachers: s.teachers.some((t) => t.id === user.id)
          ? s.teachers
          : [...s.teachers, teacher],
      }));
      return teacher;
    } catch {
      return null;
    }
  }, []);

  const teacherLogout = useCallback(() => {
    setState((s) => ({ ...s, currentTeacherId: null }));
    clearToken("teacher").catch(() => {});
  }, []);

  const currentTeacher = useMemo(
    () => state.teachers.find((t) => t.id === state.currentTeacherId) ?? null,
    [state.teachers, state.currentTeacherId],
  );

  const addTeacher = useCallback(async (t: Omit<Teacher, "id" | "joinDate"> & { id?: string }) => {
    const { id } = await apiCreateUser({
      email: t.email,
      password: t.password,
      role: "teacher",
      name: t.name,
      subject: t.subject,
    });
    const teacher: Teacher = {
      ...t,
      id,
      joinDate: new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
    };
    setState((s) => ({ ...s, teachers: [...s.teachers, teacher] }));
  }, []);

  const updateTeacher = useCallback(async (id: string, partial: Partial<Teacher>) => {
    await apiUpdateUser(id, {
      name: partial.name,
      email: partial.email,
      subject: partial.subject,
      ...(partial.password ? { password: partial.password } : {}),
    });
    setState((s) => ({
      ...s,
      teachers: s.teachers.map((t) => (t.id === id ? { ...t, ...partial, id: t.id } : t)),
    }));
  }, []);

  const removeTeacher = useCallback(async (id: string) => {
    await apiDeleteUser(id);
    setState((s) => ({
      ...s,
      teachers: s.teachers.filter((t) => t.id !== id),
      currentTeacherId: s.currentTeacherId === id ? null : s.currentTeacherId,
    }));
  }, []);

  // ── Content (syncs overrides to backend) ──────────────────────────────────

  async function addOverride(type: string, action: "hide" | "custom", sourceId?: string, data?: unknown) {
    try {
      const role = activeContentRoleRef.current;
      const { id } = await apiAddOverride({ type, action, sourceId, data }, role);
      const key = `${type}:${action === "hide" ? sourceId : data && (data as { id: string }).id}`;
      overrideIdMap.current.set(key, id);
    } catch {}
  }

  async function removeOverride(type: string, action: "hide" | "custom", ref: string) {
    try {
      const key = `${type}:${ref}`;
      const id = overrideIdMap.current.get(key);
      if (id) {
        const role = activeContentRoleRef.current;
        await apiDeleteOverride(id, role);
        overrideIdMap.current.delete(key);
      }
    } catch {}
  }

  const addCourse = useCallback(async (c: Omit<Course, "id"> & { id?: string }) => {
    const newCourse = { ...c, id: c.id ?? newId() } as Course;
    setState((s) => ({ ...s, customCourses: [newCourse, ...s.customCourses] }));
    await addOverride("course", "custom", undefined, newCourse);
  }, []);

  const updateCourse = useCallback((id: string, partial: Partial<Course>) => {
    setState((s) => {
      const wasCustom = s.customCourses.some((c) => c.id === id);
      const r = upsertEdit(s.customCourses, s.hiddenCourses, seedCourses, id, partial);
      const merged = r.customs.find((c) => c.id === id);
      if (merged) {
        if (wasCustom) {
          const ovrId = overrideIdMap.current.get(`course:${id}`);
          if (ovrId) apiUpdateOverride(ovrId, merged, activeContentRoleRef.current).catch(() => {});
        } else {
          addOverride("course", "hide", id).catch(() => {});
          addOverride("course", "custom", undefined, merged).catch(() => {});
        }
      }
      return { ...s, customCourses: r.customs, hiddenCourses: r.hidden };
    });
  }, []);

  const removeCourse = useCallback((id: string) => {
    setState((s) => {
      const isCustom = s.customCourses.some((c) => c.id === id);
      if (isCustom) {
        removeOverride("course", "custom", id).catch(() => {});
        return { ...s, customCourses: s.customCourses.filter((c) => c.id !== id) };
      }
      addOverride("course", "hide", id).catch(() => {});
      return { ...s, hiddenCourses: Array.from(new Set([...s.hiddenCourses, id])) };
    });
  }, []);

  const addLiveClass = useCallback(async (c: Omit<LiveClass, "id"> & { id?: string }) => {
    const newLC = { ...c, id: c.id ?? newId() } as LiveClass;
    setState((s) => ({ ...s, customLiveClasses: [newLC, ...s.customLiveClasses] }));
    await addOverride("liveClass", "custom", undefined, newLC);
  }, []);

  const updateLiveClass = useCallback((id: string, partial: Partial<LiveClass>) => {
    setState((s) => {
      const wasCustom = s.customLiveClasses.some((c) => c.id === id);
      const r = upsertEdit(s.customLiveClasses, s.hiddenLiveClasses, seedLiveClasses, id, partial);
      const merged = r.customs.find((c) => c.id === id);
      if (merged) {
        if (wasCustom) {
          const ovrId = overrideIdMap.current.get(`liveClass:${id}`);
          if (ovrId) apiUpdateOverride(ovrId, merged, activeContentRoleRef.current).catch(() => {});
        } else {
          addOverride("liveClass", "hide", id).catch(() => {});
          addOverride("liveClass", "custom", undefined, merged).catch(() => {});
        }
      }
      return { ...s, customLiveClasses: r.customs, hiddenLiveClasses: r.hidden };
    });
  }, []);

  const removeLiveClass = useCallback((id: string) => {
    setState((s) => {
      const isCustom = s.customLiveClasses.some((c) => c.id === id);
      if (isCustom) {
        removeOverride("liveClass", "custom", id).catch(() => {});
        return { ...s, customLiveClasses: s.customLiveClasses.filter((c) => c.id !== id) };
      }
      addOverride("liveClass", "hide", id).catch(() => {});
      return { ...s, hiddenLiveClasses: Array.from(new Set([...s.hiddenLiveClasses, id])) };
    });
  }, []);

  const addQuiz = useCallback(async (q: Omit<Quiz, "id"> & { id?: string }) => {
    const newQuiz = { ...q, id: q.id ?? newId() } as Quiz;
    setState((s) => ({ ...s, customQuizzes: [newQuiz, ...s.customQuizzes] }));
    await addOverride("quiz", "custom", undefined, newQuiz);
  }, []);

  const updateQuiz = useCallback((id: string, partial: Partial<Quiz>) => {
    setState((s) => {
      const wasCustom = s.customQuizzes.some((c) => c.id === id);
      const r = upsertEdit(s.customQuizzes, s.hiddenQuizzes, seedQuizzes, id, partial);
      const merged = r.customs.find((c) => c.id === id);
      if (merged) {
        if (wasCustom) {
          const ovrId = overrideIdMap.current.get(`quiz:${id}`);
          if (ovrId) apiUpdateOverride(ovrId, merged, activeContentRoleRef.current).catch(() => {});
        } else {
          addOverride("quiz", "hide", id).catch(() => {});
          addOverride("quiz", "custom", undefined, merged).catch(() => {});
        }
      }
      return { ...s, customQuizzes: r.customs, hiddenQuizzes: r.hidden };
    });
  }, []);

  const removeQuiz = useCallback((id: string) => {
    setState((s) => {
      const isCustom = s.customQuizzes.some((c) => c.id === id);
      if (isCustom) {
        removeOverride("quiz", "custom", id).catch(() => {});
        return { ...s, customQuizzes: s.customQuizzes.filter((c) => c.id !== id) };
      }
      addOverride("quiz", "hide", id).catch(() => {});
      return { ...s, hiddenQuizzes: Array.from(new Set([...s.hiddenQuizzes, id])) };
    });
  }, []);

  const addResource = useCallback(async (r: Omit<StudyResource, "id"> & { id?: string }) => {
    const newRes = { ...r, id: r.id ?? newId() } as StudyResource;
    setState((s) => ({ ...s, customResources: [newRes, ...s.customResources] }));
    await addOverride("resource", "custom", undefined, newRes);
  }, []);

  const updateResource = useCallback((id: string, partial: Partial<StudyResource>) => {
    setState((s) => {
      const wasCustom = s.customResources.some((c) => c.id === id);
      const r = upsertEdit(s.customResources, s.hiddenResources, seedResources, id, partial);
      const merged = r.customs.find((c) => c.id === id);
      if (merged) {
        if (wasCustom) {
          const ovrId = overrideIdMap.current.get(`resource:${id}`);
          if (ovrId) apiUpdateOverride(ovrId, merged, activeContentRoleRef.current).catch(() => {});
        } else {
          addOverride("resource", "hide", id).catch(() => {});
          addOverride("resource", "custom", undefined, merged).catch(() => {});
        }
      }
      return { ...s, customResources: r.customs, hiddenResources: r.hidden };
    });
  }, []);

  const removeResource = useCallback((id: string) => {
    setState((s) => {
      const isCustom = s.customResources.some((c) => c.id === id);
      if (isCustom) {
        removeOverride("resource", "custom", id).catch(() => {});
        return { ...s, customResources: s.customResources.filter((c) => c.id !== id) };
      }
      addOverride("resource", "hide", id).catch(() => {});
      return { ...s, hiddenResources: Array.from(new Set([...s.hiddenResources, id])) };
    });
  }, []);

  const sendNotification = useCallback(
    async (n: Omit<Notification, "id" | "time"> & { id?: string }) => {
      const newNotif = { ...n, id: n.id ?? newId(), time: "Just now" } as Notification;
      setState((s) => ({
        ...s,
        customNotifications: [newNotif, ...s.customNotifications],
      }));
      await addOverride("notification", "custom", undefined, newNotif);
    },
    [],
  );

  const updateNotification = useCallback((id: string, partial: Partial<Notification>) => {
    setState((s) => {
      const wasCustom = s.customNotifications.some((c) => c.id === id);
      const r = upsertEdit(s.customNotifications, s.hiddenNotifications, seedNotifications, id, partial);
      const merged = r.customs.find((c) => c.id === id);
      if (merged) {
        if (wasCustom) {
          const ovrId = overrideIdMap.current.get(`notification:${id}`);
          if (ovrId) apiUpdateOverride(ovrId, merged, activeContentRoleRef.current).catch(() => {});
        } else {
          addOverride("notification", "hide", id).catch(() => {});
          addOverride("notification", "custom", undefined, merged).catch(() => {});
        }
      }
      return { ...s, customNotifications: r.customs, hiddenNotifications: r.hidden };
    });
  }, []);

  const removeNotification = useCallback((id: string) => {
    setState((s) => {
      const isCustom = s.customNotifications.some((c) => c.id === id);
      if (isCustom) {
        removeOverride("notification", "custom", id).catch(() => {});
        return { ...s, customNotifications: s.customNotifications.filter((c) => c.id !== id) };
      }
      addOverride("notification", "hide", id).catch(() => {});
      return { ...s, hiddenNotifications: Array.from(new Set([...s.hiddenNotifications, id])) };
    });
  }, []);

  // ── Settings ───────────────────────────────────────────────────────────────

  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    setState((s) => {
      const next = {
        ...s.appSettings,
        ...partial,
        pricing: { ...s.appSettings.pricing, ...(partial.pricing ?? {}) },
      };
      apiUpdateConfig({ settings: next as unknown as Record<string, unknown> }).catch(() => {});
      return { ...s, appSettings: next };
    });
  }, []);

  const resetSettings = useCallback(() => {
    setState((s) => {
      apiUpdateConfig({ settings: DEFAULT_SETTINGS as unknown as Record<string, unknown> }).catch(() => {});
      return { ...s, appSettings: DEFAULT_SETTINGS };
    });
  }, []);

  // ── Computed ───────────────────────────────────────────────────────────────

  const allCourses = useMemo(
    () => [...state.customCourses, ...seedCourses.filter((c) => !state.hiddenCourses.includes(c.id))],
    [state.customCourses, state.hiddenCourses],
  );
  const allLiveClasses = useMemo(
    () => [
      ...state.customLiveClasses,
      ...seedLiveClasses.filter((c) => !state.hiddenLiveClasses.includes(c.id)),
    ],
    [state.customLiveClasses, state.hiddenLiveClasses],
  );
  const allQuizzes = useMemo(
    () => [...state.customQuizzes, ...seedQuizzes.filter((c) => !state.hiddenQuizzes.includes(c.id))],
    [state.customQuizzes, state.hiddenQuizzes],
  );
  const allResources = useMemo(
    () => [
      ...state.customResources,
      ...seedResources.filter((c) => !state.hiddenResources.includes(c.id)),
    ],
    [state.customResources, state.hiddenResources],
  );
  const allNotifications = useMemo(
    () => [
      ...state.customNotifications,
      ...seedNotifications.filter((c) => !state.hiddenNotifications.includes(c.id)),
    ],
    [state.customNotifications, state.hiddenNotifications],
  );

  const refreshStreak = useCallback(async () => {
    try {
      const streakData = await apiRecordActivity().catch(() => apiGetMyStreak());
      setState((s) => ({
        ...s,
        streak: {
          currentStreak: streakData.currentStreak,
          longestStreak: streakData.longestStreak,
          lastActivityDate: streakData.lastActivityDate,
        },
      }));
    } catch {}
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      state,
      enrollCourse,
      addWatchHistory,
      addQuizScore,
      markAttendance,
      addDoubt,
      setStudent,
      logout,
      signIn,
      studentLogin,
      loadStudentFromApi,
      addStudent,
      updateStudent,
      removeStudent,
      upgrade,
      adminLogin,
      adminLogout,
      updateAdminCredentials,
      resetAdminCredentials,
      teacherLogin,
      teacherLogout,
      currentTeacher,
      addTeacher,
      updateTeacher,
      removeTeacher,
      addCourse,
      updateCourse,
      removeCourse,
      addLiveClass,
      updateLiveClass,
      removeLiveClass,
      addQuiz,
      updateQuiz,
      removeQuiz,
      addResource,
      updateResource,
      removeResource,
      sendNotification,
      updateNotification,
      removeNotification,
      updateSettings,
      resetSettings,
      allCourses,
      allLiveClasses,
      allQuizzes,
      allResources,
      allNotifications,
      leaderboard,
      refreshStreak,
      markChapterComplete,
      unmarkChapterComplete,
      refreshProgress,
    }),
    [
      state,
      enrollCourse,
      addWatchHistory,
      addQuizScore,
      markAttendance,
      addDoubt,
      setStudent,
      logout,
      signIn,
      studentLogin,
      loadStudentFromApi,
      addStudent,
      updateStudent,
      removeStudent,
      upgrade,
      adminLogin,
      adminLogout,
      updateAdminCredentials,
      markChapterComplete,
      unmarkChapterComplete,
      refreshProgress,
      resetAdminCredentials,
      teacherLogin,
      teacherLogout,
      currentTeacher,
      addTeacher,
      updateTeacher,
      removeTeacher,
      addCourse,
      updateCourse,
      removeCourse,
      addLiveClass,
      updateLiveClass,
      removeLiveClass,
      addQuiz,
      updateQuiz,
      removeQuiz,
      addResource,
      updateResource,
      removeResource,
      sendNotification,
      updateNotification,
      removeNotification,
      updateSettings,
      resetSettings,
      allCourses,
      allLiveClasses,
      allQuizzes,
      allResources,
      allNotifications,
      refreshStreak,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function useCourse(id: string | undefined) {
  const { allCourses } = useApp();
  return allCourses.find((c) => c.id === id);
}

export function useQuiz(id: string | undefined) {
  const { allQuizzes } = useApp();
  return allQuizzes.find((q) => q.id === id);
}

export function useSettings() {
  const { state } = useApp();
  return state.appSettings;
}
