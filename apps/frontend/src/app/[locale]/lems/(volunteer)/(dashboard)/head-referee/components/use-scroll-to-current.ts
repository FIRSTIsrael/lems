'use client';

import { useEffect, useRef } from 'react';

const MAX_ATTEMPTS = 30;
const ATTEMPT_INTERVAL_MS = 50;

function isHiddenResponsiveCopy(element: HTMLElement): boolean {
  let node: HTMLElement | null = element;
  while (node && node !== document.body) {
    if (window.getComputedStyle(node).display === 'none') return true;
    node = node.parentElement;
  }
  return false;
}

const TABLE_LAYOUT_TAGS = new Set(['TABLE', 'THEAD', 'TBODY', 'TFOOT', 'TR', 'COLGROUP']);

function isLaidOut(element: HTMLElement): boolean {
  if (element.getClientRects().length === 0) return false;

  let node: HTMLElement | null = element;
  while (node && node !== document.body) {
    const style = window.getComputedStyle(node);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    if (node !== element && node.clientHeight === 0 && !TABLE_LAYOUT_TAGS.has(node.tagName)) {
      return false;
    }
    node = node.parentElement;
  }

  return true;
}

/**
 * Scrolls the attached element into view once it is actually visible.
 * Retries while a collapsed round accordion is still animating open, and
 * ignores the hidden desktop/mobile copy of the schedule.
 */
export function useScrollToCurrent<T extends HTMLElement>(isCurrent: boolean) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!isCurrent) return;
    const element = ref.current;
    if (!element) return;

    let attempts = 0;
    let timer = 0;
    let lastCollapseHeight = -1;

    const tryScroll = () => {
      if (isHiddenResponsiveCopy(element)) return;

      if (!isLaidOut(element)) {
        lastCollapseHeight = -1;
        if (attempts++ < MAX_ATTEMPTS) {
          timer = window.setTimeout(tryScroll, ATTEMPT_INTERVAL_MS);
        }
        return;
      }

      const collapse = element.closest('.MuiCollapse-root');
      const collapseHeight =
        collapse instanceof HTMLElement ? collapse.clientHeight : element.clientHeight;

      if (collapseHeight !== lastCollapseHeight) {
        lastCollapseHeight = collapseHeight;
        if (attempts++ < MAX_ATTEMPTS) {
          timer = window.setTimeout(tryScroll, ATTEMPT_INTERVAL_MS);
        }
        return;
      }

      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    timer = window.setTimeout(tryScroll, 0);
    return () => window.clearTimeout(timer);
  }, [isCurrent]);

  return ref;
}
