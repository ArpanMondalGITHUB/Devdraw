# TODO

## Done ✓

- [x] Signup / signin / refresh / logout / logoutall routes
- [x] GET /me, PUT /me, PATCH /me, DELETE /me
- [x] JWT access tokens (15min) + httpOnly refresh token cookies (30 days)
- [x] Zod validation middleware
- [x] Rate limiting on signup + signin (express-rate-limit, 10/15min)
- [x] Error handler (ApiError → JSON, pg 23505 → 409)
- [x] Shared schemas in packages/shared
- [x] AuthContext with persistent login (refresh → me on load)
- [x] Auto-refresh axios interceptor on 401
- [x] Logout button on /home
- [x] Protected routes

---

## Will Do Later Password management (needs email service + domain)

- [ ] `POST /api/v1/auth/forgot-password` — generate reset token, store in DB, send email
- [ ] `POST /api/v1/auth/reset-password` — verify token, update password, delete token
- [ ] `PATCH /api/v1/auth/me/password` — change password while logged in (currentPassword + newPassword)
- [ ] Add `PasswordResetToken` table to DB schema + migration

Blocked on: email service requires a domain. Use Resend when you have one.

---

## Database

- [ ] `updatedAt` trigger — Postgres function to auto-set `updatedAt` on User updates
- [ ] Clean up expired refresh tokens — cron or on-demand `DELETE FROM "RefreshToken" WHERE "expiresAt" < now()`
- [ ] Fix `return rows[0]!;` in packages/db/queries.ts:48 (non-null assertion, suppresses TS error)

---

## Frontend

- [ ] Profile edit page — form for PUT/PATCH /me (name, email)
- [ ] Show user info on /home properly (not placeholder)
- [ ] Error boundary — catch unhandled React errors
- [ ] Loading states on auth form (disable submit while request in flight)

---

## Deployment

- [ ] Set NODE_ENV=production in production env
- [ ] Update CORS_ORIGIN to production frontend domain
- [ ] Update VITE_API_URL to production API domain
- [ ] Verify cookies work with HTTPS (secure: true is already conditional on isProduction)
- [ ] Set sslmode=verify-full in DATABASE_URL (already done locally)

---

## Optional / later

- [ ] Email verification — POST/GET /verify-email (needs email service)
- [ ] OAuth (Google/GitHub) — social login
- [ ] Admin CRUD — GET/DELETE /users/:id with role check
- [ ] Structured logging — swap console.error for pino
- [ ] Integration tests — supertest + vitest on auth routes
- [ ] Rate limit Redis store — for multi-server deployments
