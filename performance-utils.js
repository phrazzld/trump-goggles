/**
 * Performance Utility Functions for Trump Goggles
 *
 * This module provides utility functions for improving performance of the extension.
 * Functions include throttle and debounce for event optimization, as well as general
 * performance monitoring utilities.
 *
 * @version 1.0.0
 */

// Performance utilities module pattern
const PerformanceUtils = (function () {
  'use strict';

  /**
   * Throttles a function to limit how often it can be called
   * Useful for optimizing frequent events like mousemove, scroll, resize
   *
   * @param {Function} fn - The function to throttle
   * @param {number} delay - Minimum time between invocations in milliseconds
   * @returns {Function} Throttled function
   */
  /**
   * @template T
   * @param {T} fn - The function to throttle
   * @param {number} delay - Minimum time between invocations in milliseconds
   * @returns {T} Throttled function
   */
  function throttle(fn, delay) {
    let lastCall = 0;
    /** @type {number|null} */
    let timeout = null;

    return function (/** @type {...any} */ ...args) {
      const now = Date.now();
      const timeSinceLastCall = now - lastCall;
      const context = this;

      // Clear any pending timeout
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }

      if (timeSinceLastCall >= delay) {
        // If enough time has passed since last call, execute immediately
        lastCall = now;
        return fn.apply(context, args);
      } else {
        // Schedule a call at the end of the delay period
        timeout = setTimeout(() => {
          lastCall = Date.now();
          timeout = null;
          fn.apply(context, args);
        }, delay - timeSinceLastCall);
      }
    };
  }

  /**
   * Debounces a function to delay its execution until after a period of inactivity
   * Useful for events that fire rapidly but only need one response at the end
   *
   * @param {Function} fn - The function to debounce
   * @param {number} delay - Milliseconds to wait after last call before executing
   * @param {boolean} [immediate=false] - If true, execute on the leading edge instead of trailing
   * @returns {Function} Debounced function
   */
  /**
   * @template T
   * @param {T} fn - The function to debounce
   * @param {number} delay - Milliseconds to wait after last call before executing
   * @param {boolean} [immediate=false] - If true, execute on the leading edge instead of trailing
   * @returns {T} Debounced function
   */
  function debounce(fn, delay, immediate = false) {
    /** @type {number|null} */
    let timeout = null;

    return function (/** @type {...any} */ ...args) {
      const context = this;
      const callNow = immediate && !timeout;

      // Clear existing timeout
      if (timeout) {
        clearTimeout(timeout);
      }

      // Set up new timeout
      timeout = setTimeout(() => {
        timeout = null;
        if (!immediate) {
          fn.apply(context, args);
        }
      }, delay);

      if (callNow) {
        return fn.apply(context, args);
      }
    };
  }

  /**
   * Measures the execution time of a function
   *
   * @param {Function} fn - The function to measure
   * @param {Array} args - Arguments to pass to the function
   * @returns {Object} Object containing result and executionTime properties
   */
  /**
   * @template T, R
   * @param {(...args: T[]) => R} fn - The function to measure
   * @param {T[]} [args=[]] - Arguments to pass to the function
   * @returns {{result: R, executionTime: number}} Object containing result and executionTime properties
   */
  function measureExecutionTime(fn, args = []) {
    const startTime = performance.now();
    const result = fn.apply(null, args);
    const endTime = performance.now();
    const executionTime = endTime - startTime;

    return {
      result,
      executionTime,
    };
  }

  /**
   * Measures memory usage before and after running a function
   * Note: Only works in browsers that support performance.memory
   *
   * @param {Function} fn - The function to measure
   * @param {Array} args - Arguments to pass to the function
   * @returns {Object} Object containing result, beforeMemory and afterMemory properties
   */
  /**
   * @template T, R
   * @param {(...args: T[]) => R} fn - The function to measure
   * @param {T[]} [args=[]] - Arguments to pass to the function
   * @returns {{result: R, beforeMemory: {totalJSHeapSize: number, usedJSHeapSize: number, jsHeapSizeLimit: number}|null, afterMemory: {totalJSHeapSize: number, usedJSHeapSize: number, jsHeapSizeLimit: number}|null}} Object containing result, beforeMemory and afterMemory properties
   */
  function measureMemoryUsage(fn, args = []) {
    /** @type {{totalJSHeapSize: number, usedJSHeapSize: number, jsHeapSizeLimit: number}|null} */
    let beforeMemory = null;
    /** @type {{totalJSHeapSize: number, usedJSHeapSize: number, jsHeapSizeLimit: number}|null} */
    let afterMemory = null;

    // Check if performance.memory is available (Chrome only)
    if (window.performance && performance.memory) {
      beforeMemory = {
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      };
    }

    const result = fn.apply(null, args);

    // Get memory stats after execution
    if (window.performance && performance.memory) {
      afterMemory = {
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      };
    }

    return {
      result,
      beforeMemory,
      afterMemory,
    };
  }

  /**
   * Object to cache frequently accessed DOM elements or calculations
   * Helps prevent redundant DOM queries
   */
  /**
   * Object to cache frequently accessed DOM elements or calculations
   * Helps prevent redundant DOM queries
   * @type {{
   *   cache: Map<string, Element|Element[]>,
   *   get: (selector: string, root?: Element|Document) => Element|null,
   *   getAll: (selector: string, root?: Element|Document) => Element[],
   *   set: (key: string, element: Element|Element[]) => void,
   *   clear: (key?: string) => void
   * }}
   */
  const ElementCache = {
    /** @type {Map<string, Element|Element[]>} */
    cache: new Map(),

    /**
     * Get an element from cache or query and cache it
     *
     * @param {string} selector - CSS selector for the element
     * @param {Element} [root=document] - Root element to query from
     * @returns {Element|null} The cached or queried element
     */
    /**
     * @param {string} selector - CSS selector for the element
     * @param {Element|Document} [root=document] - Root element to query from
     * @returns {Element|null} The cached or queried element
     */
    get(selector, root = document) {
      // Generate a key that incorporates the root element
      const rootKey = root === document ? 'document' : root.id || 'unknown';
      const key = `${rootKey}:${selector}`;

      if (!this.cache.has(key)) {
        const element = root.querySelector(selector);
        if (element) {
          this.cache.set(key, element);
        }
        return element;
      }

      return this.cache.get(key);
    },

    /**
     * Get all elements matching a selector from cache or query and cache them
     *
     * @param {string} selector - CSS selector for the elements
     * @param {Element} [root=document] - Root element to query from
     * @returns {Array<Element>} Array of cached or queried elements
     */
    /**
     * @param {string} selector - CSS selector for the elements
     * @param {Element|Document} [root=document] - Root element to query from
     * @returns {Element[]} Array of cached or queried elements
     */
    getAll(selector, root = document) {
      const rootKey = root === document ? 'document' : root.id || 'unknown';
      const key = `${rootKey}:all:${selector}`;

      if (!this.cache.has(key)) {
        const elements = Array.from(root.querySelectorAll(selector));
        this.cache.set(key, elements);
        return elements;
      }

      return this.cache.get(key);
    },

    /**
     * Manually add an element to the cache
     *
     * @param {string} key - Key to store the element under
     * @param {Element} element - Element to cache
     */
    /**
     * @param {string} key - Key to store the element under
     * @param {Element|Element[]} element - Element to cache
     */
    set(key, element) {
      this.cache.set(key, element);
    },

    /**
     * Clear the entire cache or a specific key
     *
     * @param {string} [key] - Optional key to clear, if not provided, clears entire cache
     */
    /**
     * @param {string} [key] - Optional key to clear, if not provided, clears entire cache
     */
    clear(key) {
      if (key) {
        this.cache.delete(key);
      } else {
        this.cache.clear();
      }
    },
  };

  /**
   * Batch multiple reads or writes to the DOM to avoid layout thrashing
   */
  /**
   * Batch multiple reads or writes to the DOM to avoid layout thrashing
   * @type {{
   *   reads: Function[],
   *   writes: Function[],
   *   scheduled: boolean,
   *   read: (fn: () => void) => void,
   *   write: (fn: () => void) => void,
   *   schedule: () => void,
   *   process: () => void
   * }}
   */
  const DOMBatch = {
    /** @type {Function[]} */
    reads: [],
    /** @type {Function[]} */
    writes: [],
    /** @type {boolean} */
    scheduled: false,

    /**
     * Schedule a DOM read operation
     *
     * @param {Function} fn - Function that reads from the DOM
     */
    /**
     * @param {() => void} fn - Function that reads from the DOM
     */
    read(fn) {
      this.reads.push(fn);
      this.schedule();
    },

    /**
     * Schedule a DOM write operation
     *
     * @param {Function} fn - Function that writes to the DOM
     */
    /**
     * @param {() => void} fn - Function that writes to the DOM
     */
    write(fn) {
      this.writes.push(fn);
      this.schedule();
    },

    /**
     * Schedule DOM batch processing
     */
    schedule() {
      if (!this.scheduled) {
        this.scheduled = true;
        requestAnimationFrame(() => this.process());
      }
    },

    /**
     * Process all scheduled DOM operations
     */
    process() {
      // Process all reads
      const reads = this.reads;
      this.reads = [];

      // Execute all read functions first
      reads.forEach((fn) => {
        try {
          fn();
        } catch (e) {
          console.error('Error in DOMBatch read operation:', e);
        }
      });

      // Process all writes
      const writes = this.writes;
      this.writes = [];

      // Execute all write functions after reads
      writes.forEach((fn) => {
        try {
          fn();
        } catch (e) {
          console.error('Error in DOMBatch write operation:', e);
        }
      });

      this.scheduled = false;

      // Schedule another frame if more operations were added during processing
      if (this.reads.length > 0 || this.writes.length > 0) {
        this.schedule();
      }
    },
  };

  // Public API
  return {
    throttle,
    debounce,
    measureExecutionTime,
    measureMemoryUsage,
    ElementCache,
    DOMBatch,
  };
})();

// Export the module
window.PerformanceUtils = PerformanceUtils;
