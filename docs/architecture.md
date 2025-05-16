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
│     DOM Modifier    │────▶│   Text Processor    │────▶│   Trump Mappings    │
│                     │     │                     │     │                     │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
   Traverses the DOM         Handles text               Provides replacement
   and wraps text segments   replacement logic          patterns and nicknames

┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│                     │     │                     │     │                     │
│  Tooltip Manager    │────▶│    Tooltip UI       │────▶│  Tooltip Browser    │
│                     │     │                     │     │      Adapter         │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
 Manages tooltip events      Handles tooltip UI         Provides cross-browser
 and user interactions       creation and positioning   compatibility for tooltips

┌─────────────────────┐
│                     │
│      Logger         │
│                     │
└─────────────────────┘
 Provides logging and  
 diagnostics           

┌─────────────────────┐
│                     │
│  Mutation Observer  │
│                     │
└─────────────────────┘
 Watches for DOM changes
 and processes new content
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

#### DOM Modifier

- Traverses the DOM efficiently
- Identifies text nodes for processing
- Wraps converted text segments in spans with appropriate attributes
- Sets data-original-text attributes for tooltips
- Makes text focusable (tabindex=0) for accessibility

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

#### TooltipManager

- Initializes tooltip functionality
- Manages event delegation for mouseover/mouseout and focus/blur events
- Shows and hides tooltips based on user interactions
- Implements keyboard accessibility (Escape key dismissal)
- Manages ARIA attributes for accessibility

#### TooltipUI

- Creates and manages the tooltip DOM element
- Handles tooltip positioning and collision detection
- Manages tooltip text content with XSS protection
- Provides smooth transitions for tooltip appearance
- Controls tooltip visibility and ARIA attributes

#### TooltipBrowserAdapter

- Provides cross-browser compatibility for tooltip functionality
- Detects browser-specific features and capabilities
- Applies appropriate browser-specific styles and workarounds
- Handles browser differences in event handling
- Ensures consistent tooltip appearance and behavior across browsers

## Data Flow

1. **Initialization**:

   - Content script loads when a page is visited
   - Core modules are initialized
   - DOM Modifier, TooltipManager, TooltipUI, and MutationObserver are set up

2. **Initial Processing**:

   - DOM content is traversed
   - TextProcessor identifies segments to convert
   - DOM Modifier wraps converted segments in spans
   - TooltipManager sets up event listeners for tooltips

3. **Ongoing Processing**:
   - MutationObserver watches for DOM changes
   - New content is processed as it appears
   - Text replacements and DOM modifications apply to new content

4. **Tooltip Interaction Flow**:
   - User hovers over or focuses on converted text
   - TooltipManager detects interaction and retrieves original text
   - TooltipUI updates tooltip content and position
   - TooltipBrowserAdapter applies browser-specific optimizations
   - Tooltip becomes visible with original text
   - When user moves away, tooltip is hidden
   - Browser-specific events (like page visibility changes) are properly handled

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
- Tooltip browser adapter for consistent UI behavior
- Browser-specific style and event handling

## Conclusion

The Trump Goggles extension is built on a foundation of modular architecture with clear separation of concerns. Each module handles a specific aspect of the extension's functionality, making the codebase maintainable and extensible.

The design emphasizes performance, reliability, and cross-browser compatibility, ensuring a smooth user experience across different browsers and websites.
