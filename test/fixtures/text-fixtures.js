/**
 * Text fixtures for testing Trump Goggles
 *
 * This module provides text samples for testing text replacement functionality
 */

/**
 * Basic Trump references for simple testing
 */
export const SIMPLE_REFERENCES = [
  'Donald Trump',
  'Trump',
  'President Trump',
  "Trump's policy",
  'Donald J. Trump',
];

/**
 * Media outlet references for testing
 */
export const MEDIA_REFERENCES = [
  "CNN reported on Trump's speech",
  'According to CNN, the policy has mixed reception',
  'The New York Times published an analysis',
  'Sources told the Washington Post that negotiations were ongoing',
  'Fox News interviewed several supporters',
];

/**
 * Edge cases for text replacement
 */
export const EDGE_CASES = [
  // Words that contain "trump" but shouldn't be replaced
  'The trumpeter played a beautiful solo',
  'It was a triumphant return to form',
  'That outtrumps all previous records',

  // Special characters
  "Donald Trump's administration announced new guidelines",
  '"Trump" is how the document referred to him',
  'Trump, along with other officials, attended the meeting',

  // HTML entities in text content
  'Donald&nbsp;Trump gave a speech yesterday',
  'Trump&apos;s policy was criticized',
  'President&nbsp;Trump hosted foreign dignitaries',

  // Mixed case variations
  'DONALD TRUMP held a press conference',
  'donald trump spoke about the economy',
  'DoNaLd TrUmP made several claims',

  // Other formatting
  'D o n a l d  T r u m p was quoted in the article',
  'T.R.U.M.P was trending on Twitter',
  'D. Trump signed the document',
];

/**
 * Text with multiple Trump references in various contexts
 */
export const PARAGRAPH_WITH_MULTIPLE_REFERENCES = `
In a statement on Tuesday, Donald Trump announced a new economic plan. 
Critics of Trump argue that the plan lacks specific details. A spokesperson for 
Trump clarified that more information would be released soon. Meanwhile, Trump 
Tower reported record occupancy rates. CNN covered the announcement extensively, 
while the New York Times questioned Trump's economic assumptions.
`;

/**
 * Long text for performance testing
 */
export const LONG_TEXT = `
Donald Trump delivered a speech yesterday addressing economic concerns. The speech, 
which lasted nearly an hour, covered several topics. Trump emphasized the importance 
of job creation and economic growth. According to Trump, his administration would 
focus on reducing regulations.

Critics argue that Trump's economic plan lacks specific details. Senator Johnson 
said, "President Trump has once again failed to provide concrete proposals." 
The Trump administration responded by pointing to previous policy successes.

CNN reported that Trump's speech received mixed reviews from economists. The 
New York Times published an analysis questioning some of Trump's claims about 
economic indicators. Fox News highlighted positive reactions from business leaders.

In related news, Trump International Hotel announced the opening of a new location. 
The Trump Organization continues to expand its real estate portfolio. Critics have 
raised concerns about potential conflicts of interest involving Trump's business 
ventures.

Trump supporters gathered outside the venue where the speech was delivered. They 
carried signs endorsing Trump's economic policies. A small group of protesters 
also attended, criticizing Trump's approach to environmental regulations.

White House sources indicated that Trump plans to meet with economic advisors next 
week to finalize details of the proposal. The meeting will focus on specific policy 
initiatives that Trump wants to prioritize.

Meanwhile, the Washington Post published an investigative report examining the impact 
of Trump's previous economic policies. The report cited data from various sources, 
including government agencies and independent research organizations.

Trump's economic team issued a statement defending the administration's approach. 
They argued that Trump's policies have led to significant economic improvements, 
citing job growth and stock market performance.

In his conclusion, Trump promised that his administration would continue to prioritize 
economic growth. He stated that under his leadership, the economy would reach 
unprecedented levels of prosperity.
`;

/**
 * Text with URL and email patterns
 */
export const TEXT_WITH_URLS = `
For more information, visit https://www.trump.com or email info@trump.org.
Donald Trump's website (https://www.donaldjtrump.com) contains policy information.
CNN (https://www.cnn.com) covered Trump's recent announcement.
`;

/**
 * Texts for testing various nickname replacements
 */
export const NICKNAME_TEST_CASES = [
  // Politicians
  'Hillary Clinton announced her new book',
  'Ted Cruz debated policy issues',
  'Marco Rubio spoke at the conference',
  'Jeb Bush released a statement',
  'Elizabeth Warren criticized the proposal',

  // Media figures
  'Megyn Kelly interviewed several experts',
  'Joe Scarborough discussed the news',
  'Mika Brzezinski offered her perspective',
  'Chuck Todd moderated the panel',

  // Media organizations
  'CNN reported breaking news',
  'The New York Times published an investigation',
  'Washington Post sources revealed new information',
  'NBC News covered the story extensively',

  // Foreign leaders
  'Kim Jong-un attended the summit',
  'Bashar al-Assad denied the allegations',

  // COVID-related terms
  'COVID-19 cases continue to decline',
  'The Coronavirus pandemic affected global economies',
  'Scientists study SARS-CoV-2 transmission',

  // Misc
  'I enjoy drinking coffee in the morning',
];

/**
 * Generate a large text with many Trump references
 *
 * @param {number} count - Number of references to include
 * @returns {string} Text with many Trump references
 */
export function generateLargeText(count = 100) {
  const references = [
    'Donald Trump announced new policies',
    'Trump spoke at the conference',
    'President Trump signed the executive order',
    'According to Trump, the initiative will succeed',
    'Critics of Trump expressed concerns',
    "Trump's administration released a statement",
    "CNN reported on Trump's latest decision",
    "The New York Times analyzed Trump's speech",
  ];

  const result = [];
  for (let i = 0; i < count; i++) {
    // Use modulo to cycle through references
    const ref = references[i % references.length];
    result.push(`[${i + 1}] ${ref}`);
  }

  return result.join('\n');
}

/**
 * Get a text fixture by name
 *
 * @param {string} name - Name of the fixture
 * @returns {string|Array} Text content
 */
export function getTextFixture(name) {
  const fixtures = {
    simple: SIMPLE_REFERENCES,
    media: MEDIA_REFERENCES,
    edgeCases: EDGE_CASES,
    paragraph: PARAGRAPH_WITH_MULTIPLE_REFERENCES,
    long: LONG_TEXT,
    urls: TEXT_WITH_URLS,
    nicknames: NICKNAME_TEST_CASES,
    large: generateLargeText(100),
  };

  return fixtures[name] || SIMPLE_REFERENCES;
}
