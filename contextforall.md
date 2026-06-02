# WBCT Members Platform — AI Context

> **Purpose**: Single source of truth for any AI assistant (Claude, Gemini, opencode, Cursor, Copilot, etc.) to understand the project quickly and produce consistent code.
>
> **Stack**: Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · NextAuth v5 · **Appwrite** via `node-appwrite` SDK (primary, all routes) · TipTap · Resend
>
> **Database mode**: **Appwrite-only**. The `node-appwrite` SDK powers all 39 API routes via `src/lib/appwrite.js`. MySQL and Prisma have been fully removed. There is no `DATABASE_URL` env var.
>
> **Language**: UI and copy are in **English** (pt-BR strings have been fully translated). Comments and identifiers are in **English**. Public URLs use English slugs (`/admin`, `/member`, `/blog`, `/events`, `/courses`, `/directory`, `/posts`, `/profile`) with legacy Portuguese URLs preserved as `307` redirects via `next.config.js`. Database content (e.g. user names, bios, post bodies) is rendered as-is.

---

## 1. Project Identity

- **Name**: WBCT Members Platform
- **Domain**: Exclusive medical community for Brazilian doctors
- **Path**: `/Users/constantino/Desktop/CLIENTES/PROGRAMACAO/CRIATIVA DIGITAL/WBCT/PROJETO-TESTE-02`
- **Two protected areas** (English slugs in the URL, Portuguese folders on disk):
  - `/admin` — requires `role = ADMIN` (folder: `src/app/admin/`)
  - `/member` — requires `status = APPROVED` (any role) (folder: `src/app/membro/`)
- **User lifecycle**: `register → PENDING → admin approves → APPROVED → can login`
- **Git remotes**:
  - `origin` → `https://github.com/JVConstantino/WBCT-SISTEMA-NOVO.git` (primary, used by Easy Panel)
  - `wbct-members` → `https://github.com/JVConstantino/wbct-members.git` (mirror)
  - Active branch: `building`

---

## 2. Quick Start (for any AI)

```bash
# Install
npm install

# Configure env
cp .env.example .env
# Edit AUTH_SECRET and Appwrite vars (no DATABASE_URL needed)

# Dev
npm run dev          # http://localhost:3000 (or next free port)
```

> **No database setup scripts needed** — Appwrite collections are managed in the Appwrite console at `database.wbctmember.org`.

---

## 3. Tech Stack (pinned)

| Layer | Package | Version | Purpose |
|---|---|---|---|
| Framework | `next` | 16.1.3 | App Router, SSR, API Routes |
| UI | `react` / `react-dom` | 19.2.3 | Components |
| Auth | `next-auth` | 5.0.0-beta.30 | JWT + Credentials |
| DB SDK | `node-appwrite` | 16.0.0 | Appwrite SDK — PRIMARY (all 39 routes) |
| Hashing | `bcryptjs` | 3.0.3 | Passwords |
| Styles | `tailwindcss` | 4.1.18 | Utility-first + custom CSS vars |
| Typography | `@tailwindcss/typography` | 0.5.19 | Prose styling |
| Icons | `lucide-react` | 0.562.0 | All icons |
| Charts | `recharts` | 3.6.0 | Area, Bar, Pie, Line |
| Animation | `framer-motion` | 12.27.1 | Layouts, transitions |
| Editor | `@tiptap/*` | 3.15–3.16 | Rich text for posts |
| Dates | `date-fns` | 4.1.0 | Formatting, calculations |
| Email | `resend` | 6.12.4 | Transactional email |
| Class utils | `clsx` / `tailwind-merge` | 2.1.1 / 3.4.0 | `cn()` helper |

> **Removed**: `mysql2`, `@prisma/client`, `prisma` — fully replaced by `node-appwrite`.

---

## 4. Repository Structure

```
PROJETO-TESTE-02/
├── .nixpacks.toml                  # Pins Node 20 + npm 10 for Easy Panel
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.js               # Root layout (Providers, fonts, metadata)
│   │   ├── page.js                 # → redirect /login
│   │   ├── globals.css             # Design tokens, Tailwind, animations
│   │   ├── login/page.js           # Login + 2-step register
│   │   ├── registro/page.js        # Alternative register page (duplicate)
│   │   ├── politica-de-privacidade/page.js
│   │   ├── termos-de-uso/page.js
│   │   │
│   │   ├── admin/                  # Admin backoffice
│   │   │   ├── layout.js           # Sidebar + Header (forces light theme)
│   │   │   ├── page.js             # Dashboard (stats + charts)
│   │   │   ├── error.js / loading.js
│   │   │   ├── membros/            # CRUD members + approve  (URL: /admin/members)
│   │   │   ├── postagens/          # Moderation               (URL: /admin/posts)
│   │   │   ├── analytics/          # Advanced charts          (URL: /admin/analytics)
│   │   │   ├── eventos/            # Calendar + management    (URL: /admin/events)
│   │   │   ├── webinars/           # Course catalog           (URL: /admin/courses)
│   │   │   ├── chat/               # Admin messages           (URL: /admin/chat)
│   │   │   ├── docs/               # Internal docs            (URL: /admin/docs)
│   │   │   ├── perfil/             # Admin profile            (URL: /admin/profile)
│   │   │   └── configuracoes/email/(URL: /admin/settings/email)
│   │   │
│   │   ├── membro/                 # Member portal (URLs under /member/...)
│   │   │   ├── layout.js           # Sidebar + Header
│   │   │   ├── page.js             # Feed                    (URL: /member)
│   │   │   ├── blog/               # Articles HUB            (URL: /member/blog)
│   │   │   ├── criar/              # New post (TipTap)       (URL: /member/create)
│   │   │   ├── minhas-postagens/   # User's own posts        (URL: /member/my-posts)
│   │   │   ├── postagens/[id]/     # Read post + comments    (URL: /member/posts/[id])
│   │   │   ├── editar/post/[id]/   # Edit post               (URL: /member/edit/post/[id])
│   │   │   ├── diretorio/          # Doctor directory        (URL: /member/directory)
│   │   │   ├── medico/[id]/        # Public doctor profile   (URL: /member/doctor/[id])
│   │   │   ├── eventos/            # Calendar view           (URL: /member/events)
│   │   │   ├── webinars/ + [id]/   # Courses + lessons       (URL: /member/courses, /member/courses/[id])
│   │   │   ├── chat/               # Private messages        (URL: /member/chat)
│   │   │   └── perfil/             # Member profile          (URL: /member/profile)
│   │   │
│   │   └── api/                    # 39 API Routes (all use Appwrite via appwrite.js)
│   │
│   ├── components/
│   │   ├── Providers.js            # SessionProvider + UserProvider
│   │   ├── NotificationDropdown.js # Bell + 30s polling
│   │   ├── StatsCard.js            # Metric card
│   │   ├── TextEditor.js           # TipTap wrapper
│   │   ├── CookieConsent.js        # LGPD banner
│   │   └── ui/                     # Design system primitives
│   │       ├── index.js            # Central re-export
│   │       ├── Avatar.js
│   │       ├── Badge.js
│   │       ├── Button.js
│   │       ├── Card.js
│   │       ├── EmptyState.js
│   │       ├── Input.js
│   │       ├── Modal.js
│   │       ├── PageHeader.js
│   │       ├── Skeleton.js         # + Spinner
│   │       └── Table.js
│   │
│   ├── contexts/
│   │   └── UserContext.js          # useUser() + updateUser() + refreshUser()
│   │
│   ├── lib/
│   │   ├── auth.js                 # NextAuth v5 config (Credentials, JWT, callbacks)
│   │   ├── appwrite.js             # node-appwrite SDK client + COLS map + listAll helper
│   │   ├── user-store.js           # Auth: Appwrite-only (getUserByEmail, createPendingUser, etc.)
│   │   └── email.js                # Resend wrapper (env + AppSetting fallback via Appwrite)
│   │
│   ├── hooks/
│   ├── styles/
│   ├── utils/                      # cn() and helpers
│   └── middleware.js               # Route protection
│
├── public/
│   ├── uploads/                    # Files from /api/upload
│   └── manifest.json               # PWA manifest
│
├── scripts/                        # Migration utilities (legacy, MySQL→Appwrite)
│   ├── provision-appwrite-from-mysql.mjs
│   └── migrate-mysql-to-appwrite.mjs
│
├── docs/
├── .env / .env.example             # AUTH_SECRET, Appwrite vars (no DATABASE_URL)
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── jsconfig.json                   # Path aliases (@/*)
└── package.json                    # engines.node >=20.19.0
```

---

## 5. Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `AUTH_SECRET` | **Yes** | — | 32+ random chars, signs JWTs |
| `AUTH_URL` | **Yes** (local dev) | — | Must match the server port, e.g. `http://localhost:3000` |
| `AUTH_TRUST_HOST` | No | `false` | `true` for non-Vercel deployments |
| `APPWRITE_ENDPOINT` | **Yes** | — | e.g. `https://database.wbctmember.org/v1` |
| `APPWRITE_PROJECT_ID` | **Yes** | — | Appwrite project id |
| `APPWRITE_API_KEY` | **Yes** | — | **Server API key — NEVER commit, rotate if exposed** |
| `APPWRITE_DATABASE_ID` | **Yes** | — | Database id (e.g. `staging`) |
| `RESEND_API_KEY` | No | — | Email (also stored in `app_settings` Appwrite collection) |
| `RESEND_FROM_EMAIL` | No | — | Default sender |
| `RESEND_FROM_NAME` | No | `WBCT` | Default sender name |

> **⚠️ AUTH_URL must match the port**: if server runs on 3000, set `AUTH_URL=http://localhost:3000`. Mismatch causes `ClientFetchError: NetworkError` in the browser.
>
> **No DATABASE_URL**: MySQL has been fully removed.
>
> **Security**: Appwrite API key has full read/write. Never commit. Rotate if exposed.

---

## 6. Authentication & Authorization

### Flow (`src/lib/auth.js`)
```
1. POST /login → signIn("credentials")
2. authorize() in src/lib/auth.js:
   - getUserByEmail from user-store (Appwrite-only)
   - If status === PENDING  → throw "PENDING"
   - If status === REJECTED → throw "REJECTED"
   - bcrypt.compare(password, user.password)
   - createLoginActivity (Appwrite)
   - updateLastActiveAt (Appwrite)
   - Return { id, name, email, image, role }
3. JWT callback: token.role, token.id, token.image
4. Session callback: session.user.role, session.user.id, session.user.image
5. Redirect: ADMIN → /admin | MEMBER → /membro
```

### Route Protection (`src/middleware.js`)
```js
// matcher excludes: /api, /_next/static, /_next/image, /favicon.ico
/admin/*   → require session + role === "ADMIN"  (else → /member)
/member/*  → require session                     (else → /login)
/membro/*  → alias of /member/* (legacy path, still protected)
/login     → if logged in, redirect to dashboard
```

### English URL Routes
`next.config.js` exposes the app under English slugs while keeping the App-Router folders in Portuguese (single source of truth):

- `redirects()` map legacy Portuguese URLs to English ones with `307`:
  `/membro → /member`, `/membro/blog → /member/blog`, `/membro/diretorio → /member/directory`, `/membro/medico/[id] → /member/doctor/[id]`, `/membro/postagens/[id] → /member/posts/[id]`, `/membro/criar → /member/create`, `/membro/editar/post/[id] → /member/edit/post/[id]`, `/membro/perfil → /member/profile`, `/membro/eventos → /member/events`, `/membro/chat → /member/chat`, `/admin/membros → /admin/members`, etc.
- `rewrites()` map English URLs back to the physical Portuguese folders internally (so existing imports keep working).
- API paths (e.g. `/api/membro/posts`) are unchanged.

### API Guard Pattern
```js
import { auth } from "@/lib/auth";

export async function GET() {
    const session = await auth();
    if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "ADMIN") return Response.json({ error: "Forbidden" }, { status: 403 });
    // ... logic
}
```

---

## 7. Database — Appwrite

### Client (`src/lib/appwrite.js`)
```js
import { db, DB_ID, COLS, ID, Query, listAll } from "@/lib/appwrite";

// List with filters
const res = await db.listDocuments(DB_ID, COLS.posts, [
    Query.equal("status", "APPROVED"),
    Query.orderDesc("createdAt"),
    Query.limit(100),
]);
const posts = res.documents;  // each doc has $id, $createdAt, $updatedAt + custom fields

// Get by ID
const post = await db.getDocument(DB_ID, COLS.posts, id);

// Create
await db.createDocument(DB_ID, COLS.posts, "post_abc123", { title, content, ... });

// Update
await db.updateDocument(DB_ID, COLS.posts, id, { title, updatedAt: new Date().toISOString() });

// Delete
await db.deleteDocument(DB_ID, COLS.posts, id);

// Fetch all pages (pagination helper)
const allDocs = await listAll(COLS.users, [Query.equal("status", "PENDING")]);
```

### Collections Map (`COLS`)
```js
COLS = {
  users: "users",
  posts: "posts",
  comments: "comments",
  events: "events",
  webinars: "webinars",
  courses: "courses",
  lessons: "lessons",
  lessonAttachments: "lesson_attachments",
  lessonProgress: "lesson_progress",
  messages: "messages",
  notifications: "notifications",
  userActivities: "user_activities",
  follows: "follows",
  userEvents: "user_events",
  connections: "connections",
  consentLog: "consent_log",
  appSettings: "app_settings",
  eventParticipants: "event_participant_status",
}
```

### Composite ID Conventions
Appwrite requires unique document IDs. For relations that had composite PKs in MySQL:

| Relation | Document ID pattern |
|---|---|
| Follows (followerId, followingId) | `flw_{followerId}_{followingId}` |
| UserEvents (eventId, userId) | `ue_{eventId}_{userId}` |
| EventParticipantStatus (eventId, userId) | `eps_{eventId}_{userId}` |
| LessonProgress (userId, lessonId) | `prog_{userId}_{lessonId}` |
| Connections (requesterId, receiverId) | `conn_{requesterId}_{receiverId}` |

### JOINs → Application-level
Appwrite has no SQL JOINs. Pattern used across routes:
```js
// Fetch primary docs
const posts = (await db.listDocuments(DB_ID, COLS.posts, [...])).documents;

// Fetch related docs in parallel
const authorIds = [...new Set(posts.map(p => p.authorId))];
const authorMap = {};
await Promise.all(authorIds.map(async id => {
    const u = await db.getDocument(DB_ID, COLS.users, id);
    authorMap[id] = { name: u.name, email: u.email };
}));
```

### Collections Schema (key fields)

#### `users`
`$id` · `name` · `email` · `password` (bcrypt) · `image` · `bio` · `crm` · `specialty` · `role` (ADMIN|MEMBER) · `status` (PENDING|APPROVED|REJECTED) · `allowMessagesFrom` · `lastActiveAt` · `createdAt` · `updatedAt`

#### `posts`
`$id` · `title` · `content` (HTML) · `image` · `status` (PENDING|APPROVED) · `views` · `authorId` · `createdAt` · `updatedAt`

#### `comments`
`$id` · `content` · `postId` · `authorId` · `parentId` (nullable) · `createdAt`

#### `events`
`$id` · `title` · `description` · `date` · `color` · `link` · `createdAt` · `updatedAt`

#### `webinars`
`$id` · `title` · `description` · `videoUrl` · `order` · `createdAt` · `updatedAt`

#### `courses` → `lessons` → `lesson_attachments`
- `lessons`: `title` · `description` · `videoUrl` · `order` · `courseId`
- `lesson_attachments`: `title` · `url` · `type` · `lessonId`

#### `lesson_progress`
`$id` = `prog_{userId}_{lessonId}` · `userId` · `lessonId` · `completed` · `completedAt` · `updatedAt`

#### `follows`
`$id` = `flw_{followerId}_{followingId}` · `followerId` · `followingId` · `createdAt`

#### `messages`
`$id` · `senderId` · `receiverId` · `content` · `createdAt`

#### `notifications`
`$id` · `userId` · `type` (MESSAGE|POST_APPROVED|POST_REJECTED) · `content` · `relatedId` · `isRead` · `createdAt`

#### `user_activities`
`$id` = `login_{userId8}_{ts36}` · `userId` · `type` (LOGIN) · `createdAt`

#### `connections`
`$id` = `conn_{requesterId}_{receiverId}` · `requesterId` · `receiverId` · `status` (PENDING|ACCEPTED) · `createdAt`

#### `user_events`
`$id` = `ue_{eventId}_{userId}` · `eventId` · `userId` · `createdAt`

#### `event_participant_status`
`$id` = `eps_{eventId}_{userId}` · `eventId` · `userId` · `status` (PENDING|CONFIRMED|REJECTED) · `updatedAt`

#### `app_settings`
`$id` = setting key (e.g. `email.resendApiKey`) · `settingKey` · `settingValue` · `updatedAt`

#### `consent_log`
`$id` · `userId` · `ip` · `mode` · `preferencesJson` · `createdAt`

---

## 8. Design System (Quick Reference)

### Color Tokens (CSS vars, in `globals.css`)
```css
--color-brand-primary:        #2563eb  /* Blue-600 */
--color-brand-primary-hover:  #1d4ed8
--color-brand-primary-active: #1e40af
--color-brand-primary-light:  #dbeafe
--color-brand-strong:         #0f172a  /* Slate-900 */
--color-accent:               #0284c7  /* Sky-600 */

--color-status-success:       #059669  bg: #ecfdf5
--color-status-warning:       #d97706  bg: #fffbeb
--color-status-error:         #dc2626  bg: #fef2f2
--color-status-info:          #2563eb  bg: #eff6ff
--color-status-pending:       #9333ea  bg: #faf5ff

--surface-page:               #f8fafc / #0a0f1e
--surface-card:               #ffffff / #0f172a
--surface-sidebar:            #ffffff / #080d1a
--surface-header:             #ffffffdd / #0a0f1edd
--surface-subtle:             #f1f5f9 / #1e293b
```

### Typography
- **Display**: Outfit (400–800) → headings
- **Body**: Inter (400–700) → base

### Border Radius
`xs=2px · sm=4px · md=6px · lg=8px · xl=12px · full=9999px`

### UI Primitives Cheatsheet
```jsx
import { Avatar, Badge, PostStatusBadge, RoleBadge, Button, Card, EmptyState, Input, Textarea, Select, Modal, PageHeader, Skeleton, Spinner, Table } from "@/components/ui";
```

---

## 9. API Routes (39, all Appwrite via `appwrite.js`)

### Auth
| Method | Route | Auth | Purpose |
|---|---|---|---|
| * | `/api/auth/[...nextauth]` | — | NextAuth handler |
| POST | `/api/auth/register` | Public | Create user (PENDING) via `user-store.js` |
| POST | `/api/auth/verify` | Public | Validate creds + log activity via `user-store.js` |

### Users
| Method | Route | Auth | Purpose |
|---|---|---|---|
| PUT | `/api/users/profile` | Logged | Update own profile |
| DELETE | `/api/users/profile` | Logged | Delete account (cascades all collections) |
| GET | `/api/users/profile/[id]` | Self | Full profile |
| GET | `/api/users/public/[id]` | Logged | Public profile + isFollowing |
| GET | `/api/users/directory` | Logged | Doctor directory + postCount |
| GET/POST | `/api/users/follow` | Logged | Check / toggle follow |
| GET | `/api/users/contacts` | Logged | Message contacts + followed users |
| GET | `/api/users/connections` | Logged | Accepted connections |
| POST | `/api/users/connect` | Logged | Send / cancel connection request |
| GET | `/api/users/connect/requests` | Logged | Pending connection requests |
| POST | `/api/users/connect/respond` | Logged | Accept / reject connection |
| GET | `/api/users/profile/export` | Self | GDPR export (all user data) |

### Members (Admin)
`/api/members` — GET list (search in JS) · POST create · PUT update (bulk) · DELETE

### Posts
`/api/posts` GET·POST·PATCH (moderate)·DELETE · `/api/posts/[id]` GET (inc. views + comments)·PATCH · `/api/posts/[id]/comments` POST · `/api/comments/[id]` DELETE · `/api/membro/posts` GET (own posts + commentCount)

### Events
`/api/events` GET (filter `?month=`)·POST·PATCH·DELETE · `/api/events/me` GET (user's events + status) · `/api/events/[id]/follow` POST toggle · `/api/admin/events/[id]/participants` GET·PATCH

### Courses & Lessons
`/api/courses` GET·POST · `/api/courses/[id]` PATCH·DELETE · `/api/courses/[id]/lessons` GET·POST · `/api/lessons/[id]` PATCH·DELETE · `/api/lessons/[id]/progress` GET·POST

### Webinars
`/api/webinars` GET·POST·PATCH·DELETE

### Messages
`/api/messages` POST (creates Notification) · `/api/messages/[userId]` GET thread · `/api/admin/chat/contacts` GET

### Notifications, Activity & Consent
`/api/notifications` GET·PUT (mark read) · `/api/activity` POST (presence ping)·GET (online count) · `/api/consent` POST

### Upload & Stats
`/api/upload` POST (image/PDF, max 5MB) · `/api/admin/stats` GET dashboard · `/api/admin/settings/email` GET·POST

---

## 10. Conventions & Patterns

### Path Aliases (`jsconfig.json`)
```js
@/components/*  @/lib/*  @/contexts/*  @/hooks/*  @/utils/*  @/styles/*
```

### Appwrite Document Access
```js
// Document ID is $id (not id)
doc.$id       // document ID
doc.$createdAt  // system creation timestamp (ISO string)
doc.$updatedAt  // system update timestamp

// Custom fields are direct properties
doc.title, doc.status, doc.authorId, ...

// Always map $id → id when returning to client
return { id: doc.$id, ...doc }
```

### API Response Shape
```js
{ success: boolean, ... }   // all routes
Response.json({ success: true, posts })
```

### Upsert Pattern (for documents with deterministic IDs)
```js
try {
    await db.updateDocument(DB_ID, col, docId, data);
} catch {
    await db.createDocument(DB_ID, col, docId, data);
}
```

### IDs
- Users: `user_${Date.now().toString(36)}`
- Posts: `post_${Date.now().toString(36)}`
- Activities: `login_${userId8}_${ts36}`
- Composite relations: see §7 Composite ID Conventions

### Naming
- **Files**: `PascalCase.js` for components, `kebab-case.js` for routes, `camelCase.js` for lib
- **Variables**: `camelCase` (English), **UI strings**: `pt-BR`
- **Status**: UPPERCASE strings (`PENDING`, `APPROVED`, `REJECTED`)
- **Role**: UPPERCASE strings (`ADMIN`, `MEMBER`)

### What NOT to do
- ❌ Don't import `mysql2`, `@prisma/client`, or `src/lib/db.js` — they don't exist
- ❌ Don't use raw SQL — use `db.listDocuments`, `db.getDocument`, etc.
- ❌ Don't add comments to code (project convention)
- ❌ Don't use emojis in files
- ❌ Don't add new dependencies without checking `package.json` first
- ❌ Don't paste the Appwrite API key in chat/commits — rotate immediately if exposed

---

## 11. Branching & Deployment

```
building  ──► release/*  ──► main
            (pre-prod)    (prod)
```

- **Work and validation** in `building`
- **Merge** `building → main` only after validation

### Easy Panel deploy
- Webhook trigger: `POST http://<host>:3000/api/deploy/<token>`
- Build provider: **Nixpacks** (`.nixpacks.toml` pins Node 20 + npm 10)
- Required env vars in Easy Panel: `AUTH_SECRET`, `AUTH_URL` (production domain), `AUTH_TRUST_HOST=true`, all `APPWRITE_*` vars

### Production Build
```bash
npm run build
npm run start
```

### Troubleshooting
- `.next/dev/lock` → kill previous `next dev`
- Port conflict → use different PORT or kill existing process
- `ClientFetchError: NetworkError` → `AUTH_URL` in `.env` doesn't match the server port; update it and clear browser cookies
- Stale `authjs.callback-url` cookie → clear all browser cookies for localhost in DevTools → Application → Cookies
- Node version < 20 → already fixed in `.nixpacks.toml` with `NODE_VERSION = "20"`

---

## 12. Appwrite Instance Notes

- **Endpoint**: `https://database.wbctmember.org/v1`
- **Database ID**: `staging`
- **SDK**: `node-appwrite` v16.0.0
- **All 18 collections** are provisioned and contain migrated data from the original MySQL database

### Query Patterns That Work
```js
Query.equal("field", "value")     // exact match
Query.equal("field", ["v1","v2"]) // IN query
Query.orderDesc("createdAt")
Query.orderAsc("name")
Query.limit(100)
Query.greaterThanEqual("createdAt", isoString)
Query.lessThan("date", isoString)
Query.cursorAfter(lastDocId)       // pagination
```

### Pagination with listAll
For routes that need all records (stats, exports, cascades):
```js
import { listAll } from "@/lib/appwrite";
const allUsers = await listAll(COLS.users, [Query.equal("status", "PENDING")]);
// listAll handles cursor pagination automatically, returns flat array
```

---

## 13. Common Tasks (for AI)

### Add a new admin page
1. Create `src/app/admin/{slug}/page.js` ("use client")
2. Add menu item in `src/app/admin/layout.js`
3. Reuse `PageHeader`, `Card`, `Table`, `EmptyState`
4. Create API route in `src/app/api/admin/{slug}/route.js` with ADMIN guard
5. Use `db.listDocuments` / `db.createDocument` etc. from `@/lib/appwrite`

### Add a new member page
1. Create `src/app/membro/{slug}/page.js`
2. Add to `src/app/membro/layout.js` sidebar
3. API route with logged-in guard
4. Access Appwrite via `@/lib/appwrite`

### Add a new collection/entity
1. Create collection in Appwrite console (`database.wbctmember.org`)
2. Add entry to `COLS` in `src/lib/appwrite.js`
3. Add CRUD to a new API route
4. No migration scripts needed (Appwrite is schema-flexible)

### Add a new UI primitive
1. Create `src/components/ui/{Name}.js`
2. Export from `src/components/ui/index.js`
3. Use CSS vars from `globals.css`, not hardcoded colors

### Modify the dashboard
- File: `src/app/admin/page.js`
- Stats endpoint: `src/app/api/admin/stats/route.js`
- Stats use `listDocuments` with `total` for counts + `listAll` for time-series grouping in JS

---

## 14. Security Checklist (for AI-generated code)

- [ ] Every API route that requires auth calls `auth()` and checks `session?.user`
- [ ] Admin-only routes verify `session.user.role === "ADMIN"`
- [ ] User input is validated before passing to Appwrite (no injection risk, but validate required fields)
- [ ] Passwords are hashed with `bcrypt` (never stored plain text)
- [ ] File uploads check MIME type and size (max 5MB)
- [ ] No secrets, API keys, or passwords are committed to the repo
- [ ] `Query.limit()` on user-facing list endpoints
- [ ] User can only edit/delete **their own** resources (or ADMIN)
- [ ] `middleware.js` matcher is preserved when adding new protected routes
- [ ] Appwrite API key is only in env vars, never in source

---

## 15. Reference File Pointers

| Topic | File |
|---|---|
| Auth config | `src/lib/auth.js` |
| Appwrite client + collections | `src/lib/appwrite.js` |
| User auth store (Appwrite-only) | `src/lib/user-store.js` |
| Email sender | `src/lib/email.js` |
| Middleware | `src/middleware.js` |
| Root layout | `src/app/layout.js` |
| Admin layout | `src/app/admin/layout.js` |
| Member layout | `src/app/membro/layout.js` |
| Design tokens | `src/app/globals.css` |
| Tailwind config | `tailwind.config.js` |
| Nixpacks config | `.nixpacks.toml` |
| UI primitives | `src/components/ui/index.js` |
| User context | `src/contexts/UserContext.js` |
| Providers | `src/components/Providers.js` |

---

## 16. Recent Changes (2026-06-01)

### Localization: UI in English
- All user-facing strings (sidebar, dashboard, profile, posts, comments, courses, events, calendar, directory, chat, webinars, admin docs) translated to English.
- Date formatting switched from `ptBR` to `enUS` (`date-fns/locale`, `toLocaleDateString("en-US", ...)` and `toLocaleTimeString("en-US", ...)`) on every page that previously rendered Portuguese months like `junho 2026`.
- Public URLs now use English slugs via `next.config.js`:
  - `/member`, `/member/blog`, `/member/directory`, `/member/doctor/[id]`, `/member/posts/[id]`, `/member/create`, `/member/edit/post/[id]`, `/member/profile`, `/member/events`, `/member/chat`, `/member/courses`
  - `/admin/members`, `/admin/posts`, `/admin/events`, `/admin/courses`
  - Legacy Portuguese URLs are kept as `307` redirects (preserves bookmarks, old notifications, history).
- The App-Router folders remain in Portuguese (`src/app/membro`, `src/app/admin/membros`, etc.) because English URLs are mapped to them with `rewrites()`. This keeps one source of truth and avoids duplicating pages.
- `middleware.js` protects both `/member/*` and the legacy `/membro/*` aliases; admin login still redirects to `/member`; non-admins on `/admin/*` go to `/member`.
- Internal links in the UI were updated to point at the English URLs.
- Database content (names, bios, post bodies) is rendered as-is; only static UI copy was translated.

### Auth + Avatar hardening
- `src/lib/auth.js`: removed `image` from the JWT and session payload so the NextAuth cookie no longer splits across 10+ cookies (`authjs.session-token.0..N`).
- `package.json`: `dev` and `start` scripts now use `NODE_OPTIONS=--max-http-header-size=262144` to survive any legacy oversized cookies.
- `src/app/admin/layout.js` and `src/app/membro/layout.js` derive the header/sidebar avatar from `useUser()` (`user.image`).
- `src/app/admin/perfil/page.js` and `src/app/membro/perfil/page.js` use `/api/upload` (multipart) instead of `FileReader.readAsDataURL`, so profile images are stored as `/uploads/...` URLs (no base64 in DB or cookies).
- `src/app/admin/membros/page.js` (edit-member modal) also routes the photo through `/api/upload`.
- `src/components/ui/Avatar.js` validates that `src` is a non-empty string before deciding to render the image; if the image fails to load (`onError`), it hides the `<img>` and reveals the initials fallback.
- `src/app/admin/perfil/page.js` now calls `updateUser()` + `refreshUser()` after save, so the header/sidebar avatar updates immediately.

### Tooling
- `scripts/check-portuguese.py` scans `src` for common Portuguese tokens (date locale, accented words, common UI phrases). Reaches `Total suspicious lines: 0` after the localization pass.
- Easy Panel deploy webhook: `POST http://185.217.125.183:3000/api/deploy/48ce309e12925a192fd16e16930a475c12c5c3a5c965d4f3`.

---

## 17. Known Issues (as of 2026-06-01)

1. **Stale browser cookies** — If the browser was previously used with the app on a different port (e.g. 3001), the `authjs.callback-url` cookie may point to the wrong port. Fix: clear all cookies for `localhost` in DevTools → Application → Cookies → Delete All, then reload.

2. **AUTH_URL must match server port** — `AUTH_URL` in `.env` must exactly match the port `npm run dev` binds to. Mismatch causes a silent `ClientFetchError: NetworkError` in the browser (the page loads HTML but React fails to hydrate the session). Default is `http://localhost:3000`.

3. **Author name fallback** — Some migrated posts reference `authorId` values that do not exist in the Appwrite `users` collection (incomplete data migration). The code handles this gracefully with an "Unknown author" fallback (rendered in English).

4. **Middleware deprecation** — Next 16 warns `"middleware" file convention is deprecated. Please use "proxy" instead`. Cosmetic warning, no impact.

5. **N+1 queries in list endpoints** — Routes like `/api/users/directory` and `/api/posts` fetch authors individually per document (no JOINs in Appwrite). Performance degrades with >500 records. Acceptable for current scale.

6. **Profile photo display** — The header/sidebar avatar shows the photo only after the Appwrite document has `image` saved. The default is initials while the user loads (or if the user has no photo on file). To set one, the user goes to `/admin/profile` or `/member/profile`, uploads an image (stored under `/public/uploads/...`), and saves; the `useUser` context refetches and the avatar updates without a full reload.

---

*Last updated: 2026-06-01 · Database: Appwrite (node-appwrite v16.0.0) · Deploy target: Easy Panel (Nixpacks, Node 20) · UI language: English (pt-BR redirects still served)*
