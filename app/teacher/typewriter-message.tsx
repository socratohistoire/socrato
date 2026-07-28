"use client";

import { useEffect, useState } from "react";
import { LocalTeacherMessageViewStore } from "@/lib/teacher-dashboard/message-view-store";

export function TypewriterMessage({ messageKey, text, onFirstViewComplete }: { messageKey: string; text: string; onFirstViewComplete?: () => void }) {
  const [visibleCharacterCount, setVisibleCharacterCount] = useState(text.length);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const store = new LocalTeacherMessageViewStore(window.localStorage);
    if (store.hasSeen(messageKey)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      store.markSeen(messageKey);
      onFirstViewComplete?.();
      return;
    }

    const intervalDuration = Math.min(35, Math.max(1, 4000 / Math.max(1, text.length)));
    let currentCount = 0;
    let intervalId: number | undefined;
    const startTimeoutId = window.setTimeout(() => {
      setVisibleCharacterCount(0);
      setIsAnimating(true);
      intervalId = window.setInterval(() => {
        currentCount += 1;
        setVisibleCharacterCount(currentCount);
        if (currentCount < text.length) return;
        window.clearInterval(intervalId);
        store.markSeen(messageKey);
        setIsAnimating(false);
        onFirstViewComplete?.();
      }, intervalDuration);
    }, 0);

    return () => {
      window.clearTimeout(startTimeoutId);
      if (intervalId !== undefined) window.clearInterval(intervalId);
    };
  }, [messageKey, onFirstViewComplete, text]);

  return <p className={`socrato-typewriter${isAnimating ? " is-typing" : ""}`}>
    <span className="sr-only">{text}</span>
    <span className="socrato-typewriter-measure" aria-hidden="true">{text}</span>
    <span className="socrato-typewriter-visual" aria-hidden="true">{text.slice(0, visibleCharacterCount)}{isAnimating && <span className="socrato-typewriter-cursor" />}</span>
  </p>;
}
