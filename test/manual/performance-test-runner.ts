/**
 * Performance Test Runner Script
 *
 * This script automates performance testing of the Trump Goggles tooltip feature.
 * It creates a test environment, generates test content with varying numbers of
 * convertible text, and measures performance metrics.
 */

import type { TestConfig, TestSize, AllMetrics, PerformanceConfig } from '../types/performance';

// Extend Performance interface for Chrome memory API
interface ExtendedPerformance extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

declare global {
  interface Window {
    performance: ExtendedPerformance;
  }
}

(function (): void {
  'use strict';

  /**
   * Type guard for test sizes
   */
  function isValidTestSize(val: string): val is TestSize {
    return val === 'small' || val === 'medium' || val === 'large' || val === 'extreme';
  }

  /**
   * Performance Test Configuration
   */
  const config: PerformanceConfig = {
    smallTest: {
      paragraphs: 50,
      referencesPerParagraph: 1,
    },
    mediumTest: {
      paragraphs: 200,
      referencesPerParagraph: 2,
    },
    largeTest: {
      paragraphs: 1000,
      referencesPerParagraph: 1,
    },
    extremeTest: {
      paragraphs: 5000,
      referencesPerParagraph: 1,
    },
    hoverTestCount: 20,
    iterations: 3,
  };

  /**
   * Performance metrics to track
   */
  const metrics: AllMetrics = {
    generationTime: {
      small: [],
      medium: [],
      large: [],
      extreme: [],
    },
    processingTime: {
      small: [],
      medium: [],
      large: [],
      extreme: [],
    },
    tooltipShowTime: {
      small: [],
      medium: [],
      large: [],
      extreme: [],
    },
    memory: {
      small: [],
      medium: [],
      large: [],
      extreme: [],
    },
  };

  /**
   * Log message with timestamp
   */
  function logMessage(message: string): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
  }

  /**
   * Generate test content
   */
  function generateTestContent(testConfig: TestConfig): string {
    const { paragraphs, referencesPerParagraph } = testConfig;
    const references = ['Trump', 'Donald Trump', 'President Trump', 'CNN', 'Coffee'];
    const fillerWords = [
      'said',
      'announced',
      'reported',
      'mentioned',
      'discussed',
      'revealed',
      'confirmed',
      'stated',
      'declared',
      'indicated',
      'suggested',
      'noted',
    ];

    let content = '';

    for (let i = 0; i < paragraphs; i++) {
      let paragraph = '';

      for (let j = 0; j < referencesPerParagraph; j++) {
        const reference = references[Math.floor(Math.random() * references.length)];
        const filler = fillerWords[Math.floor(Math.random() * fillerWords.length)];
        paragraph += `${reference} ${filler} something interesting. `;
      }

      // Add some filler text
      paragraph += 'This is additional content to make the paragraph longer and more realistic. ';
      paragraph += 'It helps simulate real-world usage patterns with mixed content. ';

      content += `<p>${paragraph}</p>\n`;
    }

    return content;
  }

  /**
   * Simulate hover events on converted elements
   */
  function simulateHoverEvents(count: number, testSize: TestSize): Promise<void> {
    return new Promise((resolve) => {
      const convertedElements = document.querySelectorAll('.tg-converted-text');

      if (convertedElements.length === 0) {
        logMessage('No converted elements found for hover testing');
        resolve();
        return;
      }

      let completedHovers = 0;
      const startTime = performance.now();

      function performHover(index: number): void {
        if (index >= count || index >= convertedElements.length) {
          const totalTime = performance.now() - startTime;
          const averageTime = totalTime / completedHovers;

          if (isValidTestSize(testSize)) {
            metrics.tooltipShowTime[testSize].push(averageTime);
          }

          logMessage(`Completed ${completedHovers} hover events in ${totalTime.toFixed(2)}ms`);
          resolve();
          return;
        }

        const element = convertedElements[index] as HTMLElement;

        // Simulate mouseenter
        const mouseenterEvent = new MouseEvent('mouseenter', {
          view: window,
          bubbles: true,
          cancelable: true,
        });
        element.dispatchEvent(mouseenterEvent);

        // Wait a bit, then simulate mouseleave
        setTimeout(() => {
          const mouseleaveEvent = new MouseEvent('mouseleave', {
            view: window,
            bubbles: true,
            cancelable: true,
          });
          element.dispatchEvent(mouseleaveEvent);

          completedHovers++;

          // Continue with next hover after a short delay
          setTimeout(() => performHover(index + 1), 50);
        }, 100);
      }

      performHover(0);
    });
  }

  /**
   * Run a single test iteration
   */
  function runTest(testSize: TestSize, testConfig: TestConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      logMessage(
        `Running ${testSize} test: ${testConfig.paragraphs} paragraphs, ${testConfig.referencesPerParagraph} references each`
      );

      let iterationCount = 0;

      function runIteration(): void {
        logMessage(`Running iteration ${iterationCount + 1}/${config.iterations}`);

        // Generate test content
        const startGeneration = performance.now();
        const content = generateTestContent(testConfig);
        const generationTime = performance.now() - startGeneration;

        if (isValidTestSize(testSize)) {
          metrics.generationTime[testSize].push(generationTime);
        }

        // Get test area
        const testArea = document.getElementById('test-area');
        if (!testArea) {
          reject(new Error('Test area element not found'));
          return;
        }

        // Set up mutation observer
        const observer = new MutationObserver((mutations: MutationRecord[]) => {
          // Check if any mutations indicate text processing
          let conversionFound = false;

          mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
              mutation.addedNodes.forEach((node) => {
                if (node instanceof Element && node.classList.contains('tg-converted-text')) {
                  conversionFound = true;
                }
              });
            }
          });

          if (conversionFound) {
            const processingTime = performance.now() - startProcessing;

            if (isValidTestSize(testSize)) {
              metrics.processingTime[testSize].push(processingTime);
            }

            // Count conversions
            const conversions = document.querySelectorAll('.tg-converted-text');
            logMessage(`Found ${conversions.length} converted text elements`);

            // Get memory usage if available (Chrome-only feature)
            if (performance.memory) {
              const memoryUsageMB = performance.memory.usedJSHeapSize / (1024 * 1024);

              if (isValidTestSize(testSize)) {
                metrics.memory[testSize].push(memoryUsageMB);
              }
            }

            // Disconnect the observer
            observer.disconnect();

            // Simulate hover events
            simulateHoverEvents(config.hoverTestCount, testSize).then(() => {
              // Clear content
              const testAreaElement = document.getElementById('test-area');
              if (testAreaElement) {
                testAreaElement.innerHTML = '';
              }

              // Run next iteration or resolve
              iterationCount++;
              if (iterationCount < config.iterations) {
                setTimeout(runIteration, 1000);
              } else {
                resolve();
              }
            });
          }
        });

        // Start observing
        observer.observe(testArea, {
          childList: true,
          subtree: true,
          characterData: true,
          attributes: true,
        });

        // Insert content and start processing timer
        const startProcessing = performance.now();
        testArea.innerHTML = content;
      }

      runIteration();
    });
  }

  /**
   * Calculate statistics for an array of numbers
   */
  function calculateStats(values: number[]): {
    avg: number;
    min: number;
    max: number;
    median: number;
  } {
    if (values.length === 0) {
      return { avg: 0, min: 0, max: 0, median: 0 };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const median =
      sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];

    return { avg, min, max, median };
  }

  /**
   * Report test results
   */
  function reportResults(): void {
    logMessage('=== Performance Test Results ===');

    const testSizes: TestSize[] = ['small', 'medium', 'large', 'extreme'];

    testSizes.forEach((size) => {
      logMessage(`\n${size.toUpperCase()} Test Results:`);

      Object.entries(metrics).forEach(([metricName, metricData]) => {
        const values = metricData[size];
        const stats = calculateStats(values);

        logMessage(
          `${metricName}: avg=${stats.avg.toFixed(2)}ms, min=${stats.min.toFixed(2)}ms, max=${stats.max.toFixed(2)}ms, median=${stats.median.toFixed(2)}ms`
        );
      });
    });

    // Create summary table
    const summaryTable = document.createElement('table');
    if (summaryTable.style) {
      summaryTable.style.width = '100%';
      summaryTable.style.borderCollapse = 'collapse';
      summaryTable.style.marginTop = '20px';
    }

    const headerRow = summaryTable.insertRow();
    ['Test Size', 'Generation (ms)', 'Processing (ms)', 'Tooltip (ms)', 'Memory (MB)'].forEach(
      (header) => {
        const cell = headerRow.insertCell();
        cell.textContent = header;
        if (cell.style) {
          cell.style.border = '1px solid #ccc';
          cell.style.padding = '8px';
          cell.style.backgroundColor = '#f5f5f5';
          cell.style.fontWeight = 'bold';
        }
      }
    );

    testSizes.forEach((size) => {
      const row = summaryTable.insertRow();

      // Test size cell
      const sizeCell = row.insertCell();
      sizeCell.textContent = size;
      if (sizeCell.style) {
        sizeCell.style.border = '1px solid #ccc';
        sizeCell.style.padding = '8px';
      }

      // Metric cells
      ['generationTime', 'processingTime', 'tooltipShowTime', 'memory'].forEach((metricName) => {
        const cell = row.insertCell();
        const values = (metrics as any)[metricName][size];
        const stats = calculateStats(values);
        cell.textContent = stats.avg.toFixed(2);
        if (cell.style) {
          cell.style.border = '1px solid #ccc';
          cell.style.padding = '8px';
          cell.style.textAlign = 'center';
        }
      });
    });

    // Append table to results area
    const resultsArea = document.getElementById('results-area');
    if (resultsArea) {
      resultsArea.appendChild(summaryTable);
    }

    logMessage('Performance testing complete!');
  }

  /**
   * Run performance tests
   */
  function runPerformanceTests(): void {
    logMessage('Starting performance test suite');

    // Run tests in sequence
    runTest('small', config.smallTest)
      .then(() => runTest('medium', config.mediumTest))
      .then(() => runTest('large', config.largeTest))
      .then(() => runTest('extreme', config.extremeTest))
      .then(() => {
        // Report results
        reportResults();
      })
      .catch((error: Error) => {
        logMessage(`Error during testing: ${error.message}`);
        console.error(error);
      });
  }

  /**
   * Initialize performance testing
   */
  function initPerformanceTest(): void {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initPerformanceTest);
      return;
    }

    // Create test environment
    const testArea = document.createElement('div');
    testArea.id = 'test-area';
    if (testArea.style) {
      testArea.style.maxHeight = '400px';
      testArea.style.overflow = 'auto';
      testArea.style.border = '1px solid #ccc';
      testArea.style.padding = '10px';
      testArea.style.marginBottom = '20px';
    }

    const resultsArea = document.createElement('div');
    resultsArea.id = 'results-area';

    const startButton = document.createElement('button');
    startButton.textContent = 'Start Performance Tests';
    startButton.onclick = runPerformanceTests;
    if (startButton.style) {
      startButton.style.marginBottom = '20px';
      startButton.style.padding = '10px 20px';
      startButton.style.fontSize = '16px';
    }

    document.body.appendChild(startButton);
    document.body.appendChild(testArea);
    document.body.appendChild(resultsArea);

    logMessage('Performance test environment ready');
  }

  // Initialize when script loads
  initPerformanceTest();
})();
