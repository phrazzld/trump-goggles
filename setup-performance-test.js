/**
 * Script to set up a local server for performance testing
 * This allows testing both optimized and unoptimized versions
 * of the Trump Goggles extension.
 */

// @ts-ignore - TypeScript doesn't understand CommonJS require
const http = require('http');
// @ts-ignore - TypeScript doesn't understand CommonJS require
const fs = require('fs');
// @ts-ignore - TypeScript doesn't understand CommonJS require
const path = require('path');
// @ts-ignore - TypeScript doesn't understand CommonJS require
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
  // @ts-ignore - 'open' module usage with direct call
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
