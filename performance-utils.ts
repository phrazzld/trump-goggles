/**
 * Performance Utility Functions for Trump Goggles
 *
 * This module provides utility functions for improving performance of the extension.
 * Functions include throttle and debounce for event optimization, as well as general
 * performance monitoring utilities.
 *
 * @version 1.0.0
 */

/// <reference path="./types.d.ts" />

'use strict';

/**
 * Throttles a function to limit how often it can be called
 * Useful for optimizing frequent events like mousemove, scroll, resize
 *
 * @param fn - The function to throttle
 * @param delay - Minimum time between invocations in milliseconds
 * @returns Throttled function
 */
function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let lastCall = 0;
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<T>): ReturnType<T> | undefined {
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
      return undefined;
    }
  };
}

/**
 * Debounces a function to delay its execution until after a certain time has passed
 * since the last invocation. Useful for optimizing input events.
 *
 * @param fn - The function to debounce
 * @param delay - Time to wait before executing in milliseconds
 * @param immediate - If true, execute on the leading edge rather than trailing
 * @returns Debounced function
 */
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
  immediate: boolean = false
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<T>): ReturnType<T> | undefined {
    const context = this;
    const later = () => {
      timeout = null;
      if (!immediate) fn.apply(context, args);
    };

    const callNow = immediate && !timeout;
    clearTimeout(timeout!);
    timeout = setTimeout(later, delay);

    if (callNow) {
      return fn.apply(context, args);
    }
    return undefined;
  };
}

/**
 * Measures the execution time of a function
 *
 * @param fn - The function to measure
 * @param args - Arguments to pass to the function
 * @returns Object containing the result and execution time
 */
function measureExecutionTime<T extends (...args: any[]) => any>(
  fn: T,
  ...args: Parameters<T>
): { result: ReturnType<T>; executionTime: number } {
  const startTime = performance.now();
  const result = fn(...args);
  const endTime = performance.now();
  const executionTime = endTime - startTime;

  return {
    result,
    executionTime,
  };
}

/**
 * Memory information interface
 */
interface MemoryInfo {
  totalJSHeapSize: number;
  usedJSHeapSize: number;
  jsHeapSizeLimit?: number;
}

/**
 * Measures memory usage before and after executing a function
 * Note: This only works in Chrome with certain flags enabled
 *
 * @param fn - The function to measure
 * @param args - Arguments to pass to the function
 * @returns Object containing the result and memory measurements
 */
function measureMemoryUsage<T extends (...args: any[]) => any>(
  fn: T,
  ...args: Parameters<T>
): {
  result: ReturnType<T>;
  beforeMemory: MemoryInfo | null;
  afterMemory: MemoryInfo | null;
} {
  let beforeMemory: MemoryInfo | null = null;
  let afterMemory: MemoryInfo | null = null;

  if (performance.memory) {
    beforeMemory = {
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
    };
  }

  const result = fn(...args);

  if (performance.memory) {
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
 * Configuration objects for performance utilities
 */
const Configs = {
  scroll: {
    delay: 150,
    maxWait: 500,
  },
  input: {
    delay: 32, // ~30 FPS
    maxWait: 100,
  },
  keyboard: {
    delay: 50,
    maxWait: 200,
  },
  mutation: {
    delay: 50,
    maxWait: 300,
  },
};

// Export the performance utilities
const PerformanceUtils = {
  throttle,
  debounce,
  measureExecutionTime,
  measureMemoryUsage,
  Configs,
};

// Browser compatibility check and export
if (typeof window !== 'undefined') {
  (window as any).PerformanceUtils = PerformanceUtils;
}

export { PerformanceUtils };
export default PerformanceUtils;
