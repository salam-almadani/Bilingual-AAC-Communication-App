# Little Voice | صوتي

A bilingual Arabic/English AAC prototype for children with autism and their caregivers.

## Product constraints

- The AAC app is frontend-only. Do not add a backend, cloud accounts, or remote storage for its data.
- Store all personal photos, audio, cards, and settings locally in IndexedDB; photos and recordings remain blobs.
- Support English LTR and Arabic RTL with a remembered language switch on every page.
- Use calm pastels, readable contrast, large child-facing touch targets (72px+), and reduced-motion support.
- The caregiver PIN is a local child-access gate, not a cloud account or a guarantee of protection against someone with device access.
- Follow the requested build order and check each stage before continuing: foundation, board, caregiver tools, body map, PWA.

## Run & Operate

- `artifacts/little-voice: web` — managed frontend workflow
- `pnpm --filter @workspace/little-voice run typecheck` — check the AAC app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- No backend or database credentials are required for the AAC app.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- AAC app: React, React Router, Tailwind, IndexedDB, WebCrypto, MediaRecorder
- Offline: vite-plugin-pwa / Workbox precaching in production builds
- The template API and PostgreSQL libraries are unused by the AAC app.

## Where things live

- `artifacts/little-voice/src/i18n` — matching Arabic and English translation files
- `artifacts/little-voice/src/state` and `src/lib` — local storage and communication logic
- `artifacts/little-voice/src/components` — board, caregiver, and body-map UI
- `artifacts/little-voice/vite.config.ts` — production offline cache and manifest

## Architecture decisions

- PWA updates wait until the old app closes, to avoid interrupting a child's communication.
- Local browser storage is not a backup. Clearing site data or changing devices loses the saved personal content.

## Product

Bilingual communication board, recorded caregiver voices, PIN-gated card editing, body-map pain communication, local photo storage, and installable offline app shell.

## User preferences

See Product constraints above.

## Gotchas

- Offline precaching runs in production builds, not the live-editing development preview.
- Microphone recording and WebCrypto require a secure browser context.
- Browser speech voices, especially Arabic and offline speech voices, depend on the device; recordings do not require speech synthesis.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
