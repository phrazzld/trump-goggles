/**
 * Trump Goggles - Chrome extension to see the world through Trump's eyes
 *
 * This content script replaces mentions of politicians, media figures, and other entities
 * with Donald Trump's nicknames for them. It works by traversing the DOM tree and replacing
 * text in non-editable elements. It also observes DOM changes to handle dynamically loaded content.
 *
 * @author Original developer (unknown)
 * @version 2.0.1
 */

// Import shared definitions from content-shared.js
/**
 * Function that builds a mapping of regular expressions to Trump's nicknames.
 * This function is defined in content-shared.js which is loaded before this script.
 *
 * TypeScript cannot statically analyze this cross-file dependency because:
 * 1. The function is defined in another file loaded at runtime via manifest.json
 * 2. It's made available through the global scope (window, self, etc.)
 * 3. Browser extension content scripts don't use standard ES module imports
 *
 * @returns {Object.<string, {regex: RegExp, nick: string}>} Trump mapping object
 */
// @ts-ignore - Function defined in content-shared.js loaded via manifest.json before this script
const buildTrumpMap =
  window.buildTrumpMap || self.buildTrumpMap || this.buildTrumpMap || globalThis.buildTrumpMap;

// Debug mode
const DEBUG = false;

// Extension state
let enabled = true;
let processingInProgress = false;
let operationCount = 0;
const MAX_OPERATIONS_PER_PAGE = 1000; // Safety limit

// Cache of processed nodes to avoid reprocessing
const processedNodes = new WeakSet();

// Cache the Trump mappings to avoid rebuilding for each text node
/**
 * Object containing all Trump nickname mappings.
 * The @ts-ignore is necessary because:
 * 1. TypeScript cannot track the return type from buildTrumpMap across files
 * 2. Multiple content scripts define variables with the same name in isolated contexts
 * 3. The browser extension architecture isolates each content script but shares globals
 *
 * @type {Object.<string, {regex: RegExp, nick: string}>}
 */
// @ts-ignore - Type derived from buildTrumpMap's return value, which TypeScript cannot track across content scripts
const trumpMap = buildTrumpMap();

/**
 * Array of keys from the Trump mapping object for iteration.
 * The @ts-ignore is necessary because TypeScript cannot infer the correct type
 * from trumpMap, which itself comes from a function defined in another file.
 *
 * @type {string[]}
 */
// @ts-ignore - Type derived from trumpMap, which TypeScript cannot properly type across content scripts
const mapKeys = Object.keys(trumpMap);

// Initialize text replacement when DOM is loaded
try {
  // Add emergency kill switch to page
  addKillSwitch();

  // Process in chunks to avoid freezing the browser
  setTimeout(() => {
    walkChunked(document.body);
  }, 100);

  // Setup MutationObserver to handle dynamic content
  setupMutationObserver();
} catch (error) {
  console.error('Trump Goggles: Error initializing extension', error);
}

/**
 * Create and add a kill switch to quickly disable the extension if needed
 */
function addKillSwitch() {
  const killSwitch = document.createElement('div');
  killSwitch.id = 'trump-goggles-kill-switch';
  killSwitch.style.position = 'fixed';
  killSwitch.style.bottom = '10px';
  killSwitch.style.right = '10px';
  killSwitch.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
  killSwitch.style.color = 'white';
  killSwitch.style.padding = '5px 10px';
  killSwitch.style.borderRadius = '5px';
  killSwitch.style.fontSize = '12px';
  killSwitch.style.fontFamily = 'Arial, sans-serif';
  killSwitch.style.cursor = 'pointer';
  killSwitch.style.zIndex = '9999999';
  killSwitch.style.display = DEBUG ? 'block' : 'none'; // Only show in debug mode
  killSwitch.textContent = 'Disable Trump Goggles';

  killSwitch.addEventListener('click', () => {
    enabled = false;
    killSwitch.textContent = 'Trump Goggles Disabled';
    killSwitch.style.backgroundColor = 'rgba(128, 128, 128, 0.7)';
    // You could also try to restore original text here if needed
  });

  document.body.appendChild(killSwitch);
}

/**
 * Process DOM in chunks to avoid freezing the browser
 *
 * @param {Node} rootNode - Root node to start processing from
 * @param {number} [chunkSize=50] - Number of nodes to process per chunk
 */
function walkChunked(rootNode, chunkSize = 50) {
  if (!enabled || operationCount >= MAX_OPERATIONS_PER_PAGE) {
    return;
  }

  const nodesToProcess = [rootNode];
  let processed = 0;

  function processChunk() {
    if (!enabled || nodesToProcess.length === 0 || operationCount >= MAX_OPERATIONS_PER_PAGE) {
      processingInProgress = false;
      return;
    }

    processingInProgress = true;
    const deadline = Date.now() + 15; // 15ms time slice

    while (nodesToProcess.length > 0 && Date.now() < deadline && processed < chunkSize) {
      const node = nodesToProcess.shift();

      if (!node || !node.nodeType || processedNodes.has(node)) {
        continue;
      }

      // Mark node as processed to avoid infinite loops
      processedNodes.add(node);

      switch (node.nodeType) {
      case 1: // Element
        // Skip script, style, SVG elements
        const tagName = node.nodeName ? node.nodeName.toLowerCase() : '';
        if (
          tagName === 'script' ||
            tagName === 'style' ||
            tagName === 'svg' ||
            node.id === 'trump-goggles-kill-switch'
        ) {
          continue;
        }

        // Add child nodes to processing queue
        if (node.childNodes && node.childNodes.length) {
          for (let i = 0; i < node.childNodes.length; i++) {
            nodesToProcess.push(node.childNodes[i]);
          }
        }
        break;

      case 3: // Text node
        // Only convert if node is not within an editable element and has content
        if (!isEditableNode(node) && node.nodeValue && node.nodeValue.trim().length > 0) {
          convert(node);
          processed++;
        }
        break;
      }
    }

    // Schedule next chunk
    if (nodesToProcess.length > 0 && processed < chunkSize) {
      setTimeout(processChunk, 0);
    } else {
      processingInProgress = false;
      if (DEBUG) {
        console.log(`Trump Goggles: Processed ${operationCount} operations`);
      }
    }
  }

  // Start processing first chunk
  processChunk();
}

/**
 * Determines if a DOM node is editable or within an editable element.
 *
 * @param {Node} node - The DOM node to check
 * @returns {boolean} - True if editable, false otherwise
 */
function isEditableNode(node) {
  // Check if it's a text node
  if (node.nodeType === 3) {
    // For text nodes, check the parent
    return isEditableNode(node.parentNode);
  }

  // Handle non-text nodes
  if (!node || node.nodeType !== 1) {
    return false;
  }

  // Check for common editable elements
  const element = /** @type {Element} */ (node);
  const nodeName = element.nodeName.toLowerCase();
  if (nodeName === 'textarea' || nodeName === 'input') {
    return true;
  }

  // Check for contenteditable attribute
  if (
    element.getAttribute &&
    (element.getAttribute('contenteditable') === 'true' ||
      element.getAttribute('contenteditable') === '')
  ) {
    return true;
  }

  // Check if any parent is editable (recursively)
  return node.parentNode ? isEditableNode(node.parentNode) : false;
}

/**
 * Applies Trump nickname replacements to the content of a text node.
 *
 * @param {Text} textNode - The text node whose content will be modified
 * @returns {void}
 */
function convert(textNode) {
  try {
    // Circuit breaker
    if (!enabled || operationCount >= MAX_OPERATIONS_PER_PAGE || !textNode || !textNode.nodeValue) {
      return;
    }

    // Skip if node already has our data attribute (processed)
    if (textNode._trumpGogglesProcessed) {
      return;
    }

    // Create a temporary variable to avoid multiple DOM updates
    let replacedText = textNode.nodeValue;
    const originalText = replacedText;

    // Apply all replacements to the temporary variable
    mapKeys.forEach(function (key) {
      try {
        // Optimization: Skip patterns unlikely to match
        // This is a simple heuristic that can be improved
        const pattern = trumpMap[key].regex.source.split('|')[0].replace(/[\\()]/g, '');
        if (pattern.length > 3 && !replacedText.includes(pattern.replace(/\\b/g, ''))) {
          return;
        }

        replacedText = replacedText.replace(trumpMap[key].regex, trumpMap[key].nick);

        // Reset the regex lastIndex if it has global flag
        if (trumpMap[key].regex.global) {
          trumpMap[key].regex.lastIndex = 0;
        }
      } catch (regexError) {
        console.error('Trump Goggles: Error applying regex', key, regexError);
      }
    });

    // Update DOM only once after all replacements are done, and only if text changed
    if (replacedText !== originalText) {
      // Important: Disconnect observer before making changes to avoid infinite loop
      if (trumpObserver) {
        trumpObserver.disconnect();
      }

      textNode.nodeValue = replacedText;

      // Mark this node as processed
      textNode._trumpGogglesProcessed = true;

      // Increment operation counter
      operationCount++;

      // Reconnect observer after changes
      if (trumpObserver && enabled) {
        trumpObserver.observe(document.body, observerConfig);
      }
    }
  } catch (error) {
    console.error('Trump Goggles: Error converting text node', error);
  }
}

// Note: buildTrumpMap is now imported from content-shared.js

// Global observer and config for the MutationObserver
let trumpObserver = null;
const observerConfig = {
  childList: true, // Watch for new nodes
  subtree: true, // Watch the entire subtree
  characterData: true, // Watch for text content changes
};

/**
 * Sets up a MutationObserver to handle dynamically added content.
 *
 * @returns {void}
 */
function setupMutationObserver() {
  // Don't run in frames - focus only on the main document
  if (window !== window.top) {
    return;
  }

  // Define a MutationObserver that will process new content
  trumpObserver = new MutationObserver((mutations) => {
    try {
      // Skip if disabled or max operations reached
      if (!enabled || operationCount >= MAX_OPERATIONS_PER_PAGE || processingInProgress) {
        return;
      }

      // Filter out mutations caused by our own changes
      const relevantMutations = mutations.filter((mutation) => {
        // Skip if mutation is on our kill switch
        if (mutation.target.id === 'trump-goggles-kill-switch') {
          return false;
        }

        // Skip if mutation is on a node we've processed
        if (
          mutation.target._trumpGogglesProcessed ||
          (mutation.target.parentNode && mutation.target.parentNode._trumpGogglesProcessed)
        ) {
          return false;
        }

        return true;
      });

      if (relevantMutations.length === 0) {
        return;
      }

      // Process new nodes from relevant mutations
      const nodesToProcess = new Set();

      relevantMutations.forEach((mutation) => {
        // Process new nodes (childList mutations)
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            // Only add element and text nodes
            if ((node.nodeType === 1 || node.nodeType === 3) && !processedNodes.has(node)) {
              nodesToProcess.add(node);
            }
          });
        }

        // Process changed text content (characterData mutations)
        if (
          mutation.type === 'characterData' &&
          mutation.target.nodeType === 3 &&
          !processedNodes.has(mutation.target) &&
          !mutation.target._trumpGogglesProcessed
        ) {
          if (!isEditableNode(mutation.target)) {
            nodesToProcess.add(mutation.target);
          }
        }
      });

      // Process collected nodes if there are any
      if (nodesToProcess.size > 0) {
        // Disconnect observer to avoid infinite loop
        trumpObserver.disconnect();

        // Process nodes in chunks
        for (const node of nodesToProcess) {
          if (node.nodeType === 1) {
            // Element node - process its children
            walkChunked(node);
          } else if (node.nodeType === 3 && !isEditableNode(node)) {
            // Text node - process directly if not editable
            convert(node);
          }
        }

        // Reconnect observer after processing
        if (enabled) {
          trumpObserver.observe(document.body, observerConfig);
        }
      }
    } catch (error) {
      console.error('Trump Goggles: Error processing mutations', error);
    }
  });

  // Start observing
  try {
    trumpObserver.observe(document.body, observerConfig);
  } catch (error) {
    console.error('Trump Goggles: Error setting up MutationObserver', error);
  }
}
