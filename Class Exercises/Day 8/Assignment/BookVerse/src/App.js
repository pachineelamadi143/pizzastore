import React, { useState } from 'react';
import './App.css';
import BookList from './components/BookList';

const initialBooks = [
  { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', price: 10.99 },
  { id: 2, title: '1984', author: 'George Orwell', price: 9.99 },
  { id: 3, title: 'To Kill a Mockingbird', author: 'Harper Lee', price: 12.5 },
  { id: 4, title: 'The Hobbit', author: 'J.R.R. Tolkien', price: 15.0 },
  { id: 5, title: 'The Catcher in the Rye', author: 'J.D. Salinger', price: 8.99 },
  { id: 6, title: 'Pride and Prejudice', author: 'Jane Austen', price: 11.25 },
];

function App() {
  const [view, setView] = useState('grid'); // 'grid' or 'list'
  const [query, setQuery] = useState('');

  const filtered = initialBooks.filter((b) => {
    const q = query.trim().toLowerCase();
    return (
      b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
    );
  });

  return (
    <div className="App bookverse">
      <header className="app-header">
        <h1>BookVerse</h1>
        <p className="subtitle">Welcome — featured books</p>

        <div className="controls">
          <div className="view-toggle" role="tablist" aria-label="View toggle">
            <button
              className={view === 'grid' ? 'active' : ''}
              onClick={() => setView('grid')}
            >
              Grid
            </button>
            <button
              className={view === 'list' ? 'active' : ''}
              onClick={() => setView('list')}
            >
              List
            </button>
          </div>

          <div className="search">
            <input
              type="text"
              placeholder="Search by title or author"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search books"
            />
          </div>
        </div>
      </header>

      <main>
        <BookList books={filtered} view={view} />
      </main>
    </div>
  );
}

export default App;
