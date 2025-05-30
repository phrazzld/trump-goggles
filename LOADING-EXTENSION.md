# Loading Trump Goggles Extension

## Build the Extension
```bash
pnpm build
```

## Load in Chrome/Edge/Brave
1. Open chrome://extensions/ (or edge://extensions/ or brave://extensions/)
2. Enable "Developer mode" toggle (top right)
3. Click "Load unpacked"
4. Navigate to the `trump-goggles/dist` directory (NOT the root directory)
5. Select the `dist` folder and click "Select"

## Load in Firefox
1. Open about:debugging
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Navigate to `trump-goggles/dist`
5. Select the `manifest.json` file

## Important Notes
- Always load the `dist/` directory, not the project root
- Run `pnpm build` after any code changes
- For development, use `pnpm build:watch` to auto-rebuild on changes