# Habit Tracker Frontend

Frontend application for Habit Tracker built with React + Vite.

## Overview

This SPA consumes the Django API and provides:

- Authentication (login/register)
- Weekly habit tracking
- Historical analytics
- Leaderboard/ranking
- Profile management and avatar upload

## Stack

- React 19
- Vite
- Axios
- Recharts
- TailwindCSS utilities
- ESLint

## Requirements

- Node.js 20+
- pnpm 9+

## Environment Variables

Create `.env` in the frontend root:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

## Run in Development

```bash
pnpm install
pnpm dev
```

Default dev URL: `http://127.0.0.1:5173`

## Build for Production

```bash
pnpm lint
pnpm build
pnpm preview
```

## Folder Structure

```text
src/
	api/          # Axios client and API wrappers
	components/   # UI components and panels
	hooks/        # Shared logic hooks
	utils/        # Formatting and visual helpers
```

## API Integration

This app expects the following backend endpoints:

- `POST /api/register/`
- `POST /api/token/`
- `POST /api/token/refresh/`
- `GET/PATCH /api/profile/`
- `GET/POST/PATCH/DELETE /api/habits/`
- `GET /api/habits/weekly/`
- `GET /api/habits/tracker-metrics/`
- `GET /api/habits/history/`
- `GET /api/habits/leaderboard/`
- `POST /api/logs/`

## Deployment Notes

- Build static assets with `pnpm build`.
- Serve `dist` with Nginx or CDN.
- Route API calls to backend service through reverse proxy.
- Configure strict CSP and HTTPS in production.

## Quality and Standards

- Linting is enforced via ESLint.
- Code follows component + hook separation.
- Error/loading states are handled at panel level.
