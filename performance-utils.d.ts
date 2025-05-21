/**
 * Type declarations for performance-utils.js
 */

interface PerformanceUtilsInterface {
  throttle<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
  ): (...args: Parameters<T>) => ReturnType<T> | undefined;
  debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number,
    immediate?: boolean
  ): (...args: Parameters<T>) => ReturnType<T> | undefined;
  measureExecutionTime<T extends (...args: any[]) => any>(
    fn: T,
    args?: Parameters<T>
  ): { result: ReturnType<T>; executionTime: number };
  measureMemoryUsage<T extends (...args: any[]) => any>(
    fn: T,
    args?: Parameters<T>
  ): {
    result: ReturnType<T>;
    beforeMemory: MemoryInfo | null;
    afterMemory: MemoryInfo | null;
  };
  Configs: {
    scroll: {
      delay: number;
      maxWait: number;
    };
    input: {
      delay: number;
      maxWait: number;
    };
    keyboard: {
      delay: number;
      maxWait: number;
    };
    mutation: {
      delay: number;
      maxWait: number;
    };
  };
}

interface MemoryInfo {
  totalJSHeapSize: number;
  usedJSHeapSize: number;
  jsHeapSizeLimit: number;
}

// Extend Window interface to include PerformanceUtils
interface Window {
  PerformanceUtils?: PerformanceUtilsInterface;
}
