"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

export function ScrollRegion({ children, className, label, hint, endHint, hintInsideViewport = false, showHintControl = true, showOverflowFade = false }: { children: React.ReactNode; className: string; label: string; hint: string; endHint?: string; hintInsideViewport?: boolean; showHintControl?: boolean; showOverflowFade?: boolean }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const viewportId = useId();
  const descriptionId = useId();
  const [hasMore, setHasMore] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  const updateOverflowState = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    setHasOverflow(viewport.scrollHeight > viewport.clientHeight + 1);
    setHasMore(viewport.scrollTop + viewport.clientHeight < viewport.scrollHeight - 1);
  }, []);

  useEffect(() => {
    updateOverflowState();
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new ResizeObserver(updateOverflowState);
    observer.observe(viewport);
    if (viewport.firstElementChild) observer.observe(viewport.firstElementChild);
    return () => observer.disconnect();
  }, [updateOverflowState]);

  const advanceViewport = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    viewport.scrollBy({ top: Math.max(80, viewport.clientHeight * 0.7), behavior: reduceMotion ? "auto" : "smooth" });
  };

  return <div className={`scroll-region ${className}`} data-has-more={hasMore || undefined}>
    <div id={viewportId} ref={viewportRef} className="scroll-region-viewport" tabIndex={0} aria-label={label} aria-describedby={descriptionId} onScroll={updateOverflowState}>{children}{hasMore && showHintControl && hintInsideViewport && <button type="button" className="scroll-hint" aria-controls={viewportId} onClick={advanceViewport}><span>{hint}</span><svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="m3 6 5 5 5-5" /></svg></button>}</div>
    <span id={descriptionId} className="sr-only">La région peut contenir davantage d’éléments accessibles par défilement.</span>
    {hasMore && showHintControl && !hintInsideViewport && <button type="button" className="scroll-hint" aria-controls={viewportId} onClick={advanceViewport}><span>{hint}</span><svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="m3 6 5 5 5-5" /></svg></button>}
    {hasMore && showOverflowFade && <div className="scroll-overflow-fade" aria-hidden="true" />}
    {!hasMore && hasOverflow && endHint && <div className="scroll-end-hint" role="status">{endHint}</div>}
  </div>;
}
