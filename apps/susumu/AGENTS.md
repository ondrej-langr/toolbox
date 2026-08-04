# susumu

This is a local first web application focused on opinionated and simple time tracking for freelancers. Before reading further make sure to read the root [AGENTS.md](../../AGENTS.md)

## Project Idea

This project focuses on simpler time tracking. The time tracking should be straightforward - select current project, input what you are working on and enter. This creates entry at current time today. Projects are now user-defined and can be renamed later without rewriting linked worklogs.

Updating time for already created items is currently possible within the same day as well as deleting the items. It should also be possible to go back in time to see previous days and manage those items.

On top of that it is possible to see summarization per project for today and this month. For current day it is also possible to see sum of all the same items (summed by time and sorted by duration).

When no projects exist yet the application blocks worklog creation and asks the user to create one first. Legacy worklogs created before project support are blocked behind an explicit migration gate before the rest of the app is shown.

All the data are stored locally with possibility to synchronize between machines through sharing user mnemonic by scanning qrcode to other device.

Read more about what is currently missing in the [TODO.md](./TODO.md)

## Technical background

This is a Vite application that uses radix-ui for styling and [evolu](https://www.evolu.dev/docs/api-reference) for data management as database. It uses React.js for UI and tailwind for little bit of styling where radix-ui is not enough. Source code is stored in [`src`](./src) folder.

The persisted schema currently stores `project` rows and `workLog` rows. Each worklog stores the creating app version, and legacy rows are migrated in-app before normal usage continues.

## Useful architecture notes

- Do not update the [CHANGELOG.md](./CHANGELOG.md). This is because the file is auto updated.
- Project reads and worklog reads live under [`src/utils`](./src/utils). The app does not use a separate models layer right now.
- `workLog` rows are the compatibility boundary:
  - new writes set `projectId` and `appVersion`
  - new writes set legacy `context` to `null`
  - joined reads expose `projectName` from the `project` table
- App version comes from `package.json` through Vite define-time injection. Runtime code reads it from [`src/appVersion.ts`](./src/appVersion.ts).
- The main app shell in [`src/App.tsx`](./src/App.tsx) owns `getAllWorkLogs()` and `getProjects()` queries and wraps the rest of the UI in [`MigrationGate`](./src/components/MigrationGate.tsx). If a migration is pending, the normal time-tracking UI is hidden.
- Current migrations live in [`src/migrations/workLogMigrations.ts`](./src/migrations/workLogMigrations.ts). The current strategy is row-based, keyed by `workLog.appVersion`, with deterministic legacy project IDs created from normalized context names via `Evolu.createIdFromString`.
- Project management currently lives in [`src/components/ProjectsDialog.tsx`](./src/components/ProjectsDialog.tsx) and supports create + rename only. Validation trims input, rejects empty names, and rejects case-insensitive duplicates.
- If there are no projects, Susumu hides the entry form and running widget and shows a callout that routes users to project creation first.
- Per-project summaries are data-driven. [`calculateWorkLogEntries`](./src/utils/calculateWorkLogEntries.ts) returns sorted `{ projectId, projectName, minutes }` entries, and break rows still close active work ranges.
- Project colors are display-only and deterministic. [`getProjectColor`](./src/constants.ts) hashes the `projectId` into a fixed Radix palette instead of storing colors in data.
- Browser verifications belong in Playwright. Run `pnpm dev` on the default localhost:5173 port first, point Playwright at that running app, store the spec in [`tests`](./tests), and whenever a manual browser check proves a bug fix or workflow add or update the matching `pnpm test:e2e` coverage in the same change.

## Commands

- `pnpm build` - use when building the project
- `pnpm dev` - use when building and verifying applied changes. it opens localhost:5173
- `pnpm test:e2e` - runs Playwright against the already running `pnpm dev` app on localhost:5173
