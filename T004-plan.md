# T004: Convert tooltip-browser-adapter.js to ES Module

## Status

- Task: Simple
- Category: Refactor
- Priority: P0

## Objective

Convert tooltip-browser-adapter.js from IIFE pattern to ES Module format, removing global namespace pollution and making it properly importable.

## Current State

- tooltip-browser-adapter.js uses IIFE pattern with window.TooltipBrowserAdapter assignment
- Not importable as ES Module
- Contributes to global scope pollution

## Plan

1. **Read current file structure**

   - Examine tooltip-browser-adapter.js implementation
   - Identify public API methods and properties

2. **Convert to ES Module**

   - Remove IIFE wrapper
   - Convert public interface to named/default exports
   - Remove window.TooltipBrowserAdapter assignment

3. **Test and verify**

   - Run linter to check for syntax/style issues
   - Run type checker to ensure TypeScript satisfaction
   - Run tests to verify functionality

4. **Commit changes**
   - Stage the modified file
   - Commit with conventional commit message
   - Push to remote

## Success Criteria

- tooltip-browser-adapter.js uses ES Module export syntax
- No global namespace pollution
- All tests pass
- TypeScript types satisfied
