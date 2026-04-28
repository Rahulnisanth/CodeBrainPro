import { CommitRecord } from '../types';

/**
 * Sequential commit processing queue.
 *
 * The CommitPoller fires `onNewCommit` synchronously for each commit it
 * discovers, but our handler is async (AI classification + grouping).
 * Without a queue, multiple handlers run concurrently and the last
 * `setWorkUnits` call wins — which may be from a handler that only saw
 * a subset of commits, causing work units to be lost.
 */
export class CommitQueue {
  private queue: CommitRecord[] = [];
  private processing = false;

  constructor(
    private readonly processor: (commit: CommitRecord) => Promise<void>,
  ) {}

  enqueue(commit: CommitRecord): void {
    this.queue.push(commit);
    if (!this.processing) {
      void this.drain();
    }
  }

  private async drain(): Promise<void> {
    this.processing = true;
    while (this.queue.length > 0) {
      const commit = this.queue.shift()!;
      try {
        await this.processor(commit);
      } catch {
        // Non-fatal — skip this commit and continue
      }
    }
    this.processing = false;
  }
}
