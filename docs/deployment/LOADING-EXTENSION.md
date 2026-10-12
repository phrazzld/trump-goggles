# Loading Trump Goggles Extension

## Build the Extension

After [cloning the repository and installing the prerequisites](../../README.md#development), run
these commands from the repository root:

```bash
pnpm install --frozen-lockfile
pnpm build
```

The build copies `extension/manifest.json` to `dist/manifest.json` and writes the scripts, options page,
and images referenced by that manifest into `dist/`. Neither the repository root nor `extension/`
contains the complete loadable extension.

## Load in Chrome/Edge/Brave

1. Open chrome://extensions/ (or edge://extensions/ or brave://extensions/)
2. Enable "Developer mode" toggle (top right)
3. Click "Load unpacked"
4. Navigate to the `trump-goggles/dist` directory (NOT the root directory)
5. Select the `dist` folder and click "Select"

## Firefox Limitation

The default build is not Firefox-ready: `dist/manifest.json` copies the Manifest V3 configuration
from `extension/manifest.json`, whose background entry declares only `service_worker`.
[Firefox does not support `background.service_worker`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background#browser_support);
it requires a compatible background script or page configuration.

`pnpm build` does not copy `extension/manifest-firefox.json`. A Firefox-compatible manifest and package
need to be prepared and verified separately before temporary loading; selecting the default
`dist/manifest.json` does not resolve that compatibility limitation.

## Important Notes

- Always load the `dist/` directory, not the project root
- Run `pnpm build` after code changes, or use `pnpm build:watch` to auto-rebuild during development
- Wait for the build to finish, then reload the extension on the browser's extensions/debugging page
- Refresh the page you are testing so it uses the rebuilt content scripts
