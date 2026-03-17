import React, { useState } from 'react';
import useTimer from '../hooks/useTimer';

export default function WorkoutTracker() {
  const [sets, setSets] = useState(0);
  const [resting, setResting] = useState(false);
  const { seconds, start, stop, reset } = useTimer(0, false);

  function completeSet() {
    setSets(s => s + 1);
    // start rest timer for 30s
    reset(0);
    start();
    setResting(true);
    setTimeout(() => {
      stop();
      setResting(false);
      reset(0);
    }, 30000);
  }

  return (
    <div className="card workout-card">
      <h3>Workout Tracker</h3>
      <p className="muted small">Sets completed: {sets}</p>
      <p className="muted">{resting ? `Resting — ${seconds}s` : 'Ready'}</p>
      <div style={{display:'flex',gap:8,marginTop:8}}>
        <button onClick={completeSet}>Complete Set (start 30s rest)</button>
        <button className="secondary" onClick={() => { setSets(0); reset(0); stop(); setResting(false); }}>Reset</button>
      </div>
    </div>
  );
}
