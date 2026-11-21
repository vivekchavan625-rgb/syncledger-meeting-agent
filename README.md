# SyncLedger - Meeting-to-Execution Agent

> Meetings end. Decisions do not.

Turn spoken discussions and meeting transcripts into reviewed decisions, assigned tasks, deadline reminders, per-person weekly digests, and a conflict-aware decision audit trail.

## Key Capabilities
- Live Voice & Transcript Capture with speaker selection and hotkeys
- Decision & Action Extraction (structured markers + natural language fallback)
- Conflict Detection & Supersede Gate (accept_new / keep_past)
- Deadline Reminders (overdue, critical_24h, due_soon, upcoming) & Per-Person Weekly Digests
- Local JSON persistence with in-memory fallback

## Architecture
Frontend (frontend/public) -> Express API (src/index.ts) -> Persistence Layer (src/db.ts)

## Local Setup
npm install
npm run build
npm start

## API Endpoints
- GET /api/state
- POST /api/analyze
- POST /api/confirm
- POST /api/reset-demo

## License
MIT License - see LICENSE
