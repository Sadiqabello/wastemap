"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  /** Optional separator for thousands (default ","). Pass "" for none. */
  separator?: string;
}

/**
 * Counts up from the previous render's value to `value` over `duration` ms.
 * Uses an ease-out curve so the increment feels rewarding at the start and
 * settles gently at the target.
 */
export function AnimatedCounter({
  value,
  duration = 900,
  className,
  separator = ",",
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    const start = prev.current;
    const delta = value - start;
    if (delta === 0) {
      setDisplay(value);
      return;
    }

    let raf = 0;
    const startTime = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(start + delta * eased));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        prev.current = value;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  const formatted = separator
    ? display.toLocaleString("en-NG").replace(/,/g, separator)
    : display.toString();

  return <span className={className}>{formatted}</span>;
}
