/**
 * BookList.js
 * Component for displaying books
 * Demonstrates component lifecycle and subscription to store changes
 * Integrates with Flux by subscribing to store updates and dispatching delete action
 */

import React, { useState, useEffect } from 'react';
import bookStore from '../flux/BookStore';
import { removeBook } from '../flux/Actions';
import './BookList.css';

/**
 * BookList Component
 * Demonstrates:
 * - React hooks (useState, useEffect) for component lifecycle
 * - Subscription to Flux store changes
 * - Component lifecycle: mount → subscribe → render → unmount
 * - Data flow from store to component state
 */
const BookList = () => {
  const [books, setBooks] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [totalValue, setTotalValue] = useState(0);

  /**
   * Effect Hook: Manage component lifecycle
   * Demonstrates component lifecycle phases:
   * 1. Mount: Subscribe to store changes
   * 2. Update: Re-render when store data changes
   * 3. Unmount: Unsubscribe to prevent memory leaks
   */
  useEffect(() => {
    // Load initial books
    const updateBooks = () => {
      const allBooks = bookStore.getBooks();
      setBooks(allBooks);
      const total = allBooks.reduce(
        (sum, book) => sum + parseFloat(book.price),
        0
      );
      setTotalValue(total);
    };

    // Initial load
    updateBooks();

    // Subscribe to store changes
    // This function is called whenever the store emits change
    const unsubscribe = bookStore.addChangeListener(updateBooks);

    // Cleanup function: Called on unmount or before re-subscription
    // Prevents memory leaks by unsubscribing from store
    return () => {
      unsubscribe();
    };
  }, []); // Empty dependency array means this runs once on mount

  /**
   * Handle book deletion
   * Dispatches REMOVE_BOOK action to Flux
   */
  const handleDeleteBook = (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      removeBook(bookId);
    }
  };

  /**
   * Filter books based on active tab
   */
  const getFilteredBooks = () => {
    if (activeTab === 'all') {
      return books;
    } else if (activeTab === 'expensive') {
      return books.filter(book => parseFloat(book.price) > 50);
    }
    return books;
  };

  const filteredBooks = getFilteredBooks();

  return (
    <div className="book-list-container">
      <div className="list-header">
        <div>
          <h2>📖 Your BookVerse Collection</h2>
          <p className="list-subtitle">
            Total Books: <strong>{books.length}</strong> | Total Value:{' '}
            <strong>${totalValue.toFixed(2)}</strong>
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Books ({books.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'expensive' ? 'active' : ''}`}
          onClick={() => setActiveTab('expensive')}
        >
          Expensive (&gt;$50) ({books.filter(b => parseFloat(b.price) > 50).length})
        </button>
      </div>

      {/* Books Display */}
      {filteredBooks.length > 0 ? (
        <div className="books-grid">
          {filteredBooks.map((book) => (
            <div key={book.id} className="book-card">
              <div className="book-header">
                <h3 className="book-title">{book.title}</h3>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteBook(book.id)}
                  title="Delete book"
                  aria-label="Delete book"
                >
                  ✕
                </button>
              </div>

              <div className="book-details">
                <p className="book-author">
                  <strong>Author:</strong> {book.author}
                </p>
                <p className="book-price">
                  <strong>Price:</strong> ${parseFloat(book.price).toFixed(2)}
                </p>
                <p className="book-date">
                  <strong>Added:</strong> {book.createdAt}
                </p>
              </div>

              <div className="book-footer">
                <span className="book-id">ID: {book.id}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>📭 No books found. Start by adding your first book!</p>
        </div>
      )}
    </div>
  );
};

export default BookList;
