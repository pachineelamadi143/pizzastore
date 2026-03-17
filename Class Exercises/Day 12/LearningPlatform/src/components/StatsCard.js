import React from 'react';

function StatsCard({ title, value, lastUpdated }) {
  console.log(`StatsCard render: ${title}`);
  return (
    <div style={{border:'1px solid #ccc',padding:12,borderRadius:6,margin:8,minWidth:120}}>
      <div style={{fontSize:12,color:'#666'}}>{title}</div>
      <div style={{fontSize:20,fontWeight:600}}>{value}</div>
      {lastUpdated && <div style={{fontSize:10,color:'#999'}}>Updated: {new Date(lastUpdated).toLocaleTimeString()}</div>}
    </div>
  );
}

export default React.memo(StatsCard);
