/**
 * Performance Test Runner Script
 *
 * This script automates performance testing of the Trump Goggles tooltip feature.
 * It creates a test environment, generates test content with varying numbers of
 * convertible text, and measures performance metrics.
 */

(function () {
  'use strict';

  /**
   * Performance Test Configuration
   */
  const config = {
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
  const metrics = {
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
   * Run performance tests
   */
  function runPerformanceTests() {
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
      .catch((error) => {
        logMessage(`Error running tests: ${error.message}`);
        console.error(error);
      });
  }

  /**
   * Run a single performance test with the given configuration
   *
   * @param {string} testSize - The size label for the test (small, medium, large, extreme)
   * @param {Object} testConfig - Configuration for the test
   * @returns {Promise} Promise that resolves when the test is complete
   */
  function runTest(testSize, testConfig) {
    return new Promise((resolve, _reject) => {
      logMessage(
        `Running ${testSize} test with ${testConfig.paragraphs} paragraphs and ${testConfig.referencesPerParagraph} references per paragraph`
      );

      // Clear previous content
      document.getElementById('test-area').innerHTML = '';

      // Run the test multiple times
      let iterationCount = 0;

      function runIteration() {
        logMessage(`${testSize} test - Iteration ${iterationCount + 1}/${config.iterations}`);

        // Generate content
        const startGeneration = performance.now();
        const content = ContentGenerator.generateContent(
          testConfig.paragraphs,
          testConfig.referencesPerParagraph
        );

        const testArea = document.getElementById('test-area');
        testArea.innerHTML = '';

        content.forEach((paragraphText) => {
          const p = document.createElement('p');
          p.textContent = paragraphText;
          testArea.appendChild(p);
        });

        const generationTime = performance.now() - startGeneration;
        metrics.generationTime[testSize].push(generationTime);

        // Measure processing time
        const startProcessing = performance.now();

        // We'll use MutationObserver to detect when Trump Goggles processes the content
        const observer = new MutationObserver((mutations) => {
          let conversionFound = false;

          for (const mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
              for (const node of mutation.addedNodes) {
                if (node.classList && node.classList.contains('tg-converted-text')) {
                  conversionFound = true;
                  break;
                }
              }
            }

            if (conversionFound) break;
          }

          if (conversionFound) {
            const processingTime = performance.now() - startProcessing;
            metrics.processingTime[testSize].push(processingTime);

            // Count conversions
            const conversions = document.querySelectorAll('.tg-converted-text');
            logMessage(`Found ${conversions.length} converted text elements`);

            // Get memory usage if available
            if (performance.memory) {
              metrics.memory[testSize].push(performance.memory.usedJSHeapSize / (1024 * 1024));
            }

            // Disconnect the observer
            observer.disconnect();

            // Simulate hover events
            simulateHoverEvents(config.hoverTestCount, testSize).then(() => {
              // Clear content
              document.getElementById('test-area').innerHTML = '';

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
          attributeFilter: ['class', 'data-original-text'],
        });

        // If Trump Goggles isn't detected after 5 seconds, try manual testing
        setTimeout(() => {
          if (metrics.processingTime[testSize].length <= iterationCount) {
            observer.disconnect();
            logMessage('Trump Goggles extension not detected or not processing content');

            // Skip to next iteration as a fallback
            iterationCount++;
            if (iterationCount < config.iterations) {
              setTimeout(runIteration, 1000);
            } else {
              resolve();
            }
          }
        }, 5000);
      }

      // Start the first iteration
      runIteration();
    });
  }

  /**
   * Simulate hover events to test tooltip performance
   *
   * @param {number} count - Number of hover events to simulate
   * @param {string} testSize - The size label for the test
   * @returns {Promise} Promise that resolves when simulation is complete
   */
  function simulateHoverEvents(count, testSize) {
    return new Promise((resolve) => {
      // Get all elements containing "Donald Trump"
      const testArea = document.getElementById('test-area');
      const paragraphs = testArea.querySelectorAll('p');
      const targetParagraphs = [];

      for (const p of paragraphs) {
        if (p.textContent.includes('Donald Trump')) {
          targetParagraphs.push(p);
        }
      }

      if (targetParagraphs.length === 0) {
        logMessage('No elements containing "Donald Trump" found');
        resolve();
        return;
      }

      logMessage(`Simulating hover on ${count} elements...`);

      // Maintain hover timings
      const hoverTimings = [];
      let hoverCount = 0;

      function simulateNextHover() {
        if (hoverCount >= count) {
          // Calculate average and store
          if (hoverTimings.length > 0) {
            const avg = hoverTimings.reduce((sum, time) => sum + time, 0) / hoverTimings.length;
            metrics.tooltipShowTime[testSize].push(avg);
          }
          resolve();
          return;
        }

        const randomIndex = Math.floor(Math.random() * targetParagraphs.length);
        const paragraph = targetParagraphs[randomIndex];

        // Measure time to show tooltip
        const startTime = performance.now();

        // Create and dispatch events
        const mouseOverEvent = new MouseEvent('mouseover', {
          bubbles: true,
          cancelable: true,
          view: window,
        });

        paragraph.dispatchEvent(mouseOverEvent);

        // Wait for tooltip to appear (looking for element with role="tooltip")
        const checkInterval = setInterval(() => {
          const tooltip = document.querySelector('[role="tooltip"]');
          if (tooltip && window.getComputedStyle(tooltip).visibility === 'visible') {
            clearInterval(checkInterval);
            const showTime = performance.now() - startTime;
            hoverTimings.push(showTime);

            // Hide tooltip after a moment
            setTimeout(() => {
              const mouseOutEvent = new MouseEvent('mouseout', {
                bubbles: true,
                cancelable: true,
                view: window,
              });
              paragraph.dispatchEvent(mouseOutEvent);

              // Wait briefly before trying next hover
              setTimeout(() => {
                hoverCount++;
                simulateNextHover();
              }, 100);
            }, 50);
          }
        }, 10);

        // Timeout if tooltip doesn't appear within 1 second
        setTimeout(() => {
          clearInterval(checkInterval);
          hoverCount++;
          simulateNextHover();
        }, 1000);
      }

      // Start simulation
      simulateNextHover();
    });
  }

  /**
   * Report test results
   */
  function reportResults() {
    logMessage('=== PERFORMANCE TEST RESULTS ===');

    // Helper to calculate average
    function calculateAverage(arr) {
      if (arr.length === 0) return 'N/A';
      return (arr.reduce((sum, val) => sum + val, 0) / arr.length).toFixed(2);
    }

    // Format time value
    function formatTime(ms) {
      if (ms === 'N/A') return ms;
      if (parseFloat(ms) < 1) {
        return `${(parseFloat(ms) * 1000).toFixed(2)} μs`;
      }
      if (parseFloat(ms) < 1000) {
        return `${ms} ms`;
      }
      return `${(parseFloat(ms) / 1000).toFixed(2)} s`;
    }

    // Generate results table
    const results = document.createElement('div');
    results.className = 'results-table';
    results.innerHTML = `
      <h2>Performance Test Results</h2>
      <table border="1" cellpadding="5" cellspacing="0">
        <tr>
          <th>Metric</th>
          <th>Small Test</th>
          <th>Medium Test</th>
          <th>Large Test</th>
          <th>Extreme Test</th>
        </tr>
        <tr>
          <td>Content Generation Time</td>
          <td>${formatTime(calculateAverage(metrics.generationTime.small))}</td>
          <td>${formatTime(calculateAverage(metrics.generationTime.medium))}</td>
          <td>${formatTime(calculateAverage(metrics.generationTime.large))}</td>
          <td>${formatTime(calculateAverage(metrics.generationTime.extreme))}</td>
        </tr>
        <tr>
          <td>Processing Time</td>
          <td>${formatTime(calculateAverage(metrics.processingTime.small))}</td>
          <td>${formatTime(calculateAverage(metrics.processingTime.medium))}</td>
          <td>${formatTime(calculateAverage(metrics.processingTime.large))}</td>
          <td>${formatTime(calculateAverage(metrics.processingTime.extreme))}</td>
        </tr>
        <tr>
          <td>Tooltip Show Time</td>
          <td>${formatTime(calculateAverage(metrics.tooltipShowTime.small))}</td>
          <td>${formatTime(calculateAverage(metrics.tooltipShowTime.medium))}</td>
          <td>${formatTime(calculateAverage(metrics.tooltipShowTime.large))}</td>
          <td>${formatTime(calculateAverage(metrics.tooltipShowTime.extreme))}</td>
        </tr>
        <tr>
          <td>Memory Usage (MB)</td>
          <td>${calculateAverage(metrics.memory.small)}</td>
          <td>${calculateAverage(metrics.memory.medium)}</td>
          <td>${calculateAverage(metrics.memory.large)}</td>
          <td>${calculateAverage(metrics.memory.extreme)}</td>
        </tr>
      </table>
    `;

    // Add the results to the page
    document.body.appendChild(results);

    // Log results
    logMessage('Performance test suite completed. Results displayed on page.');
  }

  /**
   * Log a message to the results log
   */
  function logMessage(message) {
    const log = document.getElementById('results-log');
    if (!log) return;

    const timestamp = new Date().toLocaleTimeString();
    log.textContent += `[${timestamp}] ${message}\n`;
    log.scrollTop = log.scrollHeight;

    // Also log to console
    console.log(`[PerformanceTest] ${message}`);
  }

  // Make testing functions available globally
  window.PerformanceTestRunner = {
    runTests: runPerformanceTests,
  };
})();
