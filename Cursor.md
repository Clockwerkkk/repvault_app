# Cursor Memory: Fitness App MVP

## Project Summary
GymLog Mini is a Telegram Mini App for fast strength workout logging.  
The MVP focuses on low-friction session tracking: start workout, add exercises, log sets (weight/reps/type), save workout, and review progress by exercise.  
This project is intentionally simple and optimized for solo-founder speed, not enterprise complexity.

---

## Product Scope (MVP)

### In scope
- Telegram Mini App authentication
- Home screen with quick summary
- Active workout flow
- Exercise catalog with search/filter
- Set logging (add/edit/delete)
- Workout save/finish flow
- Workout history and workout details
- Exercise details with progress chart and key metrics
- Basic relational DB schema
- Seed of popular gym exercises

### Out of scope (current MVP)
- AI recommendations
- Social features
- Payments/subscriptions
- Wearables
- Advanced analytics
- Offline mode
- Push notifications

---

## Tech Stack

### Frontend
- React + TypeScript
- Vite
- Telegram Mini Apps SDK
- TanStack Query
- Zustand (or minimal local state approach)
- Chart library: Recharts (or Victory as alternative)
- Styling: Tailwind CSS (or CSS Modules)

### Backend
- Node.js + TypeScript
- NestJS (recommended baseline)
- Prisma ORM
- PostgreSQL
- Telegram initData signature validation (HMAC)
- JWT/session token auth for API

### Tooling / Infra
- pnpm workspaces (recommended)
- ESLint + TypeScript checks
- Managed PostgreSQL (e.g., Supabase/Neon/Railway)
- Frontend hosting: Vercel/Cloudflare Pages
- Backend hosting: Railway/Render/Fly.io
- Optional monitoring: Sentry

---

## Project Structure

```txt
fitness_app/
  apps/
    miniapp/                # Telegram Mini App frontend
      src/
        screens/
        components/
        api/
        hooks/
        store/
    api/                    # Backend API
      src/
        modules/
          auth/
          users/
          exercises/
          workouts/
          sets/
        common/
  packages/
    shared/                 # Shared types/schemas/constants
      src/
  prisma/
    schema.prisma
    migrations/
    seed.ts
  docs/                     # Optional docs folder if needed
  PRD.md
  ARCHITECTURE.md
  TASKS_WEEK1.md
  Cursor.md
```

---

## Core Data Model

- `User`
- `ExerciseCategory`
- `Exercise`
- `Workout`
- `WorkoutExercise`
- `SetEntry`

Key relations:
- User 1 -> N Workouts
- Workout 1 -> N WorkoutExercises
- WorkoutExercise N -> 1 Exercise
- WorkoutExercise 1 -> N SetEntries
- ExerciseCategory 1 -> N Exercises

---

## Main Commands

> Note: adjust if final package scripts differ.

### Install
- `pnpm install`

### Development
- `pnpm dev` (run all apps)
- `pnpm --filter miniapp dev`
- `pnpm --filter api dev`

### Build
- `pnpm build`
- `pnpm --filter miniapp build`
- `pnpm --filter api build`

### Quality
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

### Database (Prisma)
- `pnpm prisma:generate`
- `pnpm prisma:migrate`
- `pnpm prisma:studio`
- `pnpm db:seed`

---

## Development Rules

1. **MVP focus first**
   - Prioritize speed and reliability of workout logging.
   - Do not add complex features unless explicitly requested.

2. **Language conventions**
   - Code comments: **Russian**.
   - Variable/function/type names: **English**.
   - API and DB naming: **English**, consistent, explicit.

3. **Code style**
   - Keep files and functions small and readable.
   - Avoid over-engineering and deep abstraction in MVP.
   - Prefer clear service-layer logic over premature architecture.

4. **UI/UX principles**
   - Minimize taps during active workout.
   - One primary action per screen.
   - Fast feedback for set operations (optimistic UI where safe).

5. **Data and validation**
   - Never trust client identity; validate Telegram auth server-side.
   - Validate set inputs (`weight`, `reps`, `set_type`) both frontend and backend.
   - Keep DB schema simple and relational.

6. **Git workflow**
   - Small focused commits.
   - Commit messages explain intent.
   - Do not mix unrelated changes in one commit.

---

## Session Start Rule (Important)

At the start of every new session:
1. Read `Cursor.md` first.
2. Confirm current project scope and MVP boundaries.
3. Check docs:
   - `PRD.md`
   - `ARCHITECTURE.md`
   - `TASKS_WEEK1.md`
4. Continue work according to current status and next tasks.

---

## Current Status

- Product documentation created:
  - `PRD.md`
  - `ARCHITECTURE.md`
  - `TASKS_WEEK1.md`
- Phase 1 completed:
  - monorepo/root setup
  - frontend miniapp scaffold
  - backend API scaffold with `/health`
  - shared package scaffold
- Phase 2 completed at file level:
  - `prisma/schema.prisma`
  - initial migration SQL
  - seed data for categories and exercises
- Phase 3 started:
  - `POST /auth/telegram` implemented
  - user auto-create/upsert by Telegram ID implemented
  - protected `GET /home/summary` implemented
- Phase 3 progress:
  - workout lifecycle endpoints implemented:
    - `POST /workouts`
    - `GET /workouts/active`
    - `POST /workouts/:id/finish`
  - exercise endpoints implemented:
    - `GET /exercises`
    - `POST /workouts/:id/exercises`
- Phase 3 completed (backend core):
  - set CRUD endpoints implemented:
    - `POST /workout-exercises/:id/sets`
    - `PATCH /sets/:id`
    - `DELETE /sets/:id`
  - workout history/details endpoints implemented:
    - `GET /workouts/history`
    - `GET /workouts/:id`
  - exercise progress endpoint implemented:
    - `GET /exercises/:id/progress`
- Phase 4 started:
  - frontend auth bootstrap implemented
  - API client layer implemented for auth/home/workouts/exercises
  - Home screen implemented and connected to `GET /home/summary`
  - Active Workout screen implemented and connected to:
    - `POST /workouts`
    - `GET /workouts/active`
  - Exercise Picker implemented and connected to:
    - `GET /exercises`
    - `POST /workouts/:id/exercises`
- Phase 4 progress:
  - workout exercise screen implemented (set logging):
    - add set (`POST /workout-exercises/:id/sets`)
    - delete set (`DELETE /sets/:id`)
  - finish workout action integrated (`POST /workouts/:id/finish`)
  - history and workout details screens integrated:
    - `GET /workouts/history`
    - `GET /workouts/:id`
  - exercise progress screen integrated:
    - `GET /exercises/:id/progress`
  - set edit flow integrated:
    - edit action in Workout Exercise screen
    - `PATCH /sets/:id` wired from frontend
  - catalog screen improved:
    - real exercise listing with search/filter
    - direct transition to exercise progress screen
- Phase 5 progress:
  - contract types expanded in `packages/shared` and reused by miniapp
  - baseline automated tests added for critical backend logic:
    - auth Telegram signature parsing/validation
    - set input validation
    - workout title normalization helper
  - release readiness updates:
    - `.env.example` expanded with DB/API/Miniapp vars
    - `README.md` updated with setup/run/quality steps
- Runtime verification commands are pending execution in local environment (`pnpm install`, migrate, seed).

---

## Next Recommended Steps

1. Run local setup commands (`pnpm install`, `pnpm prisma:generate`, `pnpm prisma:migrate`, `pnpm db:seed`).
2. Verify auth/home endpoints against real Telegram initData and DB.
3. Verify all Phase 3 endpoints with real DB data.
4. Verify Phase 4 frontend flow in browser/Telegram Mini App.
5. Run Phase 5 checks (`pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`) and Telegram E2E smoke test.

---

## Relaunch Notes (Cache-safe)

When re-testing via Telegram Mini App after UI changes, use this restart protocol:

1. Stop all local processes and old tunnel sessions.
2. Restart `api` and `miniapp` dev servers.
3. Create a fresh tunnel URL for miniapp.
4. Update BotFather Mini App URL to that fresh tunnel URL.
5. Close Telegram completely on device and reopen it.
6. Launch mini app from bot menu and confirm latest UI is loaded.

Important:
- Do not rely on previously opened webview sessions after URL changes.
- For production-like auth checks keep:
  - `ALLOW_INSECURE_TELEGRAM_AUTH=false`
  - `VITE_ALLOW_DEV_TELEGRAM_AUTH=false`
