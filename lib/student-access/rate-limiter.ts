export type RateLimitDecision = { allowed: true } | { allowed: false };

export interface StudentAccessRateLimiter {
  check(clientContext: string): RateLimitDecision;
  recordFailure(clientContext: string): void;
}

type AttemptWindow = {
  startedAt: number;
  failures: number;
};

export class InMemoryStudentAccessRateLimiter
  implements StudentAccessRateLimiter
{
  private readonly windows = new Map<string, AttemptWindow>();

  constructor(
    private readonly maximumFailures = 10,
    private readonly windowMs = 15 * 60 * 1000,
    private readonly now: () => number = Date.now,
  ) {}

  check(clientContext: string): RateLimitDecision {
    const window = this.currentWindow(clientContext);
    return window.failures >= this.maximumFailures
      ? { allowed: false }
      : { allowed: true };
  }

  recordFailure(clientContext: string): void {
    const window = this.currentWindow(clientContext);
    window.failures += 1;
  }

  private currentWindow(clientContext: string): AttemptWindow {
    const currentTime = this.now();
    const existing = this.windows.get(clientContext);

    if (!existing || currentTime - existing.startedAt >= this.windowMs) {
      const freshWindow = { startedAt: currentTime, failures: 0 };
      this.windows.set(clientContext, freshWindow);
      return freshWindow;
    }

    return existing;
  }
}
