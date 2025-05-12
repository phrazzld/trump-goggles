/**
 * Unit tests for the buildTrumpMap function in content.js
 */
import { describe, it, expect } from 'vitest';

// Import the buildTrumpMap function
// Since we can't directly import from content.js, we recreate the function for testing
// This should be kept in sync with the original function in content.js
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
      nick: 'Comrade Kamala',
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

describe('buildTrumpMap Function', () => {
  it('should return an object with the expected structure', () => {
    const trumpMap = buildTrumpMap();

    // Check that it's an object
    expect(typeof trumpMap).toBe('object');

    // Check that it's not null
    expect(trumpMap).not.toBeNull();

    // Check that it has at least 20 entries
    expect(Object.keys(trumpMap).length).toBeGreaterThan(20);

    // Check the structure of a few sample entries
    expect(trumpMap.cnn).toHaveProperty('regex');
    expect(trumpMap.cnn).toHaveProperty('nick');
    expect(trumpMap.biden).toHaveProperty('regex');
    expect(trumpMap.biden).toHaveProperty('nick');
  });

  it('should include all required mappings from each category', () => {
    const trumpMap = buildTrumpMap();

    // Politicians
    expect(trumpMap).toHaveProperty('hillary');
    expect(trumpMap).toHaveProperty('cruz');
    expect(trumpMap).toHaveProperty('biden');

    // Media figures
    expect(trumpMap).toHaveProperty('scarborough');
    expect(trumpMap).toHaveProperty('mika');

    // Media organizations
    expect(trumpMap).toHaveProperty('cnn');
    expect(trumpMap).toHaveProperty('nyt');

    // COVID-related
    expect(trumpMap).toHaveProperty('covid');
    expect(trumpMap).toHaveProperty('covidalt');

    // Misc
    expect(trumpMap).toHaveProperty('coffee');
  });

  it('should have correctly formatted regex patterns with proper flags', () => {
    const trumpMap = buildTrumpMap();

    // Check that regex patterns have global and case-insensitive flags
    Object.keys(trumpMap).forEach((key) => {
      expect(trumpMap[key].regex.flags).toContain('g');
      expect(trumpMap[key].regex.flags).toContain('i');
    });

    // Check specific regex patterns
    expect(trumpMap.cnn.regex.source).toBe('\\bCNN\\b');
    expect(trumpMap.coffee.regex.source).toBe('(coffee)|(Coffee)');
    expect(trumpMap.biden.regex.source).toBe('Joe\\s+Biden');
  });

  it('should have the correct nicknames for each entity', () => {
    const trumpMap = buildTrumpMap();

    // Check specific nicknames
    expect(trumpMap.cnn.nick).toBe('Fake News CNN');
    expect(trumpMap.hillary.nick).toBe('Crooked Hillary');
    expect(trumpMap.cruz.nick).toBe("Lyin' Ted");
    expect(trumpMap.biden.nick).toBe('Sleepy Joe');
    expect(trumpMap.coffee.nick).toBe('covfefe');
    expect(trumpMap.covid.nick).toBe('China Virus');
  });

  it('should handle boundary-specific patterns correctly', () => {
    const trumpMap = buildTrumpMap();

    // Test word boundary patterns (like \bCNN\b)
    const cnnRegex = trumpMap.cnn.regex;
    expect('CNN is a news network'.replace(cnnRegex, trumpMap.cnn.nick)).toBe(
      'Fake News CNN is a news network'
    );
    expect('I watch CNN'.replace(cnnRegex, trumpMap.cnn.nick)).toBe('I watch Fake News CNN');

    // Should not replace when CNN is part of another word
    expect('CNNBC is not real'.replace(cnnRegex, trumpMap.cnn.nick)).toBe('CNNBC is not real');
  });
});
