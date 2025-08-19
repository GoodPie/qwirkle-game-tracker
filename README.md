# Qwirkle Score Tracker

A React + TypeScript + Vite application for tracking scores in the Qwirkle board game. Uses Firebase for authentication, real‑time data sync (Realtime Database), and hosting. Built with Bun and Tailwind CSS v4.

## Quick Start

1. Create a Firebase project and add a Web App. Copy the web app config.
2. Create a Realtime Database (RTDB) instance in your project (not Firestore).
3. Enable at least one Firebase Auth provider (e.g., Anonymous or Google).
4. Configure environment variables. Create a `.env` file at the repo root:

   ```bash
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_DATABASE_URL=https://your_project.firebasedatabase.app
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_APP_ID=your_app_id
   # Optional if you enable these features
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   ```

   You can also copy `.env.example` and fill in the values.

5. Install dependencies (Bun is the default package manager):

   ```bash
   bun install
   ```

6. Start the dev server (Vite defaults to http://localhost:5173):

   ```bash
   bun run dev
   ```

## Project Conventions

- Package manager: Bun (use `bun install`, `bun run dev`, etc.).
- Database: Firebase Realtime Database (RTDB). Rules live in `./database.rules.json`.
- Auth: Firebase Authentication is required; enable at least one provider.
- Module alias: Imports use `@/` to resolve from `src` (configured in `vite.config.ts`). There’s also `@ui` for `src/components/ui`.
- Styling: Tailwind CSS v4 is integrated via `@tailwindcss/vite` – no extra setup needed beyond installing deps.
- Tests: Vitest + React Testing Library. Firebase is mocked in `src/test/setup.ts` so tests do not hit real services.

## Scripts

- `bun run dev` – Start Vite dev server
- `bun run build` – Type-check and build for production
- `bun run preview` – Preview the production build
- `bun run lint` – Run ESLint
- `bun run test` – Run tests (Vitest)
- `bun run test:ui` – Run tests with Vitest UI

## Deploy

This repo is preconfigured for Firebase Hosting.

- Deploy database rules (recommended first):

  ```bash
  firebase deploy --only database
  ```

- Deploy hosting:

  ```bash
  # If you don’t have the CLI globally
  bun add -g firebase-tools

  firebase login
  # Optionally set/confirm the project
  firebase use --add

  # Deploy the app
  firebase deploy --only hosting
  ```

`firebase.json` and `.firebaserc` in the repo are used by the CLI.

## Testing

- Run all tests:

  ```bash
  bun run test
  ```

- Run with UI:

  ```bash
  bun run test:ui
  ```

Tests run in a jsdom environment. Firebase SDKs are mocked in `src/test/setup.ts`.

## Troubleshooting

- RTDB permission errors: Ensure you created a Realtime Database (not Firestore) and deployed `database.rules.json`:
  ```bash
  firebase deploy --only database
  ```
- Auth errors (e.g., login fails): Enable at least one Auth provider for your Firebase project.
- Env not applied: With Vite, restart the dev server after changing `.env`. All runtime vars must be prefixed with `VITE_`.
- Module resolution errors for `@/...`: Verify aliases in `vite.config.ts` and that imports use paths under `src/`.

## Tech Notes

- React + Vite (default dev port 5173)
- TypeScript throughout
- Tailwind CSS v4
- Firebase v12 (App/Auth/Database)
- Path aliases: `@` -> `src`, `@ui` -> `src/components/ui`

## License

MIT
