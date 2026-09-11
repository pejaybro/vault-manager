import { useState, useEffect, useCallback } from 'react';
import { generateTOTP, getTimeRemaining, getProgress, formatCode } from '@vault/core';

export function useTOTP(secret: string, period = 30, digits = 6) {
  const [code, setCode] = useState('------');
  const [remaining, setRemaining] = useState(() => getTimeRemaining(period));
  const [progress, setProgress] = useState(() => getProgress(period));

  const refreshCode = useCallback(async () => {
    if (!secret) {
      setCode('------');
      return;
    }
    try {
      const newCode = await generateTOTP(secret, period, digits);
      setCode(newCode);
    } catch {
      setCode('ERROR');
    }
  }, [secret, period, digits]);

  // Generate initial code
  useEffect(() => {
    refreshCode();
  }, [refreshCode]);

  // Tick every second — update timer and regenerate code on period boundary
  useEffect(() => {
    if (!secret) return;

    const interval = setInterval(() => {
      const rem = getTimeRemaining(period);
      const prog = getProgress(period);

      setRemaining(rem);
      setProgress(prog);

      // Regenerate code when timer resets to full period
      if (rem === period) {
        refreshCode();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [secret, period, refreshCode]);

  return {
    code,
    formattedCode: formatCode(code),
    remaining,
    progress,
  };
}
