/**
 * Dispatcher.js
 * Central hub for managing all actions in the Flux architecture
 * Follows the unidirectional data flow pattern
 */

class Dispatcher {
  constructor() {
    this.callbacks = [];
    this.lastId = 1;
  }

  /**
   * Register a callback with the dispatcher
   * @param {Function} callback - Function to be called when action is dispatched
   * @returns {String} token - Unique identifier for the callback
   */
  register(callback) {
    const id = 'ID_' + this.lastId++;
    this.callbacks.push({ id, callback });
    return id;
  }

  /**
   * Unregister a callback from the dispatcher
   * @param {String} token - Unique identifier of the callback to remove
   */
  unregister(token) {
    this.callbacks = this.callbacks.filter(cb => cb.id !== token);
  }

  /**
   * Dispatch an action to all registered callbacks
   * @param {Object} action - Action object with type and payload
   */
  dispatch(action) {
    this.callbacks.forEach(({ callback }) => {
      callback(action);
    });
  }

  /**
   * Wait for other stores to handle action before proceeding
   * @param {Array} ids - Array of token IDs to wait for
   * @param {Function} fn - Function to execute after dependencies are handled
   */
  waitFor(ids, fn) {
    // Simple implementation - in production would track handler states
    if (fn && typeof fn === 'function') {
      fn();
    }
  }
}

// Create a singleton instance
const dispatcher = new Dispatcher();

export default dispatcher;
