# Repository Guidelines

## Project Structure & Module Organization

This directory contains a React 19 single-page application built with TypeScript and Vite. Application code lives in `src/`: `main.tsx` mounts the app, `App.tsx` defines the primary UI, and component styles are kept in adjacent CSS files such as `App.css`. Import bundled images from `src/assets/`; place files that must retain stable public URLs in `public/`. Build and lint configuration is located in `vite.config.ts`, `tsconfig*.json`, and `eslint.config.js`. Vite writes production output to `dist/`; do not commit it.

## Build, Test, and Development Commands

Run commands from `frontend/`:

- `npm install` installs declared dependencies. Commit the generated lockfile when dependency versions change.
- `npm run dev` starts Vite with hot-module replacement for local development.
- `npm run build` runs TypeScript project checks and creates the production bundle in `dist/`.
- `npm run lint` checks all TypeScript and React files with ESLint.
- `npm run preview` serves the built bundle locally for a production-like smoke test.

Before submitting changes, run `npm run lint` and `npm run build`.

## Coding Style & Naming Conventions

Follow the existing style: two-space indentation, single quotes, no semicolons, and trailing commas in multiline structures. Use `PascalCase` for React components and their files (`UserCard.tsx`), `camelCase` for functions and variables, and descriptive lowercase names for CSS classes. Prefer function components, React hooks, and explicit TypeScript types at module boundaries. Keep assets and styles close to the component that owns them. ESLint is the source of truth for React Hooks, React Refresh, and TypeScript rules.

## Testing Guidelines

No automated test framework or coverage threshold is currently configured. For every change, lint, build, and manually verify affected behavior through `npm run dev`. If tests are introduced, prefer colocated names such as `App.test.tsx`, add the runner to `package.json`, and document the command here.

## Commit & Pull Request Guidelines

Git history is not included in this checkout, so no repository-specific commit pattern can be confirmed. Use short, imperative subjects with a clear scope, for example `feat: add account summary` or `fix: preserve menu state`. Pull requests should explain the user-visible change, list verification performed, link relevant issues, and include before/after screenshots for visual updates. Keep each PR focused and call out new dependencies or configuration changes.

## Skills Activation

This project has domain-specific skills available in `**/skills/**`. You MUST activate the relevant skill whenever you work in that domain—don't wait until you're stuck.
