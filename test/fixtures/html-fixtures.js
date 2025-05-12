/**
 * HTML fixtures for testing Trump Goggles
 *
 * This module provides HTML templates and fixtures for various test scenarios
 */

/**
 * Simple HTML with Trump references for basic testing
 */
export const SIMPLE_HTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Trump Goggles Test Page</title>
</head>
<body>
  <h1>Donald Trump Test Page</h1>
  <p>This page mentions Trump multiple times to test the extension.</p>
  <p>President Trump stated that this would be the best policy ever created.</p>
</body>
</html>
`;

/**
 * Complex HTML with various structures and content types
 */
export const COMPLEX_HTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Trump Goggles Complex Test Page</title>
  <style>
    .editable {
      border: 1px solid #ccc;
      padding: 10px;
      min-height: 100px;
    }
  </style>
</head>
<body>
  <header>
    <h1>Donald Trump News and Information</h1>
    <nav>
      <ul>
        <li><a href="#">Trump Politics</a></li>
        <li><a href="#">Trump Business</a></li>
        <li><a href="#">Trump Family</a></li>
      </ul>
    </nav>
  </header>
  
  <main>
    <article>
      <h2>President Trump Announces New Policy</h2>
      <p>WASHINGTON — In a news conference yesterday, Donald Trump unveiled a new policy initiative aimed at economic growth. Trump stated that this initiative would be "the best policy ever created."</p>
      <p>Critics argue that Trump's plan lacks concrete details. Senator Johnson said, "President Trump has once again failed to provide specifics."</p>
      <p>Later, Trump responded on Twitter, calling his critics "fake news." The White House spokesperson said that Trump will address these concerns in the coming days.</p>
      
      <h3>Related Trump News:</h3>
      <ul>
        <li>Trump International Hotel opened a new location</li>
        <li>The Trump administration announced new regulations</li>
        <li>Trump Tower is located in Manhattan</li>
      </ul>
    </article>
    
    <section>
      <h2>User Comments</h2>
      <div class="comment">
        <p>I think Donald Trump is doing a great job!</p>
        <p>- TrumpSupporter123</p>
      </div>
      <div class="comment">
        <p>Trump's policies need more scrutiny.</p>
        <p>- PolicyAnalyst</p>
      </div>
    </section>
    
    <section>
      <h2>Interactive Elements (should not be processed)</h2>
      <form>
        <label for="name">Name:</label>
        <input type="text" id="name" value="Donald Trump">
        
        <label for="comment">Comment:</label>
        <textarea id="comment">This is a comment about Trump that should not be modified.</textarea>
        
        <button type="submit">Submit</button>
      </form>
      
      <div class="editable" contenteditable="true">
        This is an editable div that mentions Donald Trump. The extension should not modify this text.
      </div>
    </section>
  </main>
  
  <footer>
    <p>Trump Goggles Test Page - &copy; 2025</p>
  </footer>
</body>
</html>
`;

/**
 * HTML with nested and complex DOM structure
 */
export const NESTED_HTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Trump Goggles Nested DOM Test</title>
</head>
<body>
  <div id="level-1">
    <p>Level 1 paragraph mentioning Donald Trump.</p>
    <div id="level-2">
      <p>Level 2 paragraph mentioning Trump.</p>
      <div id="level-3">
        <p>Level 3 paragraph mentioning President Trump.</p>
        <div id="level-4">
          <p>Level 4 paragraph with no mentions.</p>
          <div id="level-5">
            <p>Level 5 paragraph mentioning Trump Tower.</p>
            <ul>
              <li>Item 1 about Trump</li>
              <li>Item 2 about Donald Trump</li>
              <li>Item 3 with no mentions</li>
              <li>
                <span>
                  Span text about Trump. 
                  <a href="#">Link about Trump</a>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;

/**
 * HTML with dynamic loading simulation
 */
export const DYNAMIC_HTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Trump Goggles Dynamic Content Test</title>
  <script>
    // Simulated dynamic content loading
    function loadMoreContent() {
      const container = document.getElementById('dynamic-container');
      const newContent = document.createElement('div');
      newContent.innerHTML = '<p>This is dynamically loaded content mentioning Donald Trump.</p>';
      container.appendChild(newContent);
    }
    
    // Simulated content update
    function updateContent() {
      const updateTarget = document.getElementById('update-target');
      updateTarget.textContent = 'This text was updated to mention Trump.';
    }
  </script>
</head>
<body>
  <h1>Dynamic Content Test</h1>
  
  <div id="initial-content">
    <p>This is initial content with no mentions.</p>
  </div>
  
  <div id="dynamic-container">
    <!-- Dynamic content will be loaded here -->
  </div>
  
  <p id="update-target">This text will be updated.</p>
  
  <button onclick="loadMoreContent()">Load More Content</button>
  <button onclick="updateContent()">Update Content</button>
</body>
</html>
`;

/**
 * HTML with mixed content from various news sources
 */
export const NEWS_HTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Trump Goggles News Content Test</title>
</head>
<body>
  <h1>News Articles Mentioning Trump</h1>
  
  <article class="cnn">
    <h2>CNN: Trump Announces New Policy</h2>
    <p>CNN reports that Donald Trump unveiled a new policy initiative yesterday. According to CNN sources, Trump described it as "revolutionary."</p>
  </article>
  
  <article class="nyt">
    <h2>New York Times: Analysis of Trump's Speech</h2>
    <p>The New York Times analyzed President Trump's recent speech, noting several factual inaccuracies. Trump supporters have criticized the New York Times for bias.</p>
  </article>
  
  <article class="wapo">
    <h2>Washington Post: Trump Administration Faces Challenges</h2>
    <p>According to the Washington Post, the Trump administration is facing new challenges. Sources told the Washington Post that Trump is frustrated with the situation.</p>
  </article>
  
  <article class="fox">
    <h2>Fox News: Trump's Economic Impact</h2>
    <p>Fox News reports that Donald Trump's policies have positively impacted the economy. Critics of Trump disagree with this assessment.</p>
  </article>
</body>
</html>
`;

/**
 * HTML with text that might cause regex problems
 */
export const EDGE_CASE_HTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Trump Goggles Edge Case Test</title>
</head>
<body>
  <h1>Edge Cases for Text Replacement</h1>
  
  <div class="edge-case">
    <h2>Partial Word Matches</h2>
    <p>Words like trumpeter or triumphant should not be replaced.</p>
  </div>
  
  <div class="edge-case">
    <h2>Name with HTML Entities</h2>
    <p>Donald&nbsp;Trump and Trump&apos;s policies should be replaced.</p>
  </div>
  
  <div class="edge-case">
    <h2>HTML Inside Text</h2>
    <p>President <span>Donald</span> <strong>Trump</strong> gave a speech.</p>
  </div>
  
  <div class="edge-case">
    <h2>Case Variations</h2>
    <p>DONALD TRUMP, donald trump, Donald Trump, and DoNaLd TrUmP should all be replaced.</p>
  </div>
  
  <div class="edge-case">
    <h2>Special Characters</h2>
    <p>Trump's (with apostrophe) and "Trump" (with quotes) should be replaced.</p>
  </div>
  
  <div class="edge-case">
    <h2>Long Text</h2>
    <p>This is a very long paragraph that mentions Donald Trump multiple times. The purpose is to test how the extension handles long text with multiple occurrences of Trump and Donald Trump. It also tests how it handles Trump being mentioned near the beginning, middle, and end of a paragraph. According to sources, Trump has expressed concern about these types of tests. Critics of Trump argue that testing is important. Finally, at the end, we mention Trump one more time.</p>
  </div>
  
  <div class="edge-case">
    <h2>Multiple Media Outlets</h2>
    <p>CNN, NBC, ABC, and New York Times all reported on Trump's speech.</p>
  </div>
</body>
</html>
`;

/**
 * Get an HTML fixture by name
 *
 * @param {string} name - Name of the fixture
 * @returns {string} HTML content
 */
export function getFixture(name) {
  const fixtures = {
    simple: SIMPLE_HTML,
    complex: COMPLEX_HTML,
    nested: NESTED_HTML,
    dynamic: DYNAMIC_HTML,
    news: NEWS_HTML,
    edgeCases: EDGE_CASE_HTML,
  };

  return fixtures[name] || SIMPLE_HTML;
}
