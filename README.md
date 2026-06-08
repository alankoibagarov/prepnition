# PrepNition

A smart analytics application, intended to improve interview performance

## Tech Stack

### Core

| Layer | Technology |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | [TypeScript 5](https://www.typescriptlang.org) |
| UI | [React 19](https://react.dev) |
| Component library | [Shadcn UI](https://ui.shadcn.com) (base-nova preset, Base UI primitives) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) |
| Theming | [next-themes](https://github.com/pacocoursey/next-themes) (class-based dark mode) |
| Fonts | [Geist](https://vercel.com/font) via `next/font` |

### State & Data

| Layer | Technology |
| --- | --- |
| Client state | [Zustand](https://zustand.docs.pmnd.rs) |
| Database | [Prisma](https://www.prisma.io) + SQLite |

### Authentication

| Layer | Technology |
| --- | --- |
| JWT | [jose](https://github.com/panva/jose) (HS256 access & refresh tokens) |
| Password hashing | [bcryptjs](https://github.com/dcodeIO/bcrypt.js) |
| Session storage | HTTP-only cookies |
| Route protection | Next.js proxy middleware (`proxy.ts`) |

### Tooling

| Layer | Technology |
| --- | --- |
| Linting & formatting | [Biome](https://biomejs.dev) |
| CSS processing | PostCSS with `@tailwindcss/postcss` |

## Getting Started

### Prerequisites

- Node.js 20+
- npm (or another package manager)

### Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template and set JWT secrets (32+ characters each):

```bash
cp .env.local.example .env.local
```

3. Generate the Prisma client:

```bash
npm run db:generate
```

4. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run Biome checks |
| `npm run format` | Format code with Biome |
| `npm run check` | Run Biome checks and apply safe fixes |
| `npm run db:generate` | Regenerate Prisma client after schema changes |
| `npm run db:push` | Sync schema to SQLite during early development |
| `npm run db:migrate` | Create versioned migrations once models exist |
| `npm run db:studio` | Open Prisma Studio to browse the database |

## Project Structure

```
app/              # App Router pages, API routes, and app-specific components
components/ui/    # Shadcn UI primitives (add via `npx shadcn@latest add <component>`)
lib/auth/         # Authentication utilities (JWT, cookies, sessions, permissions)
lib/prisma.ts     # Prisma client singleton for server-side database access
prisma/           # Prisma schema and SQLite database files
prisma.config.ts  # Prisma CLI configuration (database URL, migrations path)
generated/        # Generated Prisma client (run `npm run db:generate`)
types/            # Shared TypeScript types
proxy.ts          # Middleware for protected routes and API endpoints
```
