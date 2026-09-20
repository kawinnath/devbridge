"use client";

import React, { useState, useEffect } from "react";

interface StatCounterProps {
  target: number;
  suffix?: string;
  durationMs?: number;
}

export default function StatCounter({ target, suffix = "+", durationMs = 1500 }: StatCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const steps = 30;
    const increment = target / steps;
    const stepTime = durationMs / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [target, durationMs]);

  return (
    <span>
      {count.toLocaleString("en-US")}{suffix}
    </span>
  );
}
