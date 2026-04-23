# Week 1 Tasks: Telegram Mini App MVP

## Goal of Week 1
Ship a usable MVP where a Telegram user can authenticate, log workouts and sets quickly, save sessions, and view history + exercise progress.

---

## Day 1 - Project Bootstrap + Auth

## Deliverables
- Monorepo/workspace initialized
- Frontend mini app skeleton running
- Backend API skeleton running
- DB connected
- Telegram auth flow working with user auto-creation

## Tasks
1. Initialize repo structure (`apps/miniapp`, `apps/api`, `packages/shared`, `prisma`)
2. Setup TypeScript configs and linting
3. Setup frontend app shell and Telegram Mini Apps SDK initialization
4. Setup backend server, health endpoint, env validation
5. Configure PostgreSQL connection and Prisma
6. Implement `POST /auth/telegram` endpoint
7. Validate Telegram initData signature on backend
8. Create user on first login (upsert by `telegram_user_id`)
9. Return session token and wire token usage in frontend

## Acceptance Criteria
- Opening app in Telegram authenticates user and enters Home screen
- New user record appears automatically

---

## Day 2 - Core Schema + Seed Data

## Deliverables
- Full MVP schema migrated
- Exercise categories and exercise seeds loaded

## Tasks
1. Implement Prisma schema for:
   - `User`
   - `ExerciseCategory`
   - `Exercise`
   - `Workout`
   - `WorkoutExercise`
   - `SetEntry`
2. Add indexes and constraints
3. Run initial migration
4. Create seed script for categories
5. Add 80-120 popular gym exercises across all target groups
6. Implement script command for `db:seed`
7. Verify catalog data integrity (duplicates, category mapping)

## Acceptance Criteria
- Database contains categories and broad exercise catalog
- Exercises can be fetched via API in predictable format

---

## Day 3 - Home + Start Workout + Add Exercise

## Deliverables
- Home screen with summary and empty state
- Active workout creation flow
- Exercise picker with search/filter

## Tasks
1. Implement `GET /home/summary`
2. Build Home screen:
   - greeting
   - start workout CTA
   - stats
   - last workout card or empty state
3. Implement `POST /workouts` (create active workout)
4. Implement `GET /workouts/active`
5. Build Active Workout screen
6. Implement `GET /exercises?search=&category=`
7. Build Exercise Picker modal/screen (search + filter + add)
8. Implement `POST /workouts/:id/exercises`
9. Handle duplicate exercise add attempt gracefully

## Acceptance Criteria
- User can start workout and add at least one exercise from catalog

---

## Day 4 - Set Logging Flow

## Deliverables
- Exercise-in-workout screen functional
- Add/edit/delete set endpoints + UI
- Last-result hint visible

## Tasks
1. Build Exercise-in-Workout UI:
   - set list
   - add set inputs
   - actions
2. Implement `POST /workout-exercises/:id/sets`
3. Implement `PATCH /sets/:id`
4. Implement `DELETE /sets/:id`
5. Add input validation and error states
6. Add optimistic UI for set actions
7. Show previous best/last set hint for selected exercise

## Acceptance Criteria
- User can fully manage sets without leaving workout context

---

## Day 5 - Finish Workout + History + Workout Details

## Deliverables
- Workout completion flow
- History list
- Workout details page

## Tasks
1. Implement `POST /workouts/:id/finish`
2. Implement `GET /workouts/history`
3. Implement `GET /workouts/:id`
4. Compute and return workout volume summaries
5. Build History screen with workout cards
6. Build Workout Details screen
7. Handle edge case for finishing empty workout (confirm or block)

## Acceptance Criteria
- Completed workouts appear in history with correct totals

---

## Day 6 - Exercise Progress Screen

## Deliverables
- Exercise details API and UI
- Progress chart + metrics

## Tasks
1. Implement `GET /exercises/:id/progress`
2. Compute metrics:
   - best weight
   - best estimated 1RM
   - total volume
   - total sessions
3. Define simple e1RM formula (e.g., Epley)
4. Build Exercise Details screen
5. Add chart visualization by date
6. Validate progress values against raw set data

## Acceptance Criteria
- User can open an exercise and see clear trend + key numbers

---

## Day 7 - QA, Stability, Release

## Deliverables
- MVP hardened for first release
- Basic observability and release checklist

## Tasks
1. End-to-end QA of all primary user flows in Telegram
2. Fix blocking UX bugs and validation gaps
3. Improve loading, empty, and error states
4. Ensure responsive layout on common mobile sizes
5. Add basic logs/error capture
6. Prepare `.env.example` and setup docs
7. Smoke test production deployment

## Acceptance Criteria
- Full core flow works reliably from first open to progress review

---

## Cross-Cutting Requirements (All Week)

- Keep screens fast and minimal
- Avoid feature creep outside PRD scope
- Maintain consistent type contracts between frontend/backend
- Add only essential tests:
  - auth validation
  - set CRUD service
  - workout finish flow
- Run lint/typecheck before merge/deploy

---

## Week 1 Definition of Done

MVP is done when:
1. User can open mini app and authenticate automatically
2. User can start workout, add exercises, and log sets quickly
3. User can edit/delete sets and finish workout
4. User can browse workout history and details
5. User can view per-exercise progress chart and key metrics
6. Core edge cases are handled without data corruption
