# Development Plan (Step-by-Step)

This plan is based on `PRD.md` and is optimized for solo MVP delivery.  
Execution order is strict: **project setup -> database -> backend -> frontend -> integration**.

---

## Phase 1: Base Project Structure and Environment Setup

### Task 1.1 - Initialize workspace and root config
**What is created**
- Monorepo root setup with shared package manager config and scripts.

**Files touched**
- `package.json`
- `pnpm-workspace.yaml`
- `.gitignore`
- `.env.example`
- `README.md`

**What should work after completion**
- Dependencies can be installed from root.
- Root scripts are available (dev/build/lint/typecheck/test).

**How to verify**
- Run `pnpm install`
- Run `pnpm -w run -r --if-present lint`
- Run `pnpm -w run -r --if-present typecheck`

---

### Task 1.2 - Create folder skeleton for apps and shared package
**What is created**
- Base folder structure for frontend, backend, and shared code.

**Files touched**
- `apps/miniapp/` (initial scaffold)
- `apps/api/` (initial scaffold)
- `packages/shared/` (initial scaffold)

**What should work after completion**
- Repository has clear project boundaries and ready folders for implementation.

**How to verify**
- Confirm directories exist:
  - `apps/miniapp`
  - `apps/api`
  - `packages/shared`

---

### Task 1.3 - Setup frontend app scaffold (Mini App)
**What is created**
- React + TypeScript app with Vite baseline and Telegram Mini App bootstrap entry.

**Files touched**
- `apps/miniapp/package.json`
- `apps/miniapp/index.html`
- `apps/miniapp/tsconfig.json`
- `apps/miniapp/vite.config.ts`
- `apps/miniapp/src/main.tsx`
- `apps/miniapp/src/App.tsx`
- `apps/miniapp/src/styles.css`

**What should work after completion**
- Frontend runs locally and renders base app shell.

**How to verify**
- Run `pnpm --filter miniapp dev`
- Open local URL and confirm app renders without runtime errors.

---

### Task 1.4 - Setup backend app scaffold
**What is created**
- Node.js TypeScript backend with modular structure and health endpoint.

**Files touched**
- `apps/api/package.json`
- `apps/api/tsconfig.json`
- `apps/api/src/main.ts`
- `apps/api/src/app.module.ts`
- `apps/api/src/modules/health/health.controller.ts`
- `apps/api/.env.example`

**What should work after completion**
- Backend starts and responds on `/health`.

**How to verify**
- Run `pnpm --filter api dev`
- Call `GET /health` and confirm `200 OK`.

---

### Task 1.5 - Setup shared package for common types/schemas
**What is created**
- Shared library for DTOs, enums, and validation schemas used by frontend/backend.

**Files touched**
- `packages/shared/package.json`
- `packages/shared/tsconfig.json`
- `packages/shared/src/index.ts`
- `packages/shared/src/types/*.ts`
- `packages/shared/src/schemas/*.ts`

**What should work after completion**
- Both apps can import from `packages/shared`.

**How to verify**
- Add one test import in frontend/backend and run `typecheck`.

---

### Task 1.6 - Setup lint/typecheck/test scripts
**What is created**
- Unified quality scripts for all packages.

**Files touched**
- Root `package.json` scripts
- App-level `package.json` scripts
- ESLint config files
- Optional test configs

**What should work after completion**
- One command validates formatting/typing in all projects.

**How to verify**
- Run:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test` (if tests already wired)

---

## Phase 2: Database Schema and Seed Data

### Task 2.1 - Add Prisma and database configuration
**What is created**
- Prisma setup with PostgreSQL connection.

**Files touched**
- `prisma/schema.prisma`
- `prisma/seed.ts`
- Root `.env.example` (DATABASE_URL)
- Root scripts for prisma commands

**What should work after completion**
- Prisma can generate client and connect to DB.

**How to verify**
- Run `pnpm prisma:generate`
- Run `pnpm prisma:studio` (connection opens successfully)

---

### Task 2.2 - Implement core entities in schema
**What is created**
- Full MVP relational schema:
  - `User`
  - `ExerciseCategory`
  - `Exercise`
  - `Workout`
  - `WorkoutExercise`
  - `SetEntry`

**Files touched**
- `prisma/schema.prisma`

**What should work after completion**
- All required tables and relations reflect PRD.

**How to verify**
- Run `pnpm prisma:migrate`
- Inspect schema in Prisma Studio.

---

### Task 2.3 - Add indexes, constraints, and enums
**What is created**
- Enum and indexing strategy for MVP performance and correctness.

**Files touched**
- `prisma/schema.prisma`

**What should work after completion**
- Key fields are unique/indexed:
  - `telegram_user_id` unique
  - workout lookup indexes
  - exercise search indexes (as applicable)

**How to verify**
- Migration applies without errors.
- DB inspection confirms indexes/constraints.

---

### Task 2.4 - Seed exercise categories
**What is created**
- Seed logic for all target muscle categories.

**Files touched**
- `prisma/seed.ts`
- Optional seed constants file: `prisma/seeds/categories.ts`

**What should work after completion**
- Categories are inserted idempotently.

**How to verify**
- Run `pnpm db:seed`
- Query categories and confirm expected set exists.

---

### Task 2.5 - Seed exercise catalog (80-120 items)
**What is created**
- Realistic starter catalog of common gym exercises by category.

**Files touched**
- `prisma/seed.ts`
- Optional: `prisma/seeds/exercises.ts`

**What should work after completion**
- Exercise catalog is available immediately for new users.

**How to verify**
- Run `pnpm db:seed`
- Confirm count is within target range and categories are linked.

---

## Phase 3: Server-Side Implementation

### Task 3.1 - Implement Telegram auth validation endpoint
**What is created**
- `POST /auth/telegram` endpoint with initData signature validation.

**Files touched**
- `apps/api/src/modules/auth/auth.controller.ts`
- `apps/api/src/modules/auth/auth.service.ts`
- `apps/api/src/modules/auth/telegram-auth.util.ts`
- `apps/api/src/modules/auth/dto/*.ts`

**What should work after completion**
- Backend validates Telegram payload and rejects invalid signatures.

**How to verify**
- Valid payload returns auth token.
- Invalid payload returns unauthorized error.

---

### Task 3.2 - Implement user bootstrap on first login
**What is created**
- User upsert logic by Telegram ID.

**Files touched**
- `apps/api/src/modules/users/users.service.ts`
- `apps/api/src/modules/auth/auth.service.ts`

**What should work after completion**
- New user is auto-created; existing user is reused.

**How to verify**
- Login with new Telegram user: new DB row appears.
- Repeat login: no duplicate user created.

---

### Task 3.3 - Implement Home summary endpoint
**What is created**
- `GET /home/summary` returning last workout and quick stats.

**Files touched**
- `apps/api/src/modules/home/home.controller.ts`
- `apps/api/src/modules/home/home.service.ts`
- `apps/api/src/modules/home/dto/*.ts`

**What should work after completion**
- Home data returns both empty-state and populated-state payloads.

**How to verify**
- User without workouts gets zeroed summary.
- User with workouts gets latest data and counts.

---

### Task 3.4 - Implement workout lifecycle endpoints
**What is created**
- Active workout creation, fetch, and finish flow.

**Files touched**
- `apps/api/src/modules/workouts/workouts.controller.ts`
- `apps/api/src/modules/workouts/workouts.service.ts`
- `apps/api/src/modules/workouts/dto/*.ts`

**Endpoints**
- `POST /workouts`
- `GET /workouts/active`
- `POST /workouts/:id/finish`

**What should work after completion**
- User can create exactly one active workout and finish it.

**How to verify**
- Start workout -> status `active`
- Finish workout -> status `completed`, `finished_at` set

---

### Task 3.5 - Implement exercise catalog endpoints
**What is created**
- Search/filter API for exercises.

**Files touched**
- `apps/api/src/modules/exercises/exercises.controller.ts`
- `apps/api/src/modules/exercises/exercises.service.ts`

**Endpoints**
- `GET /exercises?search=&category=`

**What should work after completion**
- Exercises are searchable and filterable by category.

**How to verify**
- Query by text returns matching names.
- Filter by category returns only relevant exercises.

---

### Task 3.6 - Implement add exercise to workout endpoint
**What is created**
- API to append exercise into active workout.

**Files touched**
- `apps/api/src/modules/workouts/workouts.controller.ts`
- `apps/api/src/modules/workouts/workouts.service.ts`

**Endpoint**
- `POST /workouts/:id/exercises`

**What should work after completion**
- Exercise is linked to workout with order index.

**How to verify**
- Add exercise and fetch active workout -> item appears.
- Duplicate add behavior matches chosen MVP rule.

---

### Task 3.7 - Implement set CRUD endpoints
**What is created**
- Add/edit/delete set entry API with validation.

**Files touched**
- `apps/api/src/modules/sets/sets.controller.ts`
- `apps/api/src/modules/sets/sets.service.ts`
- `apps/api/src/modules/sets/dto/*.ts`

**Endpoints**
- `POST /workout-exercises/:id/sets`
- `PATCH /sets/:id`
- `DELETE /sets/:id`

**What should work after completion**
- User can fully manage sets for a workout exercise.

**How to verify**
- Create set -> record appears
- Edit set -> values updated
- Delete set -> record removed

---

### Task 3.8 - Implement workout history and details endpoints
**What is created**
- APIs for completed workout list and full workout details with totals.

**Files touched**
- `apps/api/src/modules/workouts/workouts.controller.ts`
- `apps/api/src/modules/workouts/workouts.service.ts`

**Endpoints**
- `GET /workouts/history`
- `GET /workouts/:id`

**What should work after completion**
- History cards include date, exercises count, sets count, total volume.

**How to verify**
- Finish workouts and confirm list/details include computed totals.

---

### Task 3.9 - Implement exercise progress endpoint
**What is created**
- API for exercise chart points and metrics.

**Files touched**
- `apps/api/src/modules/exercises/exercises.controller.ts`
- `apps/api/src/modules/exercises/exercises.service.ts`
- `apps/api/src/modules/exercises/progress.util.ts`

**Endpoint**
- `GET /exercises/:id/progress`

**What should work after completion**
- Returns:
  - best weight
  - best estimated 1RM
  - total volume
  - sessions count
  - trend points by date

**How to verify**
- Seed workout data and compare endpoint metrics with manual calculation.

---

## Phase 4: Frontend Implementation

### Task 4.1 - Implement app layout, routing, and auth bootstrap
**What is created**
- App shell with routes and initial auth handshake.

**Files touched**
- `apps/miniapp/src/App.tsx`
- `apps/miniapp/src/router.tsx`
- `apps/miniapp/src/api/client.ts`
- `apps/miniapp/src/auth/*.ts`

**What should work after completion**
- Mini app authenticates and routes to Home screen.

**How to verify**
- App launch triggers auth request and sets session state.

---

### Task 4.2 - Build Home screen
**What is created**
- Home UI with greeting, CTA, stats, and last workout card.

**Files touched**
- `apps/miniapp/src/screens/HomeScreen.tsx`
- `apps/miniapp/src/api/home.ts`

**What should work after completion**
- Shows empty state for new users and summary for active users.

**How to verify**
- Test with user having no workouts and with seeded completed workouts.

---

### Task 4.3 - Build Active Workout screen
**What is created**
- Screen for current workout list + actions.

**Files touched**
- `apps/miniapp/src/screens/ActiveWorkoutScreen.tsx`
- `apps/miniapp/src/api/workouts.ts`

**What should work after completion**
- User can start/open active workout and see added exercises.

**How to verify**
- Tap `Start Workout`; active workout appears with timestamp/title.

---

### Task 4.4 - Build Exercise picker UI
**What is created**
- Search + category filter + add action UI.

**Files touched**
- `apps/miniapp/src/screens/ExercisePickerScreen.tsx`
- `apps/miniapp/src/api/exercises.ts`
- `apps/miniapp/src/components/ExerciseList.tsx`

**What should work after completion**
- User can quickly find and add exercise into workout.

**How to verify**
- Search by name and add result; return to active workout with item present.

---

### Task 4.5 - Build Exercise-in-workout screen with set list
**What is created**
- Exercise detail inside active workout with set management form/list.

**Files touched**
- `apps/miniapp/src/screens/WorkoutExerciseScreen.tsx`
- `apps/miniapp/src/components/SetForm.tsx`
- `apps/miniapp/src/components/SetList.tsx`
- `apps/miniapp/src/api/sets.ts`

**What should work after completion**
- Add/edit/delete set with instant UI updates.

**How to verify**
- Perform full set CRUD from UI and confirm persistence after reload.

---

### Task 4.6 - Build History and Workout Details screens
**What is created**
- Workout history list and full workout detail visualization.

**Files touched**
- `apps/miniapp/src/screens/HistoryScreen.tsx`
- `apps/miniapp/src/screens/WorkoutDetailsScreen.tsx`
- `apps/miniapp/src/api/workouts.ts`

**What should work after completion**
- Completed workouts are browseable with totals.

**How to verify**
- Finish workout, open history, open details, verify counts and volume.

---

### Task 4.7 - Build Exercise details + progress chart screen
**What is created**
- Exercise progress UI with metrics and trend chart.

**Files touched**
- `apps/miniapp/src/screens/ExerciseDetailsScreen.tsx`
- `apps/miniapp/src/components/ProgressChart.tsx`
- `apps/miniapp/src/api/exercises.ts`

**What should work after completion**
- Metrics and chart render correctly for selected exercise.

**How to verify**
- Open exercise with known history and compare chart/metrics to expected values.

---

### Task 4.8 - Add loading, empty, and error states
**What is created**
- Stable UX for non-happy paths across all core screens.

**Files touched**
- All main screen components
- Shared UI state components:
  - `apps/miniapp/src/components/LoadingState.tsx`
  - `apps/miniapp/src/components/EmptyState.tsx`
  - `apps/miniapp/src/components/ErrorState.tsx`

**What should work after completion**
- App remains usable on API delays/errors and shows actionable states.

**How to verify**
- Simulate API failure/offline and confirm proper UI fallback.

---

## Phase 5: Integration and End-to-End Validation

### Task 5.1 - Connect frontend to backend contracts
**What is created**
- Final request/response alignment between client and server DTOs.

**Files touched**
- `packages/shared/src/types/*.ts`
- API modules on both frontend/backend

**What should work after completion**
- No mismatch in payload fields and enums.

**How to verify**
- Run `pnpm typecheck` across workspace with zero contract errors.

---

### Task 5.2 - End-to-end flow validation in Telegram
**What is created**
- Verified MVP flow in real Telegram Mini App environment.

**Files touched**
- Mostly configuration and bugfixes across app/backend

**What should work after completion**
- Full flow:
  1) open app
  2) auth
  3) start workout
  4) add exercise
  5) log sets
  6) finish workout
  7) view history
  8) view exercise progress

**How to verify**
- Execute full flow manually on mobile Telegram client.

---

### Task 5.3 - Add minimum automated checks for critical logic
**What is created**
- Baseline tests for high-risk operations.

**Files touched**
- `apps/api/src/modules/auth/*.spec.ts`
- `apps/api/src/modules/sets/*.spec.ts`
- `apps/api/src/modules/workouts/*.spec.ts`

**What should work after completion**
- Critical backend logic is guarded from obvious regressions.

**How to verify**
- Run `pnpm test` and ensure all critical suites pass.

---

### Task 5.4 - Production build and release readiness
**What is created**
- Deployable artifacts and documented startup.

**Files touched**
- `.env.example`
- deployment configs (if needed)
- root/app README updates

**What should work after completion**
- Both frontend and backend build successfully and deploy.

**How to verify**
- Run:
  - `pnpm build`
  - deploy frontend
  - deploy backend
- Smoke test production endpoints and core UX.

---

## Final Checklist (Definition of Done)

- [ ] Telegram auth works and user is auto-created
- [ ] Active workout can be started and resumed
- [ ] Exercises can be searched and added
- [ ] Sets can be added, edited, deleted quickly
- [ ] Workout can be finished and saved
- [ ] History and workout details are accurate
- [ ] Exercise progress metrics and chart are accurate
- [ ] Seed catalog is broad and usable (80-120 exercises)
- [ ] Lint/typecheck/build pass
- [ ] Core flow tested inside Telegram

---

## Phase 6: UX and Localization Improvements (Requested)

This phase captures user-requested product refinements before final relaunch.

### Task 6.1 - Russian UI + language switch (RU/EN)
**What is created**
- Full Russian localization for all current screens and actions.
- Language toggle (RU/EN) in app UI.

**Files touched**
- `apps/miniapp/src/App.tsx`
- `apps/miniapp/src/screens/*.tsx`
- `apps/miniapp/src/components/*.tsx`
- New i18n files (example):
  - `apps/miniapp/src/i18n/messages.ts`
  - `apps/miniapp/src/i18n/useI18n.ts`

**What should work after completion**
- App opens in Russian by default.
- User can switch RU/EN without reload.
- Core labels, buttons, errors, empty states are translated.

**How to verify**
- Open all screens and confirm translations in both languages.
- Switch language and ensure text updates immediately.

---

### Task 6.2 - Exercise selection starts from muscle categories
**What is created**
- Category-first exercise picker flow:
  1) choose muscle group
  2) then pick exercise from that group
- Search remains available inside selected category.

**Files touched**
- `apps/miniapp/src/screens/ExercisePickerScreen.tsx`
- `apps/miniapp/src/api/exercises.ts`
- `apps/miniapp/src/App.tsx`
- Optional backend endpoint update if needed:
  - `apps/api/src/modules/exercises/*`

**What should work after completion**
- User sees category cards first (chest/back/legs/etc).
- Exercise list appears only after category selection.

**How to verify**
- Open Add Exercise flow, select category, add exercise successfully.
- Validate behavior for empty search and filtered search.

---

### Task 6.3 - Device-localized date/time presentation
**What is created**
- Date/time formatting uses device locale/timezone on frontend.
- Replace raw ISO slicing with proper formatter.

**Files touched**
- `apps/miniapp/src/screens/HomeScreen.tsx`
- `apps/miniapp/src/screens/ActiveWorkoutScreen.tsx`
- `apps/miniapp/src/screens/HistoryScreen.tsx`
- `apps/miniapp/src/screens/WorkoutDetailsScreen.tsx`
- `apps/miniapp/src/screens/ExerciseProgressScreen.tsx`
- New helper:
  - `apps/miniapp/src/utils/dateTime.ts`

**What should work after completion**
- All dates/times are shown in user device local format.

**How to verify**
- Change device timezone/locale and confirm values re-render correctly.

---

### Task 6.4 - Authorization hardening (remove temporary dev bypass)
**What is created**
- Strict Telegram auth for production flow.
- Keep optional debug/dev mode only behind explicit env flag.
- Clear fallback behavior and user-facing auth errors.

**Files touched**
- `apps/api/src/modules/auth/*`
- `apps/miniapp/src/auth/telegram.ts`
- `apps/miniapp/src/App.tsx`
- `.env.example`
- `README.md`

**What should work after completion**
- User is auto-authenticated when opening app from Telegram bot menu.
- No manual initData input required.
- Production mode rejects invalid signatures.

**How to verify**
- Open via Telegram menu button: login success.
- Open outside Telegram context: clear auth error and retry guidance.

---

### Task 6.5 - Mobile input stability (prevent keyboard layout jump)
**What is created**
- Improved numeric input UX on set entry/edit:
  - stable layout while keyboard opens
  - proper input modes and enter-key behavior
  - avoid content shift and accidental scroll jumps

**Files touched**
- `apps/miniapp/src/screens/WorkoutExerciseScreen.tsx`
- `apps/miniapp/src/styles.css`
- Optional keyboard-safe container component:
  - `apps/miniapp/src/components/KeyboardSafeContainer.tsx`

**What should work after completion**
- Entering weight/reps does not cause disruptive screen jumps.

**How to verify**
- Test on real phone (iOS and Android if possible) while entering multiple sets.
- Confirm stable viewport and focused input behavior.

---

### Task 6.6 - Fresh relaunch procedure (cache-safe)
**What is created**
- Repeatable restart sequence to avoid stale Telegram/web cache issues.

**Files touched**
- `README.md` (add relaunch checklist)
- `Cursor.md` (session/run notes)

**What should work after completion**
- Team can stop all processes, relaunch with new tunnel URLs, update BotFather URL, and verify fresh frontend version.

**How to verify**
- Perform full stop/restart and confirm Telegram opens latest UI (not cached old screen).

---

## Phase 7: Post-MVP UX and Reliability Iteration (New Feedback)

### Task 7.1 - Sticky back navigation on scroll
**What is created**
- Stable back/header controls that remain visible while scrolling.

**Files touched**
- `apps/miniapp/src/styles.css`
- `apps/miniapp/src/screens/*.tsx` (screens with back navigation)

**What should work after completion**
- Back action does not move out of viewport during long scroll.

**How to verify**
- Open long lists/details, scroll down, confirm back button remains accessible.

---

### Task 7.2 - Workout editing controls (delete workout/exercise + edit)
**What is created**
- Ability to remove workout items and edit workout metadata where needed.

**Files touched**
- `apps/api/src/modules/workouts/*`
- `apps/miniapp/src/screens/ActiveWorkoutScreen.tsx`
- `apps/miniapp/src/screens/WorkoutDetailsScreen.tsx`
- `apps/miniapp/src/api/workouts.ts`

**What should work after completion**
- User can remove mistakenly added exercises and manage workout entity safely.

**How to verify**
- Add exercise -> delete it -> confirm list and totals update consistently.

---

### Task 7.3 - Session continuity after app background/lock
**What is created**
- Improved restoration of active workout/session state after app resume.

**Files touched**
- `apps/miniapp/src/App.tsx`
- `apps/miniapp/src/auth/session.ts`
- Optional lifecycle helpers in `apps/miniapp/src/*`

**What should work after completion**
- App resume should not unexpectedly reset current user flow.

**How to verify**
- Start workout -> lock/unlock phone -> reopen app -> state remains consistent.

---

### Task 7.4 - Home CTA context: Continue vs Start workout
**What is created**
- Dynamic primary CTA:
  - `Continue Workout` when active workout exists
  - `Start Workout` otherwise

**Files touched**
- `apps/api/src/modules/home/*` (if active flag is added)
- `apps/miniapp/src/App.tsx`
- `apps/miniapp/src/screens/HomeScreen.tsx`

**What should work after completion**
- Active unfinished workout is clearly resumable from home.

**How to verify**
- Start workout -> return home -> CTA shows continue state.

---

### Task 7.5 - Bodyweight-friendly set logging model
**What is created**
- Support set entries without mandatory external weight for bodyweight movements.

**Files touched**
- `prisma/schema.prisma` (+ migration)
- `apps/api/src/modules/sets/*`
- `apps/miniapp/src/screens/WorkoutExerciseScreen.tsx`
- `packages/shared/src/*` contracts

**What should work after completion**
- Pull-ups/dips/abs can be logged correctly without forcing manual bodyweight value.

**How to verify**
- Add set for bodyweight exercise without weight -> validation passes and analytics remain correct.

---

### Task 7.6 - Workout templates and quick start
**What is created**
- User-defined workout templates and one-tap start from template.
- Template details view with edit/delete actions.
- Template editor for:
  - title update
  - exercise composition update (add/remove)
- Ability to create template without starting workout.

**Files touched**
- `prisma/schema.prisma` (+ migration)
- `apps/api/src/modules/templates/*`
- `apps/miniapp/src/screens/HomeScreen.tsx`
- `apps/miniapp/src/screens/ActiveWorkoutScreen.tsx`

**What should work after completion**
- User can create template and start prefilled workout quickly.
- User can manage template lifecycle end-to-end (create/open/edit/delete).

**How to verify**
- Create template from active workout -> start from template -> exercises preloaded in correct order.
- Open template details -> edit title and composition -> save -> reopen and verify updates.
- Create template from scratch (without active workout) -> verify it appears and can start workout.

---

### Task 7.7 - Permanent API/Mini App URL strategy
**What is created**
- Documented move from temporary tunnels to stable URLs for:
  - External Mini App URL (Telegram/BotFather)
  - External API URL (frontend access)
  - Internal API URL (infrastructure-to-infrastructure)

**Options to evaluate**
1) Cloudflare Tunnel (named tunnel + fixed subdomain) + custom domain
2) Deploy API to Railway/Render/Fly with stable public domain
3) Deploy Mini App static build to Cloudflare Pages/Vercel with custom domain
4) DNS + TLS + environment promotion strategy (`dev/stage/prod`)

**Files touched**
- `README.md`
- `.env.example`
- deployment docs/configs (as selected)

**What should work after completion**
- No need to rotate BotFather URL per restart; predictable integration endpoints.

**How to verify**
- Restart services and confirm Telegram launch continues to use same stable URLs.
