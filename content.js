// Trump Goggles - Chrome extension to see the world through Trump's eyes

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
}
