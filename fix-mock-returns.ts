#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';

const filePath = 'test/mocks/extension-api.mock.ts';

// Read the file
const content = readFileSync(filePath, 'utf-8');

// Function to fix conditional returns
function fixConditionalReturns(content: string): string {
  // Pattern to match functions with Firefox promise returns but missing else returns
  const patterns = [
    {
      // Functions with (keys, callback) or (items, callback) or similar
      match:
        /(\w+:\s*vi\.fn\(\(([\w\s,]+),\s*callback\)\s*=>\s*{\s*[^}]*?if\s*\(browserType\s*===\s*'firefox'\)\s*{\s*return\s*Promise\.\w+\([^)]*\);\s*}[^}]*?if\s*\(callback\)\s*{\s*callback\([^)]*\);\s*}\s*}\))/g,
      replace: (match: string) => {
        return match.replace(
          /if\s*\(callback\)\s*{\s*callback\(([^)]*)\);\s*}(\s*})/,
          'if (callback) {\n          callback($1);\n        }\n        return undefined;$2'
        );
      },
    },
    {
      // Functions with special cases like sendMessage with (message, options, callback)
      match:
        /(\w+:\s*vi\.fn\(\(([\w\s,]+)\)\s*=>\s*{\s*[^}]*?if\s*\(browserType\s*===\s*'firefox'\)\s*{\s*return\s*Promise\.\w+\([^)]*\);\s*}[\s\S]*?}\s*}\))/g,
      replace: (match: string) => {
        // Only fix if it doesn't already have a return at the end
        const lastBracePos = match.lastIndexOf(
          '}',
          match.lastIndexOf('}', match.lastIndexOf('}') - 1) - 1
        );
        const beforeLastBrace = match.substring(0, lastBracePos);
        const afterLastBrace = match.substring(lastBracePos);

        if (
          !beforeLastBrace.includes('return undefined;') &&
          !beforeLastBrace.includes('return;') &&
          !beforeLastBrace.match(/return\s+[^;]+;\s*$/)
        ) {
          return beforeLastBrace + '\n        return undefined;' + afterLastBrace;
        }
        return match;
      },
    },
  ];

  let fixedContent = content;

  // Apply pattern fixes
  patterns.forEach(({ match, replace }) => {
    fixedContent = fixedContent.replace(match, replace);
  });

  // Special case: Fix executeScript function which has a different pattern
  fixedContent = fixedContent.replace(
    /(executeScript:\s*vi\.fn\(\(tabId,\s*details,\s*callback\)\s*=>\s*{[\s\S]*?if\s*\(callback\)\s*{\s*callback\(\[\{\s*result:\s*'Script executed'\s*}\]\);\s*}\s*}\))/,
    (match) => {
      if (!match.includes('return undefined;')) {
        return match.replace(
          /if\s*\(callback\)\s*{\s*callback\(\[\{\s*result:\s*'Script executed'\s*}\]\);\s*}\s*}/,
          "if (callback) {\n        callback([{ result: 'Script executed' }]);\n      }\n      return undefined;\n    })"
        );
      }
      return match;
    }
  );

  // Fix storage.sync.get function which has a more complex pattern
  fixedContent = fixedContent.replace(
    /(get:\s*vi\.fn\(\(keys,\s*callback\)\s*=>\s*{[\s\S]*?if\s*\(browserType\s*===\s*'firefox'\)\s*{\s*return\s*Promise\.resolve\(result\);\s*}[\s\S]*?if\s*\(callback\)\s*{\s*callback\(result\);\s*}\s*}\))/,
    (match) => {
      if (!match.includes('return undefined;')) {
        return match.replace(
          /if\s*\(callback\)\s*{\s*callback\(result\);\s*}\s*}/,
          'if (callback) {\n          callback(result);\n        }\n        return undefined;\n      })'
        );
      }
      return match;
    }
  );

  return fixedContent;
}

// Apply fixes
const fixedContent = fixConditionalReturns(content);

// Write back to file
writeFileSync(filePath, fixedContent);

console.log(`Fixed TypeScript return value issues in ${filePath}`);
