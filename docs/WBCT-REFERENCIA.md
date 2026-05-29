# WBCT — Plataforma Médica: Referência Completa

> Gerado em: 2026-04-16  
> Stack atual: Next.js 16.1.3 · React 19 · Tailwind CSS v4 · NextAuth v5 · MySQL + Prisma v7  
> Stack destino: React + Vite + Tailwind CSS · React Router v7 · API separada (Express / Hono)

---

## 1. Visão Geral do Projeto

WBCT é uma **plataforma de comunidade médica** exclusiva para médicos brasileiros. Possui duas áreas protegidas por autenticação:

| Área | Prefixo | Acesso |
|------|---------|--------|
| Portal do Médico | `/membro` | Qualquer usuário com `status = APPROVED` |
| Painel Administrativo | `/admin` | Usuários com `role = ADMIN` |

Fluxo de entrada: cadastro → aguarda aprovação admin → acesso liberado.

---

## 2. Stack Atual (detalhada)

### Runtime & Framework
| Pacote | Versão | Papel |
|--------|--------|-------|
| `next` | 16.1.3 | Framework (App Router, SSR, API Routes) |
| `react` / `react-dom` | 19.2.3 | UI |
| `next-auth` | 5.0.0-beta.30 | Autenticação (JWT, Credentials) |

### Banco de Dados
| Pacote | Versão | Papel |
|--------|--------|-------|
| `mysql2` | 3.16.1 | Driver MySQL (connection pool) |
| `@prisma/client` | 7.2.0 | ORM (parcialmente usado) |
| `prisma` | 7.2.0 | Dev tool (migrations) |
| `bcryptjs` | 3.0.3 | Hash de senhas |

### UI & Estilo
| Pacote | Versão | Papel |
|--------|--------|-------|
| `tailwindcss` | 4.1.18 | CSS utility-first |
| `@tailwindcss/typography` | 0.5.19 | Estilo de prosa |
| `lucide-react` | 0.562.0 | Ícones |
| `recharts` | 3.6.0 | Gráficos (Area, Bar, Pie, Line) |
| `framer-motion` | 12.27.1 | Animações (instalado, pouco usado) |

### Editor & Upload
| Pacote | Versão | Papel |
|--------|--------|-------|
| `@tiptap/react` | 3.15.3 | Editor rich text (posts) |
| `@tiptap/starter-kit` | 3.15.3 | Extensões base do TipTap |
| `@tiptap/extension-image` | 3.15.3 | Upload de imagem no editor |
| `@tiptap/extension-link` | 3.15.3 | Links no editor |
| `@tiptap/extension-placeholder` | 3.16.0 | Placeholder no editor |
| `uuid` | 13.0.0 | Geração de IDs únicos (uploads) |
| `date-fns` | 4.1.0 | Manipulação de datas |
| `clsx` / `tailwind-merge` | 2.1.1 / 3.4.0 | Utilitários de className |

### Scripts NPM
```
dev   → npx next dev --webpack   (Turbopack desabilitado — incompatível com path Windows com espaços)
build → next build
start → next start
lint  → next lint
```

---

## 3. Variáveis de Ambiente

| Variável | Obrigatoriedade | Descrição |
|----------|----------------|-----------|
| `DATABASE_URL` | Obrigatória | `mysql://user:pass@host:port/database` |
| `AUTH_SECRET` | Obrigatória | String 32+ chars para assinar JWTs |
| `AUTH_URL` | Opcional | Base URL (fallback: `http://localhost:3000`) |

---

## 4. Estrutura de Arquivos

```
PROJETO-TESTE-02/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.js               # Root layout (Providers, Inter font, metadata)
│   │   ├── page.js                 # Redirect → /login
│   │   ├── globals.css             # Design tokens CSS, Tailwind, animações
│   │   │
│   │   ├── login/
│   │   │   └── page.js             # Formulário login + registro (2 steps)
│   │   │
│   │   ├── registro/
│   │   │   └── page.js             # Página de registro alternativa (duplicata)
│   │   │
│   │   ├── admin/
│   │   │   ├── layout.js           # Sidebar + Header admin
│   │   │   ├── page.js             # Dashboard (stats, charts, moderação)
│   │   │   ├── error.js            # Error boundary admin
│   │   │   ├── loading.js          # Loading skeleton admin
│   │   │   ├── membros/page.js     # CRUD de membros
│   │   │   ├── postagens/page.js   # Moderação de posts
│   │   │   ├── postagens/novo/page.js  # Criar post (admin)
│   │   │   ├── analytics/page.js   # Analytics (gráficos avançados)
│   │   │   ├── eventos/page.js     # Gestão de eventos
│   │   │   ├── webinars/page.js    # Gestão de webinars/cursos
│   │   │   ├── chat/page.js        # Chat admin
│   │   │   ├── docs/page.js        # Documentação interna
│   │   │   └── perfil/page.js      # Perfil do admin
│   │   │
│   │   ├── membro/
│   │   │   ├── layout.js           # Sidebar + Header membro
│   │   │   ├── page.js             # Feed principal
│   │   │   ├── error.js            # Error boundary membro
│   │   │   ├── loading.js          # Loading skeleton membro
│   │   │   ├── blog/page.js        # Articles HUB
│   │   │   ├── criar/page.js       # Nova postagem (editor TipTap)
│   │   │   ├── minhas-postagens/page.js   # Posts do usuário logado
│   │   │   ├── postagens/[id]/page.js     # Leitura de post
│   │   │   ├── editar/post/[id]/page.js   # Editar post
│   │   │   ├── diretorio/page.js          # Diretório médico
│   │   │   ├── medico/[id]/page.js        # Perfil público de médico
│   │   │   ├── eventos/page.js            # Agenda de eventos
│   │   │   ├── webinars/page.js           # Lista de cursos
│   │   │   ├── webinars/[id]/page.js      # Curso (lições)
│   │   │   ├── perfil/page.js             # Perfil do usuário logado
│   │   │   └── chat/page.js               # Mensagens privadas
│   │   │
│   │   └── api/                    # API Routes (Next.js)
│   │       ├── auth/
│   │       │   ├── [...nextauth]/route.js  # Handler NextAuth
│   │       │   ├── register/route.js       # POST → criar usuário (PENDING)
│   │       │   └── verify/route.js         # POST → validar credentials (legado)
│   │       ├── activity/route.js           # POST ping online · GET contagem
│   │       ├── admin/
│   │       │   ├── stats/route.js          # GET dashboard stats
│   │       │   ├── chat/contacts/route.js  # GET contatos de chat (admin)
│   │       │   └── events/[id]/participants/route.js
│   │       ├── courses/
│   │       │   ├── route.js                # GET list · POST create
│   │       │   ├── [id]/route.js           # PATCH · DELETE
│   │       │   └── [id]/lessons/route.js   # GET · POST
│   │       ├── events/
│   │       │   ├── route.js                # GET · POST · DELETE
│   │       │   └── [id]/follow/route.js    # POST toggle
│   │       ├── lessons/
│   │       │   ├── [id]/route.js           # PATCH · DELETE
│   │       │   └── [id]/progress/route.js  # GET · POST
│   │       ├── members/route.js            # GET · POST · PUT · DELETE (admin)
│   │       ├── membro/posts/route.js       # GET posts do usuário logado
│   │       ├── messages/
│   │       │   ├── route.js                # POST enviar mensagem
│   │       │   └── [userId]/route.js       # GET thread
│   │       ├── notifications/route.js      # GET · PUT (marcar lidas)
│   │       ├── posts/
│   │       │   ├── route.js                # GET · POST · PATCH · DELETE
│   │       │   ├── [id]/route.js           # GET · PATCH (single post)
│   │       │   └── [id]/comments/route.js  # POST comentário
│   │       ├── upload/route.js             # POST upload imagem/PDF
│   │       ├── users/
│   │       │   ├── contacts/route.js       # GET usuários seguidos
│   │       │   ├── directory/route.js      # GET diretório médico
│   │       │   ├── follow/route.js         # POST toggle follow
│   │       │   ├── profile/route.js        # PUT atualizar perfil
│   │       │   ├── profile/[id]/route.js   # GET perfil próprio
│   │       │   └── public/[id]/route.js    # GET perfil público
│   │       └── webinars/route.js           # GET · POST · PATCH · DELETE
│   │
│   ├── components/
│   │   ├── Providers.js            # SessionProvider + UserProvider wrapper
│   │   ├── NotificationDropdown.js # Sino de notificações + dropdown (30s poll)
│   │   ├── StatsCard.js            # Card de métrica (label, value, icon, color)
│   │   ├── TextEditor.js           # TipTap editor (Bold, Italic, H1/H2, listas)
│   │   └── ui/
│   │       ├── index.js            # Re-export central
│   │       ├── Avatar.js           # Foto/iniciais + dot online (6 tamanhos)
│   │       ├── Badge.js            # Status badges + PostStatusBadge + RoleBadge
│   │       ├── Button.js           # 5 variantes · 3 tamanhos · loading · ícones
│   │       ├── Card.js             # 4 variantes · padding · polimórfico (as=)
│   │       ├── EmptyState.js       # Ícone + título + descrição + action
│   │       ├── Input.js            # Input · Textarea · Select (label, error, hint)
│   │       ├── Modal.js            # Dialog com Escape, scroll-lock, 5 tamanhos
│   │       ├── PageHeader.js       # Título + subtitle + breadcrumb + actions
│   │       ├── Skeleton.js         # 5 variantes de skeleton + Spinner
│   │       └── Table.js            # Tabela com columns[], loading, EmptyState
│   │
│   ├── contexts/
│   │   └── UserContext.js          # useUser() · updateUser() · refreshUser()
│   │
│   ├── lib/
│   │   ├── auth.js                 # NextAuth config (Credentials, JWT, callbacks)
│   │   ├── db.js                   # mysql2 pool · query() · testConnection()
│   │   └── prisma.js               # Singleton PrismaClient
│   │
│   └── middleware.js               # Proteção de rotas (redirect não-autenticados)
│
├── public/
│   ├── uploads/                    # Arquivos enviados via /api/upload
│   └── manifest.json               # PWA manifest
│
├── prisma/
│   └── schema.prisma               # Schema Prisma (parcialmente desatualizado)
│
├── tailwind.config.js
├── next.config.js                  # Configuração mínima (objeto vazio)
├── .env                            # DATABASE_URL · AUTH_SECRET · AUTH_URL
└── package.json
```

---

## 5. Design System

### Paleta de Cores (CSS Custom Properties)

```css
/* Brand — Azul médico */
--color-brand-primary:        #2563eb   /* Blue-600 */
--color-brand-primary-hover:  #1d4ed8   /* Blue-700 */
--color-brand-primary-active: #1e40af   /* Blue-800 */
--color-brand-primary-light:  #dbeafe   /* Blue-100 */
--color-brand-strong:         #0f172a   /* Slate-900 */
--color-accent:               #0284c7   /* Sky-600 */

/* Status */
--color-status-success:    #059669  bg: #ecfdf5
--color-status-warning:    #d97706  bg: #fffbeb
--color-status-error:      #dc2626  bg: #fef2f2
--color-status-info:       #2563eb  bg: #eff6ff
--color-status-pending:    #9333ea  bg: #faf5ff

/* Superfícies (Light / Dark) */
--surface-page:     #f8fafc  /  #0a0f1e
--surface-card:     #ffffff  /  #0f172a
--surface-sidebar:  #ffffff  /  #080d1a
--surface-header:   #ffffffdd / #0a0f1edd
--surface-subtle:   #f1f5f9  /  #1e293b
```

### Tipografia
- **Display (headings):** Outfit (400–800)
- **Body:** Inter (400–700)
- **Fonte base:** `--font-body: "Inter", system-ui`

### Border Radius (Sharp/Clínico)
`xs=2px · sm=4px · md=6px · lg=8px · xl=12px · full=9999px`

### Sombras
```
shadow-card        → 0 4px 6px -1px rgb(0 0 0 / 0.06)
shadow-card-hover  → 0 10px 20px -4px rgb(0 0 0 / 0.10)
shadow-modal       → 0 20px 60px -10px rgb(0 0 0 / 0.25)
shadow-button-primary → 0 3px 8px -1px rgb(37 99 235 / 0.35)
```

### Classes Globais (globals.css)
```
.btn-primary    → azul brand, shadow, hover/active/disabled
.btn-secondary  → surface-subtle, borda, hover
.btn-ghost      → transparente, hover:surface-subtle
.btn-accent     → cyan, shadow-button-accent
.btn-danger     → status-error vermelho
.card           → surface-card + border + rounded-lg + shadow-card + hover
.card-subtle    → surface-subtle + border-subtle
.input          → border + focus:ring brand-primary
.badge          → inline-flex text-xs font-semibold
```

### Dark Mode
Ativado via `.dark` class no `<html>` + `data-theme="dark"`.  
Armazenado em `localStorage("theme")`.  
Lido no `useEffect` de cada layout.

---

## 6. Autenticação & Autorização

### Fluxo de Autenticação
```
1. Usuário preenche email + senha em /login
2. signIn("credentials", { redirect: false }) — next-auth/react
3. authorize() em src/lib/auth.js:
   - Busca User WHERE email = ? no MySQL
   - Verifica status: PENDING → throw "PENDING" | REJECTED → throw "REJECTED"
   - bcrypt.compare(password, user.password)
   - Registra UserActivity (type: LOGIN) + atualiza lastActiveAt
   - Retorna { id, name, email, role }
4. JWT callback: adiciona token.role e token.id
5. Session callback: adiciona session.user.role e session.user.id
6. Cliente redireciona → /admin (ADMIN) ou /membro (MEMBER)
```

### Proteção de Rotas (middleware.js)
```
/admin/* → requer session + role === ADMIN
/membro/* → requer session (qualquer role aprovada)
/login   → se já logado, redireciona para dashboard
```

### Registro de Usuário
```
POST /api/auth/register
{ name, email, password, bio?, crm?, specialty?, image? }
→ Cria User com status: PENDING, role: MEMBER
→ Admin precisa aprovar manualmente em /admin/membros
→ Após aprovação (status: APPROVED) → usuário consegue logar
```

### Sessão JWT
```
strategy: JWT
session.user = { id, name, email, role }
Verificação nas APIs: const session = await auth(); if (!session?.user) → 401
Role check: if (session.user.role !== "ADMIN") → 403
```

---

## 7. Banco de Dados

### Conexão
```javascript
// src/lib/db.js
mysql://user:pass@host:port/database  (via DATABASE_URL)
Pool: 10 conexões máximas, keep-alive
Exporta: query(sql, params) → Promise<rows[]>
```

### Tabelas Completas

#### User
| Campo | Tipo | Notas |
|-------|------|-------|
| id | CUID string | PK |
| name | string? | |
| email | string? unique | |
| password | string? | bcrypt hash |
| image | string? | URL ou base64 |
| bio | text? | |
| crm | string? | Registro médico |
| specialty | string? | Especialidade |
| stack | string? | Área de atuação (fora do Prisma schema) |
| role | enum: ADMIN\|MEMBER | default: MEMBER |
| status | string: PENDING\|APPROVED\|REJECTED | default: PENDING |
| lastActiveAt | DateTime? | Para tracking online |
| createdAt | DateTime | default: now() |
| updatedAt | DateTime | auto-update |

#### Post
| Campo | Tipo | Notas |
|-------|------|-------|
| id | CUID string | PK |
| title | string | |
| content | LongText | HTML gerado pelo TipTap |
| image | string? | Cover image URL |
| status | enum: PENDING\|APPROVED | default: PENDING |
| views | int | default: 0, incrementado a cada GET |
| authorId | string | FK → User.id |
| createdAt / updatedAt | DateTime | |

#### Comment
| Campo | Tipo | Notas |
|-------|------|-------|
| id | CUID | PK |
| content | text | |
| postId | string | FK → Post.id (onDelete: Cascade) |
| authorId | string | FK → User.id |
| createdAt | DateTime | |

#### Event
| Campo | Tipo | Notas |
|-------|------|-------|
| id | CUID | PK |
| title | string | |
| description | text? | |
| date | DateTime | |
| color | string? | default: "#3b82f6" |
| link | string? | URL externa opcional |
| createdAt / updatedAt | DateTime | |

#### Webinar
| Campo | Tipo | Notas |
|-------|------|-------|
| id | CUID | PK |
| title | string | |
| description | text? | |
| videoUrl | string | |
| order | int | default: 0, para ordenação |
| createdAt / updatedAt | DateTime | |

#### Course
| Campo | Tipo | Notas |
|-------|------|-------|
| id | CUID | PK |
| title | string | |
| description | text? | |
| image | string? | |
| createdAt / updatedAt | DateTime | |

#### Lesson
| Campo | Tipo | Notas |
|-------|------|-------|
| id | CUID | PK |
| title | string | |
| description | text? | |
| videoUrl | string | |
| order | int | default: 0 |
| courseId | string | FK → Course.id (Cascade) |
| createdAt / updatedAt | DateTime | |

#### LessonAttachment
| Campo | Tipo | Notas |
|-------|------|-------|
| id | CUID | PK |
| title | string | |
| url | string | |
| type | string | "pdf" ou "image" |
| lessonId | string | FK → Lesson.id (Cascade) |
| createdAt | DateTime | |

#### LessonProgress
| Campo | Tipo | Notas |
|-------|------|-------|
| id | CUID | PK |
| userId | string | FK → User.id (Cascade) |
| lessonId | string | FK → Lesson.id (Cascade) |
| completed | bool | default: false |
| completedAt | DateTime? | |
| updatedAt | DateTime | |
| UNIQUE | [userId, lessonId] | |

#### Follows *(sem Prisma model — raw SQL)*
| Campo | Tipo | Notas |
|-------|------|-------|
| followerId | string | FK → User.id |
| followingId | string | FK → User.id |
| PK | [followerId, followingId] | |

#### Message *(sem Prisma model — raw SQL)*
| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID string | PK |
| senderId | string | FK → User.id |
| receiverId | string | FK → User.id |
| content | string | |
| createdAt | DateTime | |

#### Notification *(sem Prisma model — raw SQL)*
| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID string | PK |
| userId | string | FK → User.id |
| type | string | "MESSAGE", "POST_APPROVED", "POST_REJECTED" |
| content | string | Texto da notificação |
| relatedId | string | ID do objeto relacionado |
| isRead | bool | default: false |
| createdAt | DateTime | |

#### UserActivity *(sem Prisma model — raw SQL)*
| Campo | Tipo | Notas |
|-------|------|-------|
| id | string | formato: `login_{userId8}_{timestamp36}` |
| userId | string | FK → User.id |
| type | string | "LOGIN" |
| createdAt | DateTime | |

#### _UserEvents *(junction — Prisma auto-gerada)*
| Campo | Tipo | Notas |
|-------|------|-------|
| A | string | FK → Event.id |
| B | string | FK → User.id |
| PK | [A, B] | |

### Relacionamentos
```
User (1:N) Post              — Post.authorId
User (1:N) Comment           — Comment.authorId
User (N:N) Event             — via _UserEvents
User (N:N) User              — via Follows (follower ↔ following)
User (1:N) Message           — Message.senderId / Message.receiverId
User (1:N) Notification
User (1:N) UserActivity
User (1:N) LessonProgress

Post (1:N) Comment           — onDelete: Cascade
Course (1:N) Lesson          — onDelete: Cascade
Lesson (1:N) LessonAttachment — onDelete: Cascade
Lesson (1:N) LessonProgress   — onDelete: Cascade
```

---

## 8. API Routes — Referência Completa

### Autenticação
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET/POST | `/api/auth/[...nextauth]` | — | NextAuth handler |
| POST | `/api/auth/register` | Pública | Cria user (PENDING) |
| POST | `/api/auth/verify` | Pública | Valida credentials + log activity |

### Usuários
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| PUT | `/api/users/profile` | Logado | Atualiza perfil próprio |
| GET | `/api/users/profile/[id]` | Próprio | Busca perfil completo |
| GET | `/api/users/public/[id]` | Logado | Perfil público de outro user |
| GET | `/api/users/directory` | Logado | Diretório médico (todos) |
| POST | `/api/users/follow` | Logado | Toggle seguir/deixar de seguir |
| GET | `/api/users/contacts` | Logado | Lista quem o user segue |

### Membros (Admin)
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/members` | ADMIN | Lista todos (busca por nome/email) |
| POST | `/api/members` | ADMIN | Cria membro |
| PUT | `/api/members` | ADMIN | Atualiza (status, role, dados, senha) |
| DELETE | `/api/members?id=` | ADMIN | Exclui membro |

### Posts
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/posts?status=` | — | Lista posts (filtro status) |
| POST | `/api/posts` | Logado | Cria post (PENDING se MEMBER) |
| PATCH | `/api/posts` | ADMIN | Muda status (aprovar/rejeitar) |
| DELETE | `/api/posts?id=` | Autor/ADMIN | Remove post |
| GET | `/api/posts/[id]` | — | Lê post + comments + incrementa views |
| PATCH | `/api/posts/[id]` | Autor/ADMIN | Edita post |
| POST | `/api/posts/[id]/comments` | Logado | Adiciona comentário |
| GET | `/api/membro/posts` | Logado | Posts do usuário logado |

### Eventos
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/events?month=` | — | Lista eventos (filtro mês YYYY-MM) |
| POST | `/api/events` | ADMIN | Cria evento |
| DELETE | `/api/events?id=` | ADMIN | Remove evento |
| POST | `/api/events/[id]/follow` | Logado | Toggle seguir evento |
| GET | `/api/admin/events/[id]/participants` | ADMIN | Participantes do evento |

### Cursos & Lições
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/courses` | — | Lista cursos com contagem de lições |
| POST | `/api/courses` | ADMIN | Cria curso |
| PATCH | `/api/courses/[id]` | ADMIN | Edita curso |
| DELETE | `/api/courses/[id]` | ADMIN | Remove curso |
| GET | `/api/courses/[id]/lessons` | — | Lições do curso (ordenadas) |
| POST | `/api/courses/[id]/lessons` | ADMIN | Cria lição com attachments |
| PATCH | `/api/lessons/[id]` | ADMIN | Edita lição e substitui attachments |
| DELETE | `/api/lessons/[id]` | ADMIN | Remove lição |
| GET | `/api/lessons/[id]/progress` | Logado | Status de conclusão do usuário |
| POST | `/api/lessons/[id]/progress` | Logado | Marcar como concluída/pendente |

### Webinars
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/webinars` | — | Lista webinars |
| POST | `/api/webinars` | ADMIN | Cria webinar |
| PATCH | `/api/webinars` | ADMIN | Edita webinar |
| DELETE | `/api/webinars?id=` | ADMIN | Remove webinar |

### Mensagens
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/api/messages` | Logado | Envia mensagem (cria notification) |
| GET | `/api/messages/[userId]` | Logado | Thread completa com usuário |
| GET | `/api/admin/chat/contacts` | ADMIN | Contatos de chat do admin |

### Notificações & Atividade
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/notifications` | Logado | Lista (últimas 20, desc) |
| PUT | `/api/notifications` | Logado | Marca todas como lidas |
| POST | `/api/activity` | Logado | Ping de presença (atualiza lastActiveAt) |
| GET | `/api/activity` | — | Conta usuários online (últimos 5 min) |

### Upload & Stats
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/api/upload` | Logado | Upload imagem/PDF (max 5MB, whitelist MIME) |
| GET | `/api/admin/stats` | — | Stats completas do dashboard admin |

---

## 9. Componentes UI — Props & Comportamento

### `<Avatar>`
```jsx
<Avatar src="url" name="Dr. João" size="xs|sm|md|lg|xl|2xl" online={true} />
// Fallback: iniciais do nome em bg-brand-primary-light
// online=true: dot verde no canto inferior direito
```

### `<Badge>` / `<PostStatusBadge>` / `<RoleBadge>`
```jsx
<Badge variant="success|warning|error|info|pending|neutral|brand" size="sm|md|lg" dot />
<PostStatusBadge status="APPROVED|PENDING|REJECTED" />
<RoleBadge role="ADMIN|MEMBER" />
```

### `<Button>`
```jsx
<Button variant="primary|secondary|ghost|danger|accent" size="sm|md|lg"
        loading icon={<Icon />} iconRight disabled>
```

### `<Card>`
```jsx
<Card variant="default|elevated|subtle|ghost" padding="none|sm|md|lg" hover as="div|a|button">
```

### `<Modal>`
```jsx
<Modal isOpen={bool} title="..." size="sm|md|lg|xl|full" onClose={() => {}}>
  {/* children */}
</Modal>
// Fecha com: Esc, click no backdrop, onClose
// Trava scroll do body enquanto aberto
```

### `<Input>` / `<Textarea>` / `<Select>`
```jsx
<Input label="Nome" error="Campo obrigatório" hint="Dica" icon={Mail} iconRight />
<Textarea label="Bio" rows={4} error="..." />
<Select label="Status" error="...">
  <option>...</option>
</Select>
// Todos: forwardRef + ARIA (aria-invalid, aria-describedby)
```

### `<Skeleton>` / `<Spinner>`
```jsx
<Skeleton variant="text|card|avatar|table|stat" className="w-40 h-4" />
<Spinner size="sm|md|lg" />
```

### `<PageHeader>`
```jsx
<PageHeader
  title="Gestão de Membros"
  subtitle="32 membros cadastrados"
  actions={<Button>Novo Membro</Button>}
  breadcrumb={[{ label: 'Admin', href: '/admin' }, { label: 'Membros' }]}
/>
```

### `<Table>`
```jsx
<Table
  columns={[{ key: 'name', header: 'Nome', render: (row) => <span>{row.name}</span> }]}
  data={rows}
  loading={bool}
  onRowClick={(row) => {}}
  keyField="id"
/>
// loading → skeleton automático
// data vazio → EmptyState automático
```

### `<EmptyState>`
```jsx
<EmptyState
  icon={Users}
  title="Nenhum membro encontrado"
  description="Adicione o primeiro membro da plataforma."
  action={<Button>Novo Membro</Button>}
/>
```

### `<NotificationDropdown>` (componente especializado)
- Busca `/api/notifications` a cada 30s
- Marca todas como lidas ao abrir
- Badge com contagem de não lidas
- Tipos → ícone + cor:
  - `MESSAGE` → azul, link → /membro/chat
  - `POST_APPROVED` → verde, link → /membro/minhas-postagens
  - `POST_REJECTED` → vermelho, link → /membro/minhas-postagens

### `<TextEditor>` (TipTap rich text)
```jsx
<TextEditor initialContent="<p>...</p>" onChange={(html) => {}} />
// Toolbar: Bold · Italic · H1 · H2 · Bullet list · Ordered list · Undo · Redo
// Extensões: Image, Link, Placeholder
// Min-height: 300px
// Output: HTML string
```

---

## 10. Funcionalidades por Área

### Área Pública
- [x] Login com email/senha + feedback de erro (conta pendente/recusada)
- [x] Registro em 2 passos (credenciais → perfil profissional: CRM, especialidade, bio, foto)
- [x] Tela de sucesso pós-cadastro (aguardando aprovação)
- [x] Toggle dark/light mode (persistido em localStorage)

### Admin — Dashboard (`/admin`)
- [x] Cards de stats: Total membros · Online agora · Posts pendentes · Próximos eventos
- [x] Gráfico de atividade semanal — tabs: Acessos / Postagens / Novos Membros (AreaChart)
- [x] Gráfico pizza: status de postagens (Aprovadas/Pendentes/Rejeitadas)
- [x] Gráfico barras: crescimento mensal de membros
- [x] Tabela de membros recentes (últimos 5)
- [x] Fila de posts pendentes com aprovar/rejeitar inline
- [x] Auto-refresh a cada 30s

### Admin — Gestão de Membros (`/admin/membros`)
- [x] Listagem com busca em tempo real (nome/email, debounce 300ms)
- [x] Tabela: avatar, nome, email, role badge, status badge, data de cadastro
- [x] Modal de detalhes: visualização completa (CRM, especialidade, bio)
- [x] Modal de edição: nome, email, CRM, especialidade, bio, foto, nova senha, status, role
- [x] Aprovar / Rejeitar / Reativar pelo modal
- [x] Criar novo membro (modal separado)
- [x] Excluir membro (com confirmação)

### Admin — Moderação de Posts (`/admin/postagens`)
- [x] Filtro por status: Todas / Pendentes / Aprovadas / Rejeitadas
- [x] Busca por título ou nome do autor
- [x] Tabela com thumbnail, avatar do autor, data, status badge
- [x] Botões inline: Aprovar ✓ / Rejeitar ✗ / Visualizar (nova aba) / Excluir

### Admin — Analytics (`/admin/analytics`)
- [x] KPI cards: Membros · Online · Postagens · Eventos
- [x] Gráfico principal com tabs: Acessos / Postagens / Novos Membros
- [x] Pizza: distribuição de status de posts
- [x] Barras: crescimento mensal de membros
- [x] Linha: engajamento (curtidas / comentários / seguidores)
- [x] Cards de totais coloridos: Aprovadas / Pendentes / Rejeitadas / Webinars
- [x] Auto-refresh a cada 60s + botão manual

### Admin — Eventos, Webinars, Chat, Docs, Perfil
- [ ] Scaffolding presente, implementação em andamento

### Membro — Feed Principal (`/membro`)
- [x] Banner de boas-vindas com nome do usuário
- [x] Grid de posts aprovados (2 colunas desktop, 1 mobile)
- [x] Card de post: capa, avatar do autor, título, excerpt, data, botão "Ler artigo"
- [x] Sidebar direita (desktop): próximos 3 eventos + WBCT Academy + convite comunidade
- [x] Loading skeletons durante fetch
- [x] EmptyState quando não há posts

### Membro — Diretório Médico (`/membro/diretorio`)
- [x] Busca por nome, especialidade ou stack
- [x] Filtro dropdown por especialidade
- [x] Cards: avatar com dot online, nome, especialidade, bio excerpt, contagem de posts
- [x] Link para perfil individual `/membro/medico/[id]`
- [x] Stats: total médicos, especialidades únicas, resultados da busca

### Membro — WBCT Academy (`/membro/webinars`)
- [x] Banner com contagem de cursos disponíveis
- [x] Busca por título/tema
- [x] Grid responsivo (4 colunas xl, 3 lg, 2 md, 1 sm)
- [x] Cards: thumbnail com overlay play, contagem de aulas, título, descrição
- [x] Loading skeletons · EmptyState

### Membro — Posts, Blog, Chat, Eventos, Perfil
- [ ] Scaffolding presente, implementação em andamento

---

## 11. Contexto Global do Usuário

```javascript
// src/contexts/UserContext.js
const { user, loading } = useUser();

// user = {
//   id, name, email, image,
//   bio, stack, crm, specialty, role
// }

// Faz fetch para /api/users/profile/[session.user.id]
// Fallback para session data se fetch falhar

updateUser(newData)   // Atualiza local state sem re-fetch
refreshUser()         // Re-busca do servidor
```

---

## 12. Considerações para Migração React + Vite

### O que precisa ser recriado
| Funcionalidade Next.js | Equivalente React + Vite |
|------------------------|--------------------------|
| App Router (pages + layouts) | React Router v7 / TanStack Router |
| API Routes (`/api/**`) | Backend separado: Express / Hono / Fastify |
| NextAuth v5 (sessão, JWT) | Better Auth / Lucia Auth / JWT manual |
| `middleware.js` (proteção de rotas) | React Router loaders + guards / HOC |
| SSR / `generateMetadata` | Sem SSR (CSR puro) ou Vite SSR plugin |
| `next/font` (Outfit + Inter) | Link `<link>` Google Fonts direto no `index.html` |
| `next/image` (otimização) | `<img>` nativo ou `vite-imagetools` |
| `error.js` (Error Boundary) | `<ErrorBoundary>` manual com `react-error-boundary` |
| `loading.js` (Suspense) | `<Suspense fallback={<Skeleton/>}>` manual |

### O que é reutilizável sem ou com mínimas alterações
- Todos os componentes `src/components/ui/` — React puro, zero dependência Next.js
- `src/contexts/UserContext.js` — React Context puro
- `src/app/globals.css` — apenas Tailwind + CSS custom properties
- `tailwind.config.js` — adaptar para Tailwind v3/v4 conforme necessidade
- Toda lógica de UI das páginas (JSX + useState/useEffect)
- `recharts`, `lucide-react`, `@tiptap/*`, `date-fns`, `framer-motion`

### Backend necessário
Todos os 30+ arquivos de `/api/` precisam ser portados para rotas Express/Hono.  
Manter os mesmos contratos REST (métodos, paths, request/response shape).  
A lógica SQL em `src/lib/db.js` é reutilizável diretamente.

### Autenticação na nova stack
```
Login:  POST /api/auth/login → bcrypt.compare → gera JWT (jose/jsonwebtoken)
        → retorna httpOnly cookie com JWT
Logout: POST /api/auth/logout → limpa cookie
Sessão: GET /api/auth/me → verifica JWT → retorna user data
Guards: middleware Express verifica JWT no header/cookie
        Frontend: AuthContext verifica /api/auth/me no mount
```

### Estrutura sugerida
```
wbct-frontend/          (Vite + React + Tailwind)
  src/
    pages/              (equivalente a src/app/)
      admin/            (layout + páginas admin)
      membro/           (layout + páginas membro)
      Login.jsx
    components/         (copiar src/components/ diretamente)
    contexts/           (copiar UserContext + criar AuthContext)
    lib/
      api.js            (fetch wrapper com base URL + auth header)
    router/
      index.jsx         (React Router config)
      guards.jsx        (PrivateRoute, AdminRoute)
    index.css           (copiar globals.css)

wbct-api/               (Express ou Hono)
  src/
    routes/             (portar lógica das API routes)
      auth.js           (register, login, logout, me)
      users.js
      posts.js
      events.js
      courses.js
      messages.js
      notifications.js
      upload.js
      admin/
        stats.js
        members.js
    middleware/
      auth.js           (verifyJWT middleware)
      cors.js
    lib/
      db.js             (copiar src/lib/db.js diretamente)
      jwt.js            (sign/verify JWT)
    server.js           (entry point)
```

---

*Documento gerado automaticamente a partir da análise do código-fonte em 2026-04-16.*
