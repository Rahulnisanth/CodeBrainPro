import * as vscode from 'vscode';
import { ActivityEvent } from '../types';
import { RepoManager } from '../repos/repoManager';
import { GitClient } from '../git/gitClient';
import { SessionManager } from './sessionManager';
import { LogWriter } from './logWriter';
import { generateUUID } from '../utils/uuid';
import { toISO } from '../utils/dateUtils';

/**
 * Activity Tracker — hooks into VS Code document events to record developer activity.
 * Uses `git diff --numstat` for accurate line-change counting.
 */
export class ActivityTracker {
  private lastEventTime: number = Date.now();
  private idleCheckHandle: ReturnType<typeof setInterval> | null = null;
  private isIdle = false;

  /** Debounce timers keyed by file path — avoids spamming git on every keystroke */
  private editTimers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly repoManager: RepoManager,
    private readonly gitClient: GitClient,
    private readonly sessionManager: SessionManager,
    private readonly logWriter: LogWriter,
  ) {}

  /**
   * Activate all VS Code event hooks and start idle detection.
   */
  activate(): void {
    // Hook: text document changes — debounce per file, then query git for real diff stats
    const onEdit = vscode.workspace.onDidChangeTextDocument((e) => {
      const doc = e.document;
      if (doc.uri.scheme !== 'file') return;

      const filePath = doc.uri.fsPath;

      // Clear any pending timer for this file
      const existing = this.editTimers.get(filePath);
      if (existing) clearTimeout(existing);

      // Debounce: wait 500ms of inactivity before recording the edit
      const timer = setTimeout(() => {
        this.editTimers.delete(filePath);
        this.recordEditWithGitStats(filePath, doc.languageId);
      }, 500);

      this.editTimers.set(filePath, timer);

      // Always update last-event time and resume from idle immediately
      this.lastEventTime = Date.now();
      if (this.isIdle) {
        this.isIdle = false;
        this.sessionManager.resumeSession();
      }
    });

    // Hook: active editor changes (focus/context switch)
    const onFocus = vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (!editor || editor.document.uri.scheme !== 'file') return;
      this.handleEvent({
        filePath: editor.document.uri.fsPath,
        type: 'focus',
        linesAdded: 0,
        linesRemoved: 0,
        languageId: editor.document.languageId,
      });
    });

    // Idle detection interval — check every 30 seconds
    const idleCheckInterval = setInterval(() => {
      this.checkIdle();
    }, 30 * 1000);

    this.idleCheckHandle = idleCheckInterval;
    this.context.subscriptions.push(onEdit, onFocus, {
      dispose: () => {
        clearInterval(idleCheckInterval);
        // Clean up any pending debounce timers
        this.editTimers.forEach((timer) => clearTimeout(timer));
        this.editTimers.clear();
      },
    });
  }

  /**
   * Query git for the actual lines added/removed for a file, then record the event.
   */
  private async recordEditWithGitStats(
    filePath: string,
    languageId: string,
  ): Promise<void> {
    const repo = this.repoManager.getRepoForFile(filePath);
    if (!repo) return;

    const { linesAdded, linesRemoved } =
      await this.gitClient.getFileLineChanges(repo.repoPath, filePath);

    this.handleEvent({
      filePath,
      type: 'edit',
      linesAdded,
      linesRemoved,
      languageId,
    });
  }

  private handleEvent(args: {
    filePath: string;
    type: 'edit' | 'focus';
    linesAdded: number;
    linesRemoved: number;
    languageId: string;
  }): void {
    this.lastEventTime = Date.now();

    if (this.isIdle) {
      this.isIdle = false;
      this.sessionManager.resumeSession();
    }

    const repo = this.repoManager.getRepoForFile(args.filePath);
    if (!repo) return; // Ignore files outside tracked repos

    const session = this.sessionManager.getCurrentSession(repo.repoPath);

    const event: ActivityEvent = {
      eventId: generateUUID(),
      type: args.type,
      filePath: args.filePath,
      repoRoot: repo.repoPath,
      repoName: repo.repoName,
      timestamp: toISO(),
      linesAdded: args.linesAdded,
      linesRemoved: args.linesRemoved,
      languageId: args.languageId,
      sessionId: session.sessionId,
    };

    this.logWriter.writeEvent(event);
    this.sessionManager.recordActivity(event);
  }

  private checkIdle(): void {
    const config = vscode.workspace.getConfiguration('codeBrainPro');
    const idleThresholdMs =
      config.get<number>('idleThresholdMinutes', 5) * 60 * 1000;
    const elapsed = Date.now() - this.lastEventTime;

    if (!this.isIdle && elapsed >= idleThresholdMs) {
      this.isIdle = true;
      this.sessionManager.markIdle();
    }
  }
}
