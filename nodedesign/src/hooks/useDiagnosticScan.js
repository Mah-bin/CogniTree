import { useState, useRef, useCallback, useEffect } from 'react';

const HARDCODED_GAP_PATH = ['quadratic', 'linear-eq', 'algebra', 'ratios', 'fractions'];

export function useDiagnosticScan() {
  const [stage, setStage] = useState('idle'); // 'idle' | 'scanning' | 'path-revealing' | 'gap-found' | 'recommendation'
  const [revealedCount, setRevealedCount] = useState(0);
  const timerRefs = useRef([]);

  const clearAllTimers = useCallback(() => {
    timerRefs.current.forEach((id) => clearTimeout(id));
    timerRefs.current = [];
  }, []);

  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  const resetScan = useCallback(() => {
    clearAllTimers();
    setStage('idle');
    setRevealedCount(0);
  }, [clearAllTimers]);

  const runScan = useCallback(() => {
    // Guard: ignore if scan is already in progress
    if (stage !== 'idle' && stage !== 'recommendation') {
      return;
    }

    clearAllTimers();
    setStage('scanning');
    setRevealedCount(0);

    // 1. After 1200ms: transition to 'path-revealing' and reveal 1st node ('quadratic')
    const t1 = setTimeout(() => {
      setStage('path-revealing');
      setRevealedCount(1);
    }, 1200);
    timerRefs.current.push(t1);

    // 2. Reveal remaining nodes along path every 500ms (nodes 2 to 5)
    // t = 1700ms -> revealedCount = 2 ('linear-eq')
    // t = 2200ms -> revealedCount = 3 ('algebra')
    // t = 2700ms -> revealedCount = 4 ('ratios')
    // t = 3200ms -> revealedCount = 5 ('fractions')
    for (let i = 2; i <= HARDCODED_GAP_PATH.length; i++) {
      const delay = 1200 + (i - 1) * 500;
      const t = setTimeout(() => {
        setRevealedCount(i);
      }, delay);
      timerRefs.current.push(t);
    }

    // 3. After full path revealed (t = 3700ms): set stage to 'gap-found'
    const fullPathDelay = 1200 + (HARDCODED_GAP_PATH.length - 1) * 500 + 500; // 3700ms
    const tGap = setTimeout(() => {
      setStage('gap-found');
    }, fullPathDelay);
    timerRefs.current.push(tGap);

    // 4. After another 800ms (t = 4500ms): set stage to 'recommendation'
    const tRec = setTimeout(() => {
      setStage('recommendation');
    }, fullPathDelay + 800);
    timerRefs.current.push(tRec);
  }, [stage, clearAllTimers]);

  return {
    stage,
    gapPath: HARDCODED_GAP_PATH,
    revealedCount,
    runScan,
    resetScan,
  };
}
