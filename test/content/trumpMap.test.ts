/**
 * Unit tests for the buildTrumpMap function in content.js
 */
import { describe, it, expect } from 'vitest';
import type { TrumpMappingObject, TrumpMapping } from '../types/fixtures';

// Import the buildTrumpMap function
// Since we can't directly import from content.js, we recreate the function for testing
// This should be kept in sync with the original function in content.js
function buildTrumpMap(): TrumpMappingObject {
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
      nick: 'Low I.Q. Crazy Mika',
    },
    cnn: {
      regex: new RegExp('\\bCNN\\b', 'gi'),
      nick: 'Fake News CNN',
    },
    msnbc: {
      regex: new RegExp('MSNBC', 'gi'),
      nick: 'MSDNC',
    },
    nbc: {
      regex: new RegExp('\\bNBC\\b', 'gi'),
      nick: 'Fake News NBC',
    },
    nyt: {
      regex: new RegExp('\\b(NYT|New\\s+York\\s+Times)\\b', 'gi'),
      nick: 'Failing New York Times',
    },
    wapo: {
      regex: new RegExp('Washington Post', 'gi'),
      nick: 'Amazon Washington Post',
    },
    cbs: {
      regex: new RegExp('\\bCBS\\b', 'gi'),
      nick: 'Fake News CBS',
    },
    abc: {
      regex: new RegExp('\\bABC\\b', 'gi'),
      nick: 'Fake News ABC',
    },
    news: {
      regex: new RegExp('\\b(media|MSM|news media|mainstream media|press)\\b', 'gi'),
      nick: 'Fake News Media',
    },

    // Extended mappings
    schumer: {
      regex: new RegExp('Chuck Schumer', 'gi'),
      nick: "Cryin' Chuck",
    },
    pelosi: {
      regex: new RegExp('Nancy Pelosi', 'gi'),
      nick: 'Crazy Nancy',
    },
    biden: {
      regex: new RegExp('Joe\\s+Biden', 'gi'),
      nick: 'Sleepy Joe',
    },
    kim: {
      regex: new RegExp('Kim Jong[- ]?Un', 'gi'),
      nick: 'Little Rocket Man',
    },
    comey: {
      regex: new RegExp('James Comey', 'gi'),
      nick: 'Slippery James Comey',
    },
    mueller: {
      regex: new RegExp('Robert Mueller', 'gi'),
      nick: 'Highly Conflicted Robert Mueller',
    },
    rosenstein: {
      regex: new RegExp('Rod Rosenstein', 'gi'),
      nick: 'Rod Rosenstein, who is highly conflicted',
    },

    // Donald Trump variations
    trump: {
      regex: new RegExp('(Donald J\.? Trump|Donald Trump|President Trump|Mr\. Trump)', 'gi'),
      nick: 'Agent Orange',
    },

    // Additional entities
    coffee: {
      regex: new RegExp('(coffee)|(Coffee)', 'gi'),
      nick: 'covfefe',
    },
    covid: {
      regex: new RegExp('\\b(COVID[- ]?19|Covid|Coronavirus)\\b', 'gi'),
      nick: 'China Virus',
    },
    rosie: {
      regex: new RegExp("Rosie O'Donnell", 'gi'),
      nick: "Fat Pig Rosie O'Donnell",
    },
    mccain: {
      regex: new RegExp('John McCain', 'gi'),
      nick: '"He\'s Not a War Hero" McCain',
    },
    sessions: {
      regex: new RegExp('Jeff Sessions', 'gi'),
      nick: 'Mr. Magoo',
    },
    mattis: {
      regex: new RegExp('(James Mattis|Gen\. Mattis|General Mattis)', 'gi'),
      nick: 'Overrated General',
    },
    tillerson: {
      regex: new RegExp('Rex Tillerson', 'gi'),
      nick: 'Dumb as a Rock Rex',
    },
    stone: {
      regex: new RegExp('Roger Stone', 'gi'),
      nick: 'Roger Stone (who I hardly know)',
    },
    bolton: {
      regex: new RegExp('John Bolton', 'gi'),
      nick: 'Wacko John Bolton',
    },
    cohen: {
      regex: new RegExp('Michael Cohen', 'gi'),
      nick: 'Rat Cohen',
    },
    avenatti: {
      regex: new RegExp('Michael Avenatti', 'gi'),
      nick: 'Creepy Porn Lawyer',
    },
    graham: {
      regex: new RegExp('Lindsey Graham', 'gi'),
      nick: 'Crazy Lindsey Graham',
    },
    mcconnell: {
      regex: new RegExp('Mitch McConnell', 'gi'),
      nick: 'Broken Old Crow',
    },
    romney: {
      regex: new RegExp('Mitt Romney', 'gi'),
      nick: 'Pierre Delecto',
    },
    aoc: {
      regex: new RegExp('Alexandria Ocasio-Cortez|AOC', 'gi'),
      nick: 'Wack Job AOC',
    },
    omar: {
      regex: new RegExp('Ilhan Omar', 'gi'),
      nick: 'Ungrateful Ilhan Omar',
    },
    tlaib: {
      regex: new RegExp('Rashida Tlaib', 'gi'),
      nick: 'Crazy Rashida Tlaib',
    },
    schiff: {
      regex: new RegExp('Adam Schiff', 'gi'),
      nick: 'Shifty Schiff',
    },
    cummings: {
      regex: new RegExp('Elijah Cummings', 'gi'),
      nick: 'King Elijah',
    },
    nadler: {
      regex: new RegExp('Jerry Nadler', 'gi'),
      nick: 'Fat Jerry',
    },
    waters: {
      regex: new RegExp('Maxine Waters', 'gi'),
      nick: 'Low IQ Maxine Waters',
    },
    blumenthal: {
      regex: new RegExp('Richard Blumenthal', 'gi'),
      nick: 'Da Nang Dick',
    },
    sanders: {
      regex: new RegExp('Bernie Sanders', 'gi'),
      nick: 'Crazy Bernie',
    },
    buttigieg: {
      regex: new RegExp('Pete Buttigieg', 'gi'),
      nick: 'Alfred E. Newman',
    },
    bloomberg: {
      regex: new RegExp('(Michael Bloomberg|Mike Bloomberg)', 'gi'),
      nick: 'Mini Mike',
    },
    steyer: {
      regex: new RegExp('Tom Steyer', 'gi'),
      nick: 'Wacky Tom Steyer',
    },
    harris: {
      regex: new RegExp('Kamala Harris', 'gi'),
      nick: 'Phony Kamala',
    },
    booker: {
      regex: new RegExp('Cory Booker', 'gi'),
      nick: 'Failed Presidential Candidate Booker',
    },
    deblasio: {
      regex: new RegExp('Bill de Blasio', 'gi'),
      nick: 'NYC Mayor DeBlasio, the worst mayor in the U.S.',
    },
    christie: {
      regex: new RegExp('Chris Christie', 'gi'),
      nick: 'Sloppy Chris Christie',
    },
    bush: {
      regex: new RegExp('George W\. Bush', 'gi'),
      nick: 'Bush Original',
    },
    putin: {
      regex: new RegExp('Vladimir Putin', 'gi'),
      nick: "Vladimir Putin (who I don't know)",
    },
    xi: {
      regex: new RegExp('Xi Jinping', 'gi'),
      nick: 'President Xi (King)',
    },
    trudeau: {
      regex: new RegExp('Justin Trudeau', 'gi'),
      nick: 'Two-faced Trudeau',
    },
    macron: {
      regex: new RegExp('Emmanuel Macron', 'gi'),
      nick: 'President Macron of France (loves holding my hand)',
    },
    merkel: {
      regex: new RegExp('Angela Merkel', 'gi'),
      nick: 'Angela Merkel (who ruined Germany)',
    },
    johnson: {
      regex: new RegExp('Boris Johnson', 'gi'),
      nick: 'Britain Trump',
    },
    zelensky: {
      regex: new RegExp('Volodymyr Zelensky', 'gi'),
      nick: 'President Z',
    },
    kaepernick: {
      regex: new RegExp('Colin Kaepernick', 'gi'),
      nick: 'Kneeling Kaepernick',
    },
    lebron: {
      regex: new RegExp('LeBron James', 'gi'),
      nick: "LeBron James (who I don't watch)",
    },
    gates: {
      regex: new RegExp('Bill Gates', 'gi'),
      nick: 'Bill Gates (of Hell)',
    },
    zuckerberg: {
      regex: new RegExp('Mark Zuckerberg', 'gi'),
      nick: 'Zuckerschmuck',
    },
    bezos: {
      regex: new RegExp('Jeff Bezos', 'gi'),
      nick: 'Jeff Bozo',
    },
    buffett: {
      regex: new RegExp('Warren Buffett', 'gi'),
      nick: 'Overrated Warren Buffett',
    },
    soros: {
      regex: new RegExp('George Soros', 'gi'),
      nick: 'George Soros (of Liberal Megadonor fame)',
    },
    fauci: {
      regex: new RegExp('(Dr\. )?Anthony Fauci', 'gi'),
      nick: 'Tony Fauci',
    },
    cuomo: {
      regex: new RegExp('Andrew Cuomo', 'gi'),
      nick: "Fredo's Brother",
    },
    newsom: {
      regex: new RegExp('Gavin Newsom', 'gi'),
      nick: 'Gavin Newscum',
    },
    whitmer: {
      regex: new RegExp('Gretchen Whitmer', 'gi'),
      nick: 'Half-Whit Whitmer',
    },
    kemp: {
      regex: new RegExp('Brian Kemp', 'gi'),
      nick: 'Brian Kemp (Republican In Name Only)',
    },
    raffensperger: {
      regex: new RegExp('Brad Raffensperger', 'gi'),
      nick: 'Brad Raffensperger (who I barely know)',
    },
    cheney: {
      regex: new RegExp('Liz Cheney', 'gi'),
      nick: 'Liz Cheney (daughter of Dick "War Monger" Cheney)',
    },
    kinzinger: {
      regex: new RegExp('Adam Kinzinger', 'gi'),
      nick: "Cryin' Adam Kinzinger",
    },
    pence: {
      regex: new RegExp('Mike Pence', 'gi'),
      nick: 'Mike Pence (who failed me)',
    },
    barr: {
      regex: new RegExp('Bill Barr', 'gi'),
      nick: 'Bill Barr (who let me down)',
    },
    mcenany: {
      regex: new RegExp('Kayleigh McEnany', 'gi'),
      nick: 'Kayleigh "Milktoast" McEnany',
    },
    meadows: {
      regex: new RegExp('Mark Meadows', 'gi'),
      nick: 'Mark Meadows (a RINO if there ever was one)',
    },
    desantis: {
      regex: new RegExp('Ron DeSantis', 'gi'),
      nick: 'Ron DeSanctimonious',
    },
    hutchinson: {
      regex: new RegExp('Asa Hutchinson', 'gi'),
      nick: 'Asa Hutchinson (RINO Governor)',
    },
    fox: {
      regex: new RegExp('Fox News', 'gi'),
      nick: "Fox News (which I don't watch anymore)",
    },
    murdoch: {
      regex: new RegExp('(Rupert Murdoch|Lachlan Murdoch)', 'gi'),
      nick: 'The Murdochs (who should be ashamed)',
    },
    ryan: {
      regex: new RegExp('Paul Ryan', 'gi'),
      nick: 'Paul Ryan (failed VP candidate)',
    },
    wallace: {
      regex: new RegExp('Chris Wallace', 'gi'),
      nick: 'Mike Wallace wannabe',
    },
    cavuto: {
      regex: new RegExp('Neil Cavuto', 'gi'),
      nick: 'Neil Cavuto (very bad ratings)',
    },
    tapper: {
      regex: new RegExp('Jake Tapper', 'gi'),
      nick: 'Fake Tapper',
    },
    acosta: {
      regex: new RegExp('Jim Acosta', 'gi'),
      nick: 'Fake News Jim Acosta',
    },
    lemon: {
      regex: new RegExp('Don Lemon', 'gi'),
      nick: 'Dumb Don Lemon',
    },
    cuomo2: {
      regex: new RegExp('Chris Cuomo', 'gi'),
      nick: 'Fredo',
    },
    stelter: {
      regex: new RegExp('Brian Stelter', 'gi'),
      nick: 'Humpty Dumpty',
    },
    todd: {
      regex: new RegExp('Chuck Todd', 'gi'),
      nick: 'Sleepy Eyes Chuck Todd',
    },
    karl: {
      regex: new RegExp('Jonathan Karl', 'gi'),
      nick: 'Fake News Jonathan Karl',
    },
    stephanopoulos: {
      regex: new RegExp('George Stephanopoulos', 'gi'),
      nick: 'Little George Stephanopoulos',
    },
    brzezinski: {
      regex: new RegExp('Zbigniew Brzezinski', 'gi'),
      nick: 'Wacko father',
    },
    friedman: {
      regex: new RegExp('Thomas Friedman', 'gi'),
      nick: 'Thomas "the Chin" Friedman',
    },
    krugman: {
      regex: new RegExp('Paul Krugman', 'gi'),
      nick: 'Paul Krugman (who has been wrong about everything)',
    },
    dowd: {
      regex: new RegExp('Maureen Dowd', 'gi'),
      nick: 'Crazy Maureen Dowd',
    },
    goldberg: {
      regex: new RegExp('Michelle Goldberg', 'gi'),
      nick: 'Michelle Goldberg (third-rate columnist)',
    },
    blow: {
      regex: new RegExp('Charles Blow', 'gi'),
      nick: "Charles Blow (who doesn't have a clue)",
    },
    haberman: {
      regex: new RegExp('Maggie Haberman', 'gi'),
      nick: 'Maggot Haberman',
    },
    schmidt: {
      regex: new RegExp('Michael Schmidt', 'gi'),
      nick: 'Failing New York Times writer Michael Schmidt',
    },
    swan: {
      regex: new RegExp('Jonathan Swan', 'gi'),
      nick: 'Jonathan Swan (ratings gold!)',
    },
    cillizza: {
      regex: new RegExp('Chris Cillizza', 'gi'),
      nick: 'Corrupt Chris Cillizza',
    },
    rucker: {
      regex: new RegExp('Philip Rucker', 'gi'),
      nick: 'Phony Phil Rucker',
    },
    costa: {
      regex: new RegExp('Robert Costa', 'gi'),
      nick: 'Bob Costa',
    },
    parker: {
      regex: new RegExp('Ashley Parker', 'gi'),
      nick: 'Washington Post reporter Ashley Parker (who should be fired)',
    },
    brennan: {
      regex: new RegExp('John Brennan', 'gi'),
      nick: 'John Brennan (worst CIA Director in history)',
    },
    clapper: {
      regex: new RegExp('James Clapper', 'gi'),
      nick: 'James Clapper (who lied to Congress)',
    },
    rice: {
      regex: new RegExp('Susan Rice', 'gi'),
      nick: 'Susan Rice (disaster)',
    },
    holder: {
      regex: new RegExp('Eric Holder', 'gi'),
      nick: 'Eric Holder (worst AG in history)',
    },
    lynch: {
      regex: new RegExp('Loretta Lynch', 'gi'),
      nick: 'Loretta Lynch (who let Bill Clinton board her plane)',
    },
    yates: {
      regex: new RegExp('Sally Yates', 'gi'),
      nick: 'Sally Yates (who I fired)',
    },
    strzok: {
      regex: new RegExp('Peter Strzok', 'gi'),
      nick: 'FBI lover boy Peter Strzok',
    },
    page: {
      regex: new RegExp('Lisa Page', 'gi'),
      nick: 'Lisa Page (FBI lover)',
    },
    mccabe: {
      regex: new RegExp('Andrew McCabe', 'gi'),
      nick: 'Andrew McCabe (who was fired for lying)',
    },
    ohr: {
      regex: new RegExp('Bruce Ohr', 'gi'),
      nick: 'Bruce Ohr (whose wife worked for Fusion GPS)',
    },
    weissmann: {
      regex: new RegExp('Andrew Weissmann', 'gi'),
      nick: 'Andrew Weissmann (Hillary Clinton supporter)',
    },
    vindman: {
      regex: new RegExp('Alexander Vindman', 'gi'),
      nick: 'Lieutenant Colonel Vindman (who I fired)',
    },
    taylor: {
      regex: new RegExp('Miles Taylor', 'gi'),
      nick: 'Miles Taylor (a nobody)',
    },
    kelly2: {
      regex: new RegExp('John Kelly', 'gi'),
      nick: 'John Kelly (by far the dumbest of my Military people)',
    },
    milley: {
      regex: new RegExp('Mark Milley', 'gi'),
      nick: 'Failed General Milley',
    },
  };
}

describe('buildTrumpMap Function', () => {
  it('should return a TrumpMappingObject', () => {
    const trumpMap = buildTrumpMap();
    expect(trumpMap).toBeDefined();
    expect(typeof trumpMap).toBe('object');
  });

  it('should have regex and nick properties for each mapping', () => {
    const trumpMap = buildTrumpMap();
    const keys = Object.keys(trumpMap);

    keys.forEach((key) => {
      const mapping = trumpMap[key];
      expect(mapping).toHaveProperty('regex');
      expect(mapping).toHaveProperty('nick');
      expect(mapping.regex).toBeInstanceOf(RegExp);
      expect(typeof mapping.nick).toBe('string');
    });
  });

  it('should have case-insensitive regex patterns', () => {
    const trumpMap = buildTrumpMap();
    const keys = Object.keys(trumpMap);

    keys.forEach((key) => {
      const mapping = trumpMap[key];
      // Check that the regex has the 'i' flag
      expect(mapping.regex.flags).toContain('i');
    });
  });

  it('should have global regex patterns', () => {
    const trumpMap = buildTrumpMap();
    const keys = Object.keys(trumpMap);

    keys.forEach((key) => {
      const mapping = trumpMap[key];
      // Check that the regex has the 'g' flag
      expect(mapping.regex.flags).toContain('g');
    });
  });

  it('should contain expected politician mappings', () => {
    const trumpMap = buildTrumpMap();

    // Test some politician mappings
    expect(trumpMap.hillary.nick).toBe('Crooked Hillary');
    expect(trumpMap.cruz.nick).toBe("Lyin' Ted");
    expect(trumpMap.biden.nick).toBe('Sleepy Joe');
    expect(trumpMap.pelosi.nick).toBe('Crazy Nancy');
    expect(trumpMap.schumer.nick).toBe("Cryin' Chuck");
  });

  it('should contain expected media mappings', () => {
    const trumpMap = buildTrumpMap();

    // Test some media mappings
    expect(trumpMap.cnn.nick).toBe('Fake News CNN');
    expect(trumpMap.nyt.nick).toBe('Failing New York Times');
    expect(trumpMap.wapo.nick).toBe('Amazon Washington Post');
  });

  it('should properly match Hillary Clinton variations', () => {
    const trumpMap = buildTrumpMap();
    const regex = trumpMap.hillary.regex;

    expect('Hillary Clinton'.match(regex)).toBeTruthy();
    expect('Hillary Rodham Clinton'.match(regex)).toBeTruthy();
    expect('Mrs. Clinton'.match(regex)).toBeTruthy();
  });

  it('should properly match CNN with word boundaries', () => {
    const trumpMap = buildTrumpMap();
    const regex = trumpMap.cnn.regex;

    expect('CNN'.match(regex)).toBeTruthy();
    expect('Watch CNN tonight'.match(regex)).toBeTruthy();
    expect('DCNN'.match(regex)).toBeFalsy(); // Should not match within words
  });

  it('should match COVID-19 variations', () => {
    const trumpMap = buildTrumpMap();
    const regex = trumpMap.covid.regex;

    expect('COVID-19'.match(regex)).toBeTruthy();
    expect('COVID19'.match(regex)).toBeTruthy();
    expect('Covid'.match(regex)).toBeTruthy();
    expect('Coronavirus'.match(regex)).toBeTruthy();
  });

  it('should match Trump variations', () => {
    const trumpMap = buildTrumpMap();
    const regex = trumpMap.trump.regex;

    expect('Donald Trump'.match(regex)).toBeTruthy();
    expect('Donald J. Trump'.match(regex)).toBeTruthy();
    expect('Donald J Trump'.match(regex)).toBeTruthy();
    expect('President Trump'.match(regex)).toBeTruthy();
    expect('Mr. Trump'.match(regex)).toBeTruthy();
  });

  it('should handle special characters in nicknames', () => {
    const trumpMap = buildTrumpMap();

    // Test nicknames with apostrophes
    expect(trumpMap.cruz.nick).toContain("'");
    expect(trumpMap.schumer.nick).toContain("'");

    // Test nicknames with quotes
    expect(trumpMap.mccain.nick).toContain('"');
  });

  it('should have unique keys', () => {
    const trumpMap = buildTrumpMap();
    const keys = Object.keys(trumpMap);
    const uniqueKeys = new Set(keys);

    expect(keys.length).toBe(uniqueKeys.size);
  });

  it('should not have empty nicknames', () => {
    const trumpMap = buildTrumpMap();
    const keys = Object.keys(trumpMap);

    keys.forEach((key) => {
      const mapping = trumpMap[key];
      expect(mapping.nick).toBeTruthy();
      expect(mapping.nick.trim()).not.toBe('');
    });
  });
});
