// Original patterns
var ISIS_PATTERN = new RegExp('(ISIS)|(ISIL)|(Islamic State)|(Isis)|(Isil)', 'gi');
var HILL_PATTERN = new RegExp('(Hillary Clinton)|(Hillary Rodham Clinton)|(Mrs\. Clinton)', 'gi');
var CRUZ_PATTERN = new RegExp('Ted Cruz', 'gi');
var MARCO_PATTERN = new RegExp('(Marco Rubio)|(Rubio)', 'gi');
var JEB_PATTERN = new RegExp('(Jeb Bush)|(Jeb)', 'gi');
var WARREN_PATTERN = new RegExp('Elizabeth Warren', 'gi');
var LAMB_PATTERN = new RegExp('Conor Lamb', 'gi');
var BANNON_PATTERN = new RegExp('Steve Bannon', 'gi');
var DURBIN_PATTERN = new RegExp('Dick Durbin', 'gi');
var FEINSTEIN_PATTERN = new RegExp('Dianne Feinstein', 'gi');
var FLAKE_PATTERN = new RegExp('Jeff Flake', 'gi');
var FRANKEN_PATTERN = new RegExp('Al Franken', 'gi');
var CORKER_PATTERN = new RegExp('Bob Corker', 'gi');
var KELLY_PATTERN = new RegExp('Megyn Kelly', 'gi');
var SCARBOROUGH_PATTERN = new RegExp('Joe Scarborough', 'gi');
var MIKA_PATTERN = new RegExp('Mika Brzezinski', 'gi');
var CHUCK_TODD_PATTERN = new RegExp('Chuck Todd', 'gi');
var JIM_ACOSTA_PATTERN = new RegExp('Jim Acosta', 'gi');
var KASICH_PATTERN = new RegExp('John Kasich', 'gi');
var ASSAD_PATTERN = new RegExp('Bashar (Hafez)? al-Assad', 'gi');
var COFFEE_PATTERN = new RegExp('(coffee)|(Coffee)', 'gi');

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

// Media & Organizations - Fixed to avoid overlap
var CNN_PATTERN = new RegExp('\\bCNN\\b', 'gi');
var NYT_PATTERN = new RegExp('\\b(NYT|New\\s+York\\s+Times)\\b', 'gi');
var WP_PATTERN = new RegExp('\\b(Washington\\s+Post|WaPo)\\b', 'gi');
var MSNBC_PATTERN = new RegExp('\\bMSNBC\\b', 'gi');
var NBC_PATTERN = new RegExp('\\bNBC\\b(?!\\s+News)', 'gi'); // NBC but not NBC News
var NBC_NEWS_PATTERN = new RegExp('\\bNBC\\s+News\\b', 'gi');
var ABC_PATTERN = new RegExp('\\bABC\\b(?!\\s+News)', 'gi'); // ABC but not ABC News
var ABC_NEWS_PATTERN = new RegExp('\\bABC\\s+News\\b', 'gi');
var CBS_PATTERN = new RegExp('\\bCBS\\b', 'gi');
var HUFFPO_PATTERN = new RegExp('\\b(HuffPo|Huffington\\s+Post)\\b', 'gi');
var COMCAST_PATTERN = new RegExp('\\bComcast\\b', 'gi');
var FORBES_PATTERN = new RegExp('\\bForbes\\b', 'gi');

// COVID-related patterns
var COVID_PATTERN = new RegExp('\\b(COVID[- ]?19|Covid|Coronavirus)\\b', 'gi');
var COVID_ALT_PATTERN = new RegExp('\\b(SARS[- ]CoV[- ]?2|Wuhan\\s+Virus)\\b', 'gi');

// Cache the Trump mappings to avoid rebuilding for each text node
var trumpMap = buildTrumpMap();
var mapKeys = Object.keys(trumpMap);

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

// Simple convert function - applies all replacements without context awareness
function convert(textNode) {
  // Apply all replacements unconditionally using the cached map
  mapKeys.forEach(function (key) {
    textNode.nodeValue = textNode.nodeValue.replace(trumpMap[key].regex, trumpMap[key].nick);
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

    // Media & Organizations - Fixed to avoid overlaps
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
    nbc: {
      regex: NBC_PATTERN,
      nick: 'Fake News NBC',
    },
    nbcnews: {
      regex: NBC_NEWS_PATTERN,
      nick: 'Fake News NBC News',
    },
    abc: {
      regex: ABC_PATTERN,
      nick: 'Fake News ABC',
    },
    abcnews: {
      regex: ABC_NEWS_PATTERN,
      nick: 'Fake News ABC News',
    },
    cbs: {
      regex: CBS_PATTERN,
      nick: 'Fake News CBS',
    },
    huffpo: {
      regex: HUFFPO_PATTERN,
      nick: 'Liberal Huffington Post',
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
