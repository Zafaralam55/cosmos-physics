import AsyncStorage from "@react-native-async-storage/async-storage";

const DOMAIN = process.env["EXPO_PUBLIC_DOMAIN"];
export const API_BASE = DOMAIN ? `https://${DOMAIN}` : "";

const TOKEN_KEYS = {
  admin: "@cosmos-token-admin",
  teacher: "@cosmos-token-teacher",
  student: "@cosmos-token-student",
} as const;

type Role = keyof typeof TOKEN_KEYS;

export async function getToken(role: Role): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEYS[role]);
}
export async function setToken(role: Role, token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEYS[role], token);
}
export async function clearToken(role: Role): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEYS[role]);
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  role?: Role,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (role) {
    const token = await getToken(role);
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}/api${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText })) as { error?: string };
    throw new Error(err.error ?? res.statusText);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export type ApiUser = {
  id: string;
  role: string;
  email: string;
  name: string;
  phone?: string;
  subject?: string;
  bio?: string;
  qualification?: string;
  level?: string;
  subscriptionTier?: string;
  createdAt?: string | Date;
};

export async function apiLogin(email: string, password: string, role: Role) {
  return apiFetch<{ token: string; user: ApiUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, role }),
  });
}

export async function apiGetMe(role: Role): Promise<ApiUser> {
  return apiFetch<ApiUser>("/auth/me", {}, role);
}

// ── Public (no auth) ─────────────────────────────────────────────────────────

export async function apiGetPublicConfig() {
  return apiFetch<{ settings: Record<string, unknown> }>("/public/config");
}

export async function apiGetPublicOverrides(): Promise<ApiOverride[]> {
  return apiFetch<ApiOverride[]>("/public/overrides");
}

// ── Admin config ──────────────────────────────────────────────────────────────

export async function apiGetConfig() {
  return apiFetch<{ adminEmail: string; settings: Record<string, unknown> }>(
    "/admin/config",
    {},
    "admin",
  );
}

export async function apiUpdateConfig(data: {
  adminEmail?: string;
  adminPassword?: string;
  currentPassword?: string;
  settings?: Record<string, unknown>;
}) {
  return apiFetch<{ ok: boolean }>("/admin/config", {
    method: "PUT",
    body: JSON.stringify(data),
  }, "admin");
}

export async function apiResetAdminCredentials() {
  return apiFetch<{ ok: boolean }>("/admin/config/reset-admin", {
    method: "POST",
    body: JSON.stringify({}),
  }, "admin");
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function apiGetUsers(): Promise<ApiUser[]> {
  return apiFetch<ApiUser[]>("/admin/users", {}, "admin");
}

export async function apiCreateUser(data: Record<string, unknown>): Promise<{ id: string }> {
  return apiFetch<{ id: string }>("/admin/users", {
    method: "POST",
    body: JSON.stringify(data),
  }, "admin");
}

export async function apiUpdateUser(id: string, data: Record<string, unknown>) {
  return apiFetch<{ ok: boolean }>(`/admin/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }, "admin");
}

export async function apiDeleteUser(id: string) {
  return apiFetch<{ ok: boolean }>(`/admin/users/${id}`, { method: "DELETE" }, "admin");
}

// ── Content overrides ─────────────────────────────────────────────────────────

export type ApiOverride = {
  id: string;
  type: string;
  action: string;
  sourceId?: string | null;
  data?: unknown;
};

export async function apiGetOverrides(role: Role = "admin"): Promise<ApiOverride[]> {
  return apiFetch<ApiOverride[]>("/admin/overrides", {}, role);
}

export async function apiAddOverride(
  data: { type: string; action: string; sourceId?: string; data?: unknown },
  role: Role = "admin",
): Promise<{ id: string }> {
  return apiFetch<{ id: string }>("/admin/overrides", {
    method: "POST",
    body: JSON.stringify(data),
  }, role);
}

export async function apiDeleteOverride(id: string, role: Role = "admin") {
  return apiFetch<{ ok: boolean }>(`/admin/overrides/${id}`, { method: "DELETE" }, role);
}

// ── OTP Auth ──────────────────────────────────────────────────────────────────

export async function apiRequestOtp(contact: string, type: "email" | "sms", role = "student") {
  return apiFetch<{ ok: boolean; dev?: boolean; otp?: string }>("/auth/otp/request", {
    method: "POST",
    body: JSON.stringify({ contact, type, role }),
  });
}

export async function apiVerifyOtp(contact: string, code: string, type: "email" | "sms", role = "student") {
  return apiFetch<{ token: string; user: ApiUser }>("/auth/otp/verify", {
    method: "POST",
    body: JSON.stringify({ contact, code, type, role }),
  });
}

export async function apiUpdateOverride(id: string, data: unknown, role: Role = "admin") {
  return apiFetch<{ ok: boolean }>(`/admin/overrides/${id}`, {
    method: "PUT",
    body: JSON.stringify({ data }),
  }, role);
}

// ── Storage ───────────────────────────────────────────────────────────────────

export async function apiRequestUploadUrl(name: string, size: number, contentType: string) {
  return apiFetch<{ uploadURL: string; objectPath: string }>(
    "/storage/uploads/request-url",
    {
      method: "POST",
      body: JSON.stringify({ name, size, contentType }),
    },
    "admin",
  );
}

export async function apiUploadFile(
  uploadURL: string,
  fileUri: string,
  contentType: string,
  onProgress?: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadURL);
    xhr.setRequestHeader("Content-Type", contentType);
    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
    }
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("Upload failed")));
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send({ uri: fileUri } as unknown as BodyInit);
  });
}

export function apiObjectUrl(objectPath: string): string {
  return `${API_BASE}/api/storage/objects/${objectPath.replace(/^\/objects\//, "")}`;
}

// ── Push Notifications ────────────────────────────────────────────────────────

export async function apiRegisterPushToken(token: string, platform = "expo") {
  return apiFetch<{ ok: boolean }>("/notifications/register-token", {
    method: "POST",
    body: JSON.stringify({ token, platform }),
  }, "student").catch(() =>
    apiFetch<{ ok: boolean }>("/notifications/register-token", {
      method: "POST",
      body: JSON.stringify({ token, platform }),
    }, "admin")
  );
}

export async function apiBroadcastPush(title: string, body: string, data?: Record<string, string>) {
  return apiFetch<{ ok: boolean; sent: number; total: number }>(
    "/notifications/broadcast",
    { method: "POST", body: JSON.stringify({ title, body, data }) },
    "admin",
  );
}

export type AnnouncementRecord = {
  id: string;
  title: string;
  body: string;
  type: string;
  sentBy: string | null;
  pushSent: number;
  pushTotal: number;
  sentAt: string;
};

export async function apiAnnounce(title: string, body: string, type: string) {
  return apiFetch<{ ok: boolean; announcement: AnnouncementRecord; pushSent: number; pushTotal: number }>(
    "/notifications/announce",
    { method: "POST", body: JSON.stringify({ title, body, type }) },
    "admin",
  );
}

export async function apiGetAnnouncements() {
  return apiFetch<AnnouncementRecord[]>("/notifications/announcements", {});
}

// ── Daily Challenge ───────────────────────────────────────────────────────────

export type DailyChallengeData = {
  date: string;
  question: string;
  options: string[];
  topic: string;
  difficulty: string;
  correctIndex: number | null;
  explanation: string | null;
  userAnswer: { chosenIndex: number; isCorrect: boolean; streakBonus: number } | null;
};

export type DailyChallengeStats = {
  totalParticipants: number;
  correctAnswers: number;
  accuracy: number | null;
};

export type DailyChallengeResult = {
  isCorrect: boolean;
  correctIndex: number;
  explanation: string;
  streakBonus: number;
  currentStreak: number;
};

export async function apiGetDailyChallenge(): Promise<DailyChallengeData> {
  return apiFetch<DailyChallengeData>("/daily-challenge", {}).catch(() =>
    apiFetch<DailyChallengeData>("/daily-challenge", {}, "student"),
  );
}

export async function apiGetDailyChallengeAuthed(): Promise<DailyChallengeData> {
  return apiFetch<DailyChallengeData>("/daily-challenge", {}, "student");
}

export async function apiSubmitDailyAnswer(chosenIndex: number): Promise<DailyChallengeResult> {
  return apiFetch<DailyChallengeResult>(
    "/daily-challenge/answer",
    { method: "POST", body: JSON.stringify({ chosenIndex }) },
    "student",
  );
}

export async function apiGetDailyChallengeStats(): Promise<DailyChallengeStats> {
  return apiFetch<DailyChallengeStats>("/daily-challenge/stats", {});
}

// ── Course Progress ───────────────────────────────────────────────────────────

export type ChapterProgress = {
  id: string;
  userId: string;
  courseId: string;
  chapterId: string;
  completedAt: string;
};

export async function apiGetProgress(): Promise<ChapterProgress[]> {
  return apiFetch<ChapterProgress[]>("/progress", {}, "student");
}

export async function apiMarkChapterComplete(courseId: string, chapterId: string): Promise<ChapterProgress[]> {
  return apiFetch<ChapterProgress[]>(
    "/progress/complete",
    { method: "POST", body: JSON.stringify({ courseId, chapterId }) },
    "student",
  );
}

export async function apiUnmarkChapterComplete(courseId: string, chapterId: string): Promise<ChapterProgress[]> {
  return apiFetch<ChapterProgress[]>(
    "/progress/complete",
    { method: "DELETE", body: JSON.stringify({ courseId, chapterId }) },
    "student",
  );
}

// ── Study Streaks ─────────────────────────────────────────────────────────────

export type StreakData = {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
};

export async function apiRecordActivity() {
  return apiFetch<StreakData>("/streaks/activity", { method: "POST" }, "student");
}

export async function apiGetMyStreak() {
  return apiFetch<StreakData>("/streaks/me", {}, "student");
}

// ── Enrollments ───────────────────────────────────────────────────────────────

export async function apiGetEnrollments(): Promise<{ courseId: string }[]> {
  return apiFetch<{ courseId: string }[]>("/enrollments", {}, "student");
}

export async function apiEnrollCourse(courseId: string) {
  return apiFetch<{ ok: boolean }>("/enrollments", {
    method: "POST",
    body: JSON.stringify({ courseId }),
  }, "student");
}

export async function apiUnenrollCourse(courseId: string) {
  return apiFetch<{ ok: boolean }>(`/enrollments/${courseId}`, { method: "DELETE" }, "student");
}

export type LeaderboardEntry = {
  rank: number;
  studentId: string;
  name: string;
  level: string;
  quizzesTaken: number;
  totalScore: number;
  totalPossible: number;
  accuracy: number;
  avatar: string;
};

export async function apiGetLeaderboard(period: "alltime" | "week" | "month" = "alltime"): Promise<LeaderboardEntry[]> {
  const query = period !== "alltime" ? `?period=${period}` : "";
  return apiFetch<LeaderboardEntry[]>(`/leaderboard${query}`);
}

export async function apiSubmitQuizScore(data: {
  quizId: string;
  quizTitle: string;
  score: number;
  total: number;
}, role: Role = "student") {
  return apiFetch<{ ok: boolean; id: string }>("/quiz/scores", {
    method: "POST",
    body: JSON.stringify(data),
  }, role);
}

export async function apiUpdateProfile(
  data: { name?: string; phone?: string },
  role: Role = "student",
): Promise<ApiUser> {
  return apiFetch<ApiUser>("/auth/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  }, role);
}

export async function apiChangePassword(
  currentPassword: string,
  newPassword: string,
  role: Role = "student",
) {
  return apiFetch<{ token: string }>("/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  }, role);
}

export async function apiForgotPassword(email: string) {
  return apiFetch<{ ok: boolean; dev?: boolean; otp?: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function apiResetPassword(email: string, otp: string, newPassword: string) {
  return apiFetch<{ ok: boolean }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, otp, newPassword }),
  });
}

export async function apiRegister(data: { name: string; email: string; password: string; phone?: string }) {
  return apiFetch<{ token: string; user: ApiUser }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ── Course Access Control ─────────────────────────────────────────────────────

export type CourseAccessRecord = {
  id: string;
  studentId: string;
  courseId: string;
  status: "granted" | "blocked" | "locked";
  updatedAt: string;
};

export async function apiGetAllCourseAccess(): Promise<CourseAccessRecord[]> {
  return apiFetch<CourseAccessRecord[]>("/course-access", {}, "admin");
}

export async function apiGetStudentCourseAccess(studentId: string): Promise<CourseAccessRecord[]> {
  return apiFetch<CourseAccessRecord[]>(`/course-access/student/${studentId}`, {}, "admin");
}

export async function apiGetLockedCourses(): Promise<{ lockedCourseIds: string[] }> {
  return apiFetch<{ lockedCourseIds: string[] }>("/course-access/locked-courses");
}

export async function apiGetMyGrantedCourses(): Promise<{ grantedCourseIds: string[] }> {
  return apiFetch<{ grantedCourseIds: string[] }>("/course-access/my-grants", {}, "student");
}

export async function apiSetCourseAccess(
  studentId: string,
  courseId: string,
  status: "granted" | "blocked" | "locked",
): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>("/course-access", {
    method: "POST",
    body: JSON.stringify({ studentId, courseId, status }),
  }, "admin");
}

export async function apiRemoveCourseAccess(studentId: string, courseId: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/course-access/${studentId}/${courseId}`, { method: "DELETE" }, "admin");
}

export async function apiCheckCourseAccess(courseId: string): Promise<{ isLocked: boolean; isBlocked: boolean; hasGrant: boolean; canEnroll: boolean }> {
  return apiFetch<{ isLocked: boolean; isBlocked: boolean; hasGrant: boolean; canEnroll: boolean }>(
    `/course-access/check/${courseId}`,
    {},
    "student",
  );
}

// ── Doubts ────────────────────────────────────────────────────────────────────

export interface DoubtReply {
  id: string;
  doubtId: string;
  userId: string;
  userName: string;
  role: string;
  text: string;
  createdAt: string;
}

export interface Doubt {
  id: string;
  studentId: string;
  studentName: string;
  text: string;
  photoUrl?: string | null;
  status: "open" | "answered";
  createdAt: string;
  replies: DoubtReply[];
}

export async function apiPostDoubt(data: { text: string; photoUrl?: string }): Promise<{ id: string }> {
  return apiFetch<{ id: string }>("/doubts", { method: "POST", body: JSON.stringify(data) }, "student");
}

export async function apiGetDoubts(role: Role = "student"): Promise<Doubt[]> {
  return apiFetch<Doubt[]>("/doubts", {}, role);
}

export async function apiReplyToDoubt(doubtId: string, text: string, role: Role): Promise<{ id: string }> {
  return apiFetch<{ id: string }>(`/doubts/${doubtId}/replies`, { method: "POST", body: JSON.stringify({ text }) }, role);
}

export async function apiSolveDoubt(doubtId: string, role: Role): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/doubts/${doubtId}/solve`, { method: "PUT" }, role);
}

export async function apiReopenDoubt(doubtId: string, role: Role): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/doubts/${doubtId}/reopen`, { method: "PUT" }, role);
}

export async function apiRequestUploadUrlForRole(name: string, size: number, contentType: string, role: Role) {
  return apiFetch<{ uploadURL: string; objectPath: string }>(
    "/storage/uploads/request-url",
    { method: "POST", body: JSON.stringify({ name, size, contentType }) },
    role,
  );
}

// ── Bulk export / import ──────────────────────────────────────────────────────

export interface ExportBundle {
  version: number;
  exportedAt: string;
  appName: string;
  itemCount: number;
  items: Array<{ type: string; action: string; sourceId?: string | null; data?: unknown }>;
}

export async function apiExportContent(): Promise<ExportBundle> {
  return apiFetch<ExportBundle>("/admin/export", {}, "admin");
}

export async function apiImportContent(
  bundle: Pick<ExportBundle, "items">,
): Promise<{ ok: boolean; imported: number; skipped: number }> {
  return apiFetch<{ ok: boolean; imported: number; skipped: number }>("/admin/import", {
    method: "POST",
    body: JSON.stringify({ items: bundle.items }),
  }, "admin");
}

// ── Version history ──────────────────────────────────────────────────────────

export interface VersionHistoryEntry {
  id: string;
  type: string;
  itemId: string;
  overrideId: string;
  data: Record<string, unknown>;
  label: string;
  createdAt: string;
}

export async function apiGetHistory(overrideId?: string): Promise<VersionHistoryEntry[]> {
  const qs = overrideId ? `?overrideId=${encodeURIComponent(overrideId)}` : "";
  return apiFetch<VersionHistoryEntry[]>(`/history${qs}`, {}, "admin");
}

export async function apiRestoreVersion(historyId: string): Promise<{ ok: boolean; data: unknown }> {
  return apiFetch<{ ok: boolean; data: unknown }>(`/history/${historyId}/restore`, { method: "POST" }, "admin");
}
