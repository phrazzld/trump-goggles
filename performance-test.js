/**
 * Performance Test Runner for Trump Goggles
 *
 * This script loads either the optimized or unoptimized version of content.js
 * and helps measure performance metrics.
 */

// Global variables to store performance metrics
let startTime, endTime;
let domOperations = 0;
let nodeValueUpdates = 0;

// Function to inject performance monitoring
function injectPerformanceMonitoring() {
  // Monkey patch the Text.prototype.nodeValue setter to count DOM operations
  const originalDescriptor = Object.getOwnPropertyDescriptor(Text.prototype, 'nodeValue');
  Object.defineProperty(Text.prototype, 'nodeValue', {
    set: function (value) {
      nodeValueUpdates++;
      return originalDescriptor.set.call(this, value);
    },
    get: originalDescriptor.get,
  });

  // Log the start time
  startTime = performance.now();
  console.log(`[Performance] Test started at ${new Date().toISOString()}`);
}

// Function to report performance metrics
function reportPerformanceMetrics() {
  endTime = performance.now();
  const duration = endTime - startTime;

  console.log('=== PERFORMANCE METRICS ===');
  console.log(`Total execution time: ${duration.toFixed(2)} ms`);
  console.log(`DOM nodeValue updates: ${nodeValueUpdates}`);

  // Report memory usage if available
  if (window.performance && window.performance.memory) {
    const memory = window.performance.memory;
    console.log(`Used JS heap size: ${(memory.usedJSHeapSize / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`Total JS heap size: ${(memory.totalJSHeapSize / (1024 * 1024)).toFixed(2)} MB`);
  }

  // Create a results element to display on the page
  const resultsDiv = document.createElement('div');
  resultsDiv.style.position = 'fixed';
  resultsDiv.style.top = '10px';
  resultsDiv.style.right = '10px';
  resultsDiv.style.padding = '20px';
  resultsDiv.style.backgroundColor = '#f8f8f8';
  resultsDiv.style.border = '1px solid #ddd';
  resultsDiv.style.zIndex = '10000';
  resultsDiv.style.width = '300px';
  resultsDiv.style.maxHeight = '80vh';
  resultsDiv.style.overflow = 'auto';

  resultsDiv.innerHTML = `
    <h3>Trump Goggles Performance Results</h3>
    <p><strong>Version:</strong> ${window.trumpVersion || 'Unknown'}</p>
    <p><strong>Execution Time:</strong> ${duration.toFixed(2)} ms</p>
    <p><strong>DOM Updates:</strong> ${nodeValueUpdates}</p>
    <button id="btn-close-results" style="margin-top: 10px; padding: 5px 10px;">Close</button>
  `;

  document.body.appendChild(resultsDiv);

  // Add event listener to close button
  document.getElementById('btn-close-results').addEventListener('click', function () {
    resultsDiv.remove();
  });
}

// Setup the performance test
function setupPerformanceTest(version) {
  // Set global version identifier
  window.trumpVersion = version;

  // Inject monitoring before running the content script
  injectPerformanceMonitoring();

  // Add button to trigger performance report
  const reportButton = document.createElement('button');
  reportButton.innerText = 'Report Performance Metrics';
  reportButton.style.position = 'fixed';
  reportButton.style.top = '10px';
  reportButton.style.left = '10px';
  reportButton.style.zIndex = '10000';
  reportButton.style.padding = '8px 16px';
  reportButton.style.backgroundColor = '#ff6347';
  reportButton.style.color = 'white';
  reportButton.style.border = 'none';
  reportButton.style.borderRadius = '4px';

  reportButton.addEventListener('click', reportPerformanceMetrics);
  document.body.appendChild(reportButton);

  // Load the appropriate script after a short delay
  setTimeout(() => {
    const scriptPath = version === 'optimized' ? 'content.js' : 'content-before-optimization.js';

    const script = document.createElement('script');
    script.src = scriptPath;
    document.head.appendChild(script);

    // Auto-report after 5 seconds
    setTimeout(reportPerformanceMetrics, 5000);
  }, 500);
}

// Initialize with URL parameter version
const urlParams = new URLSearchParams(window.location.search);
const version = urlParams.get('version') || 'optimized';
setupPerformanceTest(version);
