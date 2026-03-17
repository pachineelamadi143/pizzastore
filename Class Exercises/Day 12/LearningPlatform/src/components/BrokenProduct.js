import React from 'react';

export default function BrokenProduct({ crash }) {
  if (crash) {
    // Simulate a rendering error
    throw new Error('BrokenProduct crashed while rendering');
  }
  return (
    <div style={{border:'1px solid #e7e7e7',padding:12,borderRadius:6,marginTop:12}}>
      <h4>Product Card</h4>
      <p>This product card is safe. Toggle the crash to simulate an error.</p>
    </div>
  );
}
