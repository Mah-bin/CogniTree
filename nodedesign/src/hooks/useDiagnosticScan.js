import { useState, useRef, useCallback, useEffect } from 'react';

export function useDiagnosticScan(gapPath = []) {
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
    
    // If no path is provided by the logic engine, don't run
    if (!gapPath || gapPath.length === 0) {
       return;
    }

    clearAllTimers();
    setStage('scanning');
    setRevealedCount(0);

    // 1. After 1200ms: transition to 'path-revealing' and reveal 1st node
    const t1 = setTimeout(() => {
      setStage('path-revealing');
      setRevealedCount(1);
    }, 1200);
    timerRefs.current.push(t1);

    // 2. Reveal remaining nodes along path every 500ms
    for (let i = 2; i <= gapPath.length; i++) {
      const delay = 1200 + (i - 1) * 500;
      const t = setTimeout(() => {
        setRevealedCount(i);
      }, delay);
      timerRefs.current.push(t);
    }

    // 3. After full path revealed
    const fullPathDelay = 1200 + (gapPath.length - 1) * 500 + 500;
    const tGap = setTimeout(() => {
      setStage('gap-found');
    }, fullPathDelay);
    timerRefs.current.push(tGap);

    // 4. After another 800ms: set stage to 'recommendation'
    const tRec = setTimeout(() => {
      setStage('recommendation');
    }, fullPathDelay + 800);
    timerRefs.current.push(tRec);
  }, [stage, clearAllTimers, gapPath]);

  return {
    stage,
    gapPath,
    revealedCount,
    runScan,
    resetScan,
  };
}
