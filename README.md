# SyncLedger - Meeting-to-Execution Agent

> **"Meetings end. Decisions don't."**
> Turn spoken discussions and meeting transcripts into reviewed decisions, assigned tasks, deadline reminders, per-person weekly digests, and a conflict-aware decision audit trail.

## Key Capabilities

- **Live Voice & Transcript Capture:** Capture meeting notes with speaker selection and hotkeys (`1-9`) or paste raw transcripts.
- **Decision & Action Extraction:** Parses structured markers (`Decision:`, `Action:`) as well as conversational lines and deadlines with deterministic fallbacks.
- **Conflict Detection & Supersede Gate:** Checks new decisions against active (non-superseded) past decisions before committing (`accept_new` marks past decisions as `superseded: true`; `keep_past` retains prior commitments).
- **Execution Tracking, Reminders & Weekly Digests:** Tracks approved tasks, computes deadline reminder buckets (`overdue`, `critical_24h`, `due_soon`, `upcoming`), and builds per-person weekly digests.
- **Local & Serverless Persistence:** Persists to `data/db.json` locally with an in-memory fallback for read-only environments.

## Architecture

```text
Frontend (frontend/public) ---> Express API (src/index.ts) ---> Persistence Layer (src/db.ts)
  index.html, style.css, app.js    /api/state, /api/analyze           data/db.json + In-Memory Cache
                                   /api/confirm, /api/reset-demo
```

## Local Setup

```bash
npm install
npm run build
npm start
```

Open `http://localhost:3001/` in your browser.

## API Endpoints

| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `GET` | `/api/state` | Returns meetings, staged batch, tasks, reminders, and weekly digests |
| `POST` | `/api/analyze` | Analyzes transcript into candidate decisions, actions, and conflicts |
| `POST` | `/api/confirm` | Applies conflict resolutions, saves approved tasks, and records meeting |
| `POST` | `/api/reset-demo` | Resets state back to initial seed data |

## License

MIT License - see [LICENSE](./LICENSE).