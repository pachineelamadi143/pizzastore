import React from 'react';

export default function CourseDetails({ course }) {
  return (
    <div style={{border:'1px solid #ddd',padding:12,borderRadius:6}}>
      <h3>{course.title}</h3>
      <p>Course ID: {course.id}</p>
      <p>This component was loaded lazily when you clicked "View Details".</p>
    </div>
  );
}
