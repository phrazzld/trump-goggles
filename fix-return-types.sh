#!/bin/bash

# Fix return value errors in extension-api.mock.ts
# For each function that has a conditional return, we need to add an explicit return

cd /Users/phaedrus/Development/trump-goggles

# Create a backup
cp test/mocks/extension-api.mock.ts test/mocks/extension-api.mock.ts.bak

# Fix patterns where we have:
# if (callback) {
#   callback(...);
# }
# And need to add: return undefined;

# Use sed to add return statements after callback blocks
sed -i '' -E '
  /if \(callback\) \{/,/\}$/ {
    /\}$/ {
      n
      /^\s*\}\),?$/ {
        i\
        return undefined;
      }
    }
  }
' test/mocks/extension-api.mock.ts

echo "Fixed return types in extension-api.mock.ts"