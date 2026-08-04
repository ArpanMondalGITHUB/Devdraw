# Devdraw
# Frontend (apps/web)
bun add axios --cwd=apps/web            # runtime dep
bun add -d @types/axios --cwd=apps/web     # dev-only dep

# Backend (apps/api)
bun add express --cwd=apps/api           
bun add -d @types/express @types/cors --cwd=apps/api
bun remove nodemon --cwd apps/api                           remove the dependencies

# A shared dep for everything → put it at the root
bun add -d @types/bun                          # (run from root, no --filter)

# Reinstall / relink the whole repo
bun install

# Run the backend server 
bun --cwd apps/api dev

# Run the Frontend server
bun --cwd apps/web dev

# Migrate DB (run after every schema.prisma change)
cd packages/prisma
bunx prisma migrate dev --name <name>

# Browse / edit data in the browser (Prisma Studio)
cd packages/prisma
bunx prisma studio

## API — /api/v1/auth

| Method | Route          | Auth            | Body                  | Success                | Errors                       |
|--------|----------------|-----------------|-----------------------|------------------------|------------------------------|
| POST   | /signup        | —               | name, email, password | 201 user + accessToken | 400 invalid, 409 email taken |
| POST   | /signin        | —               | email, password       | 200 user + accessToken | 400, 401 bad credentials     |
| POST   | /refresh-token | cookie          | —                     | 200 accessToken        | 401 missing/expired          |
| POST   | /logout        | cookie          | —                     | 200 message            | —                            |
| POST   | /logoutall     | Bearer + cookie | —                     | 200 message            | 401                          |

Auth: access token (JWT, 15m) in `Authorization: Bearer <token>`; refresh token (30d) in httpOnly cookie, revoked server-side in DB.