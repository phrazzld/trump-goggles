/**
 * Trump Goggles - Chrome extension to see the world through Trump's eyes
 *
 * This content script replaces mentions of politicians, media figures, and other entities
 * with Donald Trump's nicknames for them. It works by traversing the DOM tree and replacing
 * text in non-editable elements. It also observes DOM changes to handle dynamically loaded content.
 *
 * @author Original developer (unknown)
 * @version 2.0.1
 * @typedef {Object} TrumpMapping
 * @property {RegExp} regex - The regular expression pattern to match
 * @property {string} nick - The nickname to replace the matched text with
 */

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
const trumpMap = buildTrumpMap();
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

/**
 * Builds a mapping of regular expressions to Trump's nicknames.
 *
 * @returns {Object.<string, TrumpMapping>} - An object mapping keys to regex and nickname pairs
 */
function buildTrumpMap() {
  // Optimization: Use word boundaries and more efficient patterns
  return {
    // Original mappings - Politicians
    isis: {
      regex: new RegExp('\\b(ISIS|ISIL|Islamic State)\\b', 'gi'),
      nick: 'Evil Losers',
    },
    hillary: {
      regex: new RegExp('\\b(Hillary Clinton|Hillary Rodham Clinton|Mrs\\. Clinton)\\b', 'gi'),
      nick: 'Crooked Hillary',
    },
    cruz: {
      regex: new RegExp('\\bTed Cruz\\b', 'gi'),
      nick: "Lyin' Ted",
    },
    marco: {
      regex: new RegExp('\\b(Marco Rubio|Rubio)\\b', 'gi'),
      nick: 'Little Marco',
    },
    jeb: {
      regex: new RegExp('\\b(Jeb Bush|Jeb)\\b', 'gi'),
      nick: 'Low Energy Jeb',
    },
    warren: {
      regex: new RegExp('\\bElizabeth Warren\\b', 'gi'),
      nick: 'Goofy Pocahontas',
    },
    lamb: {
      regex: new RegExp('\\bConor Lamb\\b', 'gi'),
      nick: 'Lamb the Sham',
    },
    bannon: {
      regex: new RegExp('\\bSteve Bannon\\b', 'gi'),
      nick: 'Sloppy Steve',
    },
    durbin: {
      regex: new RegExp('\\bDick Durbin\\b', 'gi'),
      nick: 'Dicky Durbin',
    },
    feinstein: {
      regex: new RegExp('\\bDianne Feinstein\\b', 'gi'),
      nick: 'Sneaky Dianne Feinstein',
    },
    flake: {
      regex: new RegExp('\\bJeff Flake\\b', 'gi'),
      nick: 'Jeff Flakey',
    },
    franken: {
      regex: new RegExp('\\bAl Franken\\b', 'gi'),
      nick: 'Al Frankenstein',
    },
    corker: {
      regex: new RegExp('\\bBob Corker\\b', 'gi'),
      nick: "Liddle' Bob Corker",
    },
    kasich: {
      regex: new RegExp('\\bJohn Kasich\\b', 'gi'),
      nick: '1 for 38 Kasich',
    },
    assad: {
      regex: new RegExp('\\bBashar (Hafez )?al-Assad\\b', 'gi'),
      nick: 'Animal Assad',
    },

    // Original mappings - Media
    kelly: {
      regex: new RegExp('\\bMegyn Kelly\\b', 'gi'),
      nick: 'Crazy Megyn',
    },
    scarborough: {
      regex: new RegExp('\\bJoe Scarborough\\b', 'gi'),
      nick: 'Psycho Joe',
    },
    mika: {
      regex: new RegExp('\\bMika Brzezinski\\b', 'gi'),
      nick: 'Dumb as a Rock Mika',
    },
    chucktodd: {
      regex: new RegExp('\\bChuck Todd\\b', 'gi'),
      nick: 'Sleepy Eyes Chuck Todd',
    },
    jimacosta: {
      regex: new RegExp('\\bJim Acosta\\b', 'gi'),
      nick: 'Crazy Jim Acosta',
    },

    // Misc
    coffee: {
      regex: new RegExp('\\bcoffee\\b', 'gi'),
      nick: 'covfefe',
    },

    // 2025 Upgrade Pack - Politicians & Prosecutors
    biden: {
      regex: new RegExp('\\bJoe\\s+Biden\\b', 'gi'),
      nick: 'Sleepy Joe',
    },
    kamala: {
      regex: new RegExp('\\bKamala\\s+Harris\\b', 'gi'),
      nick: "Laffin' Kamala",
    },
    desantis: {
      regex: new RegExp('\\bRon\\s+DeSantis\\b', 'gi'),
      nick: 'Ron DeSanctimonious',
    },
    haley: {
      regex: new RegExp('\\bNikki\\s+Haley\\b', 'gi'),
      nick: 'Birdbrain Nikki',
    },
    mcconnell: {
      regex: new RegExp('\\bMitch\\s+McConnell\\b', 'gi'),
      nick: 'Old Crow Mitch',
    },
    chao: {
      regex: new RegExp('\\bElaine\\s+Chao\\b', 'gi'),
      nick: 'Coco Chow',
    },
    schiff: {
      regex: new RegExp('\\bAdam\\s+Schiff\\b', 'gi'),
      nick: 'Shifty Schiff',
    },
    pelosi: {
      regex: new RegExp('\\bNancy\\s+Pelosi\\b', 'gi'),
      nick: 'Crazy Nancy',
    },
    schumer: {
      regex: new RegExp('\\bChuck\\s+Schumer\\b', 'gi'),
      nick: "Cryin' Chuck",
    },
    bloomberg: {
      regex: new RegExp('\\b(Michael|Mike)\\s+Bloomberg\\b', 'gi'),
      nick: 'Mini Mike',
    },
    cheney: {
      regex: new RegExp('\\bLiz\\s+Cheney\\b', 'gi'),
      nick: "Lyin' Liz",
    },
    christie: {
      regex: new RegExp('\\bChris\\s+Christie\\b', 'gi'),
      nick: 'Sloppy Chris',
    },
    bernie: {
      regex: new RegExp('\\bBernie\\s+Sanders\\b', 'gi'),
      nick: 'Crazy Bernie',
    },
    jacksmith: {
      regex: new RegExp('\\bJack\\s+Smith\\b', 'gi'),
      nick: 'Deranged Jack Smith',
    },
    bragg: {
      regex: new RegExp('\\bAlvin\\s+Bragg\\b', 'gi'),
      nick: 'Fat Alvin',
    },
    letitiajames: {
      regex: new RegExp('\\bLetitia\\s+James\\b', 'gi'),
      nick: 'Peekaboo',
    },

    // Foreign Leaders
    kimjongun: {
      regex: new RegExp('\\b(Kim Jong-un|Kim Jong Un)\\b', 'gi'),
      nick: 'Little Rocket Man',
    },

    // Media & Organizations - Fixed to avoid overlaps
    cnn: {
      regex: new RegExp('\\bCNN\\b', 'gi'),
      nick: 'Fake News CNN',
    },
    nyt: {
      regex: new RegExp('\\b(NYT|New\\s+York\\s+Times)\\b', 'gi'),
      nick: 'Failing New York Times',
    },
    washingtonpost: {
      regex: new RegExp('\\b(Washington\\s+Post|WaPo)\\b', 'gi'),
      nick: 'Amazon Washington Post',
    },
    msnbc: {
      regex: new RegExp('\\bMSNBC\\b', 'gi'),
      nick: 'MSDNC',
    },
    nbc: {
      regex: new RegExp('\\bNBC\\b(?!\\s+News)', 'gi'), // NBC but not NBC News
      nick: 'Fake News NBC',
    },
    nbcnews: {
      regex: new RegExp('\\bNBC\\s+News\\b', 'gi'),
      nick: 'Fake News NBC News',
    },
    abc: {
      regex: new RegExp('\\bABC\\b(?!\\s+News)', 'gi'), // ABC but not ABC News
      nick: 'Fake News ABC',
    },
    abcnews: {
      regex: new RegExp('\\bABC\\s+News\\b', 'gi'),
      nick: 'Fake News ABC News',
    },
    cbs: {
      regex: new RegExp('\\bCBS\\b', 'gi'),
      nick: 'Fake News CBS',
    },
    huffpo: {
      regex: new RegExp('\\b(HuffPo|Huffington\\s+Post)\\b', 'gi'),
      nick: 'Liberal Huffington Post',
    },
    comcast: {
      regex: new RegExp('\\bComcast\\b', 'gi'),
      nick: 'Concast',
    },
    forbes: {
      regex: new RegExp('\\bForbes\\b', 'gi'),
      nick: 'Failing Forbes Magazine',
    },

    // COVID-related terms
    covid: {
      regex: new RegExp('\\b(COVID[- ]?19|Covid|Coronavirus)\\b', 'gi'),
      nick: 'China Virus',
    },
    covidalt: {
      regex: new RegExp('\\b(SARS[- ]CoV[- ]?2|Wuhan\\s+Virus)\\b', 'gi'),
      nick: 'Kung Flu',
    },
  };
}

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
