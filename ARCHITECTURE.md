# Collaborative Excalidraw-Like App System Design

This document is the blueprint for building an Excalidraw-like collaborative architecture canvas using React, Fabric.js, Yjs, y-websocket, Node, Express, Redis, and durable storage.

The short decision: use `y-websocket` first, not a hand-written raw WebSocket protocol. Yjs already gives you conflict-free collaborative state. `y-websocket` gives you a working provider, awareness/presence, reconnection, and a simple server path. Add Redis when you need multiple WebSocket servers, background jobs, rate limits, queues, and fast temporary state. Do not make Redis your only durable database for user work.

## 1. Product Vision

You are building a collaborative visual system design tool:

- Users draw boxes, arrows, handwritten rough shapes, text, sticky notes, code snippets, links, and files.
- Multiple users edit the same board in real time.
- The board can be messy, then the user clicks `Mess Cleanup` and the app turns it into a clean structured diagram.
- The user clicks `Architecture Assist` and the app analyzes the diagram, suggests APIs, databases, missing components, scalability risks, and improvements.
- Every object can have a `Context Layer`: notes, links, code snippets, attached files, comments, decisions, and references.

Think of it as a mix of Excalidraw, FigJam, architecture review assistant, and lightweight technical notebook.

## 2. Recommended Stack

### Frontend

- React + TypeScript
- Vite for development
- Fabric.js for canvas object rendering, interactions, selection, transforms, and serialization
- Yjs for CRDT collaborative state
- y-websocket for real-time transport
- y-indexeddb for offline/local persistence
- Zustand or Redux Toolkit for local UI state only
- TanStack Query for REST API calls
- Tailwind or CSS modules for UI styling

### Realtime Collaboration

- Yjs is the source of truth for live board content.
- `y-websocket` connects each browser to a collaboration room.
- Yjs awareness stores temporary user presence like cursor, selected object IDs, active tool, username, and color.
- Persist Yjs updates on the server.

### Backend

- Node.js + Express for REST APIs
- A WebSocket collaboration server using `y-websocket` or a y-websocket compatible backend
- PostgreSQL for durable app data: users, teams, boards, permissions, attachments metadata, context metadata, audit records, AI analysis history
- Object storage such as S3, R2, MinIO, or local disk in development for uploaded files
- Redis for caching, pub/sub, streams, job queues, rate limits, locks, presence mirrors, and horizontal scaling

### AI Layer

- Backend-only AI gateway endpoint, never call an AI provider directly from the browser with secret keys.
- Convert canvas state into a semantic scene graph JSON before asking the AI model.
- Keep the AI output structured JSON so you can render suggestions back onto the canvas.

## 3. Should You Use y-websocket Or Your Own WebSocket?

Use `y-websocket` first.

Reasons:

- Yjs updates are binary CRDT updates, not normal JSON patches.
- Collaboration needs sync, reconnection, awareness, conflict handling, and duplicate-update safety.
- y-websocket already speaks the protocol expected by `WebsocketProvider`.
- You can still put your own Express server beside it for auth, REST APIs, context, attachments, and AI.

Build raw WebSocket only when:

- You deeply understand Yjs document updates and awareness protocol.
- You need custom scaling, custom persistence, or custom permissions that y-websocket cannot handle.
- You want to build a y-websocket compatible provider/server.

Practical path:

1. MVP: `y-websocket` server.
2. Production v1: y-websocket plus persistence and auth at the reverse proxy or upgrade layer.
3. Scale phase: y-websocket compatible backend with Redis pub/sub or streams.
4. Big scale: shard rooms by board ID and use Redis Streams or a Yjs-specific Redis backend pattern.

## 4. High-Level Architecture

```text
Browser
  React UI
  Fabric.js Canvas
  Y.Doc
  y-websocket provider
  y-indexeddb offline cache
      |
      | WebSocket: Yjs updates + awareness
      v
Collaboration Server
  y-websocket compatible protocol
  auth check on connect
  room membership
  update broadcast
  persistence hook
      |
      | append updates / pub-sub / queues
      v
Redis
  pub/sub for multi-node fanout
  streams for durable update queues
  presence cache
  locks and rate limits
  AI job queue
      |
      v
Durable Storage
  PostgreSQL: users, boards, permissions, metadata, context layer
  Object Storage: files, images, exports
  Yjs Snapshot Store: compacted board document updates

Backend API
  Express REST endpoints
  auth
  file upload
  context layer APIs
  architecture assist API
  cleanup operation API if server-side cleanup is used
```

## 5. Repository Structure

Bun workspaces monorepo. Root `package.json` declares the workspaces; `tsconfig.base.json` is extended by each package.

```text
Devdraw/                          ← workspace root
├── package.json                  ← bun workspaces config
├── bun.lock
├── tsconfig.base.json            ← base TS config extended by all packages
│
├── apps/
│   ├── api/                      ← Express REST + auth backend
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts          ← entry point (starts server)
│   │       ├── app.ts            ← Express app setup, middleware, routes
│   │       ├── config/
│   │       │   └── config.ts     ← env vars, constants
│   │       ├── controllers/
│   │       │   └── auth.controllers.ts
│   │       ├── middleware/
│   │       │   └── auth.middleware.ts
│   │       ├── routes/
│   │       │   └── auth.routess.ts
│   │       ├── schemas/
│   │       │   └── auth.schemas.ts  ← server-side Zod validation
│   │       └── services/
│   │           └── auth.services.ts
│   │
│   └── web/                      ← React + Vite frontend
│       ├── package.json
│       ├── vite.config.ts
│       ├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
│       ├── index.html
│       ├── public/
│       │   ├── favicon.svg
│       │   └── icons.svg
│       └── src/
│           ├── main.tsx
│           ├── App.tsx
│           ├── index.css / App.css
│           ├── assets/
│           ├── components/
│           │   └── ui/
│           │       └── AuthLayout.tsx
│           ├── hooks/            ← shared React hooks
│           ├── lib/              ← utility helpers, API client
│           ├── pages/
│           │   └── features/
│           │       └── Auth.tsx  ← sign-in / sign-up page
│           ├── schemas/
│           │   └── auth.schemas.ts  ← client-side Zod schemas
│           └── styles/
│
└── packages/
    ├── shared/                   ← shared TS types, schemas, utils
    │   ├── package.json
    │   └── src/
    │       ├── index.ts          ← barrel export
    │       ├── schemas/
    │       │   └── auth.schemas.ts  ← canonical Zod schemas shared across apps
    │       ├── types/
    │       │   └── user.ts
    │       └── utils/
    │           └── greet.ts
    │
    ├── prisma/                   ← Prisma client + migrations
    │   ├── package.json
    │   ├── prisma.config.ts
    │   ├── index.ts              ← exports PrismaClient instance
    │   └── prisma/
    │       ├── schema.prisma
    │       └── migrations/
    │
    └── features/
        └── auth/                 ← shared auth logic (JWT helpers, session utils)
            └── lib/
                └── auth.ts
```

Key conventions:

- `packages/shared` is the single source for types and Zod schemas that cross the API/web boundary. Define once here, import in both apps.
- `packages/prisma` owns all database access. `apps/api` imports the Prisma client from this package, never directly.
- `packages/features/auth` holds runtime-agnostic logic (JWT sign/verify, session helpers) callable from both the API and future edge functions.
- `apps/web/src/schemas/` and `apps/api/src/schemas/` may hold app-specific validation wrappers, but the canonical schema lives in `packages/shared/src/schemas/`.

For learning docs in this folder:

- Fabric.js deep tutorial: `fabric-js.md`
- Yjs deep tutorial: `yjs.md`
- y-websocket deep tutorial: `y-websocket.md`
- Redis deep tutorial for this app: `redis.md`

## 6. Core Domain Model

A Fabric object is visual. A Yjs object record is collaborative state. Keep them separate.

### Board

```ts
type Board = {
  id: string
  teamId: string
  title: string
  createdBy: string
  createdAt: string
  updatedAt: string
}
```

### Canvas Object

```ts
type CanvasObject = {
  id: string
  type:
    | 'rect'
    | 'ellipse'
    | 'diamond'
    | 'arrow'
    | 'line'
    | 'text'
    | 'sticky'
    | 'frame'
    | 'image'
    | 'freehand'
    | 'code'
    | 'database'
    | 'service'
    | 'actor'
  x: number
  y: number
  width: number
  height: number
  angle: number
  scaleX: number
  scaleY: number
  zIndex: number
  text?: string
  points?: Array<{ x: number; y: number }>
  startObjectId?: string
  endObjectId?: string
  style: {
    fill?: string
    stroke?: string
    strokeWidth?: number
    fontSize?: number
    fontFamily?: string
    roughness?: number
  }
  metadata: {
    createdBy: string
    updatedBy: string
    createdAt: number
    updatedAt: number
    tags?: string[]
    semanticRole?: 'api' | 'db' | 'cache' | 'queue' | 'client' | 'service' | 'external'
  }
}
```

### Context Layer Item

```ts
type ContextItem = {
  id: string
  objectId: string
  kind: 'note' | 'link' | 'code' | 'file' | 'decision' | 'todo'
  title?: string
  body?: string
  url?: string
  language?: string
  code?: string
  fileId?: string
  createdBy: string
  createdAt: number
  updatedAt: number
}
```

### Architecture Assist Result

```ts
type ArchitectureAssistResult = {
  summary: string
  detectedArchitecture: string
  suggestedApis: Array<{
    name: string
    type: 'REST' | 'GraphQL' | 'gRPC' | 'WebSocket' | 'Webhook' | 'Event'
    from: string
    to: string
    reason: string
  }>
  suggestedDatabases: Array<{
    component: string
    database: 'PostgreSQL' | 'Redis' | 'MongoDB' | 'ElasticSearch' | 'S3' | 'ClickHouse'
    reason: string
  }>
  missingComponents: string[]
  scalabilityRisks: string[]
  securityRisks: string[]
  improvements: string[]
  canvasPatches?: Array<{
    action: 'addObject' | 'updateObject' | 'addConnector' | 'addContextNote'
    payload: unknown
  }>
}
```

## 7. Yjs Document Schema

Use a stable schema. Do not store Fabric class instances inside Yjs. Store plain JSON data only.

```ts
const ydoc = new Y.Doc()

const yObjects = ydoc.getMap<CanvasObject>('objects')
const yZOrder = ydoc.getArray<string>('zOrder')
const yContext = ydoc.getMap<ContextItem[]>('contextByObjectId')
const yComments = ydoc.getArray<CommentRecord>('comments')
const yBoardMeta = ydoc.getMap<unknown>('boardMeta')
```

Recommended structure:

- `objects`: map from object ID to plain JSON object.
- `zOrder`: array of object IDs in rendering order.
- `contextByObjectId`: map from object ID to context item summaries or IDs.
- `boardMeta`: title, schema version, default theme, viewport bookmarks.
- Awareness: current user cursor, selected object IDs, active tool, user name, user color.

Do not put large files directly in Yjs. Store files in object storage and put only metadata/file IDs in Yjs or Postgres.

## 8. Fabric.js And Yjs Binding

The key engineering task is the bridge between Fabric and Yjs.

### Rule

- Fabric renders and handles local interaction.
- Yjs owns shared state.
- Local Fabric changes write to Yjs.
- Remote Yjs changes update Fabric.
- Use transaction origins to avoid infinite loops.

### Minimal Binding Shape

```ts
const LOCAL_ORIGIN = Symbol('local-fabric-change')
const REMOTE_ORIGIN = Symbol('remote-yjs-change')

function updateYObjectFromFabric(fabricObject: fabric.Object) {
  const id = fabricObject.get('id') as string
  const record = fabricObjectToRecord(fabricObject)

  ydoc.transact(() => {
    yObjects.set(id, record)
  }, LOCAL_ORIGIN)
}

yObjects.observe(event => {
  ydoc.transact(() => {
    event.keysChanged.forEach(id => {
      const record = yObjects.get(id)

      if (!record) {
        removeFabricObject(id)
        return
      }

      upsertFabricObject(record)
    })
  }, REMOTE_ORIGIN)
})
```

### Fabric Events To Capture

- `object:added`
- `object:modified`
- `object:removed`
- `selection:created`
- `selection:updated`
- `selection:cleared`
- `path:created` for freehand drawing
- Text editing lifecycle events for text objects

### Performance Rules

- Throttle high-frequency movement updates, for example every 30 to 80 ms.
- Commit final object position on `object:modified`.
- For freehand drawing, create the path locally, then sync the final path instead of syncing every pointer point in real time.
- Use awareness for cursor/pointer movement, not the durable Yjs document.
- Batch related changes in one `ydoc.transact`.

## 9. Collaboration Flow

### Client Join

1. User opens `/boards/:boardId`.
2. Frontend fetches board metadata and permissions from Express.
3. Frontend creates a `Y.Doc`.
4. Frontend attaches `IndexeddbPersistence(boardId, ydoc)` for offline cache.
5. Frontend creates `WebsocketProvider(wsUrl, boardId, ydoc, { params: { token } })`.
6. Provider syncs document state.
7. Fabric binding renders objects from Yjs.
8. Awareness shows remote cursors and selections.

### Local Draw

1. User draws a rectangle in Fabric.
2. App assigns stable object ID.
3. App converts Fabric object to plain `CanvasObject`.
4. App writes object to `yObjects`.
5. y-websocket sends the Yjs update to the server.
6. Other users receive the update and render it.

### Remote Update

1. Yjs receives remote binary update.
2. `yObjects.observe` fires.
3. Binding finds changed object IDs.
4. Fabric object is inserted, updated, or removed.
5. Canvas re-renders.

## 10. Backend APIs

Keep collaboration and app APIs separate.

### Board REST APIs

```text
POST   /api/boards
GET    /api/boards
GET    /api/boards/:boardId
PATCH  /api/boards/:boardId
DELETE /api/boards/:boardId
POST   /api/boards/:boardId/duplicate
```

### Context APIs

```text
GET    /api/boards/:boardId/context/:objectId
POST   /api/boards/:boardId/context/:objectId
PATCH  /api/context/:contextItemId
DELETE /api/context/:contextItemId
```

### Attachment APIs

```text
POST   /api/attachments/presign
POST   /api/attachments/complete
GET    /api/attachments/:fileId
DELETE /api/attachments/:fileId
```

### AI Assist APIs

```text
POST   /api/boards/:boardId/assist/architecture
GET    /api/boards/:boardId/assist/runs/:runId
POST   /api/boards/:boardId/assist/runs/:runId/apply
```

### Cleanup APIs

For MVP, run cleanup in the browser. For larger diagrams, run server-side.

```text
POST /api/boards/:boardId/layout/cleanup-preview
POST /api/boards/:boardId/layout/apply
```

## 11. Redis Responsibilities

Redis should help the system stay fast. It should not be the only place where important user documents live.

Use Redis for:

- Pub/sub between multiple WebSocket servers.
- Streams for durable-ish event queues and background work.
- Presence cache for fast "who is online" views.
- Rate limits for AI assist, file uploads, and board operations.
- Distributed locks for compaction jobs.
- Job queues for architecture assist, thumbnails, export generation, and Yjs update compaction.
- Short-lived caches for board metadata and permissions.

Use PostgreSQL/object storage for:

- Durable board metadata.
- User/team/permission records.
- Context layer records.
- Attachment metadata.
- Long-term Yjs snapshots/update blobs.
- AI analysis history.

## 12. Durable Persistence Strategy

Yjs documents are stored as binary updates. You have two common patterns.

### Pattern A: Update Log

Store every Yjs update.

Pros:

- Simple append-only design.
- Easy to debug history.
- Good for early versions.

Cons:

- Logs grow forever.
- Loading a board can become slow unless you compact.

### Pattern B: Snapshot Plus Tail

Store compact snapshots plus recent updates.

Pros:

- Fast load.
- Smaller storage.
- Better production pattern.

Cons:

- Requires background compaction.

Recommended:

- Start with update log.
- Add compaction job when documents become large.
- Store compacted update blob in object storage.
- Store snapshot metadata in PostgreSQL.
- Use Redis Streams for temporary update fanout and worker queues.

## 13. Mess Cleanup Feature

This is the signature feature. It should feel magical, but the core should be deterministic.

### What The Button Does

When the user clicks `Mess Cleanup`, the app:

1. Reads selected objects, or the whole board if nothing is selected.
2. Classifies objects into nodes, connectors, labels, groups, frames, and freehand paths.
3. Builds a graph from arrows and spatial relationships.
4. Detects likely architecture flow direction.
5. Chooses a layout strategy.
6. Computes clean positions.
7. Routes arrows cleanly.
8. Aligns labels.
9. Shows a preview.
10. Applies all coordinate changes as a single Yjs transaction.

### Layout Libraries To Consider

- `elkjs`: best for structured diagrams, layered layouts, architecture diagrams, and complex edge routing.
- `dagre`: simpler directed graph layout.
- `d3-force`: good for organic clustering, not as clean for architecture diagrams.
- `graphlib`: graph data structure support.
- `rbush`: spatial index for finding nearby objects quickly.

Recommendation: use `elkjs` for architecture cleanup and `rbush` for spatial detection.

### Cleanup Algorithm

```ts
type LayoutInput = {
  nodes: LayoutNode[]
  edges: LayoutEdge[]
  looseText: LayoutText[]
  groups: LayoutGroup[]
}

function cleanupMess(records: CanvasObject[]): CanvasObject[] {
  const normalized = normalizeObjects(records)
  const classified = classifyObjects(normalized)
  const graph = buildGraph(classified)
  const direction = inferDirection(graph, classified)
  const clusters = detectClusters(classified)
  const layout = runLayoutEngine(graph, { direction, clusters })
  const routedEdges = routeEdges(layout)
  const labels = placeLabels(classified.looseText, layout)

  return applyLayout(records, layout, routedEdges, labels)
}
```

### Classification Rules

- Rectangles, diamonds, service icons, database icons, and sticky notes become nodes.
- Arrows and lines become edges.
- Text close to a node becomes that node's label.
- Text close to an arrow becomes an edge label.
- Frames become group boundaries.
- Freehand shapes can be converted to rough bounding boxes or left untouched.

### Direction Detection

Use heuristics:

- If most arrows point left-to-right, layout left-to-right.
- If most arrows point top-to-bottom, layout top-to-bottom.
- If there are actors/users on the left and databases on the right, use left-to-right.
- If there are layers like UI, API, service, DB, use top-to-bottom or left-to-right lanes.

### Before Applying Cleanup

Always show:

- Preview mode.
- `Apply` button.
- `Cancel` button.
- Undo support.

Do not instantly destroy the user's arrangement without review. The cleanup feature should feel helpful, not bossy.

### Collaboration Safety

Apply cleanup as one transaction:

```ts
ydoc.transact(() => {
  cleanedObjects.forEach(object => {
    yObjects.set(object.id, object)
  })
}, 'mess-cleanup')
```

This makes remote users receive one coherent operation instead of hundreds of random jumps.

## 14. Architecture Assist Feature

Architecture Assist should not only describe the diagram. It should turn visual data into useful engineering advice.

### Input Pipeline

1. Read Yjs object state.
2. Convert Fabric/Yjs objects into a semantic scene graph.
3. Include context layer notes and code snippets.
4. Include board title and optional user question.
5. Send the scene graph to your backend.
6. Backend calls an AI provider.
7. AI returns strict JSON.
8. Frontend renders suggestions in a side panel.
9. User can apply suggested boxes/arrows/notes to the board.

### Scene Graph

```ts
type SceneGraph = {
  board: {
    id: string
    title: string
  }
  nodes: Array<{
    id: string
    label: string
    type: string
    semanticRole?: string
    position: { x: number; y: number }
    size: { width: number; height: number }
    context: ContextItem[]
  }>
  edges: Array<{
    id: string
    from?: string
    to?: string
    label?: string
    direction?: string
  }>
  looseNotes: string[]
  codeSnippets: Array<{
    language: string
    code: string
    attachedTo?: string
  }>
}
```

### AI Prompt Shape

Ask for structured output:

```text
You are a senior software architect.
Analyze this canvas scene graph.
Return JSON only.

Need:
- detected architecture
- missing services
- suggested APIs and directions
- database choices
- cache/queue recommendations
- scalability risks
- security risks
- observability needs
- concrete improvements
- optional canvas patches
```

### What It Should Suggest

For APIs:

- REST for simple request/response CRUD.
- GraphQL when clients need flexible nested reads.
- gRPC for internal high-throughput service-to-service calls.
- WebSocket/SSE for live updates.
- Webhooks for external async notifications.
- Event streams or queues for async workflows.

For DBMS:

- PostgreSQL for relational core data and transactions.
- Redis for cache, presence, rate limits, queues, ephemeral state.
- S3/R2/MinIO for file attachments and exported assets.
- ElasticSearch/OpenSearch for search-heavy features.
- ClickHouse/BigQuery for analytics.
- MongoDB only when document-shaped data dominates and relational constraints are weak.

For missing things:

- Auth and authorization.
- Rate limiting.
- Background workers.
- Observability.
- Backups.
- Audit logs.
- Input validation.
- Idempotency keys.
- Disaster recovery.
- Load balancing.
- Schema migration strategy.

### Important Safety Rule

The AI should suggest. It should not automatically rewrite the board. Always show suggestions and let the user apply them.

## 15. Context Layer Feature

Every canvas object should be more than a drawing. It can carry context.

### Context Types

- Notes: long-form explanation.
- Links: docs, tickets, GitHub PRs, API references.
- Code snippets: SQL, TypeScript, config, curl, shell commands.
- File attachments: PDFs, screenshots, JSON, diagrams, logs.
- Decisions: why a design choice was made.
- TODOs: missing implementation work.

### UI

- Select an object.
- Right side panel opens.
- Tabs: `Notes`, `Links`, `Code`, `Files`, `Decisions`.
- Small badge on the object shows it has context.
- Search can find text inside context records.

### Storage

Use PostgreSQL for context records and attachment metadata.

Use object storage for files.

In Yjs, store only lightweight references:

```ts
type ObjectContextSummary = {
  objectId: string
  noteCount: number
  linkCount: number
  codeCount: number
  fileCount: number
  decisionCount: number
  updatedAt: number
}
```

Why not store everything in Yjs?

- Large notes and files make the collaborative document heavy.
- Context has different permissions and search requirements.
- Files need upload/download URLs and virus scanning in production.
- PostgreSQL is easier for filtering, search, audit, and backups.

## 16. Frontend Implementation Plan

### Phase 1: Single-User Canvas

Build:

- Canvas initialization.
- Toolbar: select, rectangle, text, arrow, sticky, pan.
- Object selection.
- Drag, resize, rotate.
- Zoom and pan.
- Export to JSON.
- Import from JSON.

Learn:

- Fabric canvas lifecycle.
- Fabric object model.
- Coordinates, scale, angle, bounding boxes.
- Serialization and custom properties.

### Phase 2: Yjs Collaboration

Build:

- Y.Doc schema.
- Fabric-to-Yjs binding.
- y-websocket provider.
- Remote object sync.
- Awareness cursors.
- Remote selection outlines.
- Undo/redo with Y.UndoManager.

Learn:

- CRDT basics.
- Y.Map, Y.Array, Y.Text.
- Yjs transactions and origins.
- Document updates.
- Awareness.
- y-websocket rooms and provider lifecycle.

### Phase 3: Context Layer

Build:

- Context side panel.
- CRUD APIs.
- File upload.
- Object badges.
- Search context records.

Learn:

- Express routing and middleware.
- PostgreSQL schema design.
- File uploads and object storage.
- Auth and permissions.

### Phase 4: Mess Cleanup

Build:

- Object classifier.
- Arrow endpoint detection.
- Graph builder.
- Layout preview.
- Apply as Yjs transaction.
- Undo.

Learn:

- Graph theory basics.
- Bounding boxes.
- Layout engines like ELK or Dagre.
- Edge routing.
- Spatial indexing.

### Phase 5: Architecture Assist

Build:

- Scene graph extractor.
- Backend AI endpoint.
- Strict JSON response validation.
- Suggestion panel.
- Apply suggested objects/notes.
- Store analysis history.

Learn:

- Prompt design.
- JSON schema validation.
- Background jobs.
- Rate limiting.
- AI safety and user approval.

### Phase 6: Redis And Scale

Build:

- Redis client.
- Rate limiting.
- Presence cache.
- AI job queue.
- Pub/sub between WebSocket nodes.
- Streams for update/compaction workers.
- Snapshot compaction lock.

Learn:

- Redis strings, hashes, sets, sorted sets.
- Pub/sub delivery limits.
- Streams and consumer groups.
- TTLs.
- Locks.
- Persistence and memory policies.

## 17. Backend Implementation Plan

### Express Server

Responsibilities:

- Auth.
- Board metadata.
- Permissions.
- Context layer.
- Attachments.
- AI assist.
- Cleanup preview if server-side.
- Health checks.

Basic middleware:

```ts
app.use(express.json({ limit: '2mb' }))
app.use(cors({ origin: process.env.WEB_ORIGIN, credentials: true }))
app.use(authMiddleware)
app.use('/api/boards', boardsRouter)
app.use('/api/context', contextRouter)
app.use('/api/attachments', attachmentsRouter)
app.use('/api/assist', assistRouter)
app.use(errorMiddleware)
```

### Collaboration Server

Options:

- Run `y-websocket` as a separate process for MVP.
- Embed a y-websocket compatible server beside Express if you need custom auth.
- Move to Redis-backed collaboration when scaling horizontally.

MVP local scripts:

```json
{
  "scripts": {
    "dev:web": "vite",
    "dev:api": "tsx src/server.ts",
    "dev:collab": "y-websocket --port 1234"
  }
}
```

## 18. Database Schema Sketch

```sql
CREATE TABLE users (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE teams (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE boards (
  id uuid PRIMARY KEY,
  team_id uuid NOT NULL REFERENCES teams(id),
  title text NOT NULL,
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE board_members (
  board_id uuid NOT NULL REFERENCES boards(id),
  user_id uuid NOT NULL REFERENCES users(id),
  role text NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  PRIMARY KEY (board_id, user_id)
);

CREATE TABLE board_context_items (
  id uuid PRIMARY KEY,
  board_id uuid NOT NULL REFERENCES boards(id),
  object_id text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('note', 'link', 'code', 'file', 'decision', 'todo')),
  title text,
  body text,
  url text,
  language text,
  code text,
  file_id uuid,
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE attachments (
  id uuid PRIMARY KEY,
  board_id uuid NOT NULL REFERENCES boards(id),
  object_key text NOT NULL,
  original_name text NOT NULL,
  content_type text NOT NULL,
  size_bytes bigint NOT NULL,
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE yjs_snapshots (
  board_id uuid PRIMARY KEY REFERENCES boards(id),
  snapshot_object_key text NOT NULL,
  state_vector bytea,
  update_count bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE architecture_assist_runs (
  id uuid PRIMARY KEY,
  board_id uuid NOT NULL REFERENCES boards(id),
  requested_by uuid NOT NULL REFERENCES users(id),
  status text NOT NULL CHECK (status IN ('queued', 'running', 'complete', 'failed')),
  input_summary jsonb,
  result jsonb,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
```

## 19. Redis Key Design

Use predictable prefixes.

```text
app:rate:user:{userId}:assist
app:presence:board:{boardId}
app:board:{boardId}:permissions-cache
app:jobs:assist
app:jobs:thumbnail
app:yjs:updates:{boardId}
app:yjs:compact-lock:{boardId}
app:ws:pubsub:board:{boardId}
```

Use TTL on anything temporary.

Examples:

- Presence: 30 to 90 seconds.
- Permission cache: 30 to 300 seconds.
- Rate-limit counters: match the rate window.
- Locks: short TTL and renewal if needed.

## 20. Security

You need security early because collaboration rooms are easy to leak.

### Auth

- Use secure HTTP-only cookies or bearer tokens.
- Check auth before returning board metadata.
- Check auth before WebSocket room join.
- Check role before accepting writes.

### Authorization

Roles:

- Owner: manage board, delete, invite.
- Editor: draw, edit context, run assist.
- Viewer: view only, maybe comment.

### WebSocket Security

- Never trust room IDs alone.
- Verify token on connection.
- Verify the user has access to the board.
- For viewer mode, prevent document writes if possible.
- Use `wss://` in production.

### AI Security

- Strip secrets from code snippets before sending to AI if possible.
- Ask user consent before including attachments.
- Do not send private files unless explicitly selected.
- Log what was sent for audit if your product needs enterprise trust.
- Validate AI JSON before rendering or applying it.

### File Security

- Enforce size limits.
- Restrict content types.
- Virus scan in production.
- Store outside your app server filesystem.
- Use short-lived signed URLs.

## 21. Testing Strategy

### Unit Tests

- Fabric object serialization.
- Yjs record conversion.
- Layout classifier.
- Arrow endpoint detection.
- Scene graph extraction.
- API validators.

### Collaboration Tests

- Two Y.Docs converge after concurrent edits.
- Duplicate updates do not break state.
- Offline edit syncs when online.
- Undo does not remove remote changes.
- Remote delete removes Fabric object.

### End-to-End Tests

- User A draws, User B sees it.
- User A edits text, User B sees it.
- Remote cursors appear.
- Mess cleanup preview appears and apply syncs.
- Context note attaches to object.
- Architecture assist returns suggestions.

### Load Tests

- Many users in one board.
- Many boards active at once.
- Large board with thousands of objects.
- AI assist queue under burst.
- Redis pub/sub or stream throughput.

## 22. Production Deployment

### MVP Deployment

```text
Frontend: Vercel/Netlify/static hosting
API: Node/Express service
Collab: y-websocket service
DB: PostgreSQL
Redis: managed Redis
Files: S3/R2/MinIO
Reverse proxy: Nginx/Caddy/Cloudflare
```

### Production Concerns

- Sticky sessions may be needed if your WebSocket server stores room state in memory.
- If you have multiple WebSocket nodes, use Redis or a y-websocket compatible distributed backend.
- Use health checks for API and WebSocket services.
- Use structured logs with board ID and request ID.
- Add metrics for active rooms, active users, updates/sec, update size, Redis memory, queue depth, and AI latency.
- Back up PostgreSQL and object storage.
- Do not rely on Redis alone for permanent documents.

## 23. Learning Roadmap

### JavaScript And TypeScript

Learn:

- Async/await.
- Modules.
- Type narrowing.
- Generics.
- Discriminated unions.
- Event emitters.
- Binary data: `Uint8Array`, `ArrayBuffer`, `Buffer`.

### React

Learn:

- `useRef` for Fabric canvas instance.
- `useEffect` and cleanup.
- Component boundaries.
- Avoid storing Fabric objects in React state.
- External system synchronization.

### Fabric.js

Learn:

- Canvas initialization.
- Object creation.
- Selection and controls.
- Events.
- Serialization.
- Custom properties.
- Groups and active selection.
- Zoom/pan.
- Custom arrows.
- Performance and rendering lifecycle.

Use `fabric-js.md` in this folder as the full course.

### Yjs

Learn:

- CRDT mental model.
- `Y.Doc`.
- `Y.Map`, `Y.Array`, `Y.Text`.
- Transactions and origins.
- Updates and state vectors.
- Awareness.
- Undo manager.
- Persistence.
- Offline support.

Use `yjs.md` in this folder as the full course.

### y-websocket

Learn:

- Room names.
- Provider lifecycle.
- Status events.
- Awareness.
- Server setup.
- Auth options.
- Persistence.
- Deployment and scaling.

Use `y-websocket.md` in this folder as the full course.

### Redis

Learn:

- Strings, hashes, sets, sorted sets.
- TTL and expiry.
- Pub/sub.
- Streams.
- Consumer groups.
- Locks.
- Rate limits.
- Persistence.
- Memory policies.
- Redis with Node.js.

Use `redis.md` in this folder as the Redis course for this app.

### System Design

Learn:

- WebSocket scaling.
- Event-driven workers.
- Durable vs ephemeral state.
- Database indexing.
- File storage.
- Rate limiting.
- Observability.
- Backups.

### AI Engineering

Learn:

- Scene graph extraction.
- Prompting with structured data.
- JSON schema validation.
- Retrieval from context notes.
- Human approval workflows.
- Cost and rate limiting.

## 24. MVP Build Order

Build in this order:

1. Single-user canvas with Fabric.js.
2. Save/load board JSON locally.
3. Yjs document schema.
4. Fabric/Yjs binding.
5. y-websocket collaboration.
6. Awareness cursors and remote selections.
7. Express board metadata APIs.
8. PostgreSQL users/boards/permissions.
9. Context side panel.
10. Attachment upload.
11. Basic mess cleanup with Dagre or ELK.
12. Architecture assist scene graph and JSON result.
13. Redis rate limits and queues.
14. Redis pub/sub or streams for scale.
15. Snapshot compaction.

## 25. Common Mistakes

- Storing Fabric objects directly in React state.
- Storing Fabric class instances in Yjs.
- Syncing cursor movement into the durable Yjs document instead of awareness.
- Sending every pointer movement as a full object update.
- Keeping large files inside Yjs.
- Treating Redis as the permanent database.
- Building raw WebSocket sync before understanding Yjs updates.
- Letting AI directly mutate the board without user approval.
- Applying cleanup without preview or undo.
- Forgetting auth checks on WebSocket room join.

## 26. Source Links Checked

- Fabric.js docs: https://fabricjs.com/docs/why-fabric/
- Fabric.js core concepts: https://fabricjs.com/docs/core-concepts/
- Yjs introduction: https://docs.yjs.dev/
- Yjs document updates: https://docs.yjs.dev/api/document-updates
- Yjs awareness: https://docs.yjs.dev/api/about-awareness
- y-websocket docs: https://docs.yjs.dev/ecosystem/connection-provider/y-websocket
- Yjs offline support: https://docs.yjs.dev/getting-started/allowing-offline-editing
- y/hub Redis-backed Yjs backend: https://github.com/yjs/yhub
- Redis Pub/Sub docs: https://redis.io/docs/latest/develop/pubsub/
- Redis Streams docs: https://redis.io/docs/latest/develop/data-types/streams/
- Redis persistence docs: https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/
- Redis Node.js guide: https://redis.io/tutorials/develop/node/gettingstarted/
- Express routing docs: https://expressjs.com/en/guide/routing.html
- Express middleware docs: https://expressjs.com/en/guide/using-middleware.html
- React `useEffect` docs: https://react.dev/reference/react/useEffect

## 27. Final Architecture Recommendation

Start simple:

```text
React + Fabric.js + Yjs + y-websocket
Node/Express REST API
PostgreSQL for durable app data
S3/R2/MinIO for files
Redis for rate limits, jobs, pub/sub, streams, presence cache
AI service behind backend for Architecture Assist
ELK/Dagre for Mess Cleanup layout
```

Then scale only the parts that hurt:

- If board loading is slow, add Yjs snapshot compaction.
- If WebSocket nodes cannot scale, add Redis pub/sub or a Redis-backed Yjs server pattern.
- If AI is slow or costly, queue jobs in Redis and cache results.
- If context search grows, add full-text search in PostgreSQL first, then OpenSearch later.

This gives you a realistic path from student MVP to serious collaborative product.

## 28. FastAPI vs Node: The Backend Decision (Direct Answer)

You asked whether to move the backend from FastAPI to Node, whether that is a mistake, and what else to change. Short answer: **for the realtime collaboration core, move to Node. It is the right call, not a mistake — Node is genuinely the correct tool for this specific product, independent of the fact that you already know it.**

Here is the reasoning, and the nuance, so you make the decision with your eyes open.

### 28.1 Why Node wins here (the one fact that decides it)

The decision is not "Node vs Python" in the abstract. It is decided by **Yjs**, which is the heart of this app.

The entire mature, production-grade Yjs server ecosystem is JavaScript/Node:

- `y-websocket` — the reference collaboration server.
- **Hocuspocus** — the production collaboration server (auth hooks, persistence hooks, scaling, webhooks). This is what you actually want in v1.
- `y-redis` / `yhub` — the Redis-backed scaling layer.
- All the binding, awareness, and update-encoding logic is written and battle-tested in JS.

Yjs updates are **binary CRDT updates**, not JSON. To serve them from Python you have two options, both worse:

1. Use `pycrdt` / `ypy` (Python bindings to the Rust Yjs core). It works and is improving, but the community, examples, docs, and StackOverflow answers are a fraction of the JS side. When you hit a weird sync/awareness bug at 1am, you will be alone.
2. Run a **separate Node collaboration process anyway** and keep FastAPI only for REST. Now you are running two runtimes, two deploy pipelines, and two dependency trees — for a solo/student project that is a real tax.

So: the realtime server **should be Node** (specifically Hocuspocus). Given that, making the REST API Node too means **one language, one repo, one `package.json`, and shared TypeScript types between frontend and backend** — which for a Fabric.js/Yjs app is a large, ongoing productivity win. Your `SceneObject` type, your context-layer schema, your AI request/response shapes: define once, import in both.

### 28.2 The one legitimate reason to keep some Python

There is exactly one place Python still has a real edge: **the AI layer.** If your `Architecture Assist` grows into anything heavy — embeddings, vector search, LangChain/LlamaIndex pipelines, custom model calls, PDF/file parsing — Python's ecosystem is richer and you may prefer it.

That gives two valid architectures:

| Option | Shape | When to pick |
|---|---|---|
| **A. All Node (recommended)** | Hocuspocus + Express/Fastify REST + AI called from Node via the provider SDK | You know Node, want one language, AI is "call an API and render JSON." This is you today. |
| **B. Node core + thin FastAPI AI service** | Hocuspocus + Node REST, plus a small FastAPI microservice for AI only, called server-to-server | Only if/when the AI work becomes genuinely Python-shaped (RAG, embeddings, model orchestration). |

Do **not** start with Option B. Start with **Option A**. If the AI service later demands Python, carve out *just that one microservice* — the collaboration and REST layers stay Node regardless. Migrating one stateless AI endpoint later is cheap; migrating the collaboration core is not.

**Verdict: switch the backend to Node now. Keep FastAPI in your back pocket for a possible future AI-only microservice, nothing more.**

### 28.3 Was starting on FastAPI a mistake?

No. FastAPI is excellent and nothing you learned is wasted (async, dependency injection, Pydantic validation, OpenAPI — all concepts transfer). The mistake would only be *insisting* on Python for the Yjs collaboration server, because that fights the ecosystem. You caught it early, before writing the hard realtime code. That is the good time to switch.

### 28.4 Other things to reconsider (mistakes worth fixing now, not just the language)

Switching runtimes is the headline, but a few other choices in this doc deserve a second look before you build:

1. **Use Hocuspocus, not raw `y-websocket`, for v1.** The reference `y-websocket` server has essentially no auth — anyone who knows a room name can join. Hocuspocus gives you an `onAuthenticate` hook (validate a JWT before the socket joins a board), `onLoadDocument` / `onStoreDocument` persistence hooks, and a Redis extension for scaling. It is the single biggest upgrade over the doc's default and it is still pure Node. Sections 3 and 27 above should be read as "y-websocket to *understand* the protocol, Hocuspocus to *ship*."

2. **Yjs is the source of truth, Fabric.js is only a renderer.** The most common way people wreck a Fabric+Yjs app is treating *both* as authoritative and creating a feedback loop (Fabric fires an event → write to Yjs → Yjs observes → update Fabric → Fabric fires an event → ...). Enforce one direction: user interaction and remote updates both write to the `Y.Doc`; a single observer renders the `Y.Doc` into Fabric. Guard the observer against echoing its own writes. Budget real time for `yFabricBinding.ts` — it is the hardest file in the project.

3. **Never let Redis be your durable store for user work.** The doc already says this (Section 5's snapshot store); just hold the line. Board content lives in Postgres (compacted Yjs snapshots + update log) and object storage. Redis is pub/sub, presence, queues, rate limits, locks — all disposable.

4. **Keep AI provider keys server-side only, and make AI async.** Never call the model from the browser. Return structured JSON from the model (a scene-graph diff, not prose) so you can render suggestions back onto the canvas, and run it as a queued job (Redis) with cached results — `Architecture Assist` is slow and costly to call synchronously.

5. **Pick Fastify over Express if you want, but don't agonize.** Fastify is faster and has first-class TypeScript/schema support; Express is more tutorials. Either is fine — this is not a decision worth a day of research. Default to whichever you'll move faster in.

6. **One monorepo with a shared `types/` package.** This is the payoff of going all-Node — put shared TS types in `packages/shared` and import them in `frontend/` and `backend/`. Don't split into separate repos yet.

### 28.5 Concrete next step

Restack the backend to:

```text
Runtime:        Node + TypeScript (drop FastAPI for now)
Realtime:       Hocuspocus (Yjs), auth via onAuthenticate JWT hook
REST API:       Fastify (or Express) — auth, boards, context layer, file upload
DB:             PostgreSQL (durable app data + compacted Yjs snapshots)
Files:          S3 / R2 / MinIO
Redis:          pub/sub, presence, job queue, rate limits, locks
AI:             called from Node, structured-JSON output, queued + cached
                (carve out a FastAPI micro-service ONLY if AI later needs Python)
Repo:           monorepo with a shared TS types package
```

Everything else in this document (Fabric.js, Yjs, y-indexeddb, the scaling path, Mess Cleanup via ELK/Dagre, the Architecture Assist flow) stays exactly as written — none of it depended on the backend being Python.
