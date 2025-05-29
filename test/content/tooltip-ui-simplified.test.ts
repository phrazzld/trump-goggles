/**
 * Simplified unit tests for the TooltipUI module
 * Tests the actual module behavior through DOM inspection
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { createTestLogger } from '../helpers/test-utils';
import { TooltipUI } from '../../tooltip-ui';
import type { DOMWindow } from '../types/dom';

describe('TooltipUI (Simplified)', () => {
  let document: Document;
  let window: DOMWindow;
  let mockLogger: ReturnType<typeof createTestLogger>;

  beforeEach(() => {
    // Create a fresh JSDOM instance for each test
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'https://example.org/',
      referrer: 'https://example.com/',
      contentType: 'text/html',
    });

    window = dom.window as DOMWindow;
    document = window.document;
    global.document = document;
    global.window = window;

    // Mock the Logger
    mockLogger = createTestLogger();
    (window as any).Logger = mockLogger;
  });

  afterEach(() => {
    // Clean up after each test by destroying any created tooltip
    TooltipUI.destroy();
    mockLogger.clear();
  });

  describe('tooltip creation and management', () => {
    it('should create tooltip element in DOM when ensureCreated is called', () => {
      // Verify tooltip doesn't exist initially
      expect(document.getElementById('tg-tooltip')).toBeNull();

      // Call ensureCreated
      TooltipUI.ensureCreated();

      // Verify element exists in the DOM
      const tooltipElement = document.getElementById('tg-tooltip');
      expect(tooltipElement).not.toBeNull();
      expect(tooltipElement!.getAttribute('role')).toBe('tooltip');
      expect(tooltipElement!.getAttribute('aria-hidden')).toBe('true');
    });

    it('should set text content when setText is called', () => {
      // Create tooltip
      TooltipUI.ensureCreated();

      // Set text
      TooltipUI.setText('Test content');

      // Verify text was set
      const tooltipElement = document.getElementById('tg-tooltip');
      expect(tooltipElement!.textContent).toBe('Test content');
    });

    it('should show tooltip by changing visibility styles', () => {
      // Create tooltip
      TooltipUI.ensureCreated();

      // Show tooltip
      TooltipUI.show();

      // Verify visibility
      const tooltipElement = document.getElementById('tg-tooltip') as HTMLElement;
      expect(tooltipElement.style.visibility).toBe('visible');
      expect(tooltipElement.style.opacity).toBe('1');
      expect(tooltipElement.getAttribute('aria-hidden')).toBe('false');
    });

    it('should hide tooltip by changing visibility styles', () => {
      // Create and show tooltip
      TooltipUI.ensureCreated();
      TooltipUI.show();

      // Hide tooltip
      TooltipUI.hide();

      // Verify hidden
      const tooltipElement = document.getElementById('tg-tooltip') as HTMLElement;
      expect(tooltipElement.style.visibility).toBe('hidden');
      expect(tooltipElement.style.opacity).toBe('0');
      expect(tooltipElement.getAttribute('aria-hidden')).toBe('true');
    });

    it('should remove tooltip from DOM when destroy is called', () => {
      // Create tooltip
      TooltipUI.ensureCreated();

      // Verify it exists
      expect(document.getElementById('tg-tooltip')).not.toBeNull();

      // Destroy tooltip
      TooltipUI.destroy();

      // Verify it's removed
      expect(document.getElementById('tg-tooltip')).toBeNull();
    });

    it('should return tooltip ID from getId', () => {
      // Get ID
      const id = TooltipUI.getId();

      // Verify it's the expected ID
      expect(id).toBe('tg-tooltip');
    });

    it('should position tooltip relative to target element', () => {
      // Create tooltip and target
      TooltipUI.ensureCreated();
      const targetElement = document.createElement('button');
      targetElement.style.position = 'absolute';
      targetElement.style.top = '100px';
      targetElement.style.left = '100px';
      targetElement.style.width = '100px';
      targetElement.style.height = '50px';
      document.body.appendChild(targetElement);

      // Update position
      TooltipUI.updatePosition(targetElement);

      // Verify tooltip has position styles (exact values depend on implementation)
      const tooltipElement = document.getElementById('tg-tooltip') as HTMLElement;
      expect(tooltipElement.style.top).toBeTruthy();
      expect(tooltipElement.style.left).toBeTruthy();
    });
  });

  describe('error handling', () => {
    it('should handle missing target element gracefully', () => {
      // Create tooltip
      TooltipUI.ensureCreated();

      // Update position with null target (should not throw)
      expect(() => TooltipUI.updatePosition(null)).not.toThrow();

      // Verify warning was logged
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should handle multiple destroy calls gracefully', () => {
      // Create tooltip
      TooltipUI.ensureCreated();

      // Destroy multiple times (should not throw)
      expect(() => {
        TooltipUI.destroy();
        TooltipUI.destroy();
        TooltipUI.destroy();
      }).not.toThrow();
    });
  });
});
