# Devdraw
# Frontend (apps/web)
bun add axios --filter @devdraw/web            # runtime dep
bun add -d some-tool --filter @devdraw/web     # dev-only dep

# Backend (apps/api)
bun add express --filter @devdraw/api          # e.g. if you switch from Bun.serve to Express
bun add -d @types/express --filter @devdraw/api

# A shared dep for everything → put it at the root
bun add -d @types/bun                          # (run from root, no --filter)

# Reinstall / relink the whole repo
bun install