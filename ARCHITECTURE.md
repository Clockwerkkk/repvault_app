# Architecture: Telegram Mini App Workout Logger (MVP)

## 1) Architecture Goals

- Optimize for **speed of delivery** and **low maintenance** for a solo founder
- Keep stack simple and strongly typed end-to-end
- Support fast set logging with minimal latency
- Keep architecture ready for incremental growth after MVP

---

## 2) Recommended Tech Stack

## Frontend (Mini App)
- **React + TypeScript** (Vite)
- **Telegram Mini Apps SDK** for init data and host integration
- **TanStack Query** for server state and optimistic updates
- **Zustand** (or simple context) for tiny local UI state
- **Lightweight chart library** (`recharts` or `victory`) for exercise progress
- **CSS approach:** Tailwind CSS (fast UI assembly) or plain CSS modules

## Backend
- **Node.js + TypeScript**
- **NestJS** (structured modules, clear patterns, scalable enough)
  - Alternative simpler option: Fastify + Zod + lightweight routing
- **Prisma ORM** for schema/migrations/type-safe DB access
- **PostgreSQL** as primary relational database
- **Telegram auth validation** (HMAC verification of init data)

## Infra / Ops
- **Single deploy unit for API**
- **Managed PostgreSQL** (Supabase/Neon/Railway Postgres)
- **Frontend static hosting** (Vercel/Cloudflare Pages)
- **Error monitoring** (optional in Week 1): Sentry

---

## 3) Why This Stack

## React + TypeScript
- Fast development cycle, strong ecosystem, good fit for mobile-first web UI
- Type safety reduces runtime bugs in workout logging flows

## Telegram Mini Apps SDK
- Native integration for user identity and launch context
- Required for smooth mini app behavior inside Telegram

## TanStack Query
- Clean API data synchronization
- Optimistic updates make set logging feel instant

## NestJS
- Good middle ground between MVP speed and maintainability
- Clear module boundaries: auth, workouts, exercises, sets

## Prisma + PostgreSQL
- Relational model maps exactly to workout/exercise/set entities
- Migrations + type generation speed up solo development

---

## 4) Mandatory vs Replaceable Technologies

## Mandatory (for this MVP direction)
- Telegram Mini Apps SDK (core platform integration)
- Relational database (PostgreSQL recommended)
- ORM/migration tool (Prisma recommended)
- TypeScript across services (to minimize integration errors)

## Replaceable
- NestJS -> Fastify/Express (if you prefer lighter backend)
- TanStack Query -> SWR/manual fetch logic
- Zustand -> React Context/useState only
- Tailwind -> CSS modules/plain CSS
- Recharts -> Victory/Chart.js
- Vercel -> any static hosting/CDN

---

## 5) High-Level System Design

```txt
Telegram User
   ->
Telegram Bot (launch button)
   ->
Mini App Frontend (React, served statically)
   ->
API Backend (Node.js)
   ->
PostgreSQL (Prisma)
```

Runtime model:
1. User opens mini app from Telegram
2. Frontend sends Telegram initData to backend auth endpoint
3. Backend validates signature and issues app session token
4. Frontend uses token for all workout/exercise requests

---

## 6) Backend Module Design

Suggested modules:
- `auth` (Telegram validation, user bootstrap, token issuing)
- `users` (profile basics)
- `exercises` (catalog, categories, exercise progress data)
- `workouts` (active workout lifecycle, history, details)
- `sets` (create/update/delete set entries)
- `stats` (exercise aggregates; can stay inside exercises module initially)

For MVP keep business logic mostly in services; avoid over-abstraction.

---

## 7) Data Architecture

Core tables:
- `users`
- `exercise_categories`
- `exercises`
- `workouts`
- `workout_exercises`
- `set_entries`

Key indexing suggestions:
- `users.telegram_user_id` unique index
- `workouts.user_id, workouts.started_at` index
- `workout_exercises.workout_id` index
- `set_entries.workout_exercise_id` index
- `exercises.category_id, exercises.name` index

MVP strategy:
- Compute progress aggregates by query (no separate analytics DB)
- Add materialized/aggregate tables only if real performance pain appears

---

## 8) API Design Principles

- REST endpoints are enough for MVP
- Keep payloads small and explicit
- Return precomputed UI-friendly totals where practical (e.g., workout volume)
- Use server-side validation for all numeric set fields
- Keep idempotent behavior where possible (especially around workout creation)

---

## 9) Security and Validation

- Validate Telegram initData hash strictly on backend
- Never trust frontend user ID
- Use short-lived JWT/session tokens
- Validate:
  - `weight_kg >= 0`
  - `reps > 0`
  - `set_type in {working, warmup}`
- Rate-limit auth endpoints lightly to prevent abuse

---

## 10) Performance Notes (MVP)

- Prioritize fast interaction on set logging screens
- Use optimistic UI for add/edit/delete set
- Keep exercise picker responsive with server-side search + local debounce
- Preload active workout data after auth

---

## 11) Error Handling and Reliability

- Standard API error format:
  - code
  - message
  - optional details
- Frontend should show short actionable errors:
  - "Failed to save set, retry"
  - "Connection lost, trying again..."
- Preserve user progress by avoiding destructive autosync behavior

---

## 12) Deployment Strategy (Simple)

Week 1 deploy target:
- Frontend: Vercel static app
- Backend: Railway/Fly.io/Render single Node service
- Database: managed Postgres

CI/CD minimal setup:
- lint
- typecheck
- tests (basic smoke/integration where feasible)
- deploy on main branch

---

## 13) Initial Repository Structure

```txt
fitness_app/
  apps/
    miniapp/
      src/
        screens/
        components/
        api/
        store/
        hooks/
    api/
      src/
        modules/
          auth/
          exercises/
          workouts/
          sets/
        common/
  packages/
    shared/
      src/
        types/
        schemas/
        constants/
  prisma/
    schema.prisma
    migrations/
    seed.ts
  docs/
    PRD.md
    ARCHITECTURE.md
    TASKS_WEEK1.md
```

---

## 14) Architectural Trade-offs Chosen for MVP

1. **Single backend service** over microservices  
   Faster to build and debug as solo founder.

2. **Relational schema with simple joins** over analytics pipeline  
   Sufficient for Week 1 metrics.

3. **REST** over GraphQL  
   Lower setup complexity and clearer endpoint ownership.

4. **Limited domain complexity** (single user role, no programs/templates)  
   Preserves focus on logging speed and launch velocity.

---

## 15) Post-MVP Evolution Path

- Add read-optimized aggregates for heavy progress queries
- Introduce workout templates and favorite exercises
- Add background jobs for periodic stats
- Add feature flags and A/B experimentation only after stable usage
