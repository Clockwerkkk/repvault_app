# PRD: Telegram Mini App for Strength Workout Logging (MVP)

## 1) Product Overview

### Product name (working)
**GymLog Mini**

### Product goal
Build the fastest, lowest-friction way to log strength training sessions inside Telegram, and help users quickly see exercise progress over time.

### MVP principle
This is not an AI fitness coach.  
This is a **fast workout logger + progress tracker** optimized for use during an active gym session.

---

## 2) Problem Statement

People who train in the gym often need to track sets, reps, and weights, but existing solutions are either:
- too heavy and feature-bloated,
- require installing a separate app,
- or are too slow during a workout.

Telegram users should be able to open a mini app from a bot and start logging within seconds.

---

## 3) Target Audience

- Men and women, age 18-40
- Beginners, intermediate, and advanced recreational lifters
- Telegram-first users who prefer Mini Apps over installing new apps
- Users who want to track:
  - working weights
  - reps
  - session volume
  - exercise history and progress

---

## 4) Roles

For MVP:
- **User** (single role)

No coach/admin/multi-role logic in Week 1 scope.

---

## 5) Success Criteria (MVP-level)

- New user can open app and start first workout in under 60 seconds
- User can log a full workout without friction:
  - add exercises
  - add/edit/delete sets
  - finish workout
- User can review workout history
- User can view exercise-level progress chart and key metrics

---

## 6) Scope

## In Scope (MVP Week 1)

1. Telegram Mini App authentication and user bootstrap
2. Home screen
3. Start and manage active workout session
4. Exercise catalog with search + category filter
5. Exercise-in-workout screen with set logging
6. Add/edit/delete set entries
7. Save completed workout
8. Workout history list
9. Workout details view
10. Exercise details screen with history and progress chart
11. Basic database schema
12. Seed data with broad popular gym exercises

## Out of Scope (for now)

- AI recommendations
- Recovery/readiness scoring
- Social features
- Subscriptions/payments
- Wearable integrations
- Complex training plans
- Multiple roles beyond regular user
- Offline mode
- Push notifications
- Advanced muscle-group analytics

---

## 7) Core User Stories

1. As a Telegram user, I want to open the app and be auto-signed in so I can start immediately.
2. As a lifter, I want to start a workout quickly from the home screen.
3. As a lifter, I want to add exercises from a searchable catalog.
4. As a lifter, I want to log sets (weight + reps + type) with minimal taps.
5. As a lifter, I want to edit or delete incorrectly logged sets.
6. As a lifter, I want to finish and save my workout.
7. As a lifter, I want to review past workouts.
8. As a lifter, I want to open an exercise and see progress over time.
9. As a lifter, I want to see best weight, estimated 1RM, volume, and total sessions per exercise.

---

## 8) UX Principles

- **Speed first**: minimal steps to log a set
- **Low cognitive load**: clean, focused screens
- **One primary action per screen**
- **Mobile thumb-friendly controls**
- **No unnecessary forms**
- **Immediate feedback after each action**

---

## 9) Screen Structure and Behavior

## 9.1 Home Screen
**Purpose:** immediate entry point to start training and access history.

**Contains:**
- Greeting (e.g., "Hi, Alex")
- Primary CTA: `Start Workout`
- Last workout summary card
- Quick stats:
  - total workouts
  - total logged exercises
  - last workout date
- Quick links:
  - `History`
  - `Exercise Catalog`

**Empty state (new user):**
- Message: no workouts yet
- CTA: `Start First Workout`

---

## 9.2 Active Workout Screen
**Purpose:** manage current workout session.

**Contains:**
- Workout name (default: "Workout")
- Start date/time
- List of added exercises (ordered)
- CTA: `Add Exercise`
- CTA: `Finish Workout`

**Behavior:**
- Workout draft starts immediately after tapping `Start Workout`
- User can enter each exercise to manage sets

---

## 9.3 Exercise Picker (Modal/Screen)
**Purpose:** add exercises into active workout fast.

**Contains:**
- Search input by exercise name
- Filter by category/muscle group
- Exercise list
- Add action per row

**Behavior:**
- Selecting an exercise creates `WorkoutExercise` item in active workout
- Prevent duplicate additions inside one workout (or ask to confirm)

---

## 9.4 Exercise in Active Workout Screen
**Purpose:** log sets for a selected exercise.

**Contains:**
- Exercise name
- Previous performance hint (last best set / last session)
- Existing set list
- Add set form:
  - weight
  - reps
  - set type (`working` or `warm-up`)
- Actions:
  - add set
  - edit set
  - delete set

**Behavior:**
- New set appears instantly in list
- Input should be numeric-friendly and fast to re-enter

---

## 9.5 Workout History Screen
**Purpose:** browse completed workouts.

**Contains:**
- Chronological workout cards
- Each card shows:
  - date
  - number of exercises
  - number of sets
  - total volume
- Tap card -> workout details

---

## 9.6 Workout Details Screen
**Purpose:** inspect completed workout.

**Contains:**
- Workout date/time
- Exercise blocks
- Sets inside each exercise
- Total workout volume

---

## 9.7 Exercise Details Screen
**Purpose:** track long-term progress for one exercise.

**Contains:**
- Exercise title and category
- Recent result history
- Progress chart (by date)
- Metrics:
  - best weight
  - best estimated 1RM
  - total volume
  - number of sessions with this exercise

---

## 10) First-Time User Flow

1. User opens Mini App from Telegram bot
2. Telegram init data is validated
3. If user is new -> create profile automatically
4. Redirect to Home screen
5. Show empty state + `Start First Workout` if no history
6. Exercise catalog is already available from seeded data

---

## 11) Main User Flows

## Flow A: Log Workout
1. Home -> `Start Workout`
2. Active Workout -> `Add Exercise`
3. Exercise Picker -> select exercise
4. Exercise in Workout -> add sets
5. Repeat for more exercises
6. `Finish Workout`
7. Persist workout and show confirmation

## Flow B: View Workout History
1. Home -> `History`
2. Select workout card
3. Open workout details

## Flow C: View Exercise Progress
1. Home or history -> open exercise details
2. See chart + metrics + latest results

---

## 12) Data Model (MVP)

## Entities
- `User`
- `ExerciseCategory`
- `Exercise`
- `Workout`
- `WorkoutExercise`
- `SetEntry`

## Relationships
- One `User` -> many `Workout`
- One `Workout` -> many `WorkoutExercise`
- One `WorkoutExercise` -> one `Exercise`
- One `WorkoutExercise` -> many `SetEntry`
- One `ExerciseCategory` -> many `Exercise`
- One `Exercise` -> one primary `ExerciseCategory` (MVP simplification)

## Suggested Fields

### User
- id (uuid)
- telegram_user_id (unique)
- username (nullable)
- first_name
- last_name (nullable)
- created_at
- updated_at

### ExerciseCategory
- id
- slug (unique, e.g., chest, back, legs)
- name
- created_at

### Exercise
- id
- name
- category_id (fk)
- equipment_type (nullable)
- is_active
- created_at

### Workout
- id
- user_id (fk)
- title (default "Workout")
- started_at
- finished_at (nullable until complete)
- status (`active` | `completed`)
- notes (nullable)
- created_at

### WorkoutExercise
- id
- workout_id (fk)
- exercise_id (fk)
- order_index
- created_at

### SetEntry
- id
- workout_exercise_id (fk)
- set_index
- weight_kg (decimal)
- reps (int)
- set_type (`working` | `warmup`)
- created_at
- updated_at

## Optional Aggregate (later)
- Materialized per-exercise user stats table, only if needed for performance.
- For MVP, compute aggregates via query.

---

## 13) Exercise Seed Requirements

MVP should include a broad but practical starter catalog across:
- chest
- back
- legs
- shoulders
- biceps
- triceps
- abs/core
- full body/compound

Include common gym exercises, for example:
- bench press, incline bench press, dumbbell bench press
- squat, front squat, leg press
- deadlift, Romanian deadlift
- pull-up, chin-up, lat pulldown, seated row
- overhead press, dumbbell shoulder press, lateral raise
- biceps curl, hammer curl, preacher curl
- triceps pushdown, overhead triceps extension, dips
- calf raise, leg curl, leg extension
- plank, cable crunch, hanging leg raise

Target seed size for MVP: **80-120 exercises**.

---

## 14) API / Backend Actions (MVP)

## Auth
- `POST /auth/telegram`  
  Validates Telegram initData and returns session/JWT.

## Home
- `GET /home/summary`  
  Returns greeting context, last workout, quick stats.

## Exercises
- `GET /exercises?search=&category=`  
  Paginated exercise catalog.
- `GET /exercises/:id/progress`  
  Returns history points + aggregate metrics.

## Workouts
- `POST /workouts`  
  Create active workout.
- `GET /workouts/active`  
  Fetch current active workout.
- `POST /workouts/:id/exercises`  
  Add exercise to active workout.
- `GET /workouts/:id`  
  Workout details.
- `POST /workouts/:id/finish`  
  Mark workout completed.
- `GET /workouts/history`  
  List completed workouts.

## Sets
- `POST /workout-exercises/:id/sets`  
  Add set.
- `PATCH /sets/:id`  
  Edit set.
- `DELETE /sets/:id`  
  Delete set.

---

## 15) Edge Cases

- User opens app without valid Telegram init data -> show auth error + retry
- Duplicate active workout exists -> reopen existing active workout
- User tries to finish workout with no exercises/sets -> confirm or block (product decision: show confirmation)
- Exercise added twice in same workout -> prevent duplicates or warn
- Invalid set input (negative weight/reps, zero reps, unrealistic values) -> validation message
- Network interruption while logging -> keep optimistic UI and retry pattern
- Deleted set recalculates volume and metrics correctly
- Timezone handling for workout dates in history

---

## 16) MVP Constraints

- Solo founder speed > perfect architecture
- Keep backend and frontend simple, strongly typed, and easy to maintain
- No microservices
- No heavy event-driven complexity
- No advanced analytics pipeline in MVP

---

## 17) Future Enhancements (Post-MVP)

- Exercise favorites/recently used shortcuts
- Templates/routines
- Personal records auto-detection
- Rest timers
- Deeper analytics and muscle split insights
- Social accountability features
- Monetization layer

---

## 18) Initial Project Structure Proposal

```txt
fitness_app/
  apps/
    miniapp/                # Telegram Mini App frontend (React)
    api/                    # Backend API (Node.js + framework)
  packages/
    shared/                 # Shared types, validation schemas, constants
    ui/                     # Reusable UI components (optional early)
  prisma/                   # DB schema, migrations, seed
  docs/
    PRD.md
    ARCHITECTURE.md
    TASKS_WEEK1.md
  .env.example
  package.json
  pnpm-workspace.yaml
```

For very fast start, `packages/ui` can be postponed and UI can live inside `apps/miniapp`.

---

## 19) Implementation Plan - Week 1

## Day 1 - Foundation
1. Initialize monorepo/workspace and baseline tooling
2. Setup backend app + frontend mini app
3. Configure DB connection and migration system
4. Implement Telegram auth verification flow
5. Auto-create user on first login

## Day 2 - Data Layer + Seeds
1. Implement core DB schema (`User`, `ExerciseCategory`, `Exercise`, `Workout`, `WorkoutExercise`, `SetEntry`)
2. Create and run initial migration
3. Add exercise category and exercise seeds (80-120 items)
4. Add basic repository/service layer for workouts and sets

## Day 3 - Core Logging Flow (Vertical Slice)
1. Build Home screen (empty + populated states)
2. Implement `Start Workout` action
3. Build Active Workout screen
4. Add Exercise Picker with search/filter
5. Add exercise to active workout

## Day 4 - Set Logging UX
1. Build Exercise-in-Workout screen
2. Implement add/edit/delete set actions
3. Show last result hint for selected exercise
4. Validate numeric inputs and error handling

## Day 5 - History + Details
1. Implement finish workout flow
2. Build workout history list API + UI
3. Build workout details screen
4. Calculate and display workout volume

## Day 6 - Exercise Progress
1. Build exercise details API
2. Implement progress metrics (best weight, e1RM, volume, sessions count)
3. Add progress chart UI
4. Validate data correctness on sample workouts

## Day 7 - Polish + MVP Hardening
1. QA full end-to-end flow inside Telegram
2. Handle edge cases and loading/error states
3. Improve mobile interaction speed (tap count, input ergonomics)
4. Prepare release checklist and deploy MVP

## Week 1 Deliverable
Working Telegram Mini App MVP where a user can:
- authenticate via Telegram,
- log workouts and sets quickly,
- save sessions,
- view history,
- track exercise progress with chart and key metrics.
