/**
 * Debug helper for Trump Goggles
 * This script runs first to help diagnose loading issues
 */

console.log('[Trump Goggles Debug] Content script loading started');

// Check which modules are available
const modules = {
  Logger: typeof window.Logger !== 'undefined',
  ErrorHandler: typeof window.ErrorHandler !== 'undefined',
  BrowserDetect: typeof window.BrowserDetect !== 'undefined',
  BrowserAdapter: typeof window.BrowserAdapter !== 'undefined',
  PerformanceUtils: typeof window.PerformanceUtils !== 'undefined',
  SecurityUtils: typeof window.SecurityUtils !== 'undefined',
  TrumpMappings: typeof window.TrumpMappings !== 'undefined',
  DOMProcessor: typeof window.DOMProcessor !== 'undefined',
  TextProcessor: typeof window.TextProcessor !== 'undefined',
  MutationObserverManager: typeof window.MutationObserverManager !== 'undefined',
  DOMModifier: typeof window.DOMModifier !== 'undefined',
  TooltipBrowserAdapter: typeof window.TooltipBrowserAdapter !== 'undefined',
  TooltipUI: typeof window.TooltipUI !== 'undefined',
  TooltipManager: typeof window.TooltipManager !== 'undefined',
  TrumpGoggles: typeof window.TrumpGoggles !== 'undefined',
};

console.log('[Trump Goggles Debug] Module availability:', modules);

// Add to window for easy console access
window.TrumpGogglesDebug = {
  modules,
  checkMappings: () => {
    if (window.TrumpMappings) {
      const map = window.TrumpMappings.getReplacementMap();
      console.log('[Trump Goggles Debug] Mappings loaded:', Object.keys(map).length, 'entries');
      console.log('[Trump Goggles Debug] Sample mappings:', Object.entries(map).slice(0, 5));
    } else {
      console.log('[Trump Goggles Debug] TrumpMappings module not loaded!');
    }
  },
  testReplacement: (text) => {
    if (window.TextProcessor && window.TrumpMappings) {
      const map = window.TrumpMappings.getReplacementMap();
      const keys = window.TrumpMappings.getKeys();
      const segments = window.TextProcessor.identifyConversableSegments(text, map, keys);
      console.log('[Trump Goggles Debug] Test result:', segments);
    } else {
      console.log('[Trump Goggles Debug] Required modules not loaded');
    }
  },
};

console.log('[Trump Goggles Debug] Debug helper loaded. Use window.TrumpGogglesDebug in console.');
