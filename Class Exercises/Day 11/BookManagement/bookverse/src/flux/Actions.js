/**
 * Actions.js
 * Defines action creators for the BookVerse application
 * Actions are plain objects that describe what happened
 */

import dispatcher from './Dispatcher';

// Action Types
export const ACTION_TYPES = {
  ADD_BOOK: 'ADD_BOOK',
  REMOVE_BOOK: 'REMOVE_BOOK',
  UPDATE_BOOK: 'UPDATE_BOOK',
};

/**
 * Action Creator: Add a new book
 * @param {Object} book - Book object with title, author, price
 */
export const addBook = (book) => {
  dispatcher.dispatch({
    type: ACTION_TYPES.ADD_BOOK,
    payload: {
      id: Date.now(),
      ...book,
      createdAt: new Date().toLocaleString(),
    },
  });
};

/**
 * Action Creator: Remove a book
 * @param {Number} bookId - ID of book to remove
 */
export const removeBook = (bookId) => {
  dispatcher.dispatch({
    type: ACTION_TYPES.REMOVE_BOOK,
    payload: { id: bookId },
  });
};

/**
 * Action Creator: Update a book
 * @param {Number} bookId - ID of book to update
 * @param {Object} updates - Updated book data
 */
export const updateBook = (bookId, updates) => {
  dispatcher.dispatch({
    type: ACTION_TYPES.UPDATE_BOOK,
    payload: { id: bookId, ...updates },
  });
};
