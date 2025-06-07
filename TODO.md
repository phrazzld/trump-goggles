# Todo

## Logger Foundation: Core Logic & Interfaces

- [x] **T001 · Feature · P0: define logentry and logger interfaces**
  - **Context:** Plan Details > Phase 1: Foundation > 1.1 Core Structured Logger (`src/utils/structured-logger.ts`) > `interface LogEntry`, `interface Logger`
  - **Action:**
    1. Create `src/utils/structured-logger.ts`.
    2. Define and export the `LogEntry` TypeScript interface as specified in the plan.
    3. Define and export the `Logger` TypeScript interface as specified in the plan.
  - **Done‑when:**
    1. Interfaces are correctly defined in `src/utils/structured-logger.ts`.
    2. TypeScript compiler raises no errors for these interface definitions.
  - **Depends‑on:** none
- [x] **T002 · Feature · P0: implement structuredlogger class skeleton**
  - **Context:** Plan Details > Phase 1: Foundation > 1.1 Core Structured Logger (`src/utils/structured-logger.ts`)
  - **Action:**
    1. Create the `StructuredLogger` class in `src/utils/structured-logger.ts`.
    2. Ensure the class implements the `Logger` interface with stubbed methods for `debug`, `info`, `warn`, `error`, `withContext`, and `child`.
  - **Done‑when:**
    1. `StructuredLogger` class is defined and implements `Logger`.
    2. All required methods exist as stubs and the file compiles.
  - **Depends‑on:** [T001]
- [x] **T003 · Feature · P1: implement json-only output in structuredlogger**
  - **Context:** Plan Details > Phase 1: Foundation > 1.1 Core Structured Logger (`src/utils/structured-logger.ts`) > Implementation Details: JSON-only output
  - **Action:**
    1. Implement the internal logging mechanism in `StructuredLogger` methods (`debug`, `info`, `warn`, `error`) to format a `LogEntry` object as a JSON string.
    2. Output the JSON string to the appropriate `console` method (e.g., `console.log`, `console.warn`).
    3. Ensure no console styling (e.g., `%c`) is applied to the output.
  - **Done‑when:**
    1. Logger methods produce valid JSON strings on the console.
    2. Log output is purely structured data without console styling.
  - **Verification:**
    1. Manually invoke logger methods and inspect console output for valid, unstyled JSON.
  - **Depends‑on:** [T002]
- [x] **T004 · Feature · P1: implement correlation id inclusion in structuredlogger**
  - **Context:** Plan Details > Phase 1: Foundation > 1.1 Core Structured Logger & 1.2 Context Propagation
  - **Action:**
    1. Modify `StructuredLogger` methods to retrieve the current correlation ID from `LoggerContext.getInstance().getCurrentCorrelation()`.
    2. Include the retrieved `correlation_id` in every `LogEntry` object before JSON serialization.
  - **Done‑when:**
    1. Every log entry JSON includes a non-empty `correlation_id` field.
  - **Verification:**
    1. Unit tests for `StructuredLogger` assert the presence and validity of `correlation_id`.
  - **Depends‑on:** [T003, T009, T012]
- [x] **T005 · Feature · P1: implement child method for component hierarchy in structuredlogger**
  - **Context:** Plan Details > Phase 1: Foundation > 1.1 Core Structured Logger (`src/utils/structured-logger.ts`) > Implementation Details: Component hierarchy
  - **Action:**
    1. Implement the `child(component: string): Logger` method in `StructuredLogger`.
    2. The returned child logger must include the specified `component` name in its `LogEntry` objects.
  - **Done‑when:**
    1. `child()` method returns a new `Logger` instance.
    2. Log entries from child loggers correctly record their `component` name.
  - **Depends‑on:** [T002]
- [x] **T006 · Feature · P1: implement context inheritance for child loggers in structuredlogger**
  - **Context:** Plan Details > Phase 1: Foundation > 1.1 Core Structured Logger (`src/utils/structured-logger.ts`) > Implementation Details: Context inheritance
  - **Action:**
    1. Ensure that child loggers created via `child()` and `withContext()` inherit the context of their parent logger.
    2. New context provided to `child()` or `withContext()` should be merged with (and potentially override) parent context.
  - **Done‑when:**
    1. Child loggers correctly inherit and merge parent context.
  - **Depends‑on:** [T005, T007]
- [x] **T007 · Feature · P1: implement withcontext method in structuredlogger**
  - **Context:** Plan Details > Phase 1: Foundation > 1.1 Core Structured Logger (`src/utils/structured-logger.ts`) > `Logger.withContext`
  - **Action:**
    1. Implement the `withContext(context: Record<string, unknown>): Logger` method in `StructuredLogger`.
    2. It should return a new logger instance with the additional `context` merged into its existing context.
  - **Done‑when:**
    1. `withContext()` returns a new `Logger` instance.
    2. The new logger instance includes the merged context in its subsequent log entries.
  - **Depends‑on:** [T002]
- [x] **T008 · Feature · P1: implement automatic caller function name detection in structuredlogger**
  - **Context:** Plan Details > Phase 1: Foundation > 1.1 Core Structured Logger (`src/utils/structured-logger.ts`) > Implementation Details: Caller detection
  - **Action:**
    1. Implement logic within `StructuredLogger` to extract the calling function's name from the JavaScript call stack (e.g., by parsing `new Error().stack`).
    2. Store the detected function name in the `function_name` field of `LogEntry`.
  - **Done‑when:**
    1. `LogEntry` correctly includes the `function_name` where the log method was called.
  - **Depends‑on:** [T002]
- [x] **T009 · Feature · P1: implement error serialization for error_details in structuredlogger**
  - **Context:** Plan Details > Phase 1: Foundation > 1.1 Core Structured Logger (`src/utils/structured-logger.ts`) > `LogEntry.error_details`
  - **Action:**
    1. In `StructuredLogger.error()`, if an `Error` object is passed (e.g., in the `context` argument), serialize it into the `error_details` field of the `LogEntry`.
    2. `error_details` should include `type` (error class name), `message`, and `stack` (if available).
  - **Done‑when:**
    1. Calling `logger.error("message", { someError: new Error("test error") })` correctly populates `error_details` if `someError` is the primary error being logged or if a convention is established for passing the error object.
    2. Stack trace is included in `error_details.stack`.
  - **Depends‑on:** [T002]

## Logger Foundation: Context Propagation

- [x] **T010 · Feature · P0: implement loggercontext singleton class structure**
  - **Context:** Plan Details > Phase 1: Foundation > 1.2 Context Propagation (`src/utils/logger-context.ts`)
  - **Action:**
    1. Create the `LoggerContext` class in `src/utils/logger-context.ts`.
    2. Implement the singleton pattern with a static `getInstance()` method.
    3. Initialize `correlationStack: string[]` as a private member.
  - **Done‑when:**
    1. `LoggerContext.getInstance()` consistently returns the same instance.
  - **Depends‑on:** none
- [x] **T011 · Feature · P1: implement createcorrelationid method in loggercontext**
  - **Context:** Plan Details > Phase 1: Foundation > 1.2 Context Propagation (`src/utils/logger-context.ts`)
  - **Action:**
    1. Implement `createCorrelationId(): string` method in `LoggerContext` to generate and return a UUID v4 string.
  - **Done‑when:**
    1. Method returns a valid UUID v4 string.
  - **Depends‑on:** [T010]
- [x] **T012 · Feature · P1: implement correlation stack operations in loggercontext**
  - **Context:** Plan Details > Phase 1: Foundation > 1.2 Context Propagation (`src/utils/logger-context.ts`)
  - **Action:**
    1. Implement `pushCorrelation(id: string): void` method.
    2. Implement `popCorrelation(): void` method.
    3. Implement `getCurrentCorrelation(): string` method. If stack is empty, it should generate a new root ID, push it, and return it. Otherwise, it returns the ID from the top of the stack.
  - **Done‑when:**
    1. Correlation ID stack operations (`push`, `pop`, `getCurrentCorrelation`) function as expected.
  - **Depends‑on:** [T010, T011]

## Logger Foundation: Legacy Adapter

- [x] **T013 · Feature · P1: define legacyloggerinterface in logger-adapter.ts**
  - **Context:** Plan Details > Phase 1: Foundation > 1.3 Legacy Adapter (`src/utils/logger-adapter.ts`)
  - **Action:**
    1. Create `src/utils/logger-adapter.ts`.
    2. Define a `LegacyLoggerInterface` that matches the existing `window.Logger` API structure (e.g., `debug(message: string, data?: any)`).
  - **Done‑when:**
    1. `LegacyLoggerInterface` is defined and matches the plan's implied structure.
  - **Depends‑on:** none
- [x] **T014 · Feature · P1: implement createlegacyshim function in logger-adapter.ts**
  - **Context:** Plan Details > Phase 1: Foundation > 1.3 Legacy Adapter (`src/utils/logger-adapter.ts`)
  - **Action:**
    1. Implement the `createLegacyShim(structuredLogger: Logger): LegacyLoggerInterface` function.
    2. This function should return an object that implements `LegacyLoggerInterface`.
  - **Done‑when:**
    1. `createLegacyShim` function is implemented and returns an object conforming to `LegacyLoggerInterface`.
  - **Depends‑on:** [T001, T013]
- [x] **T015 · Feature · P1: map legacy logger methods to structuredlogger in createlegacyshim**
  - **Context:** Plan Details > Phase 1: Foundation > 1.3 Legacy Adapter (`src/utils/logger-adapter.ts`)
  - **Action:**
    1. Implement the methods of the returned object in `createLegacyShim` (e.g., `debug`, `info`, `warn`, `error`).
    2. Each legacy method should call the corresponding method on the passed `structuredLogger` instance.
    3. The `data` argument from legacy calls should be wrapped in an object, e.g., `{ legacy_data: data }`, and passed as the `context` to the structured logger.
  - **Done‑when:**
    1. Calls to the shim's methods (e.g., `shim.debug("message", someData)`) correctly invoke the structured logger (e.g., `structuredLogger.debug("message", { legacy_data: someData })`).
  - **Depends‑on:** [T014]

## Logger Integration

- [x] **T016 · Feature · P0: implement loggerfactory class structure**
  - **Context:** Plan Details > Phase 2: Integration > 2.1 Logger Factory (`src/utils/logger-factory.ts`)
  - **Action:**
    1. Create the `LoggerFactory` class in `src/utils/logger-factory.ts`.
    2. Define a private static `structured: StructuredLogger` field.
    3. Define static `initialize(): void` and `getLogger(component: string): Logger` methods.
  - **Done‑when:**
    1. `LoggerFactory` class structure is defined as per the plan.
  - **Depends‑on:** [T001, T002]
- [x] **T017 · Feature · P1: implement loggerfactory.initialize() method**
  - **Context:** Plan Details > Phase 2: Integration > 2.1 Logger Factory (`src/utils/logger-factory.ts`)
  - **Action:**
    1. In `LoggerFactory.initialize()`:
       a. Instantiate `StructuredLogger` with `service_name: 'trump-goggles'`, `version: '18.5.0'`, and `environment: 'extension'`. Store it in `this.structured`.
       b. Call `createLegacyShim` with the new `StructuredLogger` instance.
       c. Assign the result to `window.Logger`.
  - **Done‑when:**
    1. `initialize()` correctly sets up the structured logger and shims `window.Logger`.
  - **Verification:**
    1. After calling `initialize()`, `window.Logger` should exist and use the new system.
  - **Depends‑on:** [T002, T015, T016]
- [x] **T018 · Feature · P1: implement loggerfactory.getlogger() method**
  - **Context:** Plan Details > Phase 2: Integration > 2.1 Logger Factory (`src/utils/logger-factory.ts`)
  - **Action:**
    1. Implement `LoggerFactory.getLogger(component: string): Logger` to call `this.structured.child(component)`.
  - **Done‑when:**
    1. `getLogger(component)` returns a child logger instance configured for that component.
  - **Depends‑on:** [T005, T016, T017]
- [x] **T019 · Chore · P1: update manifest.json for new logging scripts**
  - **Context:** Plan Details > Phase 2: Integration > 2.2 Manifest Integration
  - **Action:**
    1. Modify `manifest.json` to include the compiled JavaScript files for `structured-logger.ts`, `logger-context.ts`, `logger-adapter.ts`, and `logger-factory.ts` in the `content_scripts` `js` array.
  - **Done‑when:**
    1. `manifest.json` is updated with the paths to the new logging scripts.
  - **Depends‑on:** [T001, T010, T013, T016]
- [x] **T020 · Chore · P1: ensure correct script initialization order in manifest.json**
  - **Context:** Plan Details > Phase 2: Integration > 2.2 Manifest Integration > Initialization Order
  - **Action:**
    1. Verify and adjust the order of scripts in the `content_scripts` `js` array in `manifest.json` to ensure the four new logging system scripts are listed before any existing scripts that might use `window.Logger` or `LoggerFactory`.
    2. Convert TypeScript modules to use global window objects instead of ES6 imports to match existing codebase pattern (like `performance-utils.ts`).
    3. Update build configuration to copy TypeScript files with .js rename like other individual modules.
  - **Done‑when:**
    1. Logging system scripts are guaranteed to load and initialize before other dependent scripts.
    2. TypeScript modules work with individual file copying by using window globals instead of imports.
  - **Verification:**
    1. Load the extension locally and confirm no "Logger undefined" errors from existing scripts.
    2. Verify TypeScript compilation still works and logging modules load properly.
  - **Depends‑on:** [T019]

## Migration Strategy: File-by-File

- [x] **T021 · Refactor · P1: migrate src/components/tooltip-manager.ts to new logger**
  - **Context:** Plan Details > Phase 3: Migration Strategy > 3.1 Priority Order & 3.2 Per-File Migration Pattern
  - **Action:**
    1. Import `LoggerFactory` from `../utils/logger-factory`.
    2. Replace `const logger = getLogger();` with `const logger = LoggerFactory.getLogger('tooltip-manager');`.
    3. Replace all `logger.debug`, `logger.info`, etc., and `console.error` calls with the new `logger` instance methods, ensuring context objects are passed correctly.
  - **Done‑when:**
    1. `src/components/tooltip-manager.ts` uses `LoggerFactory` exclusively for logging.
    2. No `console.*` calls (for operational logging) remain in the file.
    3. Functionality of `tooltip-manager` is preserved.
  - **Depends‑on:** [T018, T036]
- [x] **T022 · Refactor · P1: migrate src/utils/error-handler.js to new logger**
  - **Context:** Plan Details > Phase 3: Migration Strategy > 3.1 Priority Order
  - **Action:**
    1. Import `LoggerFactory`.
    2. Replace `console.*` calls with `LoggerFactory.getLogger('error-handler')` and its methods.
  - **Done‑when:**
    1. `src/utils/error-handler.js` uses `LoggerFactory` exclusively for logging.
  - **Depends‑on:** [T018]
- [x] **T023 · Refactor · P1: migrate src/utils/security-utils.ts to new logger**
  - **Context:** Plan Details > Phase 3: Migration Strategy > 3.1 Priority Order
  - **Action:**
    1. Import `LoggerFactory`.
    2. Replace `console.*` calls with `LoggerFactory.getLogger('security-utils')` and its methods.
  - **Done‑when:**
    1. `src/utils/security-utils.ts` uses `LoggerFactory` exclusively for logging.
  - **Depends‑on:** [T018]
- [x] **T024 · Refactor · P2: migrate src/content/dom-modifier.ts to new logger**
  - **Context:** Plan Details > Phase 3: Migration Strategy > 3.1 Priority Order
  - **Action:**
    1. Import `LoggerFactory`.
    2. Replace `console.*` calls with `LoggerFactory.getLogger('dom-modifier')` and its methods.
  - **Done‑when:**
    1. `src/content/dom-modifier.ts` uses `LoggerFactory` exclusively for logging.
  - **Depends‑on:** [T018]
- [x] **T025 · Refactor · P2: migrate src/content/text-processor.js to new logger**
  - **Context:** Plan Details > Phase 3: Migration Strategy > 3.1 Priority Order
  - **Action:**
    1. Import `LoggerFactory`.
    2. Replace `console.*` calls with `LoggerFactory.getLogger('text-processor')` and its methods.
  - **Done‑when:**
    1. `src/content/text-processor.js` uses `LoggerFactory` exclusively for logging.
  - **Depends‑on:** [T018]
- [x] **T026 · Refactor · P2: migrate src/content/mutation-observer.js to new logger**
  - **Context:** Plan Details > Phase 3: Migration Strategy > 3.1 Priority Order
  - **Action:**
    1. Import `LoggerFactory`.
    2. Replace `console.*` calls with `LoggerFactory.getLogger('mutation-observer')` and its methods.
  - **Done‑when:**
    1. `src/content/mutation-observer.js` uses `LoggerFactory` exclusively for logging.
  - **Depends‑on:** [T018]
- [x] **T027 · Refactor · P2: migrate src/background/background-combined.js to new logger**
  - **Context:** Plan Details > Phase 3: Migration Strategy > 3.1 Priority Order
  - **Action:**
    1. Import `LoggerFactory`.
    2. Replace `console.*` calls with `LoggerFactory.getLogger('background-combined')` and its methods.
  - **Done‑when:**
    1. `src/background/background-combined.js` uses `LoggerFactory` exclusively for logging.
  - **Depends‑on:** [T018]
- [x] **T028 · Refactor · P2: migrate src/background/background-polyfill.js to new logger**
  - **Context:** Plan Details > Phase 3: Migration Strategy > 3.1 Priority Order
  - **Action:**
    1. Import `LoggerFactory`.
    2. Replace `console.*` calls with `LoggerFactory.getLogger('background-polyfill')` and its methods.
  - **Done‑when:**
    1. `src/background/background-polyfill.js` uses `LoggerFactory` exclusively for logging.
  - **Depends‑on:** [T018]
- [x] **T029 · Refactor · P3: migrate all remaining components with console.\* usage**
  - **Context:** Plan Details > Phase 3: Migration Strategy > 3.1 Priority Order > Remaining Components
  - **Action:**
    1. Identify all other files in the codebase with `console.*` usage intended for operational logging.
    2. For each identified file, import `LoggerFactory` and replace `console.*` calls with the appropriate `logger.level()` calls, assigning a relevant component name.
  - **Done‑when:**
    1. All operational `console.*` logging is replaced by the new structured logging system.
    2. Grep for `console.*` in `src/` (excluding test files and intentional `console.table` etc.) yields zero results for operational logs.
  - **Depends‑on:** [T018]

## Testing Strategy

- [x] **T030 · Test · P1: write unit tests for structured-logger.ts core logic**
  - **Context:** Plan Details > Phase 4: Testing Strategy > 4.1 Unit Tests > `structured-logger.test.ts`
  - **Action:**
    1. Create `test/utils/structured-logger.test.ts`.
    2. Write tests covering: JSON format validation, presence of mandatory fields (`timestamp`, `level`, `message`, `service_name`, `correlation_id`, `function_name`, `component`), correct error serialization (`error_details`), context inheritance for child loggers and `withContext`.
  - **Done‑when:**
    1. Unit tests achieve >95% coverage for `structured-logger.ts`.
    2. All specified key test cases pass.
  - **Depends‑on:** [T003, T004, T005, T006, T007, T008, T009, T036]
- [x] **T031 · Test · P1: write unit tests for logger-context.ts**
  - **Context:** Plan Details > Phase 4: Testing Strategy > 4.1 Unit Tests > `logger-context.test.ts`
  - **Action:**
    1. Create `test/utils/logger-context.test.ts`.
    2. Write tests covering: singleton behavior, correlation ID generation (UUID v4 format), stack operations (`push`, `pop`, `getCurrentCorrelation`), and context propagation logic.
  - **Done‑when:**
    1. Unit tests achieve >95% coverage for `logger-context.ts`.
    2. All 27 test cases pass covering edge cases and integration scenarios.
    3. 100% coverage achieved across all metrics.
  - **Depends‑on:** [T010, T011, T012, T041, T042]
- [x] **T032 · Test · P1: write unit tests for logger-adapter.ts**
  - **Context:** Plan Details > Phase 4: Testing Strategy > 4.1 Unit Tests > `logger-adapter.test.ts`
  - **Action:**
    1. Create `test/utils/logger-adapter.test.ts`.
    2. Write tests covering: exact API compatibility with the legacy `window.Logger`, correct mapping of legacy calls to `StructuredLogger` methods, and correct formatting of `legacy_data`.
  - **Done‑when:**
    1. Unit tests achieve >95% coverage for `logger-adapter.ts`.
    2. Existing API calls work unchanged via the adapter.
  - **Depends‑on:** [T015]
- [x] **T033 · Test · P1: write integration tests for logger-factory and end-to-end flows**
  - **Context:** Plan Details > Phase 4: Testing Strategy > 4.1 Unit Tests > `logger-integration.test.ts`
  - **Action:**
    1. Create `test/utils/logger-integration.test.ts`.
    2. Write tests covering: `LoggerFactory.initialize()` behavior, `LoggerFactory.getLogger()` functionality, and end-to-end flows demonstrating correlation ID propagation through a series of calls using loggers obtained from the factory.
  - **Done‑when:**
    1. Integration tests validate the logger factory and cross-module logging flows.
  - **Depends‑on:** [T018]
- [x] **T034 · Test · P1: implement e2e test for structured logging in browser extension context**
  - **Context:** Plan Details > Phase 4: Testing Strategy > 4.2 Integration Tests > `test/e2e/logging.spec.ts`
  - **Action:**
    1. Create or update `test/e2e/logging.spec.ts`.
    2. Write an E2E test that loads the extension in a browser, performs actions that trigger logging, captures console output, and verifies that logs are JSON-parseable.
    3. Verify that captured logs contain mandatory fields (`timestamp`, `service_name`, `correlation_id`, `function_name`) with expected patterns/values.
  - **Done‑when:**
    1. E2E test successfully validates structured JSON output in the browser console.
  - **Depends‑on:** [T020, T029]
- [x] **T035 · Chore · P2: ensure mock policy compliance in all tests**
  - **Context:** Plan Details > Phase 4: Testing Strategy > 4.3 Mock Policy Compliance
  - **Action:**
    1. Review all new and existing tests related to the logging system.
    2. Ensure `console` object and `performance.now()` (if used for timestamps) are the only external boundaries mocked.
    3. Ensure no mocking of internal Logger interfaces or the `LoggerContext` class.
  - **Done‑when:**
    1. All logging system tests comply with the specified mock policy.
    2. Refactored logger-adapter.test.ts to use real StructuredLogger instead of mocking internal collaborators.
    3. All 8 logging test files reviewed and 7/8 compliant, 1 violation fixed.
  - **Depends‑on:** [T030, T031, T032, T033, T034]

## Observability & Monitoring

- [x] **T036 · Feature · P1: implement input sanitization utility for logging**
  - **Context:** Plan Details > Security Considerations > Input Sanitization
  - **Action:**
    1. Create a utility function `sanitizeForLogging(data: unknown): unknown`.
    2. Implement HTML escaping for string inputs (e.g., using a robust library or custom function).
    3. Implement deep sanitization for objects, including removal/masking of sensitive patterns (API keys, tokens - TBD if this is separate from T037).
    4. Integrate this sanitization into `StructuredLogger` before context data is serialized to JSON.
  - **Done‑when:**
    1. `sanitizeForLogging` function is implemented and unit tested.
    2. `StructuredLogger` uses this utility to sanitize all contextual data.
    3. Logs from `tooltip-manager.ts` (especially `originalText`) are confirmed to be sanitized.
  - **Depends‑on:** [T002]
- [x] **T037 · Feature · P1: implement secret detection and filtering in structuredlogger**
  - **Context:** Plan Details > Security Considerations > Secret Detection
  - **Action:**
    1. Enhance `StructuredLogger` or the sanitization process to include pre-logging content filtering.
    2. Define patterns for forbidden content (API keys, tokens, passwords, full user agent strings, sensitive DOM attributes).
    3. Ensure detected secrets are masked or removed from log entries.
  - **Done‑when:**
    1. Logs do not contain forbidden sensitive content in clear text.
  - **Depends‑on:** [T002, T036]
- [x] **T038 · Chore · P2: implement log structure validation script (validate-logs.ts)**
  - **Context:** Plan Details > Phase 5: Observability & Monitoring > 5.1 Log Analysis Validation > Required Fields Checker
  - **Action:**
    1. Create `scripts/validate-logs.ts`.
    2. Implement `validateLogEntry(entry: any): boolean` function to check for the presence of all `REQUIRED_FIELDS` as listed in the plan.
  - **Done‑when:**
    1. `validateLogEntry` function correctly validates log entries against the required fields list.
  - **Depends‑on:** none
- [x] **T039 · Chore · P2: integrate log structure validation into ci pipeline**
  - **Context:** Plan Details > Phase 5: Observability & Monitoring > 5.1 Log Analysis Validation > Automated Checks
  - **Action:**
    1. Add a CI step that runs E2E tests, captures their log output, and pipes it to a script that uses `scripts/validate-logs.ts` (or similar jq command) to validate structure.
    2. The CI step should fail if log validation fails.
  - **Done‑when:**
    1. CI pipeline includes automated validation of log structure from test outputs.
  - **Depends‑on:** [T034, T038]
- [x] **T040 · Chore · P3: implement performance benchmarks for logging system**
  - **Context:** Plan Details > Phase 5: Observability & Monitoring > 5.2 Performance Monitoring > Benchmarks
  - **Action:**
    1. Create benchmarks to measure: logs/second throughput, memory overhead of context objects, and latency impact of logging calls.
  - **Done‑when:**
    1. Performance benchmarks are implemented and can be run.
    2. Baseline performance metrics are established.
    3. Performance overhead is confirmed to be <5% vs current implementation.
    4. Comprehensive benchmark system with 15 test cases validating all measurement functions.
    5. Manual benchmark runner for real-world performance assessment.
  - **Depends‑on:** [T018]
- [x] **T041 · Feature · P2: implement logger output throttling mechanism**
  - **Context:** Plan Details > Risk Assessment & Mitigation > Contingency Plans > Performance Issues
  - **Action:**
    1. Add logic to `StructuredLogger` to throttle log output (e.g., max entries per second).
  - **Done‑when:**
    1. Logger output can be throttled to prevent performance degradation under high load.
  - **Depends‑on:** [T002]
- [x] **T042 · Feature · P2: implement context size limit in structuredlogger**
  - **Context:** Plan Details > Risk Assessment & Mitigation > Contingency Plans > Performance Issues
  - **Action:**
    1. Add logic to `StructuredLogger` to limit the size of the `context` object per log entry (e.g., max 1KB).
    2. If limit is exceeded, truncate or log a warning.
  - **Done‑when:**
    1. Log entry context size is limited to prevent memory issues and excessive log verbosity.
    2. Configuration supports both 'truncate' and 'warn' modes.
    3. Comprehensive tests verify functionality.
  - **Depends‑on:** [T002]

## CRITICAL: Browser Extension Compatibility Fixes

- [x] **T043 · Bug · P0: Fix TypeScript module copying in build system**
  - **Context:** Rollup config is copying raw .ts files to dist/ instead of compiling them, causing "Unexpected token 'export'" errors in browser
  - **Root Cause:** Lines 78-101 in rollup.config.js use direct copy commands that rename .ts to .js without compilation
  - **Action:**
    1. Remove direct copy commands for TypeScript files from rollup.config.js
    2. Create proper entry points for TypeScript modules so they go through compilation pipeline
    3. Ensure TypeScript compilation converts ES6 modules to browser-compatible IIFE format
  - **Done‑when:**
    1. All .js files in dist/ contain compiled JavaScript, not raw TypeScript
    2. No "export" or "import" keywords appear in dist/ JavaScript files
    3. Extension loads without syntax errors in browser console
  - **Depends‑on:** none

- [x] **T044 · Refactor · P0: Convert TypeScript logging modules to browser globals pattern**
  - **Context:** ES6 import/export syntax doesn't work in browser extension content scripts
  - **Root Cause:** TypeScript modules use ES6 exports but browser requires window globals pattern
  - **Action:**
    1. Convert structured-logger.ts from ES6 exports to window.StructuredLogger pattern
    2. Convert logger-context.ts from ES6 exports to window.LoggerContext pattern  
    3. Convert logger-adapter.ts from ES6 exports to window.LoggerAdapter pattern
    4. Convert logger-factory.ts from ES6 exports to window.LoggerFactory pattern
    5. Update all internal references to use window globals instead of imports
  - **Done‑when:**
    1. All logging modules follow the same pattern as existing modules (performance-utils.ts, security-utils.ts)
    2. Modules expose functionality via window.ModuleName objects
    3. No import/export statements remain in the modules
  - **Depends‑on:** [T043]

- [x] **T045 · Build · P0: Update rollup configuration for proper TypeScript compilation**
  - **Context:** Build system needs to compile TypeScript modules through rollup pipeline instead of copying
  - **Action:**
    1. Create individual rollup configurations for each TypeScript logging module
    2. Set output format to IIFE for browser compatibility
    3. Configure TypeScript plugin to compile to browser-compatible ES5/ES2020
    4. Ensure proper minification and source map generation for development
  - **Done‑when:**
    1. All TypeScript modules are compiled to valid browser JavaScript
    2. Compiled output works in all target browsers (Chrome, Firefox, Edge)
    3. Development and production builds both work correctly
  - **Depends‑on:** [T043, T044]

- [x] **T046 · Fix · P0: Resolve manifest.json script loading order**
  - **Context:** Logging modules must load before dependent scripts to avoid "LoggerFactory not available" errors
  - **Action:**
    1. Verify logging modules are listed first in manifest.json content_scripts
    2. Ensure proper dependency order: context → logger → adapter → factory → dependent modules
    3. Add initialization calls in correct sequence
    4. Test that window.Logger is available when dependent scripts load
  - **Done‑when:**
    1. No "LoggerFactory not available" errors in browser console
    2. All dependent modules can access logging functionality
    3. Extension initializes without script loading errors
  - **Depends‑on:** [T045]

- [x] **T047 · Test · P1: Verify browser extension functionality end-to-end**
  - **Context:** Ensure structured logging works in actual browser extension context
  - **Action:**
    1. Load extension in Chrome, Firefox, and Edge browsers
    2. Test that structured JSON logs appear in browser console
    3. Verify correlation ID propagation across components
    4. Test that all logging levels (debug, info, warn, error) work correctly
    5. Confirm tooltip functionality still works with new logging system
  - **Done‑when:**
    1. Extension loads without errors in all target browsers
    2. Structured JSON logs are generated correctly
    3. All existing functionality (text replacement, tooltips) continues to work
    4. No console errors related to logging system
  - **Depends‑on:** [T046]

- [x] **T048 · Performance · P2: Optimize browser extension bundle size**
  - **Context:** Additional logging modules may increase extension size
  - **Action:**
    1. Measure impact of new logging system on extension bundle size
    2. Enable proper minification for production builds
    3. Remove development-only code from production builds
    4. Optimize TypeScript compilation for smaller output
  - **Done‑when:**
    1. Production bundle size increase is <20% vs baseline
    2. Extension loading performance is not degraded
    3. Minification removes debug code and comments in production
  - **Depends‑on:** [T045]

## Test Suite Compatibility

- [x] **T049 · Fix · P1: Update test suite to use window globals instead of ES6 imports**
  - **Context:** Tests are failing because they import logging classes directly, but modules now only export via window globals
  - **Root Cause:** Tests still use `import { StructuredLogger }` pattern, but modules were converted to window globals for browser compatibility
  - **Action:**
    1. Update test files to remove ES6 imports for logging modules
    2. Access classes through window globals (window.StructuredLogger.Logger, etc.)
    3. Ensure window globals are properly initialized in test environment
    4. Verify all test functionality still works with new access pattern
  - **Done‑when:**
    1. All logging-related tests pass without import errors
    2. Test functionality is preserved (no mocking of internal collaborators)
    3. Tests use window globals consistently
  - **Depends‑on:** [T044, T045, T046, T047, T048]

## CI Pipeline Failures - Critical

- [x] **T050 · Fix · P0: Fix test setup dependency on compiled modules causing CI failure**
  - **Context:** CI pipeline failing because test/setup.ts tries to load compiled JS modules from dist/ directory, but tests run before build step
  - **Root Cause:** Test setup was modified to load from dist/ but compiled modules don't exist during CI test execution
  - **Error:** `File not found: /home/runner/work/trump-goggles/trump-goggles/dist/structured-logger.js`
  - **Action:**
    1. Revert test/setup.ts changes that load compiled modules from dist/ directory
    2. Replace with direct TypeScript imports or manual window global setup
    3. Ensure logging window globals are properly initialized without requiring build artifacts
    4. Remove dependency on eval() of compiled JavaScript for test setup
  - **Done‑when:**
    1. test/setup.ts no longer attempts to load from dist/ directory
    2. All logging window globals are properly initialized for tests
    3. Tests can run without requiring a prior build step
  - **Verification:**
    1. `pnpm test` passes locally without prior build
    2. No "File not found" errors in test output
  - **Depends‑on:** [T049]

- [x] **T051 · Fix · P0: Verify all tests work with corrected window global setup**
  - **Context:** After fixing test setup, ensure all logging-dependent tests continue to work properly
  - **Action:**
    1. Run individual test files that use logging components to verify they work
    2. Run full test suite locally to check for any missed dependencies
    3. Verify test coverage is maintained across all logging functionality
    4. Check that both manual and automatic test setups work correctly
  - **Done‑when:**
    1. All individual logging tests pass: logger-adapter.test.ts, logger-context.test.ts, structured-logger-context-size.test.ts
    2. Full test suite passes with 0 failures
    3. No test functionality regression compared to previous working state
  - **Verification:**
    1. Run `pnpm test test/utils/logger-*.test.ts` - all pass
    2. Run `pnpm test` - full suite passes
    3. Test coverage report shows no significant drops
  - **Depends‑on:** [T050]

- [x] **T052 · Fix · P0: Validate CI pipeline passes with test setup fixes**
  - **Context:** Verify that CI pipeline works correctly after fixing test setup dependency issues
  - **Action:**
    1. Push test setup fixes to trigger CI run
    2. Monitor CI pipeline execution for any remaining failures
    3. Verify that lint, typecheck, and test phases all pass
    4. Check for any new warnings or edge cases
    5. If failures occur, analyze and create follow-up tasks
  - **Done‑when:**
    1. CI pipeline shows all green checkmarks for latest commit
    2. Build step completes successfully
    3. No "File not found" or module loading errors in CI logs
  - **Verification:**
    1. GitHub Actions shows successful CI run
    2. All CI steps (lint, typecheck, test) pass
    3. No error messages related to missing dist/ files
  - **Depends‑on:** [T051]

- [x] **T053 · Fix · P1: Add prevention measures for test setup build dependency issues**
  - **Context:** Prevent similar issues where tests accidentally depend on build artifacts
  - **Action:**
    1. Add documentation in test/README.md about test setup requirements
    2. Consider adding a pre-test check that verifies no dist/ dependencies exist
    3. Add comments in test/setup.ts explaining the design constraints
    4. Review if lint-staged or other tools might be introducing problematic changes
  - **Done‑when:**
    1. Clear documentation exists about test independence from build artifacts
    2. Test setup includes safeguards against build dependencies
    3. Future developers understand the test environment constraints
  - **Verification:**
    1. Documentation clearly explains test setup approach
    2. Comments in code prevent accidental reintroduction of issue
  - **Depends‑on:** [T052]

- [x] **T054 · Cleanup · P2: Remove CI failure analysis documents**
  - **Context:** Clean up temporary files created during CI failure analysis
  - **Action:**
    1. Remove CI-FAILURE-SUMMARY.md after resolution is complete
    2. Remove CI-RESOLUTION-PLAN.md after implementation
    3. Ensure any useful information is captured in permanent documentation
  - **Done‑when:**
    1. Temporary analysis files are removed from repository
    2. No temporary files remain in working directory
  - **Depends‑on:** [T053]

## CRITICAL: Pre-Merge Fixes Required

- [x] **T055 · Bug · P0: Fix overly strict CI log validation causing false failures**
  - **Context:** CI validation script incorrectly requires service_name, version, and environment in every log entry's context object, but StructuredLogger only guarantees these at logger level
  - **Root Cause:** scripts/validate-logs.ts (+65 to +77) enforces context field validation that doesn't match actual StructuredLogger implementation
  - **Impact:** CI pipeline will fail on valid logs, blocking all development and merges
  - **Action:**
    1. Remove strict validation for service_name, version, environment fields in context object validation
    2. Keep context type validation (must be object if present) but remove required field checks
    3. Focus validation only on top-level LogEntry fields that are actually guaranteed
  - **Done‑when:**
    1. CI validation passes on valid structured logs from current implementation
    2. No false failures from missing context fields that aren't guaranteed per-entry
    3. Context validation only checks type, not required internal fields
  - **Verification:**
    1. Run logging validation on actual log samples from structured logger
    2. Verify CI no longer fails on legitimate logs
  - **Depends‑on:** [T039]

- [ ] **T056 · Bug · P0: Fix logger initialization failure in production builds**
  - **Context:** LoggerFactory.initialize() only runs in content-debug.js which is excluded from production manifests, causing undefined logger errors in production
  - **Root Cause:** Production builds don't include content-debug.js, so LoggerFactory never initializes, causing crashes when getLogger() is called
  - **Impact:** Complete extension failure in production due to unhandled runtime errors from undefined _structured logger
  - **Action:**
    1. Move LoggerFactory.initialize() call from content-debug.js to content-consolidated.js
    2. Ensure initialization happens as first operation before any logging attempts
    3. Add proper error handling for initialization failures
    4. Verify production manifest includes initialization script
  - **Done‑when:**
    1. LoggerFactory.initialize() runs in all build environments (debug and production)
    2. No "LoggerFactory undefined" or similar errors in production builds
    3. Extension loads successfully in production configuration
  - **Verification:**
    1. Test extension with production manifest (manifest-production.json)
    2. Verify no console errors related to logging initialization
    3. Confirm structured logging works in production build
  - **Depends‑on:** [T020]
