# CodeBrainPro — User Guide

> **Version:** 1.0.0 · **Publisher:** Rahulnisanth · **Platform:** VS Code

---

## What is CodeBrainPro?

CodeBrainPro is a VS Code extension that **silently watches your coding activity**, classifies your commits using Google Gemini AI, and turns everything into professional work reports — daily summaries, weekly logs, and appraisal-ready documents.

You just code. CodeBrainPro tells your story.

---

## Table of Contents

1. [Installation](#1-installation)
2. [First-Time Setup](#2-first-time-setup)
3. [The Sidebar](#3-the-sidebar)
4. [Commands](#4-commands)
5. [Generating Reports](#5-generating-reports)
6. [Ask About My Work](#6-ask-about-my-work)
7. [GitHub Sync (Optional)](#7-github-sync-optional)
8. [Settings Reference](#8-settings-reference)
9. [How Tracking Works](#9-how-tracking-works)
10. [AI Classification](#10-ai-classification)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Installation

### From VS Code Marketplace _(coming soon)_

1. Open VS Code
2. Go to **Extensions** (`Cmd+Shift+X`)
3. Search for **CodeBrainPro**
4. Click **Install**

### From VSIX (Manual Install)

1. Download the `.vsix` file from [GitHub Releases](https://github.com/Rahulnisanth/CodeBrainPro/releases)
2. Open VS Code → `Cmd+Shift+P` → **Install from VSIX...**
3. Select the downloaded file

> **Requirements:** VS Code `^1.96.0` · Node.js `≥ 18.x` · An open Git repository

---

## 2. First-Time Setup

When VS Code starts with CodeBrainPro installed, you'll see a welcome prompt:

```text
🚀 CodeBrainPro is active! AI-powered activity tracking enabled.

  [Configure]   [Don't show again]
```

Click **Configure** to open Settings, or dismiss and set up on demand.

### Step 1 — Add Your GitHub Credentials

CodeBrainPro needs a GitHub Personal Access Token (Classic) to sync your activity logs.

1. Run command: `CodeBrainPro: Sync to GitHub Now` (or any sync action)
2. You'll be prompted:
   - **GitHub username** — your GitHub handle
   - **GitHub PAT (Classic)** — paste your token (it's stored securely, never in plain text)

**How to create a GitHub Personal Access Token (Classic):**

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **Generate new token (classic)**
3. Select all `repo` scopes (check the top-level `repo` checkbox, which includes all sub-scopes)
4. Copy the token and paste it when CodeBrainPro prompts you

> **Security note:** Your token is stored in VS Code Secret Storage — the same secure vault used by the GitHub Cobrain extension. It is never written to any settings file.

### Step 2 — Add Your Gemini API Key _(optional, for AI features)_

AI-powered classification, commit grouping, and report narratives require a Google Gemini API key.

1. Run any AI feature (e.g. `CodeBrainPro: Generate Daily Report`)
2. CodeBrainPro will prompt you for your Gemini API key

**How to get a Gemini API key:**

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Click **Create API key**
3. Copy and paste it when prompted

> **Without a Gemini key**, CodeBrainPro still works — commit classification falls back to keyword matching and reports are generated without AI narratives.

---

## 3. The Sidebar

Open the sidebar by pressing `Cmd+Shift+P` → **CodeBrainPro: Open Sidebar**.

The sidebar has two collapsible sections:

```text
CODE BRAIN PRO
├── 📦 Work Units (This Week)
│   ├── 🟢 Auth System Refactor         [feature]
│   ├── 🔴 Fix null pointer on login    [bugfix]
│   └── 🔵 Clean up API types           [refactor]
│
└── 📊 Reports
    ├── Generate Daily Report
    ├── Generate Weekly Report
    ├── Generate Monthly Report
    ├── Generate Appraisal Report
    └── Ask a Question...
```

### Work Units

AI-grouped clusters of related commits. Each unit shows:

- A human-readable task name (AI-generated)
- Work type label: `feature`, `bugfix`, `refactor`, `docs`, `test`, or `chore`
- Number of commits in the group

### Reports

Quick-access buttons for all report types and the Ask a Question chat.

---

## 4. Commands

Access all commands via `Cmd+Shift+P` and type `CodeBrainPro:`.

| Command                                   | What it does                                               |
| ----------------------------------------- | ---------------------------------------------------------- |
| `CodeBrainPro: Start Tracking`            | Begin tracking activity across all detected repos          |
| `CodeBrainPro: Stop Tracking`             | Pause tracking                                             |
| `CodeBrainPro: Set Commit Interval`       | Set how often auto-commit snapshots are taken (minutes)    |
| `CodeBrainPro: Generate Daily Report`     | Report for the last 24 hours                               |
| `CodeBrainPro: Generate Weekly Report`    | Report for the last 7 days                                 |
| `CodeBrainPro: Generate Monthly Report`   | Report for the last 30 days                                |
| `CodeBrainPro: Generate Appraisal Report` | Report for a custom date range                             |
| `CodeBrainPro: Ask About My Work`         | Open the AI chat panel                                     |
| `CodeBrainPro: Sync to GitHub Now`        | Push activity logs to your GitHub code-brain-pro-logs repo |
| `CodeBrainPro: View Today's Activity Log` | Open today's raw JSON activity log                         |
| `CodeBrainPro: Clear Credentials`         | Wipe stored GitHub PAT (Classic) and Gemini key            |
| `CodeBrainPro: Open Settings`             | Jump to CodeBrainPro settings                              |
| `CodeBrainPro: Open Sidebar`              | Focus the CodeBrainPro sidebar panel                       |

---

## 5. Generating Reports

### Daily Report

Covers the last 24 hours. Good for standups.

1. `Cmd+Shift+P` → `CodeBrainPro: Generate Daily Report`
2. Report generates and opens as a Markdown preview
3. File saved to `~/.codeBrainPro/reports/YYYY-MM-DD-daily.md`

### Weekly Work-Log

Covers the last 7 days. Good for weekly check-ins.

1. `Cmd+Shift+P` → `CodeBrainPro: Generate Weekly Report`
2. Saved to `~/.codeBrainPro/reports/YYYY-WW-weekly.md`

### Monthly Summary

Covers the last 30 days.

1. `Cmd+Shift+P` → `CodeBrainPro: Generate Monthly Report`

### Appraisal Report _(most powerful)_

Custom date range — ideal for performance reviews.

1. `Cmd+Shift+P` → `CodeBrainPro: Generate Appraisal Report`
2. Enter **start date** → `2026-01-01`
3. Enter **end date** → `2026-03-31`
4. Report generates covering the full period

### What's in a Report?

Each report contains:

| Section                    | Description                                      |
| -------------------------- | ------------------------------------------------ |
| **Achievement Highlights** | AI-generated 2–3 sentence narrative of your work |
| **Time Summary**           | Total active coding time, daily breakdown table  |
| **Work Units**             | Grouped tasks with type labels and commit counts |
| **Repository Breakdown**   | Time and commits per repo                        |
| **Top Files**              | Most frequently edited files                     |

### Exporting Reports

Reports are saved as **Markdown** by default. To get JSON:

- The JSON format is available for programmatic integrations
- Find reports in `~/.codeBrainPro/reports/`

---

## 6. Ask About My Work

The AI chat panel lets you ask natural language questions about your work history.

1. `Cmd+Shift+P` → `CodeBrainPro: Ask About My Work`  
   _(or click "Ask a Question..." in the sidebar Reports section)_
2. A chat panel opens in a side column
3. Type your question and press **Enter** or click **Ask**

### Example Questions

- _"What did I work on this week?"_
- _"How many bug fixes did I ship last month?"_
- _"Which repos did I spend the most time in?"_
- _"Summarize my work from January to March"_
- _"What features did I build this sprint?"_

> **Requires a Gemini API key.** Without one, CodeBrainPro will prompt you to add one or show a fallback message.

---

## 7. GitHub Sync (Optional)

CodeBrainPro can optionally push your structured activity logs to a private or public GitHub repository called `code-brain-pro-logs`.

### Enable Sync

1. Open Settings → `codeBrainPro.syncEnabled` → set to `true`
2. Set `codeBrainPro.syncFrequencyHours` (default: 24h)

Or trigger a manual sync any time:
`Cmd+Shift+P` → `CodeBrainPro: Sync to GitHub Now`

### What Gets Synced?

```text
code-brain-pro-logs (GitHub repo)
└── logs/
    └── 2026/
        └── 04/
            └── 13.json    ← today's activity log
```

The `code-brain-pro-logs` repository is created automatically on first sync if it doesn't exist.

---

## 8. Settings Reference

Open settings: `Cmd+Shift+P` → `CodeBrainPro: Open Settings`

| Setting                              | Type     | Default | Description                                      |
| ------------------------------------ | -------- | ------- | ------------------------------------------------ |
| `codeBrainPro.enabled`               | boolean  | `true`  | Enable/disable all tracking                      |
| `codeBrainPro.githubUsername`        | string   | `""`    | Your GitHub username                             |
| `codeBrainPro.additionalRepoPaths`   | string[] | `[]`    | Extra repo paths to track beyond open workspaces |
| `codeBrainPro.commitIntervalMinutes` | number   | `30`    | Interval between auto-commit log snapshots       |
| `codeBrainPro.idleThresholdMinutes`  | number   | `5`     | Minutes of no activity before marking as idle    |
| `codeBrainPro.syncEnabled`           | boolean  | `false` | Auto-sync logs to GitHub                         |
| `codeBrainPro.syncFrequencyHours`    | number   | `24`    | Hours between auto-syncs                         |
| `codeBrainPro.logRetentionDays`      | number   | `90`    | Days to keep local activity logs                 |
| `codeBrainPro.showStartupPrompt`     | boolean  | `true`  | Show welcome prompt on VS Code startup           |

### Tips for Common Setups

**Track additional repos not open in VS Code:**

```json
"codeBrainPro.additionalRepoPaths": [
  "/Users/you/projects/backend",
  "/Users/you/projects/mobile-app"
]
```

**Disable daily sync prompt:**

```json
"codeBrainPro.showStartupPrompt": false
```

---

## 9. How Tracking Works

CodeBrainPro tracks your work through two complementary mechanisms:

### Activity Events (Real-time)

Every time you edit a file, CodeBrainPro records:

- Which file changed
- How many lines were added/removed
- Which language you're working in
- Which repo it belongs to
- A timestamp

This happens silently in the background with zero performance impact.

### Commit Detection (Every 5 minutes)

CodeBrainPro polls your repo(s) for new commits every 5 minutes. When a new commit is found:

1. It's classified by AI (or keyword fallback)
2. It's added to the Work Unit grouper
3. The sidebar refreshes automatically

### Session Detection

CodeBrainPro automatically detects when you're active vs idle:

- **Active:** You're editing files
- **Idle:** No file edits for `codeBrainPro.idleThresholdMinutes` (default: 5 minutes)

Active time is what's shown in reports.

### Where Data Lives

All data stays **local on your machine** at `~/.codeBrainPro/`:

```text
~/.codeBrainPro/
├── logs/               ← Daily activity event files (JSON)
├── reports/            ← Generated report files (Markdown/JSON)
├── classifier-cache.json   ← AI classification results (cached)
└── seen-commits.json       ← Tracks which commits CodeBrainPro has seen
```

> **Privacy:** CodeBrainPro never transmits your source code. Only commit messages and `git diff --stat` summaries are sent to the Gemini API.

---

## 10. AI Classification

When a new commit is detected, CodeBrainPro classifies it into one of these work types:

| Icon | Type       | Examples                                        |
| ---- | ---------- | ----------------------------------------------- |
| 🟢   | `feature`  | "Add user authentication", "Implement search"   |
| 🔴   | `bugfix`   | "Fix null pointer crash", "Patch login error"   |
| 🔵   | `refactor` | "Clean up API types", "Rename service layer"    |
| 📄   | `docs`     | "Update README", "Add API documentation"        |
| 🧪   | `test`     | "Add unit tests for auth", "Fix flaky e2e test" |
| ⚙️   | `chore`    | "Update dependencies", "Configure CI pipeline"  |
| ⬜   | `unknown`  | Insufficient signal to classify                 |

### With Gemini API Key

Gemini reads the commit message and diff summary to determine type + confidence score + one-sentence summary.

### Without Gemini API Key (Keyword Fallback)

CodeBrainPro uses keyword matching on the commit message:

| Keywords                                          | → Type     |
| ------------------------------------------------- | ---------- |
| `fix`, `bug`, `patch`, `hotfix`, `issue`, `error` | `bugfix`   |
| `feat`, `add`, `new`, `implement`, `create`       | `feature`  |
| `refactor`, `clean`, `restructure`, `rename`      | `refactor` |
| `doc`, `readme`, `docs`, `comment`                | `docs`     |
| `test`, `spec`, `unit`, `e2e`                     | `test`     |
| `chore`, `dep`, `ci`, `build`, `config`           | `chore`    |

---

## 11. Troubleshooting

### Sidebar not showing

Make sure:

- You have a `.git` folder in your open workspace
- `codeBrainPro.enabled` is `true` in settings
- Run `CodeBrainPro: Start Tracking` from the command palette

### Gemini API errors

- Verify your key is valid at [aistudio.google.com](https://aistudio.google.com)
- Run `CodeBrainPro: Clear Credentials` and re-enter your key
- Check your API quota hasn't been exceeded
- CodeBrainPro will fall back to keyword classification automatically

### GitHub sync failing

- Verify your PAT (Classic) has all `repo` scopes on GitHub
- Run `CodeBrainPro: Clear Credentials` and re-enter your token
- Check your internet connection
- Ensure your PAT (Classic) hasn't expired

### Reports showing 0 activity

The report builder reads from `~/.codeBrainPro/logs/`. Check:

- You've had the extension running for at least a few hours
- Run `CodeBrainPro: View Today's Activity Log` — if the file exists, data is there
- Each file edit generates an event, so you should see entries

### "No activity log for today yet" message

This is normal if you just installed CodeBrainPro or haven't edited any files in the current workspace yet. Edit any tracked file and check again in a minute.

### Extension not activating

CodeBrainPro activates when VS Code detects a `.git` folder. Make sure:

- Your workspace has a `.git` folder (it's a Git repo)
- The extension is enabled (not disabled in Extensions panel)

---

## Privacy & Security

| Concern                      | CodeBrainPro Behaviour                                                |
| ---------------------------- | --------------------------------------------------------------------- |
| Source code                  | **Never sent anywhere.** Stays on your machine.                       |
| Commit messages & diff stats | Sent to Gemini API for classification (optional, can disable AI)      |
| GitHub PAT (Classic)         | Stored in VS Code Secret Storage, never in plaintext                  |
| Gemini API key               | Stored in VS Code Secret Storage, never in plaintext                  |
| Activity logs                | Stored locally at `~/.codeBrainPro/`. Optional GitHub sync if enabled |

---

_Made with ❤️ by Rahulnisanth · [GitHub](https://github.com/Rahulnisanth/CodeBrainPro)_
