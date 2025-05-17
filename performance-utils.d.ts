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
  ElementCache: {
    cache: Map<string, Element>;
    get(selector: string, root?: Element | Document): Element | null;
    getAll(selector: string, root?: Element | Document): Element[];
    set(key: string, element: Element): void;
    clear(key?: string): void;
  };
  DOMBatch: {
    reads: Function[];
    writes: Function[];
    scheduled: boolean;
    read(fn: () => void): void;
    write(fn: () => void): void;
    schedule(): void;
    process(): void;
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
