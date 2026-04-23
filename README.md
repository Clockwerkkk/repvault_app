# RepVault app

Telegram Mini App MVP for fast strength workout logging.

## Setup

1. Copy env file:
- `cp .env.example .env`
2. Update `.env` with your DB and Telegram values.
3. Install dependencies:
- `pnpm install`
4. Prepare database:
- `pnpm prisma:generate`
- `pnpm prisma:migrate`
- `pnpm db:seed`

## Run

- Backend API: `pnpm --filter api dev`
- Mini App: `pnpm --filter miniapp dev`
- All packages: `pnpm dev`

## Auth Mode

- Production: open the mini app only from Telegram bot menu (strict initData validation).
- Optional local debug mode:
  - backend: `ALLOW_INSECURE_TELEGRAM_AUTH=true`
  - miniapp: `VITE_ALLOW_DEV_TELEGRAM_AUTH=true`
- Debug mode is disabled automatically in `NODE_ENV=production`.

## Telegram Bot /start

To enable `/start` welcome message with inline button `Открыть приложение`, set:

- `TELEGRAM_BOT_POLLING_ENABLED=true`
- `TELEGRAM_BOT_TOKEN=<your_bot_token>`
- `TELEGRAM_MINIAPP_URL=<your_https_miniapp_url>` (or `MINIAPP_PUBLIC_URL` as fallback)

When enabled, API process polls bot updates and responds to `/start` with a short Russian intro and Web App button.

Important:
- Restart API process after changing bot env vars so polling picks up new values.
- Bot handler accepts both plain `/start` and `/start <payload>`.

## Phase 7 Implementation Notes

Implemented UX/reliability updates include:
- Sticky back navigation on scroll-heavy screens.
- Workout editing controls: rename/delete workout, remove exercise from active workout.
- Session continuity after app background/lock with state restore.
- Dynamic Home CTA (`Continue Workout` vs `Start Workout`).
- Bodyweight-friendly set logging (weight optional).
- Templates:
  - create from active workout,
  - create from scratch (without starting workout),
  - start workout from template,
  - open template details,
  - edit template title and exercise composition,
  - delete template.
- Confirm dialogs before destructive actions (set/exercise/workout/template deletes).
- Stable URL/env strategy documented for BotFather/API/Mini App URLs.

## Cache-safe Relaunch Checklist

Use this sequence before validating a fresh Telegram relaunch to avoid stale webview cache artifacts.

1. Stop all running dev processes (`api`, `miniapp`, tunnels).
2. Start backend and miniapp again:
   - `pnpm --filter api dev`
   - `pnpm --filter miniapp dev`
3. Start a new tunnel for miniapp and copy the new HTTPS URL.
4. Update Mini App URL in BotFather to the new tunnel URL.
5. Fully close Telegram on device, then reopen it.
6. Open the bot menu button and launch the mini app again.
7. Verify fresh UI:
   - language switch works (RU default, EN toggle)
   - category-first Add Exercise flow is present
   - dates/times are localized to device
8. If old UI is still shown, repeat with a new tunnel URL and reopen Telegram again.

## Permanent URL Strategy (Phase 7.7 Plan)

This section is a deployment plan only. No production rollout is performed yet.

### Target URL model

- `MINIAPP_PUBLIC_URL` - stable HTTPS domain used in BotFather.
- `API_PUBLIC_URL` - stable HTTPS API domain used by miniapp (`VITE_API_BASE_URL`).
- `API_INTERNAL_URL` - private URL for service-to-service traffic (optional).

### Recommended path

1. Miniapp static hosting:
   - Cloudflare Pages or Vercel
   - custom domain (`miniapp.example.com`)
2. API hosting:
   - Railway/Render/Fly with fixed public domain
   - custom domain (`api.example.com`)
3. DNS + TLS:
   - managed DNS records for miniapp/api
   - HTTPS certificates (auto-managed by platform)
4. Environment promotion:
   - `dev` -> `stage` -> `prod` URL sets
   - keep BotFather pointed only to production miniapp URL

### BotFather stability rule

- After switching to `MINIAPP_PUBLIC_URL` with a permanent domain, do not rotate URL on every restart.
- Tunnel URLs remain only for local debug and should not replace production BotFather URL.

## Quality & Build

- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
