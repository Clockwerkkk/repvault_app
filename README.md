# GymLog Mini

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
- `TELEGRAM_MINIAPP_URL=<your_https_miniapp_url>`

When enabled, API process polls bot updates and responds to `/start` with a short Russian intro and Web App button.

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

## Quality & Build

- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
