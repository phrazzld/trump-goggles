// Original patterns
var ISIS_PATTERN = new RegExp('(ISIS)|(ISIL)|(Islamic State)|(Isis)|(Isil)', 'g');
var HILL_PATTERN = new RegExp('(Hillary Clinton)|(Hillary Rodham Clinton)|(Mrs\. Clinton)', 'g');
var FAKENEWS_PATTERN = new RegExp(
  '(MSNBC)|(NBC)|(NYTIMES)|(NYTimes)|(TNYT)|(NYT)|(New York Times)|(NBC News)|(HuffPo)|(Huffington Post)|(ABC News)|(American Broadcasting Company)|(CBS)',
  'g'
);
var CRUZ_PATTERN = new RegExp('Ted Cruz', 'g');
var MARCO_PATTERN = new RegExp('(Marco Rubio)|(Rubio)', 'g');
var JEB_PATTERN = new RegExp('(Jeb Bush)|(Jeb)', 'g');
var WARREN_PATTERN = new RegExp('Elizabeth Warren', 'g');
var LAMB_PATTERN = new RegExp('Conor Lamb', 'g');
var BANNON_PATTERN = new RegExp('Steve Bannon', 'g');
var DURBIN_PATTERN = new RegExp('Dick Durbin', 'g');
var FEINSTEIN_PATTERN = new RegExp('Dianne Feinstein', 'g');
var FLAKE_PATTERN = new RegExp('Jeff Flake', 'g');
var FRANKEN_PATTERN = new RegExp('Al Franken', 'g');
var CORKER_PATTERN = new RegExp('Bob Corker', 'g');
var KELLY_PATTERN = new RegExp('Megyn Kelly', 'g');
var SCARBOROUGH_PATTERN = new RegExp('Joe Scarborough', 'g');
var MIKA_PATTERN = new RegExp('Mika Brzezinski', 'g');
var CHUCK_TODD_PATTERN = new RegExp('Chuck Todd', 'g');
var JIM_ACOSTA_PATTERN = new RegExp('Jim Acosta', 'g');
var KASICH_PATTERN = new RegExp('John Kasich', 'g');
var ASSAD_PATTERN = new RegExp('Bashar (Hafez)? al-Assad', 'g');
var COFFEE_PATTERN = new RegExp('(coffee)|(Coffee)', 'g');

// 2025 Upgrade Pack - Politicians & Prosecutors
var BIDEN_PATTERN = new RegExp('Joe\\s+Biden', 'gi');
var KAMALA_PATTERN = new RegExp('Kamala\\s+Harris', 'gi');
var DESANTIS_PATTERN = new RegExp('Ron\\s+DeSantis', 'gi');
var HALEY_PATTERN = new RegExp('Nikki\\s+Haley', 'gi');
var MCCONNELL_PATTERN = new RegExp('Mitch\\s+McConnell', 'gi');
var CHAO_PATTERN = new RegExp('Elaine\\s+Chao', 'gi');
var SCHIFF_PATTERN = new RegExp('Adam\\s+Schiff', 'gi');
var PELOSI_PATTERN = new RegExp('Nancy\\s+Pelosi', 'gi');
var SCHUMER_PATTERN = new RegExp('Chuck\\s+Schumer', 'gi');
var BLOOMBERG_PATTERN = new RegExp('(Michael|Mike)\\s+Bloomberg', 'gi');
var CHENEY_PATTERN = new RegExp('Liz\\s+Cheney', 'gi');
var CHRISTIE_PATTERN = new RegExp('Chris\\s+Christie', 'gi');
var BERNIE_PATTERN = new RegExp('Bernie\\s+Sanders', 'gi');
var JACK_SMITH_PATTERN = new RegExp('Jack\\s+Smith', 'gi');
var BRAGG_PATTERN = new RegExp('Alvin\\s+Bragg', 'gi');
var LETITIA_JAMES_PATTERN = new RegExp('Letitia\\s+James', 'gi');

// Foreign Leaders
var KIM_JONG_UN_PATTERN = new RegExp('(Kim Jong-un)|(Kim Jong Un)', 'gi');

// Media & Organizations
var CNN_PATTERN = new RegExp('CNN', 'gi');
var NYT_PATTERN = new RegExp('(NYT|New\\s+York\\s+Times)', 'gi');
var WP_PATTERN = new RegExp('(Washington\\s+Post|WaPo)', 'gi');
var MSNBC_PATTERN = new RegExp('(MSNBC|MSDNC)', 'gi');
var COMCAST_PATTERN = new RegExp('Comcast', 'gi');
var FORBES_PATTERN = new RegExp('Forbes', 'gi');

// COVID-related patterns
var COVID_PATTERN = new RegExp('(COVID[- ]?19|Covid|Coronavirus)', 'gi');
var COVID_ALT_PATTERN = new RegExp('(SARS[- ]CoV[- ]?2|Wuhan\\s+Virus)', 'gi');

chrome.storage.sync.get(null, function (obj) {
  walk(document.body);
});

// Credit to t-j-crowder on StackOverflow for this walk function
// http://bit.ly/1o47R7V
function walk(node) {
  var child, next;

  switch (node.nodeType) {
    case 1: // Element
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
      convert(node);
      break;
  }
}

// Analyzes context of the text node to determine if replacements should be applied
function analyzeContext(textNode) {
  // Get parent elements for context
  var parentNode = textNode.parentNode;
  if (!parentNode) return 0;

  // Get context score based on HTML elements and content
  var contextScore = 0;

  // Check if we're in a news article or political content
  if (isNewsContext(parentNode)) {
    contextScore += 50;
  }

  if (isPoliticalContext(parentNode)) {
    contextScore += 40;
  }

  // Check text content for political keywords
  var content = textNode.nodeValue.toLowerCase();
  var politicalKeywords = [
    'president',
    'congress',
    'senator',
    'representative',
    'election',
    'politics',
    'political',
    'government',
    'democrat',
    'republican',
    'campaign',
    'policy',
    'policies',
    'administration',
  ];

  // Count political keywords in the text
  politicalKeywords.forEach(function (keyword) {
    if (content.indexOf(keyword) !== -1) {
      contextScore += 5;
    }
  });

  return Math.min(contextScore, 100); // Cap at 100
}

// Checks if we're in a news context
function isNewsContext(node) {
  // Check for common news site elements
  var newsElements = ['article', 'main', 'section'];
  var newsClasses = ['news', 'article', 'story', 'post'];

  // Check current node and its parents
  var currentNode = node;
  while (currentNode && currentNode.nodeType === 1) {
    // Check tag name
    if (newsElements.indexOf(currentNode.tagName.toLowerCase()) !== -1) {
      return true;
    }

    // Check class names
    if (currentNode.className) {
      var classNames = currentNode.className.toLowerCase();
      for (var i = 0; i < newsClasses.length; i++) {
        if (classNames.indexOf(newsClasses[i]) !== -1) {
          return true;
        }
      }
    }

    // Check for news domains in the URL
    if (window.location.hostname) {
      var hostname = window.location.hostname.toLowerCase();
      var newsDomains = [
        'news',
        'cnn',
        'fox',
        'msnbc',
        'nbc',
        'abc',
        'cbs',
        'bbc',
        'reuters',
        'bloomberg',
        'politico',
        'washingtonpost',
        'nytimes',
      ];

      for (var j = 0; j < newsDomains.length; j++) {
        if (hostname.indexOf(newsDomains[j]) !== -1) {
          return true;
        }
      }
    }

    currentNode = currentNode.parentNode;
  }

  return false;
}

// Checks if we're in political content
function isPoliticalContext(node) {
  // Check for political content indicators
  var politicalClasses = ['politics', 'political', 'government', 'election'];
  var politicalIds = ['politics', 'political', 'government', 'election'];

  // Check current node and its parents
  var currentNode = node;
  while (currentNode && currentNode.nodeType === 1) {
    // Check class names
    if (currentNode.className) {
      var classNames = currentNode.className.toLowerCase();
      for (var i = 0; i < politicalClasses.length; i++) {
        if (classNames.indexOf(politicalClasses[i]) !== -1) {
          return true;
        }
      }
    }

    // Check ID
    if (currentNode.id) {
      var id = currentNode.id.toLowerCase();
      for (var j = 0; j < politicalIds.length; j++) {
        if (id.indexOf(politicalIds[j]) !== -1) {
          return true;
        }
      }
    }

    currentNode = currentNode.parentNode;
  }

  return false;
}

// Convert text with context awareness
function convert(textNode) {
  var mappings = buildTrumpMap();
  var mapKeys = Object.keys(mappings);

  // Analyze context to determine if we should apply replacements
  var contextScore = analyzeContext(textNode);
  var confidenceThreshold = 20; // Minimum score to do replacements

  // Skip replacements if context score is too low
  if (contextScore < confidenceThreshold) {
    return;
  }

  // Adjust replacement strategy based on confidence
  // - Low confidence (20-40): Only replace high-profile political figures
  // - Medium confidence (40-70): Replace most political figures
  // - High confidence (70+): Replace all targets

  var priorityMappings = [];

  if (contextScore >= 70) {
    // High confidence - apply all replacements
    priorityMappings = mapKeys;
  } else if (contextScore >= 40) {
    // Medium confidence - focus on political figures
    priorityMappings = mapKeys.filter(function (key) {
      // Only include political figures, not media or COVID
      return !['covid', 'covidalt', 'coffee'].includes(key);
    });
  } else {
    // Low confidence - only high-profile targets
    var highProfileTargets = ['biden', 'kamala', 'cnn', 'nyt', 'kimjongun'];
    priorityMappings = mapKeys.filter(function (key) {
      return highProfileTargets.includes(key);
    });
  }

  // Apply replacements for prioritized mappings
  priorityMappings.forEach(function (key) {
    textNode.nodeValue = textNode.nodeValue.replace(mappings[key].regex, mappings[key].nick);
  });
}

// Build RegEx patterns and replacements for each object of Trump's derision
function buildTrumpMap() {
  return {
    // Original mappings
    isis: {
      regex: ISIS_PATTERN,
      nick: 'Evil Losers',
    },
    hillary: {
      regex: HILL_PATTERN,
      nick: 'Crooked Hillary',
    },
    fakenews: {
      regex: FAKENEWS_PATTERN,
      nick: 'Fake News',
    },
    cruz: {
      regex: CRUZ_PATTERN,
      nick: "Lyin' Ted",
    },
    marco: {
      regex: MARCO_PATTERN,
      nick: 'Little Marco',
    },
    jeb: {
      regex: JEB_PATTERN,
      nick: 'Low Energy Jeb',
    },
    warren: {
      regex: WARREN_PATTERN,
      nick: 'Goofy Pocahontas',
    },
    lamb: {
      regex: LAMB_PATTERN,
      nick: 'Lamb the Sham',
    },
    bannon: {
      regex: BANNON_PATTERN,
      nick: 'Sloppy Steve',
    },
    durbin: {
      regex: DURBIN_PATTERN,
      nick: 'Dicky Durbin',
    },
    feinstein: {
      regex: FEINSTEIN_PATTERN,
      nick: 'Sneaky Dianne Feinstein',
    },
    flake: {
      regex: FLAKE_PATTERN,
      nick: 'Jeff Flakey',
    },
    franken: {
      regex: FRANKEN_PATTERN,
      nick: 'Al Frankenstein',
    },
    corker: {
      regex: CORKER_PATTERN,
      nick: "Liddle' Bob Corker",
    },
    kelly: {
      regex: KELLY_PATTERN,
      nick: 'Crazy Megyn',
    },
    scarborough: {
      regex: SCARBOROUGH_PATTERN,
      nick: 'Psycho Joe',
    },
    mika: {
      regex: MIKA_PATTERN,
      nick: 'Dumb as a Rock Mika',
    },
    chucktodd: {
      regex: CHUCK_TODD_PATTERN,
      nick: 'Sleepy Eyes Chuck Todd',
    },
    jimacosta: {
      regex: JIM_ACOSTA_PATTERN,
      nick: 'Crazy Jim Acosta',
    },
    kasich: {
      regex: KASICH_PATTERN,
      nick: '1 for 38 Kasich',
    },
    coffee: {
      regex: COFFEE_PATTERN,
      nick: 'covfefe',
    },
    assad: {
      regex: ASSAD_PATTERN,
      nick: 'Animal Assad',
    },

    // 2025 Upgrade Pack - Politicians & Prosecutors
    biden: {
      regex: BIDEN_PATTERN,
      nick: 'Sleepy Joe',
    },
    kamala: {
      regex: KAMALA_PATTERN,
      nick: "Laffin' Kamala",
    },
    desantis: {
      regex: DESANTIS_PATTERN,
      nick: 'Ron DeSanctimonious',
    },
    haley: {
      regex: HALEY_PATTERN,
      nick: 'Birdbrain Nikki',
    },
    mcconnell: {
      regex: MCCONNELL_PATTERN,
      nick: 'Old Crow Mitch',
    },
    chao: {
      regex: CHAO_PATTERN,
      nick: 'Coco Chow',
    },
    schiff: {
      regex: SCHIFF_PATTERN,
      nick: 'Shifty Schiff',
    },
    pelosi: {
      regex: PELOSI_PATTERN,
      nick: 'Crazy Nancy',
    },
    schumer: {
      regex: SCHUMER_PATTERN,
      nick: "Cryin' Chuck",
    },
    bloomberg: {
      regex: BLOOMBERG_PATTERN,
      nick: 'Mini Mike',
    },
    cheney: {
      regex: CHENEY_PATTERN,
      nick: "Lyin' Liz",
    },
    christie: {
      regex: CHRISTIE_PATTERN,
      nick: 'Sloppy Chris',
    },
    bernie: {
      regex: BERNIE_PATTERN,
      nick: 'Crazy Bernie',
    },
    jacksmith: {
      regex: JACK_SMITH_PATTERN,
      nick: 'Deranged Jack Smith',
    },
    bragg: {
      regex: BRAGG_PATTERN,
      nick: 'Fat Alvin',
    },
    letitiajames: {
      regex: LETITIA_JAMES_PATTERN,
      nick: 'Peekaboo',
    },
    kimjongun: {
      regex: KIM_JONG_UN_PATTERN,
      nick: 'Little Rocket Man',
    },

    // Media & Organizations
    cnn: {
      regex: CNN_PATTERN,
      nick: 'Fake News CNN',
    },
    nyt: {
      regex: NYT_PATTERN,
      nick: 'Failing New York Times',
    },
    washingtonpost: {
      regex: WP_PATTERN,
      nick: 'Amazon Washington Post',
    },
    msnbc: {
      regex: MSNBC_PATTERN,
      nick: 'MSDNC',
    },
    comcast: {
      regex: COMCAST_PATTERN,
      nick: 'Concast',
    },
    forbes: {
      regex: FORBES_PATTERN,
      nick: 'Failing Forbes Magazine',
    },

    // COVID-related terms
    covid: {
      regex: COVID_PATTERN,
      nick: 'China Virus',
    },
    covidalt: {
      regex: COVID_ALT_PATTERN,
      nick: 'Kung Flu',
    },
  };
}
