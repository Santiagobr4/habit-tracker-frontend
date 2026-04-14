# Habit Tracker Frontend

React + Vite app to manage habits per user.

## Features

- User login and registration.
- Session persistence with JWT in localStorage.
- Automatic refresh-token flow for expired access tokens.
- Authenticated user profile.
- Create, edit, and delete habits.
- Daily status tracking with full cycle: `pending -> done -> missed -> pending`.
- Weekly metrics and average completion.
- Historical analytics with daily, weekly, and monthly charts.
- Profile management (avatar URL, names, birth date, weight, gender).
- Avatar upload from local file (JPG/PNG/WEBP, up to 2MB).
- "All days" quick-select option in the habit form.
- Metrics baseline behavior: no fake 100% values before account/habit start dates.

## Requirements

- Node.js 20+
- pnpm

## Configuration

Create a `.env` file in the frontend root:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

## Setup and Run

```bash
pnpm install
pnpm dev
```

## Usage Flow

1. Register a user or sign in.
2. Use the Tracker tab to create habits and update daily status.
3. Use the History tab to compare daily, weekly, and monthly completion.
4. Use the Profile tab to update personal profile information.

## Relevant Structure

- `src/api/auth.js`: login, register, profile, and token helpers.
- `src/api/habits.js`: habit and log API operations.
- `src/components/HistoryPanel.jsx`: charts for long-term progress.
- `src/components/ProfilePanel.jsx`: profile edit form.
- `src/hooks/useHabits.js`: weekly logic and UI state.
- `src/components/WeeklyTable.jsx`: main tracking table.
- `src/components/AuthPanel.jsx`: authentication panel.
