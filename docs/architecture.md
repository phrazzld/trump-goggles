# Trump Goggles Architecture

## Overview

Trump Goggles is a browser extension that replaces references to Donald Trump and related terms with humorous nicknames throughout web pages. The extension is built with modern JavaScript and follows a modular architecture pattern.

This document provides a comprehensive overview of the extension's architecture, including module relationships, data flow, and key design decisions.

## Core Architecture

The extension is built around a modular architecture with clear separation of concerns:

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│                     │     │                     │     │                     │
│  Content Scripts    │────▶│  Core Modules       │────▶│  Background Script  │
│                     │     │                     │     │                     │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
      Injects into                 Performs                 Handles browser
       web pages               text replacement              interactions
```

### Module Structure

Each module is designed as a self-contained unit with a clear responsibility:

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│                     │     │                     │     │                     │
│   Browser Detect    │     │   Browser Adapter   │     │   Error Handler     │
│                     │     │                     │     │                     │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
      Identifies              Provides unified           Manages errors and
      browser type            browser API access         exception handling

┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│                     │     │                     │     │                     │
│     DOM Processor   │────▶│   Text Processor    │────▶│   Trump Mappings    │
│                     │     │                     │     │                     │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
   Traverses the DOM         Handles text               Provides replacement
   and finds text nodes      replacement logic          patterns and nicknames

┌─────────────────────┐     ┌─────────────────────┐
│                     │     │                     │
│  Mutation Observer  │     │      Logger         │
│                     │     │                     │
└─────────────────────┘     └─────────────────────┘
 Watches for DOM changes     Provides logging and
 and processes new content   diagnostics
```

## Module Responsibilities

### Background Script

- Handles browser extension lifecycle events
- Manages extension icon clicks
- Opens the options page when requested
- Initializes cross-browser compatibility

### Content Script

- Main entry point for DOM processing
- Coordinates the text replacement process
- Initializes and manages the mutation observer
- Ensures the extension only runs once per page

### Core Modules

#### Browser Detect

- Identifies the current browser (Chrome, Firefox, Edge)
- Detects manifest version (v2 or v3)
- Provides feature detection for browser capabilities

#### Browser Adapter

- Abstracts browser-specific APIs into a unified interface
- Handles differences between callback and promise-based APIs
- Provides methods for common browser extension operations

#### DOM Processor

- Traverses the DOM efficiently
- Identifies text nodes for processing
- Skips interactive elements and special content
- Processes DOM in chunks to avoid UI freezing

#### Text Processor

- Performs text replacements
- Implements performance optimizations (caching, pattern pre-compilation)
- Handles large text with incremental processing
- Uses early bailout to skip unnecessary processing

#### Mutation Observer

- Watches for DOM changes
- Processes new content as it's added to the page
- Manages observer lifecycle and prevents infinite loops
- Implements batched processing for better performance

#### Trump Mappings

- Defines regex patterns for Trump-related terms
- Provides replacement nicknames
- Exports mappings for use by the text processor

#### Error Handler

- Provides error boundaries for critical operations
- Captures and logs exceptions
- Prevents extension crashes

#### Logger

- Structured logging with severity levels
- Diagnostic information for debugging
- Performance monitoring

## Data Flow

1. **Initialization**:

   - Content script loads when a page is visited
   - Core modules are initialized
   - DOM processor and MutationObserver are set up

2. **Initial Processing**:

   - DOM processor traverses the page
   - Text nodes are identified and processed
   - Text replacements are applied

3. **Ongoing Processing**:
   - MutationObserver watches for DOM changes
   - New content is processed as it appears
   - Text replacements are applied to new content

## Design Decisions

### Module Pattern

The extension uses the module pattern (IIFE with exports) to create private scopes and prevent global namespace pollution. This approach:

- Keeps internal implementation details private
- Exposes only necessary public APIs
- Prevents conflicts with page scripts

### Performance Optimizations

Several optimizations ensure smooth operation on complex pages:

1. **Chunked Processing**:

   - Large DOM trees are processed in chunks
   - Processing is spread across multiple frames
   - Prevents UI freezing on complex pages

2. **Text Optimizations**:

   - Pattern pre-compilation for faster matching
   - Result caching to avoid reprocessing
   - Early bailout for unlikely matches

3. **Mutation Handling**:
   - Batched processing of mutations
   - Debouncing to prevent excessive processing
   - Throttling for high-frequency changes

### Cross-Browser Compatibility

The extension supports multiple browsers through:

- Browser detection module
- API abstraction layer
- Feature detection and fallbacks
- Manifest version handling

## Conclusion

The Trump Goggles extension is built on a foundation of modular architecture with clear separation of concerns. Each module handles a specific aspect of the extension's functionality, making the codebase maintainable and extensible.

The design emphasizes performance, reliability, and cross-browser compatibility, ensuring a smooth user experience across different browsers and websites.
