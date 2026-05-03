# Cosmos Physics Academy

A premium mobile-first physics teaching app by Md Zafar Alam (B.Tech Mech, PhD scholar IIT Patna). Designed for Class 9-12 students, JEE/NEET aspirants, and engineering students.

## Project Overview

- **Tagline**: Explore the Universe of Physics
- **Theme**: Futuristic galaxy — deep cosmic black background, electric blue (#5B8CFF) primary, indigo accent (#8B5CF6), animated atom logo
- **Branding**: Animated three-ring atom logo, hand-painted galaxy hero image, founder portrait
- **Founder**: Md Zafar Alam — PhD scholar at IIT Patna researching Molecular Dynamics

## Architecture

Two artifacts:
- `artifacts/cosmos-physics` — Expo (React Native) mobile app, mobile-first with full web preview
- `artifacts/api-server` — Express API server at `/api`, backed by PostgreSQL (Drizzle ORM)

### Stack

**Mobile (Expo)**
- Expo SDK 54 + Expo Router 6 (typed routes)
- React Native 0.81, Reanimated 4, Safe Area Context
- AsyncStorage for session-only local cache (watchHistory, quizScores, attendance, doubts, notificationsRead)
- JWT tokens stored in AsyncStorage per role: `@cosmos-token-admin`, `@cosmos-token-teacher`, `@cosmos-token-student`
- expo-linear-gradient, expo-blur, expo-haptics, expo-image-picker, expo-web-browser

**API (Express)**
- Express 5 + TypeScript + esbuild
- Drizzle ORM with PostgreSQL (lib/db)
- bcryptjs for password hashing, jose for JWT (HS256, 30-day expiry)
- Pino logger (req.log in handlers, singleton logger elsewhere)

**Database (lib/db)**
- Schema tables: `users`, `app_config`, `enrollments`, `content_overrides`, `otp_tokens`, `doubts`, `doubt_replies`
- Migrations via `pnpm --filter @workspace/db run push`

**Storage**
- Replit Object Storage (bucket: `replit-objstore-0e0c6c8d-fb6a-455a-a94a-ef6fb537178a`)
- PDF upload: admin picks PDF → presigned PUT URL → direct upload to Object Storage
- Serve via `GET /api/storage/objects/*path`

### API Routes

- `GET /api/healthz` — health check
- `POST /api/auth/login` — login for admin/teacher/student, returns JWT
- `GET /api/auth/me` — current user from JWT
- `POST /api/auth/otp/request` — request email or SMS OTP for student login (type: "email"|"sms")
- `POST /api/auth/otp/verify` — verify OTP, returns JWT; email lookup by email, SMS lookup by phone
- `POST /api/notifications/register-token` — save Expo push token for a device (auth required)
- `POST /api/notifications/broadcast` — send push to all registered devices (admin only)
- `POST /api/storage/uploads/request-url` — presigned upload URL (admin auth required)
- `GET /api/storage/objects/*path` — serve stored objects
- `GET/PUT /api/admin/config` — app settings + admin credentials (admin only)
- `GET/POST/PUT/DELETE /api/admin/users` — teacher/student CRUD (admin only)
- `GET/POST/PUT/DELETE /api/admin/overrides` — content overrides (admin only)
- `GET/POST/DELETE /api/enrollments` — student enrollments
- `POST /api/doubts` — student posts a doubt (text + optional photoUrl)
- `GET /api/doubts` — list doubts (student sees own; teacher/admin sees all, with replies)
- `GET /api/doubts/:id` — get one doubt with replies
- `POST /api/doubts/:id/replies` — add reply (any role; teacher/admin auto-marks doubt answered)
- `PUT /api/doubts/:id/solve` — mark as answered (teacher/admin)
- `PUT /api/doubts/:id/reopen` — reopen (teacher/admin)

### Auth Flow

Three roles: `admin`, `teacher`, `student`. Each gets its own JWT stored in AsyncStorage.
- Admin: credentials stored in `app_config` table, seeded as `zafar@cosmos.in` / `Cosmos@2026`
- Teachers/Students: stored in `users` table, managed by admin
- On app startup: AppContext hydrates from backend (verifies tokens, fetches config, users, overrides)

### Content Strategy

- Seed data stays in Expo TypeScript files (`data/courses.ts`, `data/liveClasses.ts`, etc.)
- Content customisations (hide/add) stored in `content_overrides` table and fetched on startup
- App settings (name, tagline, colors, pricing) stored in `app_config.settings` JSON column

### Demo Accounts (seeded on first startup)

| Role    | Email                       | Password     |
|---------|-----------------------------|--------------|
| Admin   | zafar@cosmos.in             | Cosmos@2026  |
| Student | arjun.sharma@cosmos.in      | Cosmos@2026  |
| Teacher | priya.teacher@cosmos.in     | Teacher@2026 |

### Navigation

Five tabs (Home, Courses, Live, Quiz, Profile) plus stack screens for course detail, quiz play, quiz result, login, notes, doubt solving, founder profile, founder dashboard, physics tools, notifications, payment, and leaderboard.

### Key Files

- `artifacts/cosmos-physics/contexts/AppContext.tsx` — global state, backend hydration, all CRUD via API
- `artifacts/cosmos-physics/lib/apiClient.ts` — typed fetch helpers for all API endpoints
- `artifacts/api-server/src/routes/` — auth, admin, enrollments route handlers
- `artifacts/api-server/src/lib/auth.ts` — bcrypt + jose JWT helpers
- `artifacts/api-server/src/lib/seed.ts` — seeds admin config + demo accounts on first run
- `artifacts/api-server/src/middlewares/requireAuth.ts` — JWT middleware + requireRole helper
- `lib/db/src/schema/` — users, config, enrollments, overrides Drizzle schemas

## Features

- Animated atom logo and starry/nebula backgrounds throughout
- Browse and enroll in 7 physics courses (Class 9-10 → JEE/NEET → Engineering)
- Courses support YouTube playlist URL — "Watch Playlist on YouTube" button on course detail
- Chapters support per-chapter YouTube URL — play icon opens YouTube on tap
- Live class schedule with "Live Now" hero card and join button
- Daily quizzes with timer, MCQ flow, scoring and results screen
- Notes library: notes, formula sheets, PYQs, numerical sheets — formula tap-to-copy, open PDF/Drive links
- Study resources support PDF via Object Storage (pdfObjectPath) or Google Drive URL (driveUrl)
- Doubt solving with image attachment via library
- Founder profile + dashboard with KPIs and admin actions
- Founder Dashboard: manage teachers, students, courses (+ YouTube playlist URL), live classes, quizzes, resources (+ PDF upload + Drive URL), notifications, app settings — all persisted to backend
- PDF upload in admin: admin picks PDF → uploads to Replit Object Storage → objectPath saved with resource
- Physics tools: complete formula sheet, multi-unit converter, smart calculator
- Notifications, leaderboard with podium, plans/pricing
- Subscription tiers: Free / Pro / Lifetime
- Teacher portal: sign-in with real credentials, view assigned content
- Admin credential management with current-password verification
- Student login: 3 modes — Password, Email OTP, or Mobile OTP (6-digit code, 10-minute expiry)
- Email OTP delivery via SMTP (nodemailer); if SMTP not configured, OTP returned in response (dev mode)
- Mobile OTP (SMS) delivery via Twilio; if Twilio not configured, OTP returned in response (dev mode)
- Mobile OTP lookup by phone number stored in student profile
- Push notifications: app registers Expo push token on startup (native only, skipped on web)
- Admin can broadcast push notification to all registered devices from Notify panel in admin dashboard
- Push tokens stored in `push_tokens` DB table; sent in batches of 100 via Expo Push API

## Notes

- Free tier: only one artifact allowed for this project — Expo mobile app at root path `/`.
- API server runs at `/api` path prefix on port 8080.
- `EXPO_PUBLIC_DOMAIN` env var set to `$REPLIT_DEV_DOMAIN` in Expo workflow for API base URL.
