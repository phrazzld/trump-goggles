# T019 Plan: Set production logging level to INFO

## Problem Analysis

Currently, in production mode, the Logger is configured with a minimum level of `WARN` (line 61 in content-consolidated.js):

```javascript
minLevel: DEBUG ? window.Logger.LEVELS.DEBUG : window.Logger.LEVELS.WARN,
```

This means that only warnings and errors are logged in production, while informational messages are filtered out. The task is to change the minimum level to `INFO` in production mode so that informational messages are also logged, providing better operational diagnostics.

## Current State

- Logger is configured during initialization in content-consolidated.js
- In production mode (when DEBUG is false), the minimum log level is set to WARN
- This filters out INFO level log messages that could provide useful operational diagnostics

## Solution Approach

Change the Logger configuration in content-consolidated.js to use INFO as the minimum level in production mode instead of WARN.

## Implementation Steps

1. Locate the Logger configuration in content-consolidated.js (line 58-65)
2. Change `minLevel: DEBUG ? window.Logger.LEVELS.DEBUG : window.Logger.LEVELS.WARN,` to `minLevel: DEBUG ? window.Logger.LEVELS.DEBUG : window.Logger.LEVELS.INFO,`
3. Run tests to verify the change doesn't cause any issues
4. Update TODO.md to mark task as completed
5. Commit the changes