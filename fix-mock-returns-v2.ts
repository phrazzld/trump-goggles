#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';

const filePath = 'test/mocks/extension-api.mock.ts';

// Read the file
const content = readFileSync(filePath, 'utf-8');

// Function to fix conditional returns for all cases
function fixConditionalReturns(content: string): string {
  // Split into lines for easier processing
  const lines = content.split('\n');
  const result: string[] = [];

  let inFunction = false;
  let functionDepth = 0;
  let needsReturn = false;
  let lastCallbackLine = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Check if we're entering a vi.fn function
    if (trimmedLine.includes('vi.fn(') && trimmedLine.includes('=>')) {
      inFunction = true;
      functionDepth = 0;
      needsReturn = false;
    }

    // Track depth within functions
    if (inFunction) {
      functionDepth += (line.match(/{/g) || []).length;
      functionDepth -= (line.match(/}/g) || []).length;

      // Check if line contains firefox return
      if (
        trimmedLine.includes("browserType === 'firefox'") &&
        lines[i + 1] &&
        lines[i + 1].trim().includes('return Promise')
      ) {
        needsReturn = true;
      }

      // Check if this is a callback() call
      if (trimmedLine.match(/^\s*callback\([^)]*\);?\s*$/)) {
        lastCallbackLine = i;
      }

      // Check if we're at the end of the function
      if (functionDepth === 0 && trimmedLine.includes('}')) {
        if (needsReturn && lastCallbackLine > -1) {
          // Check if there's already a return after the callback
          let hasReturn = false;
          for (let j = lastCallbackLine + 1; j <= i; j++) {
            if (lines[j].trim().startsWith('return')) {
              hasReturn = true;
              break;
            }
          }

          if (!hasReturn) {
            // Add return undefined before the closing brace
            const indent = line.match(/^\s*/)?.[0] || '';
            result.push(indent + '  return undefined;');
          }
        }

        inFunction = false;
        needsReturn = false;
        lastCallbackLine = -1;
      }
    }

    result.push(line);
  }

  return result.join('\n');
}

// Apply fixes
let fixedContent = fixConditionalReturns(content);

// Additional specific fixes for some edge cases
const specificFixes = [
  // Fix executeScript which has a unique pattern
  {
    search: /executeScript:\s*vi\.fn\(\(tabId,\s*details,\s*callback\)\s*=>\s*{[\s\S]*?}\)\)/g,
    replace: (match: string) => {
      if (!match.includes('return undefined;')) {
        return match.replace(/(\s*)\}\)\)$/, '$1  return undefined;\n$1})');
      }
      return match;
    },
  },
];

// Apply specific fixes
specificFixes.forEach(({ search, replace }) => {
  fixedContent = fixedContent.replace(search, replace);
});

// Write back to file
writeFileSync(filePath, fixedContent);

console.log(`Fixed TypeScript return value issues in ${filePath}`);
