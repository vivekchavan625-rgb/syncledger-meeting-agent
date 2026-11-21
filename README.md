# SyncLedger — Meeting-to-Execution Agent

> **Meetings end. Decisions don't.**  
> Turn spoken discussions and meeting transcripts into reviewed decisions, assigned tasks, deadline reminders, per-person weekly digests, and a conflict-aware decision audit trail.

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Architecture](https://img.shields.io/badge/Human--in--the--Loop-Conflict%20Gate-7C3AED?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-059669?style=flat-square)

---

## Why SyncLedger?

In real teams, meetings generate plenty of talk—but action items get scattered across notes, deadlines slip quietly, and new decisions silently contradict earlier commitments.

**SyncLedger** bridges the gap between **conversation** and **accountable execution**:
1. **Captures** live voice notes (with speaker hotkeys `1–9`) or raw meeting transcripts.
2. **Extracts** candidate decisions and action items (owners + deadlines).
3. **Detects conflicts** against active prior decisions before anything is committed.
4. **Gates execution behind human review** (`Keep Past` vs. `Accept New`), then generates **tasks**, **deadline urgency reminders**, and **per-person weekly digests**.

---

## Core Features at a Glance

| Feature | What It Does |
| :--- | :--- |
| **Voice & Transcript Capture** | Captures live voice notes with speaker hotkeys (`1–9`) or structured/raw meeting transcripts. |
| **Smart Extraction** | Extracts decisions and action items (with owners & deadlines) via structured markers (`Decision:`, `Action:`) plus natural-language fallback. |
| **Conflict & Supersede Gate** | Flags contradictions against active past decisions (`accept_new` marks old decisions as `superseded: true`; `keep_past` preserves prior decisions). |
| **Deadline Reminders** | Computes live urgency buckets (`overdue`, `critical_24h`, `due_soon`, `upcoming`) so owners know what needs attention first. |
| **Per-Person Weekly Digest** | Groups tasks, deadlines, statuses, and decisions by owner for quick team sharing. |
| **Resilient Persistence** | Uses JSON persistence locally with serverless-safe memory and `/tmp` fallback support. |

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

## Visual Walkthrough (Website Screenshots)

Save your website screenshots inside the `assets/` folder using the filenames below:

| Screen / Stage | What It Shows | File Path in `assets/` |
| :--- | :--- | :--- |
| **Overview & Capture** | Hero summary, live counters, and meeting transcript / voice capture workspace | `assets/01-overview-capture.png` |
| **Conflict Review Gate** | Side-by-side past decision vs. new proposal with `Keep Past` / `Accept New` controls | `assets/02-conflict-review.png` |
| **Confirm & Post** | Approving staged decisions & tasks to publish execution items | `assets/03-confirm-post.png` |
| **Tasks, Reminders & Digests** | Tracked owner tasks, deadline urgency buckets, per-person digests, and decision memory | `assets/04-tasks-digests-memory.png` |

---

## Tech Stack & Architecture

* **Frontend (`frontend/public`)**: `index.html`, `style.css`, `app.js` — clean multi-view workspace (`Overview`, `Capture`, `Pipeline`, `Review`, `Tasks`, `Reminders`, `Digests`, `Memory`).
* **Backend (`src/index.ts`)**: Express + TypeScript REST API handling extraction, conflict detection, batch staging, confirmation, and demo reset.
* **Persistence (`src/db.ts`)**: JSON store with resilient runtime fallback for local and serverless execution.
* **Serverless Entry (`api/index.ts` & `vercel.json`)**: Routes `/api/*` requests cleanly to the Express application.

---

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/state` | Fetch meetings, staged batch, tasks, reminders, and weekly digests. |
| `POST` | `/api/analyze` | Analyze transcript into candidate decisions, actions, and conflicts. |
| `POST` | `/api/confirm` | Apply conflict resolutions, save approved tasks, and record the meeting. |
| `POST` | `/api/reset-demo` | Reset workspace back to seeded demo data. |

---

## Run Locally

```bash
npm install
npm run build
npm start
```

Then open `http://localhost:3001/` in your browser.

---

## License

Released under the **MIT License**.
