# SyncLedger — Meeting-to-Execution Agent

### *Meetings end. Decisions don't.*

Turn spoken discussions and meeting transcripts into **reviewed decisions**, **assigned tasks**, **deadline reminders**, **per-person weekly digests**, and a **conflict-aware decision audit trail**.

[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-111827?style=for-the-badge&logo=github)](https://github.com/vivekchavan625-rgb/syncledger-meeting-agent)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Deploy%20on%20Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com/new)
[![License: MIT](https://img.shields.io/badge/License-MIT-2563EB?style=for-the-badge)](./LICENSE)

> **Tip:** Once deployed on Vercel, replace the `Live Demo` badge link above with your `https://your-app.vercel.app` URL so judges and visitors can open the live app in one click.

---

## Core Features at a Glance

| Feature | What It Does |
| :--- | :--- |
| **Voice & Transcript Capture** | Captures live voice notes with speaker hotkeys (`1-9`) or raw meeting transcripts |
| **Smart Extraction** | Extracts decisions and action items (with owners & deadlines) via structured markers + natural language fallback |
| **Conflict & Supersede Gate** | Flags contradictions against active past decisions (`accept_new` marks old as `superseded: true`, `keep_past` keeps prior decision) |
| **Deadline Reminders** | Computes live urgency buckets (`overdue`, `critical_24h`, `due_soon`, `upcoming`) |
| **Per-Person Weekly Digest** | Groups tasks, deadlines, statuses, and decisions by owner for quick sharing |
| **Resilient Persistence** | Uses `data/db.json` locally with an in-memory fallback for read-only/serverless runtimes |

---

## How It Works

```text
[Capture Voice / Transcript]
           |
           v
[Extract Decisions & Tasks] ---> [Check Active Memory for Conflicts]
                                              |
               +------------------------------+------------------------------+
               | No Conflict                                 Conflict Found |
               v                                                             v
       [Stage Batch]                                     [Human Review Gate: Keep Past / Accept New]
               |                                                             |
               +------------------------------+------------------------------+
                                              |
                                              v
             [Confirm & Post] ---> [Tasks + Reminders + Per-Person Weekly Digests]
```

---

## Tech Stack & Architecture

- **Frontend (`frontend/public`):** `index.html`, `style.css`, `app.js`
- **Backend (`src/index.ts`):** Express + TypeScript REST API
- **Persistence (`src/db.ts`):** JSON store (`data/db.json`) + in-memory fallback

---

## Run Locally

```bash
npm install
npm run build
npm start
```

Then open **[http://localhost:3001/](http://localhost:3001/)** in your browser.

---

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/state` | Fetch meetings, staged batch, tasks, reminders, and weekly digests |
| `POST` | `/api/analyze` | Analyze transcript into candidate decisions, actions, and conflicts |
| `POST` | `/api/confirm` | Apply conflict resolutions, save approved tasks, and record meeting |
| `POST` | `/api/reset-demo` | Reset workspace back to seeded demo data |

---

## License

Released under the **[MIT License](./LICENSE)**.