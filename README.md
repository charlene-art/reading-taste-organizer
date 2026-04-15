# Reading taste organizer

A small Next.js app to catalog books you have read, run **AI analysis** (themes, tone, plot/trope patterns, summary), **embed** each analysis for similarity, **cluster** your library into thematic groups, and browse **insights** (tone and trope charts, theme frequency, optional writing prompts).

## Prerequisites

- **[Node.js](https://nodejs.org/)** — install the **LTS** version (20.x or newer). The installer should add Node to your system `PATH`.
- **[OpenAI API key](https://platform.openai.com/api-keys)** — create a key in your OpenAI account; billing must be set up if your org requires it.

### Verify Node is installed

Open a **new** terminal (so `PATH` updates apply) and run:

```bash
node -v
npm -v
```

You should see version numbers (for example `v22.x` and `10.x`). If you see `'node' is not recognized`, reinstall Node and ensure **“Add to PATH”** is enabled, or log out and back in.

---

## How to run (local development)

Follow these steps **in order** from the folder that contains this project’s `package.json` (for example `Cursor Personal Project Test`).

### 1. Go to the project directory

**Windows (PowerShell or Command Prompt):**

```powershell
cd "C:\path\to\Cursor Personal Project Test"
```

**macOS / Linux:**

```bash
cd /path/to/your/project
```

In **Cursor** or **VS Code**, you can use **Terminal → New Terminal**; it usually opens already in the project root.

### 2. Install dependencies

```bash
npm install
```

This downloads packages and runs `prisma generate` so the database client is ready.

- If `npm install` fails with **`'node' is not recognized`** during a script step, Node is not on `PATH` in that terminal. Fix `PATH`, then run `npm install` again.
- First install can take one or two minutes.

### 3. Create your environment file

Copy the example env file to `.env` (the app reads this automatically; do **not** commit real keys to git).

**Windows (Command Prompt):**

```bat
copy .env.example .env
```

**Windows (PowerShell):**

```powershell
Copy-Item .env.example .env
```

**macOS / Linux:**

```bash
cp .env.example .env
```

### 4. Configure `.env`

Open `.env` in an editor. Minimum required:

| Variable | What to put |
|----------|-------------|
| `DATABASE_URL` | A **PostgreSQL** connection string (see below). The app no longer uses a local SQLite file so your data can live in the cloud and work when you deploy. |
| `OPENAI_API_KEY` | Your secret key from OpenAI (starts with `sk-`). **Required** for “Analyze with AI”, embeddings, clustering labels, and writing prompts. |

**Database options:**

- **Easiest for a personal URL + multiple devices:** create a free **[Neon](https://neon.tech/)** Postgres database. In the Neon dashboard, copy the connection string (use the **pooled** / “serverless” URI if Neon offers it). It usually looks like `postgresql://user:pass@ep-something.region.aws.neon.tech/neondb?sslmode=require`.
- **Other hosts:** any **PostgreSQL** provider (Supabase, Railway, Render, etc.) works as long as `DATABASE_URL` is reachable from your machine and from your hosting provider (allow **Vercel IPs** or use `0.0.0.0/0` for testing only).

Example (replace with your real URL and key):

```env
DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
OPENAI_API_KEY="sk-...your-key..."
```

Save the file.

### 5. Create the database tables

```bash
npx prisma migrate deploy
```

You should see migrations applied against your Postgres database. Run this again after you pull new migrations from git. For local schema experiments, advanced users can use `npx prisma migrate dev` instead.

### 6. Start the development server

```bash
npm run dev
```

- The dev server uses **Turbopack** and listens on **port 3000** by default.
- When it is ready, open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 7. First-time flow in the app

1. Click **Add book** and save at least one book (notes help the model).
2. Open the book → **Analyze with AI** (calls OpenAI; requires a valid key and network).
3. Go to **Insights** → **Recompute clusters** once you have several analyzed books.

### Stop the server

In the terminal where `npm run dev` is running, press **Ctrl+C**.

---

## How to run (production build on your machine)

Use this to check that the app builds and to run it like a production server locally.

```bash
npm run build
npm run start
```

Then open **[http://localhost:3000](http://localhost:3000)**. To use another port:

**Windows Command Prompt:**

```bat
set PORT=4000
npm run start
```

**Windows PowerShell:**

```powershell
$env:PORT = "4000"; npm run start
```

**macOS / Linux:**

```bash
PORT=4000 npm run start
```

---

## Troubleshooting

| Problem | What to try |
|--------|-------------|
| `OPENAI_API_KEY is not set` or 503 on analyze | Ensure `.env` exists in the project root, contains `OPENAI_API_KEY=...`, and restart `npm run dev`. |
| `node` / `npm` not found | Reinstall Node LTS with “Add to PATH”, open a **new** terminal, verify `node -v`. |
| Prisma errors after pulling changes | Run `npx prisma generate` and `npx prisma migrate deploy` (needs a valid `DATABASE_URL`). |
| Build fails at `prisma migrate deploy` | Ensure `.env` has a working `DATABASE_URL` before `npm run build`, or deploy on Vercel with env vars set (see below). |
| Port 3000 already in use | Stop the other process or run dev on another port: `npx next dev --turbopack -p 3001` then open `http://localhost:3001`. |

## Optional environment variables

| Variable | Purpose |
|----------|---------|
| `OPENAI_ANALYSIS_MODEL` | Chat model for book analysis (default: `gpt-4o-mini`) |
| `OPENAI_EMBEDDING_MODEL` | Embeddings model (default: `text-embedding-3-small`) |
| `OPENAI_CLUSTER_MODEL` | Short labels for clusters (default: `gpt-4o-mini`) |
| `OPENAI_PROMPTS_MODEL` | Writing prompts (default: `gpt-4o-mini`) |
| `OPENAI_CLUSTER_LLM_NAMES` | Set to `0` to use theme-frequency labels only (no extra LLM call per cluster) |

## Usage

1. **Add book** — title, author, optional date and notes (notes strongly improve analysis).
2. Open the book and click **Analyze with AI** — stores summary, themes, tones, plot patterns, and an embedding.
3. **Insights** — click **Recompute clusters** after you have several analyzed books. Adjust grouping by re-running analysis and clustering as your library grows.
4. **Generate writing prompts** (optional) — uses aggregated themes and tones from analyzed books.

## Access from multiple devices (public URL)

To use the app from your phone, laptop, etc., you need **two pieces**: a **hosted database** (PostgreSQL is already wired in this project) and a **hosted web app** that runs Next.js.

### 1. Hosted PostgreSQL (Neon example)

1. Sign up at **[Neon](https://neon.tech/)** (or use Supabase / Railway / another Postgres host).
2. Create a **project** and a **database**.
3. Copy the **connection string**. Prefer **SSL** (`sslmode=require` is usually in the URL).
4. Put it in your local `.env` as `DATABASE_URL` and run `npx prisma migrate deploy` once so tables exist.

Your data now lives in the cloud, not only on one PC.

### 2. Hosted Next.js (Vercel example)

1. Push this project to **GitHub** (or GitLab / Bitbucket).
2. Sign up at **[Vercel](https://vercel.com/)** and **Import** that repository.
3. In the Vercel project → **Settings → Environment Variables**, add:
   - `DATABASE_URL` — same Neon (or other) Postgres URL as above.
   - `OPENAI_API_KEY` — your OpenAI secret key.
4. Deploy. Vercel runs `npm run build`, which runs `prisma migrate deploy` and then `next build`, so tables are created/updated on the server database during deploy.

5. Open the URL Vercel gives you (for example `https://your-app.vercel.app`). That address works on **any device** on the internet.

**Security:** do not expose `OPENAI_API_KEY` in the browser or commit it to git. It stays in Vercel’s server-side environment only.

### Migrating from an older SQLite setup

If you previously used `file:./dev.db`, that file is **not** used anymore. Point `DATABASE_URL` at Postgres and run `npx prisma migrate deploy`. Re-enter your books or restore from a backup if you had important data only in SQLite.

---

## Deployment (other options)

- **Your own VPS / Docker:** run `npm run build` and `npm start` with `DATABASE_URL` and `OPENAI_API_KEY` in the environment (same Postgres URL as above). Ensure the server can reach Postgres over the network.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |
