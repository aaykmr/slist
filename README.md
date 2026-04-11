# slist

Shortlist resumes: Express + MySQL (Prisma) API, Next.js UI, and **OpenAI** or **local Ollama** for structured PDF resume extraction.

## Prerequisites

- Node 20+
- MySQL 8 (e.g. `docker compose up -d` in this repo)
- Either **`OPENAI_API_KEY`** (cloud) or **[Ollama](https://ollama.com)** running locally (see below)

## Setup

1. Copy env files and fill secrets:

   - [apps/api/.env.example](apps/api/.env.example) → `apps/api/.env`
   - [apps/web/.env.example](apps/web/.env.example) → `apps/web/.env.local`

2. From the repo root:

   ```bash
   npm install
   cd apps/api && npx prisma migrate dev --name init && npm run db:seed
   ```

   If you prefer `db push` without migration history: `npx prisma db push && npm run db:seed`.

3. Run API and web (two terminals):

   ```bash
   npm run dev:api
   npm run dev:web
   ```

4. Open http://localhost:3000 — upload a PDF, wait for the parse job, then filter the table by skills (AND) and job profile (OR).

### Using Ollama (local, no OpenAI billing)

1. Install and start Ollama (menu bar app or `ollama serve`).
2. Pull a model that follows JSON instructions well, for example:

   ```bash
   ollama pull llama3.2
   ```

   Other options: `llama3.1`, `mistral`, `qwen2.5`. Larger models usually parse messy PDFs more reliably.

3. In `apps/api/.env` set:

   ```env
   LLM_PROVIDER=ollama
   OLLAMA_MODEL=llama3.2
   ```

   Optional: `OLLAMA_HOST=http://127.0.0.1:11434` if Ollama listens elsewhere.

4. Restart the API (`npm run dev:api`). You do not need `OPENAI_API_KEY` when `LLM_PROVIDER=ollama`.

## API (summary)

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/resumes` | Multipart field `file` (PDF) → `202` + `{ jobId }`, parses async |
| `GET` | `/resumes/jobs/:id` | Parse job status + linked candidate |
| `GET` | `/candidates` | Paginated list; `q`, `skill` (repeat or comma), `jobProfile`, `page`, `pageSize` |
| `GET` | `/candidates/:id` | Full candidate |
| `GET` | `/meta/skills` | Skills present for the default company |
| `GET` | `/meta/job-profiles` | Seeded taxonomy |

Default tenant: `DEFAULT_COMPANY_SLUG=demo` (created by seed).

## Troubleshooting

### `The table 'Company' does not exist` (or similar)

The database user can connect, but **schema migrations were never applied**. From `apps/api` (with `DATABASE_URL` set in `.env`):

```bash
npx prisma migrate deploy
npm run db:seed
```

Use `npx prisma migrate dev` instead of `deploy` only if you are actively changing the Prisma schema and want interactive migration creation.

### `Unknown authentication plugin 'sha256_password'`

Prisma’s MySQL driver does **not** support `sha256_password`. Use **`caching_sha2_password`** (MySQL 8 default) for the app user — it works with Prisma.

**1. Rule out a bad `DATABASE_URL`**

A **wrong username/password** can sometimes look like an auth-plugin error ([Prisma#16085](https://github.com/prisma/prisma/issues/16085)). Confirm `apps/api/.env` uses:

`mysql://USER:PASSWORD@HOST:PORT/DATABASE`

If the password contains `@`, `:`, or `/`, it must be [URL-encoded](https://developer.mozilla.org/en-US/docs/Glossary/Percent-encoding).

**2. Inspect the user**

```sql
SELECT user, host, plugin FROM mysql.user WHERE user = 'slist';
```

**3. Set `slist` to `caching_sha2_password`**

Script (password must match `DATABASE_URL`; default here is `slist`): [apps/api/scripts/fix-mysql-user-for-prisma.sql](apps/api/scripts/fix-mysql-user-for-prisma.sql).

**Local MySQL (TCP):** you must use the **actual** `root` password for whatever server is listening on `3306`:

```bash
mysql -h 127.0.0.1 -uroot -p < apps/api/scripts/fix-mysql-user-for-prisma.sql
```

**Docker:** run SQL **inside** the container (uses compose root password, not your Mac login):

```bash
docker compose exec -i mysql mysql -uroot -proot < apps/api/scripts/fix-mysql-user-for-prisma.sql
```

If `docker compose exec` fails with “no such service”, MySQL is not running in Docker — the `-h 127.0.0.1` command talks to **Homebrew / another install** instead.

The script uses `CREATE USER IF NOT EXISTS` for both `'%'` and `'localhost'` so **`ALTER USER` does not hit ERROR 1396** when only one host row existed before (typical for local installs).

### `Access denied for user 'root'` (ERROR 1045)

That is a **wrong password** or **wrong server**, not a Prisma bug.

1. **Confirm what owns port 3306** (Homebrew vs Docker vs other):  
   `lsof -iTCP:3306 -sTCP:LISTEN`

2. **Docker:** use `docker compose exec mysql mysql -uroot -p` and enter `MYSQL_ROOT_PASSWORD` from [docker-compose.yml](docker-compose.yml) (default `root`). Do not rely on `-h 127.0.0.1` unless you intend to hit the host-mapped port with that same password.

3. **Homebrew MySQL on macOS:** try the socket (no `-h`), which matches how `root` is often defined:

   ```bash
   mysql -uroot -p --protocol=socket < apps/api/scripts/fix-mysql-user-for-prisma.sql
   ```

   If you never set a root password, see the install notes for your version or use MySQL’s [official reset procedure](https://dev.mysql.com/doc/refman/en/resetting-permissions.html).

### `Plugin 'mysql_native_password' is not loaded` (ERROR 1524)

On **MySQL 8.4+ / 9**, `mysql_native_password` is often **removed or not loaded**. Do **not** use `mysql_native_password` for new users; run the **`caching_sha2_password`** script above instead.

### Docker and fresh data

[docker-compose.yml](docker-compose.yml) uses the server default (`caching_sha2_password`) for new databases. To reset local data: `docker compose down -v && docker compose up -d`, then migrate and seed again.
