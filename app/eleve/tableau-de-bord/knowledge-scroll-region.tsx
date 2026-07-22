"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getKnowledgeScrollState,
  getNextKnowledgeScrollTop,
} from "@/lib/student-dashboard/knowledge-scroll";

export function KnowledgeScrollRegion({
  total,
  children,
}: {
  total: number;
  children: ReactNode;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [isAtEnd, setIsAtEnd] = useState(true);

  const measure = useCallback(() => {
    const list = listRef.current;
    if (!list) return;

    const state = getKnowledgeScrollState(
      list.scrollTop,
      list.clientHeight,
      list.scrollHeight,
    );
    setHasOverflow(state.hasOverflow);
    setIsAtEnd(state.isAtEnd);
  }, []);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure, total]);

  function showNextKnowledge() {
    const list = listRef.current;
    if (!list) return;

    list.scrollTo({
      top: getNextKnowledgeScrollTop(
        list.scrollTop,
        list.clientHeight,
        list.scrollHeight,
      ),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }

  return (
    <div className="knowledge-scroll-region">
      <div
        className={`knowledge-scroll-shell ${hasOverflow && !isAtEnd ? "knowledge-scroll-has-more" : ""}`}
      >
        <div
          ref={listRef}
          className="knowledge-list"
          role="region"
          aria-label="Liste défilable des connaissances historiques"
          tabIndex={total > 0 ? 0 : undefined}
          onScroll={measure}
        >
          {children}
        </div>
        {hasOverflow && !isAtEnd ? (
          <button
            type="button"
            className="knowledge-scroll-more"
            onClick={showNextKnowledge}
            aria-label="Voir les autres connaissances"
          >
            <span>Voir les autres connaissances</span>
            <svg
              className="knowledge-scroll-chevrons"
              viewBox="0 0 24 18"
              aria-hidden="true"
              focusable="false"
            >
              <path d="m7 3 5 5 5-5" />
              <path d="m7 10 5 5 5-5" />
            </svg>
          </button>
        ) : null}
      </div>
      {hasOverflow && isAtEnd ? (
        <p className="knowledge-scroll-complete" aria-live="polite">
          Toutes les connaissances sont affichées
        </p>
      ) : null}
    </div>
  );
}
