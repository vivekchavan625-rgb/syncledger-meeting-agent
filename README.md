# SyncLedger — Meeting-to-Execution Agent

> **Meetings end. Decisions don't.**  
> Turn spoken discussions and meeting transcripts into reviewed decisions, assigned tasks, deadline reminders, per-person weekly digests, and a conflict-aware decision audit trail.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-syncledger--meeting--agent.vercel.app-00C853?style=for-the-badge&logo=vercel&logoColor=white)](https://syncledger-meeting-agent.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Conflict Gate](https://img.shields.io/badge/Human--in--the--Loop-Conflict%20Gate-7C3AED?style=for-the-badge)](#how-it-works)
[![License](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge)](#license)

**Live App:** [https://syncledger-meeting-agent.vercel.app](https://syncledger-meeting-agent.vercel.app)

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