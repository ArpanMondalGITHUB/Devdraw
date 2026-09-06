# Progress

## Auth system — full stack ✓

**Backend:** Express 5 + raw pg (no ORM)
**Frontend:** React 19 + Context API
**Shared:** Zod schemas + types in `packages/shared`

### What exists

```
apps/api/src/
  config/config.ts              → reads .env, throws at boot on missing vars
  middleware/auth.middleware.ts → ApiError, validate(), requireAuth, errorHandler, authLimiter
  services/auth.services.ts    → issueTokens(userId, res, rememberMe)
  controllers/auth.controllers.ts → signup, signin, refresh, logout, logoutall,
                                     getMe, updateMe, patchMe, deleteMe
  routes/auth.routess.ts       → all routes wired with middleware

packages/db/
  pool.ts                      → pg Pool, reads DATABASE_URL from env
  queries.ts                   → findUserByEmail, findUserById, createUser,
                                  updateUser, deleteUser, createRefreshToken,
                                  findRefreshToken, deleteRefreshToken, deleteAllRefreshTokens
  migrations/1_init.sql        → User + RefreshToken tables
  package.json scripts         → bun run migrate / migrate:down

packages/shared/src/
  schemas/auth.schemas.ts      → signupSchema, signinSchema, updateMeSchema,
                                  patchMeSchema, deleteMeSchema
  types/user.ts                → User, AuthResponse interfaces

apps/web/src/
  config/config.ts             → reads VITE_API_URL
  api/axios.config.ts          → axiosInstance, 401 interceptor with auto-refresh + queue
  api/auth.api.ts              → signup, signin, refresh, me, logout
  context/auth.context.tsx     → AuthProvider, useAuth (user, accessToken, loading, setAuth, clearAuth)
                                  restores session on load via refresh → me, redirects to /home if on /auth
  pages/features/Auth.tsx      → login + signup form, Zod validation, setAuth → navigate
  pages/features/Files.tsx     → files dashboard with header, sidebar, quick actions, mock recent files table
  components/ProtectedRoute.tsx → redirects to /auth if not logged in
  components/ui/FabricCanvas.tsx → Fabric.js canvas component with resize + dispose
```

### Route table

| Method | Route | Auth | Body | Success |
|--------|-------|------|------|---------|
| POST | /signup | authLimiter | name, email, password | 201 user + accessToken |
| POST | /signin | authLimiter | email, password | 200 user + accessToken |
| POST | /refresh-token | cookie | — | 200 accessToken |
| POST | /logout | cookie | — | 200 message |
| POST | /logoutall | Bearer | — | 200 message |
| GET | /me | Bearer | — | 200 {user} |
| PUT | /me | Bearer | name, email | 200 {user} |
| PATCH | /me | Bearer | name?, email? | 200 {user} |
| DELETE | /me | Bearer | password | 200 message |

### Frontend Routes

| Path | Component | Protected | Description |
|------|-----------|-----------|-------------|
| / | Auth | No | Login/signup page |
| /home | Files | Yes | Files dashboard |

---

## Files page — frontend only ✓

`apps/web/src/pages/features/Files.tsx` (435 lines):

**Header:**
- Logo, menu toggle button
- Tab navigation: All / Recents / Created by Me / Folders / Unsorted
- Search input
- Invite button
- User avatar dropdown (name, email, logout)

**Collapsible Sidebar:**
- Team switcher dropdown
- Navigation items: All Files, Private Files, Archive, Team Folders, AI Presets, Custom Styles, MCP, DevDraw Bot, New File
- Projects section

**Main content:**
- Greeting section with user name
- 5 quick action cards: Create Blank File, Generate AI Diagram, Connect DevDraw MCP, Create Template, Create Custom Style
- Recent files table with 3 mock rows (hardcoded)

**Status:** UI built, no backend wired. Quick actions don't create files yet, recent files are mock data.

---

## Fabric.js canvas ✓

`apps/web/src/components/ui/FabricCanvas.tsx`:
- Mounts Fabric v7 Canvas instance via refs
- Sizes from container's clientWidth/clientHeight
- Window resize listener → canvas.setDimensions()
- Proper cleanup: removeEventListener + canvas.dispose() on unmount
- Uses `import { Canvas } from "fabric"` (v7 style, not old v5 `fabric.Canvas`)

Currently embedded in Files.tsx for testing — needs to move to `/canvas/:id` route.

---

## Key decisions

- **Raw SQL over Prisma** — `pg` + `node-pg-migrate`. SQL functions in `packages/db/queries.ts`.
- **Context over Redux** — one global state (logged-in user). `AuthProvider` restores session on load.
- **Shared Zod schemas** — `packages/shared` exports form schemas used by both frontend and backend.
- **JWT + refresh tokens** — 15min access token (stateless JWT), 30-day refresh token (DB-backed, httpOnly cookie, revocable).
- **Bun password hashing** — `Bun.password.hash/verify` uses argon2id natively, no bcrypt.
- **Rate limiting** — `express-rate-limit` on `/signup` and `/signin`, 10 requests per 15min per IP.
- **Auto-refresh interceptor** — axios 401 interceptor queues concurrent requests during token refresh, skips `/refresh-token` URL to prevent infinite loop.
- **Persistent login** — `AuthProvider` calls `/refresh-token` → `/me` on mount, redirects to `/home` if user logged in and on `/auth`.

---

## Database (Prisma Postgres hosted)

```
postgres://user:password@pooled.db.prisma.io:5432/postgres?sslmode=verify-full
```

View data: [console.prisma.io](https://console.prisma.io) SQL editor, or [TablePlus](https://tableplus.com).

**Tables:** User, RefreshToken

---

## Env vars

`apps/api/.env`:
```
PORT=3000
JWT_SECRET=<hex from openssl rand -hex 32>
CORS_ORIGIN=http://localhost:5173
DATABASE_URL=postgres://...
```

`apps/web/.env`:
```
VITE_API_URL=http://localhost:3000
```
