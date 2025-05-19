/**
 * Fix return values in extension-api.mock.ts
 */
const fs = require('fs');

const file = 'test/mocks/extension-api.mock.ts';
let content = fs.readFileSync(file, 'utf8');

// Pattern to find callbacks without return statements
const pattern = /if \(callback\) \{\s*callback\([^)]*\);\s*\}\s*\}\),/g;

// Replace with version that includes return undefined
const replacement = (match) => {
  return match.replace(/\}\s*\}\),/, '}\n        return undefined;\n      }),');
};

content = content.replace(pattern, replacement);

// Also fix tab methods
content = content.replace(
  /if \(callback\) \{\s*callback\(([^)]*)\);\s*\}\s*\}\),/g,
  'if (callback) {\n        callback($1);\n      }\n      return undefined;\n    }),'
);

// Write back
fs.writeFileSync(file, content);
console.log('Fixed return values in ' + file);
