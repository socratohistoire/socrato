const DEFAULT_MAX_CONCURRENT_ANALYSES = 15;

type QueueEntry = {
  enqueuedAt: number;
  resolve: (permit: AnalysisPermit) => void;
};

export type AnalysisPermit = {
  waitDurationMs: number;
  release: () => void;
};

export class AnalysisQueue {
  private active = 0;
  private readonly waiting: QueueEntry[] = [];

  constructor(readonly maximumConcurrency: number) {}

  acquire(): Promise<AnalysisPermit> {
    const enqueuedAt = Date.now();
    return new Promise((resolve) => {
      this.waiting.push({ enqueuedAt, resolve });
      this.dispatch();
    });
  }

  private dispatch() {
    while (this.active < this.maximumConcurrency && this.waiting.length > 0) {
      const entry = this.waiting.shift();
      if (!entry) return;
      this.active += 1;
      let released = false;
      entry.resolve({
        waitDurationMs: Math.max(0, Date.now() - entry.enqueuedAt),
        release: () => {
          if (released) return;
          released = true;
          this.active -= 1;
          this.dispatch();
        },
      });
    }
  }
}

function configuredMaximum(value: string | undefined) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_CONCURRENT_ANALYSES;
}

const queueKey = Symbol.for("socrato.analysis-queue");
const globalQueues = globalThis as typeof globalThis & { [queueKey]?: { maximum: number; queue: AnalysisQueue } };

export function getSharedAnalysisQueue(environment: Record<string, string | undefined> = process.env) {
  const maximum = configuredMaximum(environment.SOCRATO_MAX_CONCURRENT_ANALYSES);
  if (!globalQueues[queueKey] || globalQueues[queueKey]?.maximum !== maximum) {
    globalQueues[queueKey] = { maximum, queue: new AnalysisQueue(maximum) };
  }
  return globalQueues[queueKey].queue;
}

export async function runQueuedAnalysis<T>(operation: (waitDurationMs: number) => Promise<T>) {
  const permit = await getSharedAnalysisQueue().acquire();
  try {
    return await operation(permit.waitDurationMs);
  } finally {
    permit.release();
  }
}
