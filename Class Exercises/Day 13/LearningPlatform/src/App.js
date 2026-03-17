import React, { useState, Suspense, lazy, useEffect } from 'react';
import './App.css';
import ErrorBoundary from './components/ErrorBoundary';
import StatsCard from './components/StatsCard';
import Modal from './components/Modal';
import Spinner from './components/Spinner';
import BrokenProduct from './components/BrokenProduct';
import ThemeContext from './context/ThemeContext';
import WorkoutTracker from './components/WorkoutTracker';
import ProductsAdmin from './components/ProductsAdmin';

const CourseDetails = lazy(() => import('./components/CourseDetails'));
const InstructorProfile = lazy(() => import('./components/InstructorProfile'));

const initialStats = [
  { id: 1, title: 'Students', value: 1245 },
  { id: 2, title: 'Courses', value: 27 },
  { id: 3, title: 'Revenue', value: '$12k' },
];

function App() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showInstructor, setShowInstructor] = useState(false);
  const [stats, setStats] = useState(initialStats);
  const [showModal, setShowModal] = useState(false);
  const [crashProduct, setCrashProduct] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const saved = localStorage.getItem('lp_theme');
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem('lp_theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme(t => (t === 'light' ? 'dark' : 'light'));
  }

  function openCourse(id) {
    setSelectedCourse({ id, title: `Course ${id}` });
  }

  function simulateUpdate() {
    // change only the first card's value
    setStats(prev => prev.map((s, i) => i === 0 ? { ...s, value: s.value + 1, lastUpdated: Date.now() } : s));
  }

  return (
    <div className="App container">
      <h1>Learning Platform — React Advanced Concepts</h1>
      <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:12}}>
        <button onClick={toggleTheme}>Switch to {theme === 'light' ? 'dark' : 'light'} theme</button>
      </div>

      <ThemeContext.Provider value={{ theme, toggleTheme }}>

      <section className="stats-row">
        {stats.map(s => (
          <StatsCard key={s.id} title={s.title} value={s.value} lastUpdated={s.lastUpdated} />
        ))}
        <div className="stats-actions">
          <button onClick={simulateUpdate}>Simulate Update</button>
        </div>
      </section>

      <section className="content-row">
        <div className="panel">
          <h2>Courses</h2>
          <ul>
            {[1,2,3].map(id => (
              <li key={id} className="course-item">
                <span>Course {id} — Intro to React</span>
                <div>
                  <button onClick={() => openCourse(id)}>View Details</button>
                </div>
              </li>
            ))}
          </ul>

          <button onClick={() => setShowInstructor(prev => !prev)}>
            {showInstructor ? 'Hide' : 'Show'} Instructor Profile
          </button>
        </div>

        <div className="panel">
          <h2>Dynamic Views</h2>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <button onClick={() => setShowModal(true)}>Open Notification Modal</button>
            <button onClick={() => setCrashProduct(p => !p)}>{crashProduct ? 'Reset Product' : 'Crash Product'}</button>
          </div>

          <ErrorBoundary>
            <BrokenProduct crash={crashProduct} />
          </ErrorBoundary>

          <div className="dynamic-area">
            <Suspense fallback={<Spinner />}>
              {selectedCourse && <CourseDetails course={selectedCourse} />}
              {showInstructor && <InstructorProfile id={42} />}
            </Suspense>
          </div>
        </div>
      </section>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <div style={{padding:20}}>
            <h3>Notification</h3>
            <p>This is rendered in a portal above the app UI.</p>
            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        </Modal>
      )}
      <div style={{marginTop:16}}>
        <WorkoutTracker />
        <ProductsAdmin />
      </div>

      </ThemeContext.Provider>
    </div>
  );
}

export default App;
