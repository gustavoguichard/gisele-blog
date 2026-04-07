---
name: domain-patterns
description: Established patterns for domain functions, business logic, schemas, routes, composition, testing, and file organization. Use when creating query functions, Zod schemas, route loaders/actions, form handling, error handling, composable functions, adding new features, or discussing code structure and conventions.
---

# Domain & Route Patterns

## Business Function Patterns

Business functions live in `app/business/*.server.ts`, organized by domain (e.g., `posts.server.ts`, `comments.server.ts`). Two patterns exist depending on whether input validation is needed:

### Pattern A: With `applySchema` (user/form input)

Use when the function receives input that needs validation (form data, URL params, user-provided values). **Preferred** — validation happens in the domain layer, not in routes:

```typescript
import { applySchema } from "composable-functions";
import { z } from "zod";
import { getDb } from "~/db/db.server";

const fetchPostBySlug = applySchema(z.object({ slug: z.string().min(1) }))(async ({ slug }) => {
  return getDb()
    .selectFrom("posts")
    .where("slug", "=", slug)
    .where("status", "=", "published")
    .selectAll()
    .executeTakeFirstOrThrow();
});
```

### Pattern B: `composable()` (no validation needed)

Use when the function has no user input or only internal parameters:

```typescript
import { composable } from "composable-functions";

const fetchRecentPosts = composable(async (limit = 6) => {
  return getDb()
    .selectFrom("posts")
    .where("status", "=", "published")
    .select(["id", "title", "slug", "excerpt", "featuredImage", "publishedAt"])
    .orderBy("publishedAt", "desc")
    .limit(limit)
    .execute();
});
```

### Input vs Context (Two-Argument Convention)

Business functions use `applySchema(inputSchema, contextSchema)` with two distinct parameters:

- **Input** (1st arg): Data that flows through the system (form data, URL params, IDs)
- **Context** (2nd arg): Stable route/session data (tenantId, userId, request)

```typescript
const updatePost = applySchema(
  z.object({ title: z.string() }), // Input: from form
  z.object({ id: z.string().uuid() }), // Context: from route params
)(async ({ title }, { id }) => {
  return getDb().updateTable("posts").set({ title }).where("id", "=", id).execute();
});
```

Use `inputFromUrl(request)` for URL param extraction and `inputFromForm(formData)` for form data. Never manually use `searchParams.get()` with Zod schemas — `null` vs `undefined` causes silent validation failures.

## Schema Patterns

Schemas and types live in `app/business/*.common.ts`. Derive TypeScript types from schemas with `z.infer<typeof schema>`. Never duplicate type definitions manually.

```typescript
import { z } from "zod";

const commentSchema = z.object({
  postId: z.string().uuid(),
  parentId: z.string().uuid().nullable(),
  authorName: z.string().min(1).max(100),
  authorEmail: z.string().email().max(254),
  content: z.string().min(1).max(5000),
});

type Comment = z.infer<typeof commentSchema>;

export type { Comment };
export { commentSchema };
```

`*.common.ts` files may also contain form validation schemas, helper validation functions, and shared constants.

Database types are auto-generated in `app/db/types.d.ts` by `kysely-codegen`. Never edit that file manually.

## Route Conventions

### Filenames

Route params are defined in `app/routes.ts`, **not** in filenames. Never use `$param` or dots in route filenames.

Use simple, descriptive, hyphenated names. Where applicable, prefer **verb-subject** naming:

```
app/routes/
  home.tsx
  blog.tsx
  blog-post.tsx
  blog-tag.tsx
  contact.tsx
  testimonials.tsx
  trabalhos.tsx
  sitemap.ts
```

### Route definition

All route paths and params are declared centrally in `app/routes.ts`:

```typescript
import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("./routes/home.tsx"),
  route("blog", "./routes/blog.tsx"),
  route("blog/page/:page", "./routes/blog.tsx", { id: "blog-paginated" }),
  route("blog/:slug", "./routes/blog-post.tsx"),
  route("*", "./routes/wp-catchall.tsx"),
] satisfies RouteConfig;
```

Same component with different param sets uses `{ id: 'unique-id' }`.

### Route exports

Route files **only** export the standard React Router API:

- `loader` / `clientLoader`
- `action` / `clientAction`
- `meta`
- `headers`
- `default` (the component)
- `ErrorBoundary`

If a constant, helper, or schema needs to be exported, it belongs in `app/business/`, `app/lib/`, or `app/components/` — not in the route file. This keeps route files as thin controllers and prevents server-only code from leaking into the client bundle.

### Route types

Always import route-specific types from the generated `+types` directory:

```typescript
import type { Route } from "./+types/blog-post";
```

### Loader pattern

```typescript
export async function loader({ params }: Route.LoaderArgs) {
  const result = await fetchPostBySlug({ slug: params.slug });
  if (!result.success) {
    throw new Response("Post não encontrado", { status: 404 });
  }
  const post = result.data;

  const [tags, comments] = await Promise.all([
    fromSuccess(fetchTagsForPost)(post.id),
    fromSuccess(fetchCommentsForPost)(post.id),
  ]);
  return { post, tags, comments };
}
```

Key patterns:

- Check `result.success` for failable queries, throw `Response` with status on failure
- Use `fromSuccess()` when failure is not expected (throws automatically)
- Fetch related data in parallel with `Promise.all()`
- Routes never do their own Zod validation — `applySchema` handles it

### Action pattern

Use `inputFromForm(request)` to extract form data and pass it directly to the business function. The action is a thin controller — all orchestration (validation, rate limiting, external API calls) belongs in the business layer:

```typescript
export async function action({ request }: Route.ActionArgs) {
  const formInput = await inputFromForm(request);
  const result = await submitContactForm(formInput, { ip: getClientIp(request) });

  if (!result.success) {
    const fieldErrors = result.errors
      .filter((e) => "path" in e)
      .map((e) => ({ path: (e as { path: string[] }).path, message: e.message }));
    return data({ success: false, errors: fieldErrors }, { status: 400 });
  }

  return data({ success: true, errors: [] });
}
```

Use `inputFromUrl(request)` for URL/query param extraction. Never manually extract with `formData.get()` or `searchParams.get()` — `null` vs `undefined` causes silent Zod validation failures.

### Meta and headers

Every route exports `meta()` using `generateMeta()` + JSON-LD helpers from `~/lib/seo`, and `headers()` with Cache-Control:

```typescript
export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData) return [];
  return [
    ...postSeoMeta(post, "/blog"),
    blogPostingJsonLd(post),
    breadcrumbJsonLd([
      { name: "Início", url: "/" },
      { name: "Blog", url: "/blog" },
      { name: post.title, url: `/blog/${post.slug}` },
    ]),
  ];
}

export function headers() {
  return { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=3600" };
}
```

### ErrorBoundary

Routes with dynamic params export an `ErrorBoundary` using `ErrorPage`:

```typescript
export function ErrorBoundary() {
  const error = useRouteError()
  const is404 = isRouteErrorResponse(error) && error.status === 404
  return <ErrorPage ... />
}
```

## Function Composition

### Parallel: `collect()`

Run independent data sources in parallel:

```typescript
const result = await collect({
  posts: fetchRecentPosts,
  works: fetchWorks,
})();
```

Wrap non-composable (impure) functions in `() =>` arrow functions inside `collect()`.

### Sequential: `pipe()`

Chain functions where output feeds into the next:

```typescript
const combined = pipe(fetchPost, enrichWithTags);
```

### Graceful degradation: `catchFailure()`

Recover from errors with a fallback value:

```typescript
catchFailure(fetchOptionalData, () => []);
```

## Services Pattern

Services live in `app/services/*.server.ts`. Each service creates a typed HTTP client with `makeService` from `make-service` and exports thin wrapper functions. Business functions call services; routes never call services directly.

```typescript
import { makeService } from "make-service";
import { z } from "zod";
import { env } from "~/env.server";

const turnstileService = makeService("https://challenges.cloudflare.com/turnstile/v0", {
  headers: { "content-type": "application/json" },
});

const turnstileResponseSchema = z.object({ success: z.boolean() });

async function verifyTurnstileToken(token: string, ip: string) {
  const secret = env().TURNSTILE_SECRET_KEY;
  if (!secret) return { success: true };

  const response = await turnstileService.post("/siteverify", {
    body: { secret, response: token, remoteip: ip },
  });
  return response.json(turnstileResponseSchema);
}

export { verifyTurnstileToken };
```

Key patterns:

- `makeService(baseURL, options)` creates the client — owns base URL, default headers
- Wrapper functions handle provider-specific logic (auth, optional features)
- Use Zod schemas with `response.json(schema)` for validated responses

## Error Handling

Consistent pattern across all routes:

```typescript
const result = await domainFunction(input)

if (!result.success) {
  throw new Response('Not found', { status: 404 })      // Loader: semantic error
  return data({ errors: [...] }, { status: 400 })        // Action: validation errors
}

// Access result.data only after success check
```

Use `fromSuccess()` when failure is not expected:

```typescript
const posts = await fromSuccess(fetchRecentPosts)(5);
```

## Export Conventions

Gather all exports at the end of every file. **Types first, then runtime values**:

```typescript
// ... all implementation above ...

export type { Post, PostList };
export { fetchPosts, fetchPostBySlug, postSchema, PER_PAGE };
```

## Testing Patterns

Tests live alongside source files as `*.test.ts` or `*.test.tsx`.

### Testing `applySchema` validation

Schema validation fails before reaching the DB, so no mocking needed:

```typescript
it("rejects empty slug", async () => {
  const result = await fetchPostBySlug({ slug: "" });
  expect(result.success).toBe(false);
});
```

### Testing domain functions with mocked DB

```typescript
vi.mock("~/db/db.server", () => ({ getDb: vi.fn() }));

import { getDb } from "~/db/db.server";

it("allows submission when under the limit", async () => {
  vi.mocked(getDb).mockReturnValue(mockDb as unknown as ReturnType<typeof getDb>);
  const result = await checkContactRateLimit("1.2.3.4");
  expect(result.success).toBe(true);
});
```

### Component rendering with route stubs

```typescript
function renderRoute() {
  const Stub = createRoutesStub([{ path: '/', Component: MyComponent }])
  return render(<Stub initialEntries={['/']} />)
}
```

## File Organization

```
app/
  business/
    feature.server.ts       # Domain functions (DB queries + logic)
    feature.common.ts       # Zod schemas, derived types, validation helpers, constants
    feature.ui.tsx           # Domain-specific UI components (not generic shared ones)
    feature.server.test.ts   # Unit tests (colocated)

  components/               # Generic shared components (used by 2+ routes, no business knowledge)

  db/
    db.server.ts            # Kysely singleton (getDb)
    migrations/             # Timestamped migrations (YYYYMMDDTHHmmss-name.ts)
    types.d.ts              # Auto-generated by kysely-codegen

  lib/                      # Generic, project-agnostic utilities (could be copy-pasted to any project)

  services/                 # HTTP clients (make-service) and external provider wrappers
    feature.server.ts       # Service client + wrapper functions
    feature.server.test.ts  # Unit tests (colocated)

  routes/                   # Route modules (thin controllers)

  test/                     # Test setup
```

### Boundary rules

- **`app/business/`** — Domain logic, input validation via `applySchema`, DB queries. All Zod validation stays here; callers (routes) just check `result.success`
- **`app/components/`** — Pure, reusable UI with no business knowledge
- **`app/lib/`** — Generic utilities that could be copy-pasted to any project — an internal framework layer
- **`app/services/`** — HTTP clients built with `make-service` and thin wrapper functions for external providers. Services own the API shape (base URL, headers, endpoint paths) and response parsing. Business functions call services; routes never call services directly
- **`app/db/`** — Database connection and schema only. No business logic here — that goes in `app/business/`
- **Routes** — Thin controllers: use `inputFromForm(request)` / `inputFromUrl(request)` to extract input, call one business function, check `result.success`, return response. All orchestration (rate limiting, external API calls, multi-step flows) belongs in business functions. Only export the standard React Router API. No inline Zod `safeParse`; no raw DB queries; no manual `formData.get()` / `searchParams.get()`
