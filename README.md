# WBCT Members Platform

Full-stack web platform for the WBCT medical community, including member area, admin backoffice, events, webinars, moderation flows, networking, messaging preferences, and consent/privacy controls.

## English

### 1) Project Overview

This project is a Next.js application with:

- `Admin` area for member moderation, posts, webinars, events, analytics, and settings.
- `Member` area for profile, events, webinars, content creation, social connections, and messaging.
- Cookie consent and privacy terms pages.
- Notification and email support (Resend).
- MySQL-first data layer with optional Appwrite adapter flags.

### 2) Tech Stack

- **Runtime:** Node.js
- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS, Lucide, Recharts, TipTap
- **Auth:** next-auth (credentials)
- **Database:** MySQL (`mysql2`), Prisma client available
- **Email:** Resend

### 3) Repository Structure

```text
src/
  app/                 Next.js app routes (admin, member, api, auth pages)
  components/          Shared UI and feature components
  contexts/            React context providers
  lib/                 Auth, DB, email, adapters

prisma/                Prisma schema
public/                Static assets
scripts/               DB setup/migration/seed/provision scripts
docs/                  Internal and product documentation
```

### 4) Prerequisites

- Node.js 20+
- npm 10+
- MySQL database reachable from app runtime

### 5) Environment Variables

Create a `.env` file in the project root.

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | MySQL connection string (`mysql://user:password@host:3306/dbname`) |
| `AUTH_SECRET` | Recommended (required in production) | Secret used by Auth.js/next-auth |
| `RESEND_API_KEY` | Optional | Global fallback API key for email sending |
| `RESEND_FROM_EMAIL` | Optional | Default sender email |
| `RESEND_FROM_NAME` | Optional | Default sender name |
| `USE_APPWRITE_DB` | Optional | Set `1` to use Appwrite adapter mode |
| `APPWRITE_ENDPOINT` | Optional | Appwrite endpoint |
| `APPWRITE_PROJECT_ID` | Optional | Appwrite project id |
| `APPWRITE_API_KEY` | Optional | Appwrite API key |
| `APPWRITE_DATABASE_ID` | Optional | Appwrite database id |

Notes:

- Email settings can also be configured from admin settings and persisted in DB.
- If both environment and DB settings exist, code may prioritize runtime/env fallback depending on route.

### 6) Install and Run Locally

```bash
npm install
npm run dev
```

Default local URL:

- `http://localhost:3000` (or next available port)

To force a specific port:

```bash
PORT=3001 npm run dev
```

### 7) Database Setup and Seeds

Common scripts:

- `node scripts/setup-db.mjs`
- `node scripts/seed-admin.mjs`
- `node scripts/seed-posts.mjs`
- `node scripts/seed-webinars.mjs`
- `node scripts/seed-activity.mjs`

For Appwrite migration/provisioning:

- `npm run provision:appwrite:staging`
- `npm run migrate:appwrite:staging`

### 8) Production Build

```bash
npm run build
npm run start
```

### 9) Branching and Deployment Flow

Recommended workflow used in this repository:

1. Work and validation in `building`.
2. Pre-production cleanup/release branch (example: `release/main-hardening`).
3. Merge `building -> main` only after validation.
4. Keep a backup branch/tag before production release.

### 10) Backup and Rollback Strategy

Before promoting to `main`:

- Create a backup branch (example: `backup/pre-main-YYYY-MM-DD`).
- Create an optional backup tag (example: `pre-main-YYYY-MM-DD`).

Rollback options:

- `git revert <commit>` for safe history-preserving rollback.
- Redeploy previous release/tag from your hosting platform.

### 11) Troubleshooting

- **`not a git repository`**: run git commands inside the project directory.
- **`Unable to acquire lock ... .next/dev/lock`**: stop previous `next dev` process.
- **Port conflict**: set `PORT=3001 npm run dev`.
- **MySQL auth/connection errors**: verify `DATABASE_URL` and DB network access.

---

## Portugues (PT-BR)

### 1) Visao Geral

Este projeto e uma aplicacao Next.js para a comunidade medica WBCT com:

- Area `Admin` para moderacao de membros, postagens, webinars, eventos, analytics e configuracoes.
- Area `Membro` para perfil, eventos, webinars, criacao de conteudo, conexoes e preferencias de mensagens.
- Banner de consentimento e paginas de privacidade/termos.
- Suporte a notificacoes e envio de e-mail (Resend).
- Camada de dados principal em MySQL com adaptador opcional para Appwrite.

### 2) Stack Tecnologica

- **Runtime:** Node.js
- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS, Lucide, Recharts, TipTap
- **Autenticacao:** next-auth (credentials)
- **Banco:** MySQL (`mysql2`), Prisma client disponivel
- **Email:** Resend

### 3) Estrutura do Repositorio

```text
src/
  app/                 Rotas da aplicacao (admin, membro, api, auth)
  components/          Componentes compartilhados e UI
  contexts/            Providers de contexto React
  lib/                 Auth, banco, email e adaptadores

prisma/                Schema Prisma
public/                Arquivos estaticos
scripts/               Scripts de setup/migracao/seed/provision
docs/                  Documentacao interna e funcional
```

### 4) Pre-requisitos

- Node.js 20+
- npm 10+
- Banco MySQL acessivel pela aplicacao

### 5) Variaveis de Ambiente

Crie um arquivo `.env` na raiz do projeto.

| Variavel | Obrigatoria | Descricao |
|---|---|---|
| `DATABASE_URL` | Sim | String de conexao MySQL (`mysql://user:password@host:3306/dbname`) |
| `AUTH_SECRET` | Recomendado (obrigatorio em producao) | Segredo do Auth.js/next-auth |
| `RESEND_API_KEY` | Opcional | Chave global para envio de emails |
| `RESEND_FROM_EMAIL` | Opcional | Email remetente padrao |
| `RESEND_FROM_NAME` | Opcional | Nome remetente padrao |
| `USE_APPWRITE_DB` | Opcional | Defina `1` para usar modo Appwrite |
| `APPWRITE_ENDPOINT` | Opcional | Endpoint Appwrite |
| `APPWRITE_PROJECT_ID` | Opcional | ID do projeto Appwrite |
| `APPWRITE_API_KEY` | Opcional | Chave da API Appwrite |
| `APPWRITE_DATABASE_ID` | Opcional | ID do database Appwrite |

Observacoes:

- As configuracoes de email tambem podem ser salvas no painel admin.
- Dependendo da rota, as configs podem usar env e/ou fallback em banco.

### 6) Instalacao e Execucao Local

```bash
npm install
npm run dev
```

URL local padrao:

- `http://localhost:3000` (ou proxima porta livre)

Para fixar porta:

```bash
PORT=3001 npm run dev
```

### 7) Banco de Dados e Seeds

Scripts comuns:

- `node scripts/setup-db.mjs`
- `node scripts/seed-admin.mjs`
- `node scripts/seed-posts.mjs`
- `node scripts/seed-webinars.mjs`
- `node scripts/seed-activity.mjs`

Para provisionamento/migracao Appwrite:

- `npm run provision:appwrite:staging`
- `npm run migrate:appwrite:staging`

### 8) Build de Producao

```bash
npm run build
npm run start
```

### 9) Fluxo de Branch e Deploy

Fluxo recomendado neste repositorio:

1. Desenvolvimento e validacao em `building`.
2. Branch de pre-producao/ajustes finais (exemplo: `release/main-hardening`).
3. Merge `building -> main` somente apos validacao.
4. Manter branch/tag de backup antes de publicar.

### 10) Backup e Rollback

Antes de promover para `main`:

- Criar branch de backup (exemplo: `backup/pre-main-YYYY-MM-DD`).
- Criar tag opcional de backup (exemplo: `pre-main-YYYY-MM-DD`).

Opcoes de rollback:

- `git revert <commit>` para voltar com historico preservado.
- Re-deploy de release/tag anterior no provedor.

### 11) Problemas Comuns

- **`not a git repository`**: execute comandos git dentro da pasta do projeto.
- **`Unable to acquire lock ... .next/dev/lock`**: finalize processo anterior do `next dev`.
- **Conflito de porta**: use `PORT=3001 npm run dev`.
- **Erro de MySQL**: valide `DATABASE_URL` e acesso de rede ao banco.
