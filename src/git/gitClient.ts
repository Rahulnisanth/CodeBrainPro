import { exec } from 'child_process';
import { promisify } from 'util';
import { CommitInfo } from '../types';

const execAsync = promisify(exec);

/**
 * Async Git command wrappers.
 */
export class GitClient {
  /**
   * Check if a path is inside a git work tree.
   */
  async isGitRepo(cwd: string): Promise<boolean> {
    try {
      await execAsync('git rev-parse --is-inside-work-tree', { cwd });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the remote URL for a repository (origin).
   */
  async getRemoteUrl(cwd: string): Promise<string | null> {
    try {
      const { stdout } = await execAsync('git remote get-url origin', { cwd });
      return stdout.trim() || null;
    } catch {
      return null;
    }
  }

  /**
   * Get the repo name from its remote URL or folder name.
   */
  async getRepoName(cwd: string): Promise<string> {
    const remoteUrl = await this.getRemoteUrl(cwd);
    if (remoteUrl) {
      const match = remoteUrl.match(/\/([^/]+?)(\.git)?$/);
      if (match) return match[1];
    }
    return cwd.split('/').pop() ?? 'unknown';
  }

  /**
   * Get the unstaged diff stat.
   */
  async getDiffStat(cwd: string): Promise<string> {
    try {
      const { stdout } = await execAsync('git diff --stat', { cwd });
      return stdout.trim();
    } catch {
      return '';
    }
  }

  /**
   * Get recent commits since a date. Returns structured CommitInfo[].
   */
  async getRecentCommits(cwd: string, since: string): Promise<CommitInfo[]> {
    try {
      // Get the configured Git user email
      const emailObj = await execAsync('git config user.email', { cwd }).catch(
        () => ({ stdout: '' }),
      );
      const userEmail = emailObj.stdout.trim();

      // Get the configured Git user name
      const nameObj = await execAsync('git config user.name', { cwd }).catch(
        () => ({ stdout: '' }),
      );
      const userName = nameObj.stdout.trim();

      const { stdout } = await execAsync(
        `git log --oneline --since="${since}" --pretty=format:"%H|%s|%an|%ae|%ad" --date=iso`,
        { cwd },
      );
      if (!stdout.trim()) return [];

      return stdout
        .trim()
        .split('\n')
        .map((line) => {
          const [hash, message, authorName, authorEmail, timestamp] =
            line.split('|');
          return {
            hash: hash.trim(),
            message: message.trim(),
            author: authorName.trim(),
            authorEmail: authorEmail?.trim(),
            timestamp: timestamp?.trim(),
          };
        })
        .filter((c) => {
          if (!c.hash || !c.message) return false;
          // Filter out peer commits: only accept user's own commits
          if (userEmail && c.authorEmail === userEmail) return true;
          if (userName && c.author === userName) return true;
          if (!userEmail && !userName) return true;
          return false;
        });
    } catch {
      return [];
    }
  }

  /**
   * Get lines added/removed for a specific file from the working tree diff.
   * Combines both unstaged and staged changes.
   */
  async getFileLineChanges(
    cwd: string,
    filePath: string,
  ): Promise<{ linesAdded: number; linesRemoved: number }> {
    try {
      const { stdout } = await execAsync(
        `git diff --numstat -- "${filePath}" && git diff --cached --numstat -- "${filePath}"`,
        { cwd },
      );
      let linesAdded = 0;
      let linesRemoved = 0;
      stdout
        .trim()
        .split('\n')
        .forEach((line) => {
          if (!line.trim()) return;
          const parts = line.split('\t');
          const added = parseInt(parts[0], 10);
          const removed = parseInt(parts[1], 10);
          if (!isNaN(added)) linesAdded += added;
          if (!isNaN(removed)) linesRemoved += removed;
        });
      return { linesAdded, linesRemoved };
    } catch {
      return { linesAdded: 0, linesRemoved: 0 };
    }
  }

  /**
   * Get the number of lines added and removed for a specific commit.
   */
  async getCommitLineChanges(
    cwd: string,
    hash: string,
  ): Promise<{ linesAdded: number; linesRemoved: number }> {
    try {
      const { stdout } = await execAsync(
        `git show --numstat --format="" ${hash}`,
        { cwd },
      );
      let linesAdded = 0;
      let linesRemoved = 0;
      stdout
        .trim()
        .split('\n')
        .forEach((line) => {
          const parts = line.split('\t');
          const added = parseInt(parts[0], 10);
          const removed = parseInt(parts[1], 10);
          if (!isNaN(added)) linesAdded += added;
          if (!isNaN(removed)) linesRemoved += removed;
        });
      return { linesAdded, linesRemoved };
    } catch {
      return { linesAdded: 0, linesRemoved: 0 };
    }
  }
}
