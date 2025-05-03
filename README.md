# Trump Goggles
See the world like Trump does.

## Usage
Download the extension for Google Chrome [here]. Trump Goggles uses basic regular expressions to replace certain words and phrases with their Trump equivalents, like:
  * "ISIS" becomes "Evil Losers"
  * "New York Times" becomes "FAKE NEWS"
  * "Hillary Clinton" becomes "Crooked Hillary"
  * And more!

[here]: https://chrome.google.com/webstore/detail/trump-goggles/jffbimfdmgbfannficjejaffmnggoigd

## Development

### Prerequisites
- Node.js (v18.18.0 or higher)
- pnpm (v7.0.0 or higher)

### Setup
```bash
# Install dependencies
pnpm install
```

### Commands
```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run linting
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code with Prettier
pnpm format
```

### Pre-commit Hooks
This project uses [husky](https://github.com/typicode/husky) and [lint-staged](https://github.com/okonet/lint-staged) to run linting, formatting, and tests on staged files before commit.

## License
[MIT](https://opensource.org/licenses/MIT)
