# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Trump Goggles is a browser extension that replaces references to Donald Trump and related terms with humorous nicknames throughout web pages. It's built with TypeScript and follows a modular architecture with strict type checking, comprehensive testing, and structured logging.

## Essential Commands

### Development

```bash
# Install dependencies (project enforces pnpm)
pnpm install

# Build for development with watch mode
pnpm build:watch

# Build for production
pnpm build:prod

# Type checking
pnpm typecheck

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run end-to-end tests (requires built extension)
pnpm test:e2e

# Linting and formatting
pnpm lint
pnpm lint:fix
pnpm format

# Verify all CI checks locally
./scripts/verify-ci.sh
# or
pnpm verify
```

### Build System

- Uses Rollup for bundling ES modules for browser extension compatibility
- TypeScript is compiled to ES2020 with strict type checking
- Development builds include source maps; production builds are minified
- Output goes to `dist/` directory

## Architecture Overview

The extension follows a **modular architecture** with clear separation of concerns:

### Core Architecture Pattern

- **Content Scripts**: Inject into web pages and coordinate text replacement
- **Background Scripts**: Handle browser extension lifecycle
- **Core Modules**: Self-contained units with specific responsibilities
- **Cross-browser Compatibility**: Browser detection and API abstraction

### Key Modules

- **Text Processor**: Handles text replacement logic with performance optimizations
- **DOM Modifier**: Traverses DOM, wraps converted text in interactive spans
- **Tooltip System**: Three-component architecture (Manager, UI, Browser Adapter) providing original text on hover/focus
- **Mutation Observer**: Watches for dynamic content changes
- **Trump Mappings**: Defines replacement patterns and nicknames with immutability guarantees
- **Logger**: Structured JSON logging system with correlation ID propagation
- **Browser Adapter**: Unified API across Chrome, Firefox, Edge

### Data Flow

1. Content script initializes core modules
2. DOM is traversed and text segments are identified
3. Text replacements are applied and DOM is modified
4. Tooltip system enables access to original text
5. Mutation observer handles dynamically added content

## Data Immutability Pattern

The project implements a **comprehensive immutability pattern** for core data structures to ensure data integrity and prevent accidental mutations:

### Trump Mappings Immutability

- **Deep Freeze Implementation**: All mapping objects are recursively frozen using `Object.freeze()`
- **Runtime Protection**: Attempts to modify frozen objects throw `TypeError` in strict mode
- **Compile-time Safety**: TypeScript `readonly` modifiers provide additional type-level protection
- **Performance Optimization**: Frozen objects are cached and reused across multiple calls
- **RegExp Preservation**: RegExp objects remain unfrozen to maintain functionality for text matching

### Immutability Benefits

- **Data Integrity**: Prevents accidental mutations that could break text replacement functionality
- **Predictable Behavior**: Ensures mappings remain consistent throughout the application lifecycle
- **Testing Reliability**: Eliminates test pollution from shared mutable state
- **Performance**: Cached frozen references avoid redundant object creation

## Development Philosophy Adherence

This project strictly follows the `DEVELOPMENT_PHILOSOPHY.md` and its TypeScript appendix:

### Type Safety

- TypeScript strict mode enabled with all strict checks
- `any` type is **FORBIDDEN** - use specific types, unions, or `unknown`
- All function parameters and return values must be explicitly typed
- No suppression of linter/type errors allowed

### Testing Strategy

- **NO MOCKING INTERNAL COLLABORATORS** - refactor code for testability instead
- Mock only external boundaries (console, filesystem, network, browser APIs)
- Focus on integration/workflow tests for high ROI
- Minimum 85% test coverage enforced in CI
- Uses Vitest with jsdom environment

### Code Quality

- ESLint with TypeScript support and strict rules
- Prettier for formatting (non-negotiable)
- Pre-commit hooks enforce quality (bypassing with --no-verify is forbidden)
- All code must pass: linting, type checking, tests, and formatting

## Browser Extension Specifics

### Manifest Structure

- Supports Chrome, Firefox, and Edge
- Cross-browser compatibility through browser detection and adapters
- Content scripts load in specific order for proper initialization

### Loading the Extension

Chrome: Load unpacked from project directory at `chrome://extensions/`
Firefox: Load temporary add-on using `manifest.json` at `about:debugging`

### Key Files

- `manifest.json`: Extension configuration
- `src/content/content-consolidated.js`: Main content script entry point
- `src/background/background-combined.js`: Background script
- `dist/`: Built extension files

## Current Development Context

The project is actively implementing **structured JSON logging** (see TODO.md for progress). Key aspects:

### Logging System

- Structured JSON output only (no console styling)
- Correlation ID propagation through all operations
- Context inheritance for component hierarchy
- Legacy adapter maintains backward compatibility
- Mandatory fields: timestamp, level, message, service_name, correlation_id, function_name

### Migration Status

- Foundation components (StructuredLogger, LoggerContext) are complete
- Currently working on legacy adapter implementation
- File-by-file migration from console.\* to structured logging in progress

## Testing Requirements

### Unit/Integration Tests

- Use Vitest with TypeScript
- Tests must be written in TypeScript
- Focus on behavior verification through public APIs
- Real implementations for internal collaborators

### E2E Tests

- Use Playwright
- Test tooltip functionality and accessibility
- Verify extension behavior in real browser environment
- Cannot run headless due to browser extension limitations

### Coverage

- Minimum 85% overall, 95% for core logic
- Coverage enforced in CI pipeline
- Tests fail CI if coverage drops

## Security Considerations

- Input sanitization for all logged data
- Secret detection and filtering in logs
- No hardcoded secrets (enforced by pre-commit hooks)
- XSS protection in tooltip content

## Performance Optimizations

- Chunked DOM processing to prevent UI freezing
- Text pattern pre-compilation and result caching
- Mutation batching and debouncing
- Early bailout for unlikely text matches

## Package Management

- **pnpm required** - enforced by preinstall script
- Lock file must be committed
- Dependencies kept updated with security scanning
- Node.js v18.18.0+ required
