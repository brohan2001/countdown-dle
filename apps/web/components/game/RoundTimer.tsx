"use client";

import { useEffect, useState } from "react";

interface RoundTimerProps {
  durationMs: number; // 30000 for standard
  onExpire: () => void;
  isActive: boolean;
}

export function RoundTimer({ durationMs, onExpire, isActive }: RoundTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(durationMs);

  useEffect(() => {
    if (!isActive) return;

    const startTime = Date.now();
    const endTime = startTime + durationMs;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);

      setTimeRemaining(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        // Race-condition guard: only trigger expiry once
        // The round handler will have already moved to next state if user submitted
        onExpire();
      }
    }, 100); // Update every 100ms for smooth countdown

    return () => clearInterval(interval);
  }, [durationMs, isActive, onExpire]);

  const seconds = Math.ceil(timeRemaining / 1000);
  const isWarning = seconds <= 5;
  const isCritical = seconds <= 2;

  return (
    <div className="text-center">
      <div
        className={`text-6xl font-bold tabular-nums transition-all duration-100 ${
          isCritical
            ? "text-red-500 animate-pulse"
            : isWarning
              ? "text-yellow-400"
              : "text-blue-400"
        }`}
      >
        {seconds}
      </div>
      <p className="text-slate-300 text-sm mt-2">
        {seconds === 1 ? "second" : "seconds"} remaining
      </p>

      {/* Progress bar */}
      <div className="mt-4 w-full bg-slate-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-100 ${
            isCritical
              ? "bg-red-500"
              : isWarning
                ? "bg-yellow-400"
                : "bg-blue-500"
          }`}
          style={{ width: `${(timeRemaining / durationMs) * 100}%` }}
        />
      </div>
    </div>
  );
}

export function useRoundTimer(durationMs: number, onExpire: () => void) {
  return {
    Component: (props: { isActive: boolean }) => (
      <RoundTimer durationMs={durationMs} onExpire={onExpire} isActive={props.isActive} />
    ),
    timeRemaining: durationMs, // Caller should track this via round state
  };
}
