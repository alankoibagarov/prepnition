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

## Docker

SQLite is embedded in the application (not a separate container). A named Docker volume (`sqlite-data`) persists the database file at `/data/app.db` inside the container.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose)

### Setup

1. Ensure `.env.local` exists with JWT secrets (see setup above).

2. Start in **development** mode (hot reload, source bind-mounted):

```bash
npm run docker:dev
```

3. Start in **production** mode (optimized image, no source mount):

```bash
npm run docker:prod
```

4. Stop containers:

```bash
npm run docker:down
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

| File | Purpose |
| --- | --- |
| `Dockerfile.dev` | Development image with native SQLite bindings |
| `Dockerfile` | Multi-stage production image (Next.js standalone) |
| `docker-compose.yml` | Dev (`--profile dev`) and prod (`--profile prod`) services |
| `docker/entrypoint.sh` | Ensures `/data` exists, runs Prisma generate/migrate |

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
| `npm run docker:dev` | Build and run the app in Docker (development) |
| `npm run docker:prod` | Build and run the app in Docker (production) |
| `npm run docker:down` | Stop Docker containers |

## Project Structure

```
app/              # App Router pages, API routes, and app-specific components
components/ui/    # Shadcn UI primitives (add via `npx shadcn@latest add <component>`)
lib/auth/         # Authentication utilities (JWT, cookies, sessions, permissions)
lib/prisma.ts     # Prisma client singleton for server-side database access
prisma/           # Prisma schema and SQLite database files
prisma.config.ts  # Prisma CLI configuration (database URL, migrations path)
generated/        # Generated Prisma client (run `npm run db:generate`)
docker/           # Docker entrypoint scripts
types/            # Shared TypeScript types
proxy.ts          # Middleware for protected routes and API endpoints
Dockerfile        # Production Docker image
Dockerfile.dev    # Development Docker image
docker-compose.yml
```
