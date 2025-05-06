/**
 * Trump Goggles - Shared definitions
 *
 * This file contains shared type definitions and functions used by both
 * content.js and content-fixed.js to avoid duplicate declarations.
 */

/**
 * Builds a mapping of regular expressions to Trump's nicknames.
 *
 * This function is deliberately declared in the global scope so that it can be
 * accessed by other content scripts. The @ts-ignore is necessary because:
 * 1. Multiple content scripts need to access this function
 * 2. Browser extension content scripts run in isolated JavaScript contexts
 * 3. Functions declared in the global scope in one content script become accessible to others
 * 4. TypeScript doesn't have a mechanism to model this browser-specific behavior
 * 5. Content scripts cannot use ES modules for sharing code in this extension architecture
 *
 * @returns {Object.<string, TrumpMapping>} - An object mapping keys to regex and nickname pairs
 */
// @ts-ignore - Function needs to be globally accessible to other content scripts via window/global scope
function buildTrumpMap() {
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
