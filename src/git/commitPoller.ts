import * as vscode from 'vscode';
import { GitClient, CommitInfo } from './gitClient';
import { RepoManager } from '../repos/repoManager';
import { CommitRecord } from '../types';
import { writeJson, readJson, getCodeBrainProDir } from '../utils/storage';
import * as path from 'path';

type CommitListener = (commit: CommitRecord) => void;

/**
 * Polls all tracked repos every 5 minutes for new commits.
 * Stores handle in context.subscriptions
 */
export class CommitPoller {
  private lastSeenCommits = new Map<string, Set<string>>();
  private listeners: CommitListener[] = [];
  private readonly seenCommitsFile: string;
  private pollTimeout: NodeJS.Timeout | null = null;
  private isPolling = false;
  private pollRequested = false;
  private repoWatchers = new Map<string, vscode.FileSystemWatcher[]>();

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly gitClient: GitClient,
    private readonly repoManager: RepoManager,
  ) {
    this.seenCommitsFile = path.join(getCodeBrainProDir(), 'seen-commits.json');
    // Load previously seen commits to persist across restarts
    const stored = readJson<Record<string, string[]>>(this.seenCommitsFile, {});
    Object.entries(stored).forEach(([repo, hashes]) => {
      this.lastSeenCommits.set(repo, new Set(hashes));
    });
  }

  /**
   * Start watching for commits and register disposables.
   */
  start(): void {
    this.context.subscriptions.push({
      dispose: () => {
        this.disposeWatchers();
      },
    });

    // Run immediately on start
    this.triggerPoll();
  }

  private disposeWatchers(): void {
    for (const watchers of this.repoWatchers.values()) {
      watchers.forEach((w) => w.dispose());
    }
    this.repoWatchers.clear();
  }

  private setupWatchers(): void {
    const repos = this.repoManager.getAll();
    for (const repo of repos) {
      if (!this.repoWatchers.has(repo.repoPath)) {
        try {
          const watchers: vscode.FileSystemWatcher[] = [];

          const headPattern = new vscode.RelativePattern(
            repo.repoPath,
            '.git/logs/HEAD',
          );
          const headWatcher =
            vscode.workspace.createFileSystemWatcher(headPattern);
          headWatcher.onDidChange(() => this.triggerPoll());
          headWatcher.onDidCreate(() => this.triggerPoll());
          watchers.push(headWatcher);

          const refsPattern = new vscode.RelativePattern(
            repo.repoPath,
            '.git/refs/heads/**',
          );
          const refsWatcher =
            vscode.workspace.createFileSystemWatcher(refsPattern);
          refsWatcher.onDidChange(() => this.triggerPoll());
          refsWatcher.onDidCreate(() => this.triggerPoll());
          watchers.push(refsWatcher);

          this.repoWatchers.set(repo.repoPath, watchers);
          watchers.forEach((w) => this.context.subscriptions.push(w));
        } catch {
          // Ignore errors setting up watchers for a specific repo
        }
      }
    }
  }

  /**
   * Trigger a debounced poll.
   */
  triggerPoll(): void {
    if (this.pollTimeout) {
      clearTimeout(this.pollTimeout);
    }
    this.pollTimeout = setTimeout(() => {
      void this.executePoll();
    }, 2000);
  }

  private async executePoll(): Promise<void> {
    if (this.isPolling) {
      this.pollRequested = true;
      return;
    }
    this.isPolling = true;
    this.pollRequested = false;

    try {
      this.setupWatchers(); // Ensure new repos are watched
      await this.poll();
    } finally {
      this.isPolling = false;
      if (this.pollRequested) {
        this.triggerPoll();
      }
    }
  }

  /**
   * Add a listener for new commit events.
   */
  onNewCommit(listener: CommitListener): void {
    this.listeners.push(listener);
  }

  /**
   * Trigger an immediate poll of all repos for new commits.
   * Called externally (e.g. after a GitHub sync) to refresh without
   * waiting for the next scheduled interval.
   */
  async poll(): Promise<void> {
    const repos = this.repoManager.getAll();
    const since = '7 days ago';

    for (const repo of repos) {
      try {
        const commits: CommitInfo[] = await this.gitClient.getRecentCommits(
          repo.repoPath,
          since,
        );

        const seen = this.lastSeenCommits.get(repo.repoPath) ?? new Set();
        const newCommits = commits.filter((c) => !seen.has(c.hash));

        for (const commit of newCommits) {
          seen.add(commit.hash);
          const diffStat = await this.gitClient.getDiffStat(repo.repoPath);
          const record: CommitRecord = {
            hash: commit.hash,
            message: commit.message,
            author: commit.author,
            timestamp: commit.timestamp,
            repoName: repo.repoName,
            repoPath: repo.repoPath,
            filesChanged: [],
            diffStat,
            linesAdded: 0,
            linesRemoved: 0,
          };
          this.listeners.forEach((l) => {
            l(record);
          });
        }

        this.lastSeenCommits.set(repo.repoPath, seen);
      } catch {
        // Silently ignore per-repo errors
      }
    }

    // Persist seen commits
    const toStore: Record<string, string[]> = {};
    this.lastSeenCommits.forEach((set, repoPath) => {
      toStore[repoPath] = Array.from(set);
    });
    writeJson(this.seenCommitsFile, toStore);
  }
}
