/**
 * BookStore.js
 * Store that manages book data
 * Uses Dependency Injection pattern for Dispatcher
 * Part of Flux architecture - handles state and business logic
 */

import dispatcher from './Dispatcher';
import { ACTION_TYPES } from './Actions';

// Private store data
let books = [];

// Change listeners - observers pattern
let changeListeners = [];

/**
 * BookStore - Manages book collection
 * Demonstrates:
 * - Flux Store pattern for centralized state
 * - Dependency Injection (dispatcher injected as dependency)
 * - Unidirectional data flow (Actions → Dispatcher → Store → Views)
 */
class BookStore {
  constructor(injectedDispatcher = dispatcher) {
    this.dispatcher = injectedDispatcher;
    this.dispatcherToken = null;
    this.init();
  }

  /**
   * Initialize the store by registering with dispatcher
   */
  init() {
    this.dispatcherToken = this.dispatcher.register((action) => {
      this.handleAction(action);
    });

    // Load books from localStorage on initialization
    this.loadFromStorage();
  }

  /**
   * Handle incoming actions
   * @param {Object} action - Action from dispatcher
   */
  handleAction(action) {
    switch (action.type) {
      case ACTION_TYPES.ADD_BOOK:
        this.addBook(action.payload);
        break;
      case ACTION_TYPES.REMOVE_BOOK:
        this.removeBook(action.payload.id);
        break;
      case ACTION_TYPES.UPDATE_BOOK:
        this.updateBook(action.payload.id, action.payload);
        break;
      default:
        return;
    }
    // Notify all observers of state change
    this.emitChange();
  }

  /**
   * Add a book to the collection
   * @param {Object} book - Book to add
   */
  addBook(book) {
    books.push(book);
    this.saveToStorage();
  }

  /**
   * Remove a book from collection
   * @param {Number} id - Book ID to remove
   */
  removeBook(id) {
    books = books.filter(book => book.id !== id);
    this.saveToStorage();
  }

  /**
   * Update a book in collection
   * @param {Number} id - Book ID to update
   * @param {Object} updates - Updated book data
   */
  updateBook(id, updates) {
    const index = books.findIndex(book => book.id === id);
    if (index !== -1) {
      books[index] = { ...books[index], ...updates };
      this.saveToStorage();
    }
  }

  /**
   * Get all books (read-only copy)
   * @returns {Array} Copy of books array
   */
  getBooks() {
    return [...books];
  }

  /**
   * Get a specific book
   * @param {Number} id - Book ID
   * @returns {Object} Book object or null
   */
  getBook(id) {
    return books.find(book => book.id === id) || null;
  }

  /**
   * Get total number of books
   * @returns {Number} Number of books
   */
  getBookCount() {
    return books.length;
  }

  /**
   * Save books to localStorage
   */
  saveToStorage() {
    localStorage.setItem('bookverse_books', JSON.stringify(books));
  }

  /**
   * Load books from localStorage
   */
  loadFromStorage() {
    const stored = localStorage.getItem('bookverse_books');
    if (stored) {
      try {
        books = JSON.parse(stored);
      } catch (e) {
        console.error('Error loading books from storage:', e);
        books = [];
      }
    }
  }

  /**
   * Register a change listener
   * Observer pattern - components subscribe to state changes
   * @param {Function} listener - Callback when store changes
   * @returns {Function} Unsubscribe function
   */
  addChangeListener(listener) {
    changeListeners.push(listener);
    // Return unsubscribe function
    return () => {
      changeListeners = changeListeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of state change
   */
  emitChange() {
    changeListeners.forEach(listener => listener());
  }

  /**
   * Cleanup - remove all listeners
   */
  removeAllListeners() {
    changeListeners = [];
  }

  /**
   * Unregister from dispatcher
   */
  destroy() {
    if (this.dispatcherToken) {
      this.dispatcher.unregister(this.dispatcherToken);
    }
    this.removeAllListeners();
  }
}

// Export singleton instance
const bookStore = new BookStore();
export default bookStore;
