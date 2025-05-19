/**
 * Script to set up a local server for performance testing
 * This allows testing both optimized and unoptimized versions
 * of the Trump Goggles extension.
 */

/**
 * Node.js Module imports using CommonJS require syntax.
 *
 * The @ts-ignore directives are necessary because:
 * 1. This file uses CommonJS require() syntax which TypeScript doesn't recognize by default
 * 2. The project is not configured with Node.js type definitions (@types/node)
 * 3. This file is a standalone utility script, not part of the main extension
 * 4. TypeScript is used for the browser extension code, not server-side scripts
 * 5. Adding full Node.js typings just for this utility script would be overkill
 */
// @ts-ignore - This file uses CommonJS require() syntax in a TypeScript environment without Node.js type definitions
const http = require('http');
// @ts-ignore - This file uses CommonJS require() syntax in a TypeScript environment without Node.js type definitions
const fs = require('fs');
// @ts-ignore - This file uses CommonJS require() syntax in a TypeScript environment without Node.js type definitions
const path = require('path');
// @ts-ignore - This file uses CommonJS require() syntax in a TypeScript environment without Node.js type definitions
const open = require('open');

// Port for the test server
const PORT = 3000;

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  // Get the file path from the URL
  let filePath = path.join(__dirname, req.url === '/' ? 'performance-test-page.html' : req.url);

  // Ensure the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
      return;
    }

    // Determine content type based on file extension
    const extname = path.extname(filePath);
    let contentType = 'text/html';

    switch (extname) {
      case '.js':
        contentType = 'text/javascript';
        break;
      case '.css':
        contentType = 'text/css';
        break;
      case '.json':
        contentType = 'application/json';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
        contentType = 'image/jpg';
        break;
    }

    // Read and serve the file
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Server Error');
        return;
      }

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Performance Test Server running at http://localhost:${PORT}/`);
  console.log('');
  console.log('INSTRUCTIONS:');
  console.log('1. Opening test page in your browser...');
  console.log('2. Use the buttons at the top to switch between optimized and unoptimized versions');
  console.log('3. Load more content to stress test the performance');
  console.log('4. Review the performance metrics displayed');
  console.log('5. Press Ctrl+C to stop the server when finished');
  console.log('');

  // Open the browser to the test page
  /**
   * The `open` module launches a URL in the user's default browser.
   * The @ts-ignore is necessary because:
   * 1. TypeScript doesn't have type definitions for the 'open' module
   * 2. The function call pattern doesn't match what TypeScript expects
   * 3. This is a standalone utility script where strict typing is less critical
   * 4. Adding @types/open just for this single usage would be excessive
   */
  // @ts-ignore - TypeScript lacks type definitions for the 'open' module's function signature
  open(`http://localhost:${PORT}/`);
});

// Handle server shutdown
process.on('SIGINT', () => {
  console.log('Stopping performance test server...');
  server.close(() => {
    console.log('Server stopped');
    process.exit(0);
  });
});
