import React from 'react';

function StatsCard({ title, value, lastUpdated }) {
  return (
    <div className="stats-card">
      <div className="stats-title">{title}</div>
      <div className="stats-value">{value}</div>
      {lastUpdated && <div className="stats-updated">Updated: {new Date(lastUpdated).toLocaleTimeString()}</div>}
    </div>
  );
}

export default React.memo(StatsCard);
