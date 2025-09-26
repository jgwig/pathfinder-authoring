# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview
- Framework: Next.js 15 (App Router)
- Language: TypeScript
- UI/Styling: Tailwind CSS v4 (via globals.css)
- Graph editor: @xyflow/react (React Flow)
- Package manager: pnpm (pnpm-lock.yaml present)

Commands
- Install dependencies
  - pnpm install
- Run the dev server (Turbopack)
  - pnpm dev
  - Serves on http://localhost:3000
- Build production bundle
  - pnpm build
- Start production server
  - pnpm start
- Lint
  - pnpm lint
- Tests
  - No test runner is configured (no test script in package.json).

Architecture and structure (big picture)
- App Router under src/app
  - src/app/layout.tsx defines RootLayout, sets next/font (Geist) variables and global <body> classes.
  - src/app/page.tsx is the home route and a Client Component. It renders a ReactFlow canvas (from @xyflow/react) and manages nodes/edges state with applyNodeChanges/applyEdgeChanges/addEdge helpers.
  - src/app/globals.css imports Tailwind CSS (Tailwind v4 via @tailwindcss/postcss).
- TypeScript configuration
  - tsconfig.json sets strict, noEmit, bundler moduleResolution, and defines a path alias: @/* -> ./src/*.
- Linting
  - eslint.config.mjs uses FlatCompat to extend next/core-web-vitals and next/typescript, ignoring build outputs (.next/, out/, build/).
- Next.js configuration
  - next.config.ts currently minimal; adjust here for images, redirects, experimental flags, etc., as needed.

Notes and conventions specific to this repo
- Styling uses Tailwind CSS utilities (Tailwind v4). Global import is in src/app/globals.css.
- Prefer pnpm for all scripts and installs to stay consistent with the lockfile.

Key pointers from README
- Start the dev server with pnpm dev and edit the main page at src/app/page.tsx. Hot reload is enabled.
