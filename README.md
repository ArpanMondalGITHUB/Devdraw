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