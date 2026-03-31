# Gisele de Menezes Blog

Blog for a holistic therapist / Ayurveda practitioner / writer. All UI text is in Brazilian Portuguese. Migrated from WordPress, deployed on Vercel.

## Tech Stack

- **React Router v7** (framework mode, SSR)
- **Kysely** + pg (CamelCasePlugin, singleton `getDb()`)
- **Tailwind CSS v4** + @tailwindcss/typography
- **composable-functions** for domain logic
- **Vite Plus** toolchain (`vp` CLI)
- **Vitest** (jsdom environment)
- **pnpm** (managed through `vp`)

## Quick Reference

```bash
vp dev              # Dev server
vp check            # Format + lint + typecheck
vp run test         # Run tests (watch mode)
vp run test:run     # Run tests once
vp build            # Production build
```

## Environment Variables

Required in `.env` (validated by `make-typed-env` in `app/env.server.ts`):

```
DATABASE_URL=postgresql://...
SESSION_SECRET=<random hex string>
SITE_URL=https://giseledemenezes.com  # optional, has default
```

## Database

PostgreSQL database `gisele_blog`. 4 tables: `posts`, `comments`, `tags`, `post_tags`.

Types are auto-generated in `app/db/types.d.ts` by `kysely-codegen`.

### Migrations

```bash
pnpm run db:migration <name>   # Create new migration file
pnpm run db:migrate            # Run pending migrations + regenerate types
pnpm run db:rollback           # Rollback last migration + regenerate types
```

Migration files live in `app/db/migrations/` with timestamp prefix format `YYYYMMDDTHHmmss-name.ts`. Each migration exports `up()` and `down()` functions.

After any schema change, types are regenerated automatically. To regenerate manually:

```bash
pnpm run db:generate
```

### Queries

All queries in `app/db/queries.server.ts`. Use `composable()` for plain queries, `applySchema(zodSchema)` for queries with user input. Never do Zod validation at the caller (route) level when using `applySchema`.

## Routes

| Path                          | File                | Description                              |
| ----------------------------- | ------------------- | ---------------------------------------- |
| `/`                           | `home.tsx`          | Hero + recent posts + trabalhos          |
| `/blog`                       | `blog.tsx`          | Paginated post listing + tag menu        |
| `/blog/page/:page`            | `blog.tsx`          | Same component, id: `blog-paginated`     |
| `/blog/tag/:slug`             | `blog-tag.tsx`      | Posts filtered by tag + pagination       |
| `/blog/tag/:slug/page/:page`  | `blog-tag.tsx`      | Same component, id: `blog-tag-paginated` |
| `/blog/:slug`                 | `blog-post.tsx`     | Post detail + tags + comments            |
| `/sobre`                      | `about.tsx`         | About page                               |
| `/depoimentos`                | `testimonials.tsx`  | Testimonials                             |
| `/trabalhos`                  | `trabalhos.tsx`     | Trabalhos listing                        |
| `/trabalhos/:slug`            | `trabalho.tsx`      | Trabalho detail                          |
| `/contato`                    | `contact.tsx`       | Contact form                             |
| `/sitemap.xml`                | `sitemap.ts`        | Dynamic sitemap                          |
| `/robots.txt`                 | `robots.ts`         | Robots file                              |
| `*`                           | `wp-catchall.tsx`   | WordPress URL redirects                  |

## Route Conventions

1. Import route types: `import type { Route } from "./+types/routename"`
2. Loaders call query functions and check `result.success`, or use `fromSuccess()` when failure isn't expected
3. Every route exports `meta()` using `generateMeta()` + JSON-LD helpers from `app/lib/seo.ts`
4. Every route exports `headers()` with Cache-Control
5. Routes with dynamic params have `ErrorBoundary` using `ErrorPage`

## Key Directories

```
app/
  components/     # Reusable UI components
  db/             # Database layer (queries, migrations, types)
  lib/            # Utilities (format, seo, wp-redirects)
  routes/         # Route modules
  styles/         # Tailwind CSS (tailwind.css)
  test/           # Test setup
public/uploads/   # Images (webp, migrated from WordPress)
```

## Deployment

Vercel. `vercel.json` runs migrations on production builds only:

```
[ "$VERCEL_ENV" = 'production' ] && pnpm exec tsx ./app/db/scripts/migrate.ts; pnpm exec react-router build
```

WordPress redirect rules are in `vercel.json` and `app/routes/wp-catchall.tsx`.

## Admin / CMS

[Flashboard](https://getflashboard.com) connects directly to the PostgreSQL database and provides a CRUD admin panel. Used for comment moderation (approve/reject pending comments) and general data management.

## Comments

New comments submitted via the blog are stored with `status = 'pending'` and must be approved via Flashboard before they appear publicly. Spam prevention uses honeypot fields and timing checks (no external services).

## Dark Mode

Client-side only via `localStorage`. A blocking `<script>` in `<head>` reads the preference before paint to prevent flash. No server session involved — avoids conflicts with Vercel SWR cache.

## Content Migrations

Post `content` is raw HTML. Internal links have been migrated from absolute `giseledemenezes.com` URLs to relative paths. Content migrations use JS regex (not SQL) to handle non-greedy matching — see existing migrations for the pattern. The root loader handles legacy `?p=ID` WordPress query params via `wp_original_id`.

## Code Rules

- No code comments unless explicitly requested
- Never use `any` type
- Use `??` instead of `||` for nullish coalescing
- All UI text in Portuguese (pt-BR)
