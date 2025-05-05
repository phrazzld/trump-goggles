/**
 * Trump Goggles - Chrome extension to see the world through Trump's eyes
 *
 * This is a simulated "before optimization" version of content.js that:
 * 1. Does not cache the trumpMap at module level
 * 2. Updates the DOM for each replacement
 * 3. Simulates unnecessary storage calls
 *
 * This file is used for performance comparison only.
 */

// Initialize text replacement when DOM is loaded
try {
  // Simulate an unnecessary storage call
  setTimeout(() => {
    // Simulate storage callback
    walk(document.body);

    // Setup MutationObserver to handle dynamic content
    setupMutationObserver();
  }, 100); // Add artificial delay to simulate storage API call
} catch (error) {
  console.error('Trump Goggles: Error initializing extension', error);
}

/**
 * Determines if a DOM node is editable or within an editable element.
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
  const element = node;
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
        convert(node);
      }
      break;
    }
  } catch (error) {
    console.error('Trump Goggles: Error walking node', error);
  }
}

/**
 * UNOPTIMIZED VERSION:
 * 1. Rebuilds trumpMap for every text node
 * 2. Updates DOM for each replacement (no batching)
 * 3. Doesn't check if text has changed before updating
 * 4. Doesn't reset regex.lastIndex
 */
function convert(textNode) {
  try {
    // Skip if node is invalid or has no content
    if (!textNode || !textNode.nodeValue) {
      return;
    }

    // Inefficiently rebuild the map for each text node (simulating no caching)
    const trumpMap = buildTrumpMap();
    const mapKeys = Object.keys(trumpMap);

    // Inefficiently update the DOM directly for each replacement
    mapKeys.forEach(function (key) {
      try {
        // Update DOM directly for each pattern (many DOM updates)
        textNode.nodeValue = textNode.nodeValue.replace(trumpMap[key].regex, trumpMap[key].nick);

        // Not resetting lastIndex here, possibly causing issues with subsequent matches
      } catch (regexError) {
        console.error('Trump Goggles: Error applying regex', key, regexError);
      }
    });

    // Note: We're not checking if the text actually changed
  } catch (error) {
    console.error('Trump Goggles: Error converting text node', error);
  }
}

/**
 * Builds a mapping of regular expressions to Trump's nicknames.
 */
function buildTrumpMap() {
  // Simulate more expensive map building by making it slightly slower
  const start = performance.now(); // Measure start time

  // Simulate computational overhead by doing unnecessary work
  let overhead = 0;
  for (let i = 0; i < 1000; i++) {
    overhead += Math.sqrt(i);
  }

  const map = {
    // Original mappings - Politicians
    isis: {
      regex: new RegExp('(ISIS)|(ISIL)|(Islamic State)|(Isis)|(Isil)', 'gi'),
      nick: 'Evil Losers',
    },
    hillary: {
      regex: new RegExp('(Hillary Clinton)|(Hillary Rodham Clinton)|(Mrs\. Clinton)', 'gi'),
      nick: 'Crooked Hillary',
    },
    cruz: {
      regex: new RegExp('Ted Cruz', 'gi'),
      nick: "Lyin' Ted",
    },
    marco: {
      regex: new RegExp('(Marco Rubio)|(Rubio)', 'gi'),
      nick: 'Little Marco',
    },
    jeb: {
      regex: new RegExp('(Jeb Bush)|(Jeb)', 'gi'),
      nick: 'Low Energy Jeb',
    },
    warren: {
      regex: new RegExp('Elizabeth Warren', 'gi'),
      nick: 'Goofy Pocahontas',
    },
    lamb: {
      regex: new RegExp('Conor Lamb', 'gi'),
      nick: 'Lamb the Sham',
    },
    bannon: {
      regex: new RegExp('Steve Bannon', 'gi'),
      nick: 'Sloppy Steve',
    },
    durbin: {
      regex: new RegExp('Dick Durbin', 'gi'),
      nick: 'Dicky Durbin',
    },
    feinstein: {
      regex: new RegExp('Dianne Feinstein', 'gi'),
      nick: 'Sneaky Dianne Feinstein',
    },
    flake: {
      regex: new RegExp('Jeff Flake', 'gi'),
      nick: 'Jeff Flakey',
    },
    franken: {
      regex: new RegExp('Al Franken', 'gi'),
      nick: 'Al Frankenstein',
    },
    corker: {
      regex: new RegExp('Bob Corker', 'gi'),
      nick: "Liddle' Bob Corker",
    },
    kasich: {
      regex: new RegExp('John Kasich', 'gi'),
      nick: '1 for 38 Kasich',
    },
    assad: {
      regex: new RegExp('Bashar (Hafez)? al-Assad', 'gi'),
      nick: 'Animal Assad',
    },

    // Original mappings - Media
    kelly: {
      regex: new RegExp('Megyn Kelly', 'gi'),
      nick: 'Crazy Megyn',
    },
    scarborough: {
      regex: new RegExp('Joe Scarborough', 'gi'),
      nick: 'Psycho Joe',
    },
    mika: {
      regex: new RegExp('Mika Brzezinski', 'gi'),
      nick: 'Dumb as a Rock Mika',
    },
    chucktodd: {
      regex: new RegExp('Chuck Todd', 'gi'),
      nick: 'Sleepy Eyes Chuck Todd',
    },
    jimacosta: {
      regex: new RegExp('Jim Acosta', 'gi'),
      nick: 'Crazy Jim Acosta',
    },

    // Misc
    coffee: {
      regex: new RegExp('(coffee)|(Coffee)', 'gi'),
      nick: 'covfefe',
    },

    // 2025 Upgrade Pack - Politicians & Prosecutors
    biden: {
      regex: new RegExp('Joe\\s+Biden', 'gi'),
      nick: 'Sleepy Joe',
    },
    kamala: {
      regex: new RegExp('Kamala\\s+Harris', 'gi'),
      nick: "Laffin' Kamala",
    },
    desantis: {
      regex: new RegExp('Ron\\s+DeSantis', 'gi'),
      nick: 'Ron DeSanctimonious',
    },
    haley: {
      regex: new RegExp('Nikki\\s+Haley', 'gi'),
      nick: 'Birdbrain Nikki',
    },
    mcconnell: {
      regex: new RegExp('Mitch\\s+McConnell', 'gi'),
      nick: 'Old Crow Mitch',
    },
    chao: {
      regex: new RegExp('Elaine\\s+Chao', 'gi'),
      nick: 'Coco Chow',
    },
    schiff: {
      regex: new RegExp('Adam\\s+Schiff', 'gi'),
      nick: 'Shifty Schiff',
    },
    pelosi: {
      regex: new RegExp('Nancy\\s+Pelosi', 'gi'),
      nick: 'Crazy Nancy',
    },
    schumer: {
      regex: new RegExp('Chuck\\s+Schumer', 'gi'),
      nick: "Cryin' Chuck",
    },
    bloomberg: {
      regex: new RegExp('(Michael|Mike)\\s+Bloomberg', 'gi'),
      nick: 'Mini Mike',
    },
    cheney: {
      regex: new RegExp('Liz\\s+Cheney', 'gi'),
      nick: "Lyin' Liz",
    },
    christie: {
      regex: new RegExp('Chris\\s+Christie', 'gi'),
      nick: 'Sloppy Chris',
    },
    bernie: {
      regex: new RegExp('Bernie\\s+Sanders', 'gi'),
      nick: 'Crazy Bernie',
    },
    jacksmith: {
      regex: new RegExp('Jack\\s+Smith', 'gi'),
      nick: 'Deranged Jack Smith',
    },
    bragg: {
      regex: new RegExp('Alvin\\s+Bragg', 'gi'),
      nick: 'Fat Alvin',
    },
    letitiajames: {
      regex: new RegExp('Letitia\\s+James', 'gi'),
      nick: 'Peekaboo',
    },

    // Foreign Leaders
    kimjongun: {
      regex: new RegExp('(Kim Jong-un)|(Kim Jong Un)', 'gi'),
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

  const end = performance.now(); // Measure end time
  console.log(`Trump map build time: ${end - start} ms (unoptimized)`);

  return map;
}

/**
 * Sets up a MutationObserver to handle dynamically added content.
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
            convert(mutation.target);
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
}
