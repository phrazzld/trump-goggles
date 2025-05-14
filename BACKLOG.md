# BACKLOG

- redesign and style up the popup -- or kill it, since it doesn't really do anything
- bigly

## High Priority

### Core User Features & Accessibility

- **[Feature]**: Implement hover tooltip showing original unconverted text
  - **Type**: Feature
  - **Complexity**: Medium
  - **Rationale**: Enhances user experience by providing context and transparency about the conversion process, allowing users to see the original text.
  - **Expected Outcome**: Users can hover over any converted text phrase, and a tooltip or similar overlay displays the original, unconverted text. The interaction is smooth and intuitive.
  - **Dependencies**: None

- **[Feature]**: Display converted text in a styled, visually distinct container
  - **Type**: Feature
  - **Complexity**: Simple
  - **Rationale**: Improves visual distinction of converted text, making the extension's effect clear and enhancing readability without being overly intrusive.
  - **Expected Outcome**: Converted text is wrapped in an HTML element (e.g., `<span>`) styled with a subtle but clear visual indicator (e.g., an orange box or underline as originally suggested), consistently applied.
  - **Dependencies**: None

- **[Enhancement] ID: [A11Y-01]**: Ensure Accessibility for All UI Features
  - **Type**: Enhancement
  - **Complexity**: Medium
  - **Rationale**: Critical for inclusivity, ensuring the extension's UI elements (hover text, styled converted text) are usable by people with disabilities, including those using keyboard navigation and screen readers. Aligns with WCAG standards.
  - **Expected Outcome**: All user-facing UI elements, especially the hover tooltip and styled text container, meet WCAG 2.1 AA guidelines. This includes keyboard accessibility, screen reader compatibility (ARIA attributes), and sufficient color contrast.
  - **Dependencies**: None (should be implemented alongside core features, not after)

### Architectural Foundation & Modernization

- **[Refactor] ID: [FUT-02C]**: Convert All JavaScript to TypeScript & Enforce Strict Typing
  - **Type**: Refactor
  - **Complexity**: Complex
  - **Rationale**: Enforces strict typing ("Leverage Types Diligently"), improves code quality, maintainability, and developer experience by catching errors at compile-time. Prevents use of `any` without justification.
  - **Expected Outcome**: All `.js` files converted to `.ts`. `tsconfig.json` configured for strict type checking (`strict: true`). `any` type usage is minimized and justified. Test files are included in TypeScript checks.
  - **Dependencies**: None (first step in modernization)

- **[Refactor] ID: [FUT-03C]**: Adopt Standard Module System (ES Modules) & Bundling
  - **Type**: Refactor
  - **Complexity**: Complex
  - **Rationale**: Aligns with "Modularity is Mandatory" philosophy. Eliminates hidden global dependencies, improves code organization, enables tree-shaking, and facilitates modern development workflows.
  - **Expected Outcome**: Entire codebase uses ES Modules (`import`/`export`). A module bundler (e.g., Webpack, Rollup) is implemented to produce optimized extension artifacts. Global function sharing is eliminated.
  - **Dependencies**: [FUT-02C] (TypeScript conversion with module syntax)

- **[Enhancement] ID: [FUT-04C]**: Refine and Centralize Type Definitions with Explicit Interfaces
  - **Type**: Enhancement
  - **Complexity**: Medium
  - **Rationale**: Improves code clarity, maintainability, and type safety by creating explicit contracts between modules and centralizing shared type definitions.
  - **Expected Outcome**: A dedicated `types.d.ts` file or `src/types` directory contains well-defined, explicit interfaces and types for all key data structures, function signatures, and module contracts.
  - **Dependencies**: [FUT-02C] (Basic TypeScript implementation)

- **[Refactor] ID: [ARCH-01]**: Modularize Content Script Architecture with Dependency Injection
  - **Type**: Refactor
  - **Complexity**: Complex
  - **Rationale**: Decouples components, makes dependencies explicit, improves testability, and removes reliance on global state/functions. Aligns with "Strict Separation of Concerns."
  - **Expected Outcome**: Content script logic is broken into smaller, focused, and testable modules. Dependencies are explicitly injected (e.g., via constructors or function arguments).
  - **Dependencies**: [FUT-03C] (ES Modules provide framework for modular structure)

- **[Enhancement] ID: [FUT-05C]**: Adopt `webextension-polyfill` for Cross-Browser API Unification
  - **Type**: Enhancement
  - **Complexity**: Medium
  - **Rationale**: Simplifies cross-browser development and maintenance by providing a consistent, Promise-based API. Replaces custom browser detection and adapter code.
  - **Expected Outcome**: `webextension-polyfill` is integrated and used for all browser API interactions, ensuring consistent behavior across major browsers (Chrome, Firefox, Edge).
  - **Dependencies**: [FUT-03C] (ES Modules facilitate dependency management)

### Testing & CI/CD Infrastructure

- **[Test] ID: [FUT-01C]**: Implement Comprehensive Unit Testing with Strict Mocking Policy
  - **Type**: Test
  - **Complexity**: Complex
  - **Rationale**: Ensures code correctness, prevents regressions, and enables safe refactoring. Strict mocking policy (mock only at true external boundaries) improves test quality and design.
  - **Expected Outcome**: A testing framework (e.g., Jest, Vitest) is integrated. Unit tests cover critical logic (e.g., `buildTrumpMap`, text processing modules) with high coverage (e.g., >80%). Integration tests cover core content script functionality. Test coverage thresholds enforced in CI.
  - **Dependencies**: None (can begin with existing code, evolving as architecture improves)

- **[Enhancement] ID: [DEV-01]**: Add Explicit TypeScript Checking to Pre-commit Hooks
  - **Type**: Enhancement
  - **Complexity**: Simple
  - **Rationale**: Provides faster feedback to developers and catches type errors before code is even pushed, improving robustness and reducing CI load.
  - **Expected Outcome**: Pre-commit hooks (e.g., Husky + lint-staged) are configured to run `tsc --noEmit` on staged files.
  - **Dependencies**: [FUT-02C] (TypeScript implementation)

- **[Infra] ID: [CI-02]**: Automate and Enforce Full CI Pipeline
  - **Type**: Infra
  - **Complexity**: Medium
  - **Rationale**: Ensures consistent code quality through automated checks (linting, type checking, tests, conventional commits) and acts as a quality gate, aligning with "Automate Everything."
  - **Expected Outcome**: A CI pipeline (e.g., GitHub Actions) is configured to run on every push/PR. Pipeline includes: linting, code formatting checks, TypeScript type checking (including test files), unit and integration tests with coverage reporting, and conventional commit message validation. Merges are blocked on CI failure.
  - **Dependencies**: [FUT-01C] (Tests to run), [FUT-02C] (TypeScript to check), [DEV-01] (for consistency with pre-commit hooks)

### Observability & Error Handling

- **[Enhancement] ID: [LOG-01]**: Implement Structured JSON Logging for All Operations
  - **Type**: Enhancement
  - **Complexity**: Medium
  - **Rationale**: Eliminates direct `console.*` usage for application logging, enabling better log analysis, filtering, and monitoring. Aligns with "Structured Logging is Mandatory."
  - **Expected Outcome**: A dedicated logging utility is implemented or integrated. All operational logs are emitted in JSON format, including standard context fields (timestamp, level, message, component, etc.).
  - **Dependencies**: None (can be implemented as a standalone utility)

- **[Enhancement] ID: [ERROR-01]**: Standardize Error Handling with Structured Logger
  - **Type**: Enhancement
  - **Complexity**: Medium
  - **Rationale**: Ensures consistent error handling patterns, improves debugging by logging errors with rich context, and provides a foundation for reliable error reporting.
  - **Expected Outcome**: Consistent error handling patterns (e.g., custom error classes, centralized error processing) are established. All caught errors are logged using the structured logger with relevant context and stack traces.
  - **Dependencies**: [LOG-01] (Structured logging implementation)

## Medium Priority

### Code Quality & Maintainability

- **[Refactor] ID: [DEV-03C]**: Enforce Immutability for Core Data Structures
  - **Type**: Refactor
  - **Complexity**: Medium
  - **Rationale**: Prevents accidental mutations in shared data (e.g., mapping objects), simplifies state management, and reduces side effects. Aligns with "Default to Immutability."
  - **Expected Outcome**: Core data structures, particularly the mapping objects, are made immutable using `Object.freeze()` and/or TypeScript `readonly` types. Immutable update patterns are adopted where necessary.
  - **Dependencies**: [FUT-02C] (TypeScript for readonly types)

- **[Refactor] ID: [REFACTOR-BG]**: Consolidate and Modularize Background Script Logic
  - **Type**: Refactor
  - **Complexity**: Medium
  - **Rationale**: Creates a cleaner, more modular, and maintainable background script architecture, eliminating redundancy and improving separation of concerns.
  - **Expected Outcome**: Background script logic is organized into distinct modules with clear responsibilities. Any redundant background script files are consolidated or removed.
  - **Dependencies**: [FUT-03C] (ES Modules structure)

### Documentation & Configuration

- **[Docs] ID: [DOCS-01]**: Update Documentation with Architectural Decisions and "Why" Rationales
  - **Type**: Docs
  - **Complexity**: Medium
  - **Rationale**: Documents key architectural choices, design patterns, and their reasoning, aiding onboarding for new contributors and providing context for future development. Aligns with "Document Decisions, Not Mechanics."
  - **Expected Outcome**: `README.md` and/or dedicated `ADR` (Architecture Decision Records) files document significant architectural decisions, trade-offs, and how they align with the development philosophy.
  - **Dependencies**: [FUT-03C], [ARCH-01] (Document after major architectural changes)

- **[Enhancement] ID: [CONFIG-01]**: Externalize Environment-Specific Configuration
  - **Type**: Enhancement
  - **Complexity**: Simple
  - **Rationale**: Separates configuration (e.g., feature flags, logging levels) from code, improving flexibility and maintainability across different environments (dev, test, prod).
  - **Expected Outcome**: Configuration values are loaded from external sources (e.g., build-time variables, environment files) rather than being hardcoded.
  - **Dependencies**: [FUT-03C] (Bundler facilitates configuration management)

## Low Priority

### Security & Dependency Management

- **[Security] ID: [SEC-01]**: Add Dependency Vulnerability Scanning to CI Pipeline
  - **Type**: Security
  - **Complexity**: Simple
  - **Rationale**: Automatically detects known security vulnerabilities in third-party dependencies, enabling proactive mitigation.
  - **Expected Outcome**: Automated dependency vulnerability scanning (e.g., `npm audit --audit-level=high`, Snyk) is integrated into the CI pipeline. Builds fail or warn on critical/high severity vulnerabilities.
  - **Dependencies**: [CI-02] (CI pipeline implementation)

- **[Process] ID: [MAINT-01C]**: Automate Dependency Review Reminders
  - **Type**: Process
  - **Complexity**: Simple
  - **Rationale**: Establishes a process for regular review and updating of dependencies to maintain security and benefit from improvements.
  - **Expected Outcome**: A scheduled mechanism (e.g., GitHub Actions cron job, Dependabot/RenovateBot configuration) prompts for regular dependency review and updates.
  - **Dependencies**: None

### Code Cleanup & Housekeeping

- **[Chore] ID: [CLEANUP-01]**: Remove Deprecated Code and Legacy Warning Mechanisms
  - **Type**: Chore
  - **Complexity**: Simple
  - **Rationale**: Improves codebase maintainability by removing dead, obsolete, or superseded code (e.g., legacy `window.buildTrumpMap` function, custom console warning shims).
  - **Expected Outcome**: Deprecated code and associated warning mechanisms are removed. Codebase relies on new standard mechanisms (e.g., structured logging).
  - **Dependencies**: [LOG-01] (For replacement logging functionality)

- **[Chore] ID: [DEV-05C]**: Enforce Newlines at End of All Text Files
  - **Type**: Chore
  - **Complexity**: Simple
  - **Rationale**: Ensures consistent file formatting across the project, preventing trivial diffs and satisfying some linter/tool requirements.
  - **Expected Outcome**: Linters and/or formatters (e.g., Prettier, EditorConfig) are configured to enforce newlines at the end of all relevant text files. All existing files are updated.
  - **Dependencies**: None (can be implemented independently)

- **[Chore] ID: [DEV-06C]**: Update CODEOWNERS with Actual GitHub Handles
  - **Type**: Chore
  - **Complexity**: Simple
  - **Rationale**: Ensures PRs are routed to appropriate reviewers and defines clear ownership areas within the codebase.
  - **Expected Outcome**: The `CODEOWNERS` file is updated with actual GitHub team/user handles, reflecting current project responsibilities.
  - **Dependencies**: None

## Future Considerations

This section includes items that are valuable for long-term vision, innovation, or depend on significant prior work.

- **[Research]**: Investigate Advanced Text Processing & Matching Algorithms
  - **Type**: Research
  - **Complexity**: Medium
  - **Rationale**: Explore more sophisticated techniques (e.g., context-awareness, NLP, whole-word matching improvements) to enhance the accuracy and relevance of text transformations.
  - **Expected Outcome**: A research summary outlining potential improvements, feasibility, and effort for enhancing text processing capabilities.

- **[Feature]**: User-configurable Mappings and Settings UI
  - **Type**: Feature
  - **Complexity**: Complex
  - **Rationale**: Allow users to customize replacement rules, toggle the extension on/off for specific sites, or adjust UI styling, significantly increasing utility and user control.
  - **Expected Outcome**: A functional and accessible options page or popup UI allowing users to manage their preferences, with settings persisted via extension storage.

- **[Test]**: Implement End-to-End (E2E) Testing for Key User Flows
  - **Type**: Test
  - **Complexity**: Complex
  - **Rationale**: Provides the highest level of confidence by testing user scenarios in a real browser environment, complementing unit and integration tests.
  - **Expected Outcome**: Key user flows (e.g., page load and text conversion, hover display) are covered by E2E tests using a framework like Playwright or Cypress, integrated into the CI pipeline.

- **[Infra]**: Automated Release Process (Semantic Versioning, Changelog Generation)
  - **Type**: Infra
  - **Complexity**: Medium
  - **Rationale**: Streamlines the release process by automating versioning based on conventional commits, generating changelogs, and potentially automating publishing to extension stores.
  - **Expected Outcome**: A fully or semi-automated release workflow that includes version bumping, changelog creation, and tagging.
