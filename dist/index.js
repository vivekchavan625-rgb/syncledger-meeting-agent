"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const db_1 = require("./db");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// ----- Serve Frontend -----
const staticPath = path_1.default.resolve(__dirname, '..', 'frontend', 'public');
app.use(express_1.default.static(staticPath));
const PORT = 3001;
// Helper to get fresh DB
async function getDB() {
    return await (0, db_1.readDB)();
}
// Helper to detect conflicts between new decisions and past non‑superseded decisions
function detectConflicts(newDecisions, pastDecisions) {
    const conflicts = [];
    const keywords = [
        'launch date',
        'auth method',
        'payment gateway',
        'stack',
        'database',
        'deadline',
    ];
    for (const nd of newDecisions) {
        const ndText = nd.text.toLowerCase();
        for (const kw of keywords) {
            if (ndText.includes(kw)) {
                for (const pd of pastDecisions) {
                    if (pd.superseded)
                        continue;
                    const pdText = pd.text.toLowerCase();
                    if (pdText.includes(kw) && pdText !== ndText) {
                        conflicts.push({ newId: nd.id, pastId: pd.id, reason: kw });
                    }
                }
            }
        }
    }
    return conflicts;
}
// Simple parser – extracts lines starting with "Decision:" and "Action:".
function parseTranscript(transcript) {
    const decisions = [];
    const actions = [];
    const lines = transcript.split(/\r?\n/);
    let decisionCount = 0;
    let actionCount = 0;
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.toLowerCase().startsWith('decision:')) {
            decisionCount++;
            const text = trimmed.slice('decision:'.length).trim();
            decisions.push({
                id: `d${Date.now()}${decisionCount}`,
                text,
                timestamp: new Date().toISOString(),
            });
        }
        else if (trimmed.toLowerCase().startsWith('action:')) {
            // Expected format: Action: <title> | owner:<owner> | deadline:<YYYY‑MM‑DD>
            actionCount++;
            const rest = trimmed.slice('action:'.length).trim();
            const parts = rest.split('|').map(p => p.trim());
            const title = parts[0] || `Action ${actionCount}`;
            const ownerPart = parts.find(p => p.toLowerCase().startsWith('owner:')) || '';
            const deadlinePart = parts.find(p => p.toLowerCase().startsWith('deadline:')) || '';
            const owner = ownerPart.split(':')[1]?.trim() || 'unassigned';
            const deadline = deadlinePart.split(':')[1]?.trim() || new Date().toISOString().split('T')[0];
            actions.push({
                id: `t${Date.now()}${actionCount}`,
                title,
                owner,
                deadline,
            });
        }
        else {
            // Heuristic natural‑language extraction (fallback when no markers)
            const speakerMatch = trimmed.match(/^([A-Za-z]+):\s*(.*)$/);
            if (speakerMatch) {
                const speaker = speakerMatch[1];
                const content = speakerMatch[2];
                // Look for simple deadline phrasing (by <day>) – placeholder
                const deadlineMatch = content.match(/by\s+(\w+\s*\d{1,2}|Friday|Monday|Tuesday|Wednesday|Thursday|Saturday|Sunday)/i);
                if (deadlineMatch) {
                    actions.push({
                        id: `t${Date.now()}${actionCount++}`,
                        title: content,
                        owner: speaker.toLowerCase(),
                        deadline: new Date().toISOString().split('T')[0], // placeholder
                    });
                }
                // Look for decision phrasing
                const decisionMatch = content.match(/we decided to (.+)/i);
                if (decisionMatch) {
                    decisions.push({
                        id: `d${Date.now()}${decisionCount++}`,
                        text: decisionMatch[1].trim(),
                        timestamp: new Date().toISOString(),
                    });
                }
            }
        }
    }
    return { decisions, actions };
}
app.get('/api/state', async (_req, res) => {
    const db = await getDB();
    // Compute reminders from incomplete tasks
    const today = new Date();
    const reminders = db.tasks
        .filter(t => !t.completed)
        .map(t => {
        const deadline = new Date(t.deadline);
        const diffDays = (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        let status;
        if (diffDays < 0)
            status = 'overdue';
        else if (diffDays <= 1)
            status = 'critical_24h';
        else if (diffDays <= 3)
            status = 'due_soon';
        else
            status = 'upcoming';
        return { type: 'deadline', taskId: t.id, status };
    });
    // Weekly digests per owner (tasks + decisions that mention owner)
    const weeklyDigests = {};
    const owners = new Set();
    db.tasks.forEach(t => owners.add(t.owner));
    db.meetings.forEach(m => {
        m.decisions.forEach(d => {
            // Simple heuristic: if decision text contains an owner name, associate it
            owners.forEach(o => {
                if (d.text.toLowerCase().includes(o.toLowerCase())) {
                    if (!weeklyDigests[o])
                        weeklyDigests[o] = [];
                    weeklyDigests[o].push({ meeting: m.id, decision: d });
                }
            });
        });
    });
    owners.forEach(o => {
        if (!weeklyDigests[o])
            weeklyDigests[o] = [];
        const ownerTasks = db.tasks.filter(t => t.owner === o);
        weeklyDigests[o].push({ tasks: ownerTasks });
    });
    res.json({
        meetings: db.meetings,
        stagedBatch: db.stagedBatch,
        tasks: db.tasks,
        reminders,
        weeklyDigests,
    });
});
app.post('/api/analyze', async (req, res) => {
    const { meetingTitle, transcript } = req.body;
    if (!meetingTitle || !transcript) {
        return res.status(400).json({ error: 'meetingTitle and transcript are required' });
    }
    const { decisions, actions } = parseTranscript(transcript);
    const db = await getDB();
    // Gather past non‑superseded decisions for conflict detection
    const pastDecisions = [];
    db.meetings.forEach(m => {
        m.decisions.forEach(d => {
            const dec = d;
            if (!dec.superseded)
                pastDecisions.push(dec);
        });
    });
    const conflicts = detectConflicts(decisions, pastDecisions);
    db.stagedBatch = { meetingTitle, decisions, actions, conflicts };
    await (0, db_1.writeDB)(db);
    res.json({ stagedBatch: db.stagedBatch });
});
app.post('/api/confirm', async (req, res) => {
    const { approvedTaskIds, conflictResolutions } = req.body;
    const db = await getDB();
    const batch = db.stagedBatch;
    if (!batch) {
        return res.status(400).json({ error: 'No staged batch to confirm' });
    }
    const resolutions = conflictResolutions || {};
    // Apply conflict resolutions – supersede past decisions when requested
    if (Array.isArray(batch.conflicts)) {
        for (const c of batch.conflicts) {
            const resolution = resolutions[c.pastId];
            if (resolution === 'accept_new') {
                // Mark the past decision as superseded
                for (const m of db.meetings) {
                    const idx = m.decisions.findIndex((d) => d.id === c.pastId);
                    if (idx !== -1) {
                        m.decisions[idx].superseded = true;
                    }
                }
            }
        }
    }
    const filteredDecisions = (batch.decisions || []).filter((dec) => {
        const res = resolutions[dec.id];
        return res !== 'keep_past';
    });
    const newMeeting = {
        id: `m${Date.now()}`,
        title: batch.meetingTitle || 'Untitled',
        date: new Date().toISOString().split('T')[0],
        decisions: filteredDecisions,
        tasks: batch.actions || [],
    };
    db.meetings.push(newMeeting);
    if (Array.isArray(approvedTaskIds)) {
        const tasksToAdd = (batch.actions || []).filter((t) => approvedTaskIds.includes(t.id));
        db.tasks.push(...tasksToAdd);
    }
    // Re‑compute reminders & digests after update (simple placeholders)
    db.reminders = [];
    db.weeklyDigests = {};
    db.stagedBatch = null;
    await (0, db_1.writeDB)(db);
    res.json({ message: 'Confirmed', meeting: newMeeting });
});
app.post('/api/reset-demo', async (_req, res) => {
    await (0, db_1.seedDB)();
    res.json({ message: 'Database reset to initial seeded state' });
});
app.listen(PORT, '127.0.0.1', () => console.log(`Server running on port ${PORT}`));
exports.default = app;
