import assert from "node:assert/strict";
import test from "node:test";
import { AnalysisQueue } from "../lib/pedagogical-session-engine/analysis-queue.ts";

test("limite les analyses simultanées et mesure leur attente", async () => {
  const queue = new AnalysisQueue(2);
  const first = await queue.acquire();
  const second = await queue.acquire();
  let thirdStarted = false;
  const thirdPromise = queue.acquire().then((permit) => {
    thirdStarted = true;
    return permit;
  });

  await new Promise((resolve) => setTimeout(resolve, 5));
  assert.equal(thirdStarted, false);
  first.release();
  const third = await thirdPromise;
  assert.equal(thirdStarted, true);
  assert.ok(third.waitDurationMs >= 1);
  second.release();
  third.release();
});

test("rend la libération d’un permis idempotente", async () => {
  const queue = new AnalysisQueue(1);
  const first = await queue.acquire();
  first.release();
  first.release();
  const second = await queue.acquire();
  const thirdPromise = queue.acquire();
  second.release();
  const third = await thirdPromise;
  third.release();
});
