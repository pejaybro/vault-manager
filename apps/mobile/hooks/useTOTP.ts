import { useState, useEffect } from 'react';
import { generateTOTP, getTimeRemaining, getProgress, formatCode } from '@vault/core';

export function useTOTP(secret: string, period = 30, digits = 6) {
  const [code, setCode] = useState(() =>
    secret ? generateTOTP(secret, period, digits) : '------'
  );
  const [remaining, setRemaining] = useState(() => getTimeRemaining(period));
  const [progress, setProgress] = useState(() => getProgress(period));

  useEffect(() => {
    if (!secret) return;

    const interval = setInterval(() => {
      const rem = getTimeRemaining(period);
      const prog = getProgress(period);

      setRemaining(rem);
      setProgress(prog);

      // Regenerate code when remaining hits 30 (or period)
      if (rem === period || code === '------') {
        try {
          setCode(generateTOTP(secret, period, digits));
        } catch {
          setCode('ERROR');
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [secret, period, digits, code]);

  return {
    code,
    formattedCode: formatCode(code),
    remaining,
    progress,
  };
}
