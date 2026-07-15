# Repository Guidelines

## Project Structure & Module Organization

This repository contains two independently managed applications:

- `backend/` is a Laravel 13 REST API. Domain code lives in `app/` (`Actions`, `Services`, `Models`, HTTP requests/controllers/resources); routes are in `routes/api.php`; migrations and factories are in `database/`; Pest tests are split between `tests/Feature` and `tests/Unit`.
- `frontend/` is a React 19, TypeScript, and Vite SPA. Keep application code in `src/`, API clients in `src/api/`, bundled assets in `src/assets/`, and static public files in `public/`.
- `docs/` contains the assessment notes and OpenAPI contract.

Follow the more specific `backend/AGENTS.md` or `frontend/AGENTS.md` when working inside either application.

## Skills Activation

This project has domain-specific skills available in `**/skills/**`. You MUST activate the relevant skill whenever you work in that domain—don't wait until you're stuck.

## Build, Test, and Development Commands

Run commands from the relevant application directory:

- `cd backend && composer install` installs PHP dependencies.
- `php artisan migrate` prepares the SQLite database; `php artisan serve` starts the API.
- `php artisan test --compact` runs the Pest suite.
- `vendor/bin/phpstan analyse` performs static analysis; `vendor/bin/pint --test` checks PHP formatting.
- `cd frontend && npm install` installs frontend dependencies.
- `npm run dev` starts Vite; `npm run lint` checks source; `npm run build` type-checks and creates `dist/`.

## Coding Style & Naming Conventions

PHP follows Laravel conventions and PSR-4: four-space indentation, explicit parameter and return types, `StudlyCase` classes, and `camelCase` methods. Format PHP with Pint. Frontend code uses two spaces, single quotes, no semicolons, `PascalCase` components, and `camelCase` variables. ESLint is authoritative. Reuse existing actions, services, resources, and components before adding abstractions.

## Testing Guidelines

Name backend tests `*Test.php`; use Feature tests for API behavior and Unit tests for isolated services. Add regression coverage with behavior changes. The frontend has no automated test runner, so run lint/build and manually exercise affected flows with `npm run dev`. No coverage threshold is configured.

## Commit & Pull Request Guidelines

The current history contains only one emoji-only commit, so it provides no reliable convention. Use short imperative subjects, optionally Conventional Commits (for example, `fix: prevent duplicate vouchers`). Keep PRs focused; describe behavior and verification, link issues, note configuration or API changes, and attach before/after screenshots for UI work. Never commit `.env`, credentials, SQLite data, `vendor/`, `node_modules/`, or generated `dist/` files.
