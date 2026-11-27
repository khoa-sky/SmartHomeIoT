import React, { useEffect, useRef, useState } from 'react';

/**
 * Smoothly interpolates numeric sensor values over 280ms when real MQTT telemetry arrives.
 * Respects prefers-reduced-motion automatically.
 */
export function useAnimatedNumber(targetValue, duration = 280) {
  const numericTarget = Number(targetValue);
  const isValid = Number.isFinite(numericTarget);
  const [displayValue, setDisplayValue] = useState(isValid ? numericTarget : 0);
  const previousRef = useRef(isValid ? numericTarget : 0);

  useEffect(() => {
    if (!isValid) return;
    const startVal = previousRef.current;
    const delta = numericTarget - startVal;
    if (Math.abs(delta) < 0.01) {
      setDisplayValue(numericTarget);
      previousRef.current = numericTarget;
      return;
    }

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setDisplayValue(numericTarget);
      previousRef.current = numericTarget;
      return;
    }

    let rafId = null;
    const startTime = performance.now();

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Cubic ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startVal + delta * eased;
      setDisplayValue(current);
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        previousRef.current = numericTarget;
      }
    };

    rafId = requestAnimationFrame(step);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      previousRef.current = numericTarget;
    };
  }, [numericTarget, isValid, duration]);

  return isValid ? displayValue : null;
}

export default function AnimatedNumber({
  value,
  decimals = 0,
  fallback = '—',
  className = ''
}) {
  const animated = useAnimatedNumber(value);
  if (value === null || value === undefined || animated === null) {
    return <span className={className}>{fallback}</span>;
  }
  return <span className={className}>{animated.toFixed(decimals)}</span>;
}
