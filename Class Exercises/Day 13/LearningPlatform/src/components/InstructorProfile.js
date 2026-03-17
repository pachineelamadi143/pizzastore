import React from 'react';

export default function InstructorProfile({ id }) {
  return (
    <div style={{border:'1px dashed #999',padding:12,borderRadius:6,marginTop:8}}>
      <h3>Instructor #{id}</h3>
      <p>Name: Jane Doe</p>
      <p>Bio: Experienced React instructor.</p>
      <p>This profile is code-split and loaded via React.lazy.</p>
    </div>
  );
}
