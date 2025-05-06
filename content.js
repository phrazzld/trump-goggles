/**
 * Trump Goggles - Chrome extension to see the world through Trump's eyes
 *
 * This content script replaces mentions of politicians, media figures, and other entities
 * with Donald Trump's nicknames for them. It works by traversing the DOM tree and replacing
 * text in non-editable elements. It also observes DOM changes to handle dynamically loaded content.
 *
 * @author Original developer (unknown)
 * @version 2.0.0
 */

// Import shared definitions from content-shared.js
/**
 * Function that builds a mapping of regular expressions to Trump's nicknames.
 * This function is defined in content-shared.js which is loaded before this script.
 *
 * It returns an object where:
 * - Keys are identification strings like 'isis', 'hillary', etc.
 * - Values are objects with structure {regex: RegExp, nick: string}
 *
 * TypeScript cannot statically analyze this cross-file dependency because:
 * 1. The function is defined in another file that's loaded at runtime
 * 2. It's made available through the global scope (window, self, etc.)
 * 3. The browser extension architecture doesn't use standard ES modules
 *
 * @returns {Object.<string, {regex: RegExp, nick: string}>} Trump mapping object
 */
// @ts-ignore - Function defined in content-shared.js loaded via manifest.json before this script
const buildTrumpMap =
  window.buildTrumpMap || self.buildTrumpMap || this.buildTrumpMap || globalThis.buildTrumpMap;

// Pre-declare variables to avoid scoping issues
/**
 * Object containing all the Trump mapping entries.
 * Structure: { [key: string]: { regex: RegExp, nick: string } }
 */
// @ts-ignore - Type is derived from buildTrumpMap's return value
let trumpMap = {};

/**
 * Array of keys from the Trump mapping object for iteration.
 */
// @ts-ignore - Type is derived from trumpMap
let mapKeys = [];

// Runtime check for the function's existence to handle loading failures
if (typeof buildTrumpMap !== 'function') {
  // Log detailed error with troubleshooting instructions
  console.error(
    'Trump Goggles Error: buildTrumpMap function not found! ' +
      'This likely means content-shared.js failed to load or loaded after content.js. ' +
      'Check manifest.json script order. Replacements disabled.'
  );
  // Extension functionality will be effectively disabled since we can't proceed without buildTrumpMap
} else {
  // Only execute initialization if buildTrumpMap exists

  // Cache the Trump mappings to avoid rebuilding for each text node
  trumpMap = buildTrumpMap();
  mapKeys = Object.keys(trumpMap);

  // Initialize text replacement when DOM is loaded
  try {
    walk(document.body);

    // Setup MutationObserver to handle dynamic content
    setupMutationObserver();
  } catch (error) {
    console.error('Trump Goggles: Error initializing extension', error);
  }
}

/**
 * Determines if a DOM node is editable or within an editable element.
 *
 * An element is considered editable if it's an input, textarea,
 * or has the contenteditable attribute set. This function
 * recursively checks the node and its ancestors.
 *
 * @param {Node} node - The DOM node to check
 * @returns {boolean} - True if the node is editable or within an editable element, false otherwise
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
 * Recursively traverses the DOM tree and applies text replacements to text nodes.
 *
 * This function walks through all nodes in the DOM tree, including elements,
 * documents, document fragments, and text nodes. For text nodes, it calls
 * the convert function to apply Trump's nicknames, unless the node is within
 * an editable element.
 *
 * Credit to t-j-crowder on StackOverflow for this walk function:
 * http://bit.ly/1o47R7V
 *
 * @param {Node} node - The starting DOM node to traverse
 * @returns {void}
 */
function walk(node) {
  try {
    // Skip if node is undefined, null, or not a valid node
    if (!node || !node.nodeType) {
      return;
    }

    let child, next;

    switch (node.nodeType) {
      case 1: // Element
        // Skip script, style, and SVG elements
        const tagName = node.nodeName ? node.nodeName.toLowerCase() : '';
        if (tagName === 'script' || tagName === 'style' || tagName === 'svg') {
          return;
        }
      // Continue to default processing
      case 9: // Document
      case 11: // Document fragment
        child = node.firstChild;
        while (child) {
          next = child.nextSibling;
          walk(child);
          child = next;
        }
        break;
      case 3: // Text node
        // Only convert if the node is not within an editable element
        if (!isEditableNode(node)) {
          convert(/** @type {Text} */ (node));
        }
        break;
    }
  } catch (error) {
    console.error('Trump Goggles: Error walking node', error);
  }
}

/**
 * Applies Trump nickname replacements to the content of a text node.
 *
 * This function takes a text node and replaces all occurrences of target phrases
 * with Trump's nicknames for them. It uses a temporary variable to batch all
 * replacements before updating the DOM once, which improves performance.
 *
 * @param {Text} textNode - The text node whose content will be modified
 * @returns {void}
 */
function convert(textNode) {
  try {
    // Skip if node is invalid or has no content
    if (!textNode || !textNode.nodeValue) {
      return;
    }

    // Create a temporary variable to avoid multiple DOM updates
    let replacedText = textNode.nodeValue;
    const originalText = replacedText;

    // Apply all replacements to the temporary variable
    mapKeys.forEach(function (key) {
      try {
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
      textNode.nodeValue = replacedText;
    }
  } catch (error) {
    console.error('Trump Goggles: Error converting text node', error);
  }
}

// Note: buildTrumpMap is now imported from content-shared.js

/**
 * Sets up a MutationObserver to handle dynamically added content.
 *
 * This function creates and configures a MutationObserver instance that
 * watches for changes to the DOM (e.g., new nodes being added). When
 * changes occur, it processes only the new content to apply Trump's nicknames,
 * making the extension work with dynamic content loading like infinite scrolling
 * or AJAX-loaded content commonly found in modern web applications.
 *
 * @returns {void}
 */
function setupMutationObserver() {
  // Don't run in frames - focus only on the main document
  if (window !== window.top) {
    return;
  }

  // Define a MutationObserver that will process new content
  const trumpObserver = new MutationObserver((mutations) => {
    try {
      // Process each mutation
      mutations.forEach((mutation) => {
        // Process new nodes (childList mutations)
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            // Only process element and text nodes
            if (node.nodeType === 1 || node.nodeType === 3) {
              walk(node);
            }
          });
        }

        // Process changed text content (characterData mutations)
        if (mutation.type === 'characterData' && mutation.target.nodeType === 3) {
          // Make sure the node isn't in an editable field
          if (!isEditableNode(mutation.target)) {
            convert(/** @type {Text} */ (mutation.target));
          }
        }
      });
    } catch (error) {
      console.error('Trump Goggles: Error processing mutations', error);
    }
  });

  // Configure the observer to watch for relevant changes
  const observerConfig = {
    childList: true, // Watch for new nodes
    subtree: true, // Watch the entire subtree
    characterData: true, // Watch for text content changes
  };

  // Start observing
  try {
    trumpObserver.observe(document.body, observerConfig);
  } catch (error) {
    console.error('Trump Goggles: Error setting up MutationObserver', error);
  }

  // Error handling is already integrated into the MutationObserver callbacks
}
