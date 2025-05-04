// Original patterns
const ISIS_PATTERN = new RegExp('(ISIS)|(ISIL)|(Islamic State)|(Isis)|(Isil)', 'gi');
const HILL_PATTERN = new RegExp('(Hillary Clinton)|(Hillary Rodham Clinton)|(Mrs\. Clinton)', 'gi');
const CRUZ_PATTERN = new RegExp('Ted Cruz', 'gi');
const MARCO_PATTERN = new RegExp('(Marco Rubio)|(Rubio)', 'gi');
const JEB_PATTERN = new RegExp('(Jeb Bush)|(Jeb)', 'gi');
const WARREN_PATTERN = new RegExp('Elizabeth Warren', 'gi');
const LAMB_PATTERN = new RegExp('Conor Lamb', 'gi');
const BANNON_PATTERN = new RegExp('Steve Bannon', 'gi');
const DURBIN_PATTERN = new RegExp('Dick Durbin', 'gi');
const FEINSTEIN_PATTERN = new RegExp('Dianne Feinstein', 'gi');
const FLAKE_PATTERN = new RegExp('Jeff Flake', 'gi');
const FRANKEN_PATTERN = new RegExp('Al Franken', 'gi');
const CORKER_PATTERN = new RegExp('Bob Corker', 'gi');
const KELLY_PATTERN = new RegExp('Megyn Kelly', 'gi');
const SCARBOROUGH_PATTERN = new RegExp('Joe Scarborough', 'gi');
const MIKA_PATTERN = new RegExp('Mika Brzezinski', 'gi');
const CHUCK_TODD_PATTERN = new RegExp('Chuck Todd', 'gi');
const JIM_ACOSTA_PATTERN = new RegExp('Jim Acosta', 'gi');
const KASICH_PATTERN = new RegExp('John Kasich', 'gi');
const ASSAD_PATTERN = new RegExp('Bashar (Hafez)? al-Assad', 'gi');
const COFFEE_PATTERN = new RegExp('(coffee)|(Coffee)', 'gi');

// 2025 Upgrade Pack - Politicians & Prosecutors
const BIDEN_PATTERN = new RegExp('Joe\\s+Biden', 'gi');
const KAMALA_PATTERN = new RegExp('Kamala\\s+Harris', 'gi');
const DESANTIS_PATTERN = new RegExp('Ron\\s+DeSantis', 'gi');
const HALEY_PATTERN = new RegExp('Nikki\\s+Haley', 'gi');
const MCCONNELL_PATTERN = new RegExp('Mitch\\s+McConnell', 'gi');
const CHAO_PATTERN = new RegExp('Elaine\\s+Chao', 'gi');
const SCHIFF_PATTERN = new RegExp('Adam\\s+Schiff', 'gi');
const PELOSI_PATTERN = new RegExp('Nancy\\s+Pelosi', 'gi');
const SCHUMER_PATTERN = new RegExp('Chuck\\s+Schumer', 'gi');
const BLOOMBERG_PATTERN = new RegExp('(Michael|Mike)\\s+Bloomberg', 'gi');
const CHENEY_PATTERN = new RegExp('Liz\\s+Cheney', 'gi');
const CHRISTIE_PATTERN = new RegExp('Chris\\s+Christie', 'gi');
const BERNIE_PATTERN = new RegExp('Bernie\\s+Sanders', 'gi');
const JACK_SMITH_PATTERN = new RegExp('Jack\\s+Smith', 'gi');
const BRAGG_PATTERN = new RegExp('Alvin\\s+Bragg', 'gi');
const LETITIA_JAMES_PATTERN = new RegExp('Letitia\\s+James', 'gi');

// Foreign Leaders
const KIM_JONG_UN_PATTERN = new RegExp('(Kim Jong-un)|(Kim Jong Un)', 'gi');

// Media & Organizations - Fixed to avoid overlap
const CNN_PATTERN = new RegExp('\\bCNN\\b', 'gi');
const NYT_PATTERN = new RegExp('\\b(NYT|New\\s+York\\s+Times)\\b', 'gi');
const WP_PATTERN = new RegExp('\\b(Washington\\s+Post|WaPo)\\b', 'gi');
const MSNBC_PATTERN = new RegExp('\\bMSNBC\\b', 'gi');
const NBC_PATTERN = new RegExp('\\bNBC\\b(?!\\s+News)', 'gi'); // NBC but not NBC News
const NBC_NEWS_PATTERN = new RegExp('\\bNBC\\s+News\\b', 'gi');
const ABC_PATTERN = new RegExp('\\bABC\\b(?!\\s+News)', 'gi'); // ABC but not ABC News
const ABC_NEWS_PATTERN = new RegExp('\\bABC\\s+News\\b', 'gi');
const CBS_PATTERN = new RegExp('\\bCBS\\b', 'gi');
const HUFFPO_PATTERN = new RegExp('\\b(HuffPo|Huffington\\s+Post)\\b', 'gi');
const COMCAST_PATTERN = new RegExp('\\bComcast\\b', 'gi');
const FORBES_PATTERN = new RegExp('\\bForbes\\b', 'gi');

// COVID-related patterns
const COVID_PATTERN = new RegExp('\\b(COVID[- ]?19|Covid|Coronavirus)\\b', 'gi');
const COVID_ALT_PATTERN = new RegExp('\\b(SARS[- ]CoV[- ]?2|Wuhan\\s+Virus)\\b', 'gi');

// Cache the Trump mappings to avoid rebuilding for each text node
const trumpMap = buildTrumpMap();
const mapKeys = Object.keys(trumpMap);

// Initialize text replacement when DOM is loaded
walk(document.body);

// Credit to t-j-crowder on StackOverflow for this walk function
// http://bit.ly/1o47R7V
function walk(node) {
  let child, next;

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
  // Create a temporary variable to avoid multiple DOM updates
  let replacedText = textNode.nodeValue;

  // Apply all replacements to the temporary variable
  mapKeys.forEach(function (key) {
    replacedText = replacedText.replace(trumpMap[key].regex, trumpMap[key].nick);
  });

  // Update DOM only once after all replacements are done
  textNode.nodeValue = replacedText;
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
