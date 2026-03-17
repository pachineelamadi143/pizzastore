import { useState, useEffect, useRef, useCallback } from 'react';

export default function useTimer(initial = 0, autoStart = false) {
  const [seconds, setSeconds] = useState(initial);
  const [running, setRunning] = useState(autoStart);
  const intervalRef = useRef(null);

  const start = useCallback(() => setRunning(true), []);
  const stop = useCallback(() => setRunning(false), []);
  const reset = useCallback((value = 0) => {
    setSeconds(value);
    setRunning(false);
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running]);

  return { seconds, running, start, stop, reset };
}
