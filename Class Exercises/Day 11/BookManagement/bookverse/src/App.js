/**
 * App.js
 * Main application component for BookVerse
 * Demonstrates:
 * - Flux Architecture integration
 * - Component composition
 * - SPA (Single Page Application) behavior
 * - Unidirectional data flow
 */

import React, { useState } from 'react';
import AddBookForm from './components/AddBookForm';
import BookList from './components/BookList';
import './App.css';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleBookAdded = () => {
    // Trigger a refresh by changing local state
    // This helps ensure UI updates are visible
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="App">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">📚 BookVerse</h1>
          <p className="app-subtitle">
            Add New Books and Manage Your Collection with Flux Architecture
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        <div className="container">
          {/* Form Section */}
          <section className="form-section">
            <AddBookForm onBookAdded={handleBookAdded} />
          </section>

          {/* Books List Section */}
          <section className="list-section">
            <BookList key={refreshTrigger} />
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
