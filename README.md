# Trump Goggles

<p align="center">
  <img src="images/goggles-01.png" alt="Trump Goggles Logo" width="128" height="128">
</p>

<p align="center">
  <strong>See the world like Trump does.</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#examples">Examples</a> •
  <a href="#development">Development</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

Trump Goggles is a browser extension that automatically replaces references to Donald Trump and related terms with their Trumpian equivalents across the web. Experience the internet through Trump's unique perspective!

## Features

- **Automatic Replacements**: Replaces mentions of Donald Trump, politicians, media outlets, and more with Trump's nicknames
- **Original Text Tooltips**: Hover over or focus on converted text to see the original text in a tooltip
- **Dynamic Content Support**: Works with dynamically loaded content using MutationObserver
- **Cross-browser Compatibility**: Supports Chrome, Firefox, and Edge
- **Performance Optimized**: Efficient processing with minimal impact on page loading and browsing
- **Accessibility Support**: Keyboard navigation, ARIA attributes, and screen reader compatibility
- **No Configuration Needed**: Works out of the box without any setup

## Installation

### Chrome Web Store

Download the extension for Google Chrome [here](https://chrome.google.com/webstore/detail/trump-goggles/jffbimfdmgbfannficjejaffmnggoigd).

### Firefox Add-ons (Coming Soon)

Firefox Add-ons store link will be added soon.

### Manual Installation (Development)

See the [Development](#development) section below for instructions on installing the development version.

## Examples

Trump Goggles transforms your browsing experience with replacements like:

| Original         | Replacement         |
| ---------------- | ------------------- |
| Donald Trump     | Agent Orange        |
| Trump            | The Orange One      |
| ISIS             | Evil Losers         |
| Hillary Clinton  | Crooked Hillary     |
| New York Times   | FAKE NEWS           |
| CNN              | Very Fake News      |
| Covid-19         | China Virus         |
| Coronavirus      | The Invisible Enemy |
| _and many more!_ |                     |

## How It Works

When you visit a webpage, Trump Goggles scans the text content for certain keywords and phrases, replacing them with alternative versions that reflect Trump's colorful vocabulary. The extension:

1. Processes the initial page content
2. Watches for dynamically added content
3. Performs replacements while preserving the page's functionality
4. Skips inputs, textareas, and other editable elements
5. Wraps converted text in interactive elements that show tooltips with the original text
6. Provides keyboard navigation for accessing original text (using Tab and Escape keys)

For more details on the extension's behavior, see [docs/behavior.md](docs/behavior.md).

## Development

### Prerequisites

- Node.js (v18.18.0 or higher)
- pnpm (v7.0.0 or higher)

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/trump-goggles.git
cd trump-goggles

# Install dependencies
pnpm install
```

### Loading the Extension

#### Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top-right corner
3. Click "Load unpacked" and select the project directory
4. The extension should now be installed and active

#### Firefox

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on..."
3. Select the `manifest.json` file in the project directory

### Development Commands

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run linting
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code with Prettier
pnpm format

# Check TypeScript types
pnpm typecheck
```

## Project Structure

The extension is built using a modular architecture:

- **Content Script**: Runs on web pages and modifies content
- **Background Script**: Handles extension lifecycle and browser events
- **Core Modules**:
  - **Text Processor**: Handles text replacement logic
  - **DOM Processor**: Traverses the DOM and finds text nodes
  - **Mutation Observer**: Watches for DOM changes
  - **Trump Mappings**: Defines replacement patterns
  - **Browser Adapter**: Provides cross-browser compatibility
  - **Error Handler**: Ensures reliability
  - **Logger**: Provides diagnostic information

For more details, see [docs/architecture.md](docs/architecture.md).

## Testing

The project uses Vitest for unit and integration testing, and Playwright for end-to-end (E2E) testing:

```bash
# Run all unit and integration tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run E2E tests (requires browser extension to be built)
pnpm test:e2e

# Run E2E tests with UI mode (for interactive debugging)
pnpm test:e2e:ui

# Run E2E tests with debug mode
pnpm test:e2e:debug

# View the E2E test report
pnpm test:e2e:report
```

### E2E Testing

E2E tests verify the tooltip feature of the extension in a real browser environment:

- Tests verify tooltip appearance on hover
- Tests verify keyboard navigation and accessibility
- Tests verify tooltip content matches original text
- Tests verify tooltip behavior with dynamic content

The E2E tests require the extension to be loaded in a headful browser and cannot run in headless mode due to browser extension limitations.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines on how to contribute to this project.

## Roadmap

Upcoming features and improvements:

- Option page for customizing replacements
- User-defined replacements
- Support for additional languages
- Performance optimizations for very large pages

## License

[MIT](https://opensource.org/licenses/MIT)

## Disclaimer

This extension is intended for entertainment purposes only. It doesn't reflect the political views of the developers.
