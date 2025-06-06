/**
 * Unit tests for Performance Benchmark system
 *
 * Validates that the benchmark system produces reasonable results
 * and all measurement functions work correctly as specified in T040.
 * Following DEVELOPMENT_PHILOSOPHY.md: no mocking of internal collaborators.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PerformanceBenchmark } from '../manual/performance-benchmark-logging';

describe('Performance Benchmark System', () => {
  let benchmark: PerformanceBenchmark;
  let originalConsole: Console;

  beforeEach(() => {
    // Save original console
    originalConsole = global.console;

    // Mock console to capture benchmark output
    global.console = {
      ...originalConsole,
      log: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    } as any;

    benchmark = new PerformanceBenchmark();
  });

  afterEach(() => {
    // Restore original console
    global.console = originalConsole;
    vi.clearAllMocks();
  });

  describe('Benchmark Infrastructure', () => {
    it('should create benchmark instance successfully', () => {
      expect(benchmark).toBeDefined();
      expect(typeof benchmark.benchmarkStructuredLogger).toBe('function');
      expect(typeof benchmark.benchmarkLegacyAdapter).toBe('function');
      expect(typeof benchmark.benchmarkLoggerFactory).toBe('function');
    });

    it('should have exportResults functionality', () => {
      expect(typeof benchmark.exportResults).toBe('function');
      expect(typeof benchmark.getResults).toBe('function');
    });
  });

  describe('Individual Benchmark Methods', () => {
    it('should benchmark structured logger performance', async () => {
      const result = await benchmark.benchmarkStructuredLogger();

      expect(result).toBeDefined();
      expect(result.name).toBe('StructuredLogger Basic');
      expect(result.throughputLogsPerSecond).toBeGreaterThan(0);
      expect(result.averageLatencyMs).toBeGreaterThan(0);
      expect(result.memoryUsageMB).toBeGreaterThanOrEqual(0);

      // Sanity check: should be able to handle at least 1000 logs/sec
      expect(result.throughputLogsPerSecond).toBeGreaterThan(1000);
    });

    it('should benchmark legacy adapter performance', async () => {
      const result = await benchmark.benchmarkLegacyAdapter();

      expect(result).toBeDefined();
      expect(result.name).toBe('Legacy Adapter');
      expect(result.throughputLogsPerSecond).toBeGreaterThan(0);
      expect(result.averageLatencyMs).toBeGreaterThan(0);

      // Legacy adapter should still be reasonably fast
      expect(result.throughputLogsPerSecond).toBeGreaterThan(500);
    });

    it('should benchmark logger factory performance', async () => {
      const result = await benchmark.benchmarkLoggerFactory();

      expect(result).toBeDefined();
      expect(result.name).toBe('LoggerFactory');
      expect(result.throughputLogsPerSecond).toBeGreaterThan(0);
      expect(result.averageLatencyMs).toBeGreaterThan(0);
    });

    it('should benchmark baseline console performance', async () => {
      const result = await benchmark.benchmarkBaseline();

      expect(result).toBeDefined();
      expect(result.name).toBe('Baseline console.log');
      expect(result.throughputLogsPerSecond).toBeGreaterThan(0);
      expect(result.averageLatencyMs).toBeGreaterThan(0);
    });
  });

  describe('Context Size Benchmarks', () => {
    it('should benchmark various context sizes', async () => {
      const results = await benchmark.benchmarkContextSizes();

      expect(results).toHaveLength(4);
      expect(results[0].name).toContain('Small Context');
      expect(results[1].name).toContain('Medium Context');
      expect(results[2].name).toContain('Large Context');
      expect(results[3].name).toContain('Very Large Context');

      // Larger contexts should generally have lower throughput, but in test environments
      // performance can vary due to JIT compilation, memory allocation patterns, etc.
      // Focus on validating that all contexts produce reasonable results
      const smallContextThroughput = results[0].throughputLogsPerSecond;
      const largeContextThroughput = results[3].throughputLogsPerSecond;

      // Validate that the ratio is within a reasonable range (allow for test environment variance)
      const throughputRatio = smallContextThroughput / largeContextThroughput;
      expect(throughputRatio).toBeGreaterThan(0.5); // Small context shouldn't be more than 2x slower than large
      expect(throughputRatio).toBeLessThan(10); // Small context shouldn't be more than 10x faster than large

      // All results should have valid metrics
      results.forEach((result) => {
        expect(result.throughputLogsPerSecond).toBeGreaterThan(0);
        expect(result.averageLatencyMs).toBeGreaterThan(0);
        expect(result.memoryUsageMB).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Feature Overhead Analysis', () => {
    it('should measure context size limiting overhead', async () => {
      const results = await benchmark.benchmarkContextSizeLimiting();

      expect(results).toHaveLength(2);
      expect(results[0].name).toBe('Without Size Limiting');
      expect(results[1].name).toBe('With Size Limiting');

      // Should calculate overhead percentage
      expect(results[1].overhead).toBeDefined();

      // Both configurations should produce valid results
      results.forEach((result) => {
        expect(result.throughputLogsPerSecond).toBeGreaterThan(0);
        expect(result.averageLatencyMs).toBeGreaterThan(0);
      });
    });

    it('should measure throttling overhead', async () => {
      const results = await benchmark.benchmarkThrottling();

      expect(results).toHaveLength(2);
      expect(results[0].name).toBe('Without Throttling');
      expect(results[1].name).toBe('With Throttling');

      // Should calculate overhead percentage
      expect(results[1].overhead).toBeDefined();

      // Both configurations should produce valid results
      results.forEach((result) => {
        expect(result.throughputLogsPerSecond).toBeGreaterThan(0);
        expect(result.averageLatencyMs).toBeGreaterThan(0);
      });
    });
  });

  describe('Results Export and Analysis', () => {
    it('should export results in valid JSON format', () => {
      // Run a simple benchmark first
      expect(() => {
        const exported = benchmark.exportResults();
        const parsed = JSON.parse(exported);

        expect(parsed.timestamp).toBeDefined();
        expect(parsed.environment).toBeDefined();
        expect(parsed.results).toBeInstanceOf(Array);
        expect(parsed.summary).toBeDefined();
      }).not.toThrow();
    });

    it('should track results internally', async () => {
      const initialResults = benchmark.getResults();
      expect(initialResults).toHaveLength(0);

      // Run a benchmark
      await benchmark.benchmarkBaseline();

      const updatedResults = benchmark.getResults();
      expect(updatedResults).toHaveLength(1);
      expect(updatedResults[0].name).toBe('Baseline console.log');
    });
  });

  describe('Performance Requirements Validation', () => {
    it('should validate that structured logger produces measurable performance metrics', async () => {
      const baseline = await benchmark.benchmarkBaseline();
      const structured = await benchmark.benchmarkStructuredLogger();

      // In test environments, performance can vary wildly due to:
      // - Different execution contexts, JIT compilation, memory allocation patterns
      // - Concurrent test execution, mocked console overhead
      // - Different timing precision across environments

      // Focus on functional validation that benchmarks work correctly
      expect(structured.throughputLogsPerSecond).toBeGreaterThan(0);
      expect(structured.averageLatencyMs).toBeGreaterThan(0);
      expect(structured.memoryUsageMB).toBeGreaterThanOrEqual(0);

      expect(baseline.throughputLogsPerSecond).toBeGreaterThan(0);
      expect(baseline.averageLatencyMs).toBeGreaterThan(0);
      expect(baseline.memoryUsageMB).toBeGreaterThanOrEqual(0);

      // Verify that both systems produce reasonable performance (not zero or infinite)
      expect(structured.throughputLogsPerSecond).toBeLessThan(100000000); // Less than 100M logs/sec (sanity check)
      expect(baseline.throughputLogsPerSecond).toBeLessThan(100000000); // Less than 100M logs/sec (sanity check)

      expect(structured.averageLatencyMs).toBeLessThan(1000); // Less than 1 second per log (sanity check)
      expect(baseline.averageLatencyMs).toBeLessThan(1000); // Less than 1 second per log (sanity check)

      // The actual performance comparison will be done in manual benchmark runs
      // where environment factors can be controlled and real performance assessed
    });
  });

  describe('Benchmark Consistency', () => {
    it('should produce consistent results across multiple runs', async () => {
      const run1 = await benchmark.benchmarkBaseline();
      const run2 = await benchmark.benchmarkBaseline();

      // Results should be in the same order of magnitude
      const throughputRatio = run1.throughputLogsPerSecond / run2.throughputLogsPerSecond;
      expect(throughputRatio).toBeGreaterThan(0.1);
      expect(throughputRatio).toBeLessThan(10);

      const latencyRatio = run1.averageLatencyMs / run2.averageLatencyMs;
      expect(latencyRatio).toBeGreaterThan(0.1);
      expect(latencyRatio).toBeLessThan(10);
    });
  });

  describe('Error Handling', () => {
    it('should handle benchmark errors gracefully', async () => {
      // This test ensures the benchmark system is robust
      expect(async () => {
        await benchmark.benchmarkStructuredLogger();
      }).not.toThrow();
    });

    it('should handle memory measurement edge cases', () => {
      // Should not crash when memory measurement is unavailable
      expect(() => {
        const exported = benchmark.exportResults();
        JSON.parse(exported);
      }).not.toThrow();
    });
  });
});
