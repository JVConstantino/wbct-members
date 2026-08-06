# WBCT Member System

Next.js 16 app using Appwrite (node-appwrite) as the database/auth backend and NextAuth v5 (credentials) for sessions. See `contextforall.md` for full running context — deploy setup, collections, gotchas, and change history. Read it before making infra/deploy changes.

## Known local-only issue (temporary, see contextforall.md §19)

- Production Appwrite domain `database.wbctmember.org` was unreachable via DNS from this dev machine as of 2026-07-07. `.env`'s `APPWRITE_ENDPOINT` was temporarily pointed at the EasyPanel internal hostname instead. **This is not the permanent endpoint** — revert once the domain is fixed.
- The machine's default Node (v26) breaks `node-appwrite`'s fetch wrapper (`invalid onError method`), causing every DB call — including login — to 500. Local dev must run on Node 22 (`brew install node@22`; run with `PATH="/opt/homebrew/opt/node@22/bin:$PATH" npm run dev`) until this is fixed properly (pin engines/`.nvmrc` or upgrade `node-appwrite`).
