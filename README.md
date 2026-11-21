# SyncLedger — Meeting-to-Execution Agent

> **Meetings end. Decisions don't.**
> Turn spoken discussions and meeting transcripts into reviewed decisions, assigned tasks, deadline reminders, per‑person weekly digests, and a conflict‑aware decision audit trail.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-syncledger--meeting--agent.vercel.app-00C853?style=for-the-badge&logo=vercel&logoColor=white)](https://syncledger-meeting-agent.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Conflict Gate](https://img.shields.io/badge/Human--in--the--Loop-Conflict%20Gate-7C3AED?style=for-the-badge)](#how-it-works)
[![License](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge)](#license)

**Live App:** https://syncledger-meeting-agent.vercel.app

---

## Why SyncLedger?

In real teams, meetings generate plenty of talk — but action items get scattered across notes, deadlines slip quietly, and new decisions silently contradict earlier commitments.

SyncLedger bridges the gap between **conversation** and **accountable execution** through four core stages:
1. **Capture** – record live voice (hotkeys `1–9`) or upload a raw transcript.
2. **Extract** – parse `Decision:` and `Action:` markers, with a natural‑language fallback.
3. **Conflict Detection** – compare new decisions against active past decisions.
4. **Human Review Gate** – choose *Keep Past* or *Accept New* before generating **tasks**, **reminders**, and **per‑person weekly digests**.

---

## Core Features at a Glance

| Feature | What It Does |
| :--- | :--- |
| **Voice & Transcript Capture** | Live voice notes with speaker hotkeys (`1–9`) or structured/raw meeting transcripts. |
| **Smart Extraction** | Parses `Decision:` and `Action:` markers; falls back to heuristic natural‑language parsing. |
| **Conflict & Supersede Gate** | Flags contradictions; `accept_new` marks old decisions `superseded: true`, `keep_past` preserves them. |
| **Deadline Reminders** | Buckets tasks into `overdue`, `critical_24h`, `due_soon`, `upcoming`. |
| **Per‑Person Weekly Digest** | Groups tasks, deadlines, and decisions by owner for easy sharing. |
| **Resilient Persistence** | JSON store on disk with in‑memory / `/tmp` fallback for serverless/read‑only runtimes. |

---

## How It Works

```text
[Capture Voice / Transcript]
           |
           v
[Extract Decisions & Tasks] --> [Check Active Memory for Conflicts]
                                   |
          +------------------------+------------------------+
          | No Conflict                             Conflict Found |
          v                                             v
   [Stage Batch]                         [Human Review Gate: Keep Past / Accept New]
          |
          +------------------------+------------------------+
                                   |
                                   v
                     [Confirm & Post] --> [Tasks + Reminders + Per‑Person Weekly Digests]
```

---

## Website Visual Showcase

> **Make sure the `assets/` directory exists and contains the screenshots referenced below.**

### Overview & Capture Workspace
![Overview & Capture](assets/01-overview-capture.png)

### Conflict Review Gate
![Conflict Review Gate](assets/02-conflict-review.png)

### Confirm & Post Execution Flow
![Confirm & Post](assets/03-confirm-post.png)

### Tasks, Reminders & Per‑Person Digests
![Tasks & Digests](assets/04-tasks-digests-memory.png)

---

## Tech Stack & Architecture
- **Frontend:** Plain HTML/CSS/JS (served from `frontend/public`).
- **Backend:** Node.js with Express, written in TypeScript.
- **Data Store:** JSON file (`data/db.json`) with in‑memory cache; fallback to `/tmp` for Vercel serverless.
- **Conflict Engine:** Keyword‑based detection with deterministic supersede logic.
- **Deployment:** Vercel (static frontend + serverless API) – live at the link above.

---

## API Endpoints
| Method | Path | Description |
| :--- | :--- | :--- |
| `GET` | `/api/state` | Returns current meetings, staged batch, tasks, reminders, and weekly digests. |
| `POST` | `/api/analyze` | Accepts `{ meetingTitle, transcript }`; returns parsed decisions, actions, and any conflicts. |
| `POST` | `/api/confirm` | Accepts `{ approvedTaskIds, conflictResolutions }`; applies conflict resolutions, creates a new meeting, updates tasks/reminders. |
| `POST` | `/api/reset-demo` | Resets the in‑memory DB to the seeded demo state. |

---

## Run Locally
```bash
# Clone the repo (already done locally)
cd SyncLedger
npm install            # install deps
npm run build          # compile TypeScript
npm start              # starts server on http://localhost:3001
```

The frontend is served automatically from `frontend/public`.

---

## License

MIT © 2026 Vivek Ramdas Chavan

---
