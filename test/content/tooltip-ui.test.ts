/**
 * Unit tests for the TooltipUI module
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { createTestLogger } from '../helpers/test-utils';
import { TooltipUI } from '../../tooltip-ui';

// Types for test environment
interface TestLogger {
  info: ReturnType<typeof vi.fn>;
  warn: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
  debug: ReturnType<typeof vi.fn>;
  clear: ReturnType<typeof vi.fn>;
}

declare global {
  var Logger: TestLogger;
}

describe('TooltipUI', () => {
  let document: Document;
  let window: Window & typeof globalThis;
  let mockLogger: TestLogger;

  beforeEach(() => {
    // Create a fresh JSDOM instance for each test
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'https://example.org/',
      referrer: 'https://example.com/',
      contentType: 'text/html',
    });

    window = dom.window as unknown as Window & typeof globalThis;
    document = window.document;
    (global as any).document = document;
    (global as any).window = window;

    // Mock the Logger
    mockLogger = createTestLogger() as TestLogger;
    (window as any).Logger = mockLogger;
  });

  afterEach(() => {
    // Clean up after each test by destroying any created tooltip
    TooltipUI.destroy();
    mockLogger.clear();
  });

  // Tests for ensureCreated()
  describe('ensureCreated', () => {
    it('should create tooltip element when it does not exist', () => {
      // Verify tooltip doesn't exist in DOM initially
      expect(document.getElementById('tg-tooltip')).toBeNull();

      // Call ensureCreated
      TooltipUI.ensureCreated();

      // Verify element exists in the DOM
      const tooltipElement = document.getElementById('tg-tooltip');
      expect(tooltipElement).not.toBeNull();
      expect(tooltipElement!.id).toBe('tg-tooltip');
      expect(tooltipElement!.getAttribute('role')).toBe('tooltip');
      expect(tooltipElement!.getAttribute('aria-hidden')).toBe('true');
    });

    it('should not create duplicate tooltip elements', () => {
      // Create tooltip twice
      TooltipUI.ensureCreated();
      TooltipUI.ensureCreated();

      // Verify only one tooltip exists
      const tooltipElements = document.querySelectorAll('#tg-tooltip');
      expect(tooltipElements.length).toBe(1);
    });

    it('should create tooltip with correct initial styling', () => {
      // Create tooltip
      TooltipUI.ensureCreated();

      // Get tooltip element
      const tooltipElement = document.getElementById('tg-tooltip');
      expect(tooltipElement).not.toBeNull();

      // Verify initial styles (these may vary based on implementation)
      expect(tooltipElement!.style.position).toBe('fixed');
      expect(tooltipElement!.style.visibility).toBe('hidden');
      expect(tooltipElement!.style.opacity).toBe('0');
    });
  });

  // Tests for setText()
  describe('setText', () => {
    beforeEach(() => {
      // Ensure tooltip exists for setText tests
      TooltipUI.ensureCreated();
    });

    it('should set tooltip text content', () => {
      // Set text
      const testText = 'Donald Trump';
      TooltipUI.setText(testText);

      // Verify text was set
      const tooltipElement = document.getElementById('tg-tooltip');
      expect(tooltipElement!.textContent).toBe(testText);
    });

    it('should update text content when called multiple times', () => {
      // Set initial text
      TooltipUI.setText('First text');
      let tooltipElement = document.getElementById('tg-tooltip');
      expect(tooltipElement!.textContent).toBe('First text');

      // Update text
      TooltipUI.setText('Second text');
      tooltipElement = document.getElementById('tg-tooltip');
      expect(tooltipElement!.textContent).toBe('Second text');
    });

    it('should handle empty strings', () => {
      // Set empty text
      TooltipUI.setText('');

      // Verify empty text was set
      const tooltipElement = document.getElementById('tg-tooltip');
      expect(tooltipElement!.textContent).toBe('');
    });

    it('should handle special characters and HTML entities', () => {
      // Set text with special characters
      const specialText = 'Text with "quotes" & <symbols>';
      TooltipUI.setText(specialText);

      // Verify text was set correctly (should be treated as text, not HTML)
      const tooltipElement = document.getElementById('tg-tooltip');
      expect(tooltipElement!.textContent).toBe(specialText);
    });
  });

  // Tests for updatePosition()
  describe('updatePosition', () => {
    let targetElement: HTMLElement;

    beforeEach(() => {
      // Ensure tooltip exists
      TooltipUI.ensureCreated();

      // Create a target element with known position
      targetElement = document.createElement('span');
      targetElement.textContent = 'Target';
      targetElement.style.position = 'absolute';
      targetElement.style.left = '100px';
      targetElement.style.top = '200px';
      targetElement.style.width = '50px';
      targetElement.style.height = '20px';
      document.body.appendChild(targetElement);

      // Mock getBoundingClientRect for predictable positioning
      vi.spyOn(targetElement, 'getBoundingClientRect').mockReturnValue({
        left: 100,
        top: 200,
        right: 150,
        bottom: 220,
        width: 50,
        height: 20,
        x: 100,
        y: 200,
        toJSON: () => ({}),
      });
    });

    it('should position tooltip relative to target element', () => {
      // Update position
      TooltipUI.updatePosition(targetElement);

      // Verify position was updated (tooltip should be centered horizontally relative to target)
      const tooltipElement = document.getElementById('tg-tooltip');
      // The tooltip is centered: targetLeft (100) + targetWidth/2 (25) - tooltipWidth/2 = 125 - tooltipWidth/2
      // Since we can't easily predict tooltip width in JSDOM, just verify position was set
      expect(tooltipElement!.style.left).toBeTruthy();
      expect(tooltipElement!.style.top).toBeTruthy();

      // Verify the position values are numeric pixel values
      expect(tooltipElement!.style.left).toMatch(/^\d+px$/);
      expect(tooltipElement!.style.top).toMatch(/^\d+px$/);
    });

    it('should handle null target element gracefully', () => {
      // Update position with null
      TooltipUI.updatePosition(null);

      // Should not throw error
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should handle undefined target element gracefully', () => {
      // Update position with undefined
      TooltipUI.updatePosition(undefined as any);

      // Should not throw error
      expect(mockLogger.error).not.toHaveBeenCalled();
    });
  });

  // Tests for show()
  describe('show', () => {
    beforeEach(() => {
      // Ensure tooltip exists
      TooltipUI.ensureCreated();
    });

    it('should make tooltip visible', () => {
      // Show tooltip
      TooltipUI.show();

      // Verify visibility
      const tooltipElement = document.getElementById('tg-tooltip');
      expect(tooltipElement!.style.visibility).toBe('visible');
      expect(tooltipElement!.style.opacity).toBe('1');
      expect(tooltipElement!.getAttribute('aria-hidden')).toBe('false');
    });

    it('should handle multiple show calls', () => {
      // Show multiple times
      TooltipUI.show();
      TooltipUI.show();

      // Should remain visible
      const tooltipElement = document.getElementById('tg-tooltip');
      expect(tooltipElement!.style.visibility).toBe('visible');
      expect(tooltipElement!.style.opacity).toBe('1');
      expect(tooltipElement!.getAttribute('aria-hidden')).toBe('false');
    });
  });

  // Tests for hide()
  describe('hide', () => {
    beforeEach(() => {
      // Ensure tooltip exists and is shown
      TooltipUI.ensureCreated();
      TooltipUI.show();
    });

    it('should hide tooltip', () => {
      // Hide tooltip
      TooltipUI.hide();

      // Verify hidden
      const tooltipElement = document.getElementById('tg-tooltip');
      expect(tooltipElement!.style.visibility).toBe('hidden');
      expect(tooltipElement!.style.opacity).toBe('0');
      expect(tooltipElement!.getAttribute('aria-hidden')).toBe('true');
    });

    it('should handle multiple hide calls', () => {
      // Hide multiple times
      TooltipUI.hide();
      TooltipUI.hide();

      // Should remain hidden
      const tooltipElement = document.getElementById('tg-tooltip');
      expect(tooltipElement!.style.visibility).toBe('hidden');
      expect(tooltipElement!.style.opacity).toBe('0');
      expect(tooltipElement!.getAttribute('aria-hidden')).toBe('true');
    });
  });

  // Tests for destroy()
  describe('destroy', () => {
    it('should remove tooltip element from DOM', () => {
      // Create tooltip
      TooltipUI.ensureCreated();
      expect(document.getElementById('tg-tooltip')).not.toBeNull();

      // Destroy tooltip
      TooltipUI.destroy();

      // Verify element was removed
      expect(document.getElementById('tg-tooltip')).toBeNull();
    });

    it('should handle destroy when tooltip does not exist', () => {
      // Destroy when no tooltip exists
      TooltipUI.destroy();

      // Should not throw error
      expect(mockLogger.error).not.toHaveBeenCalled();
      expect(document.getElementById('tg-tooltip')).toBeNull();
    });

    it('should handle multiple destroy calls', () => {
      // Create and destroy multiple times
      TooltipUI.ensureCreated();
      TooltipUI.destroy();
      TooltipUI.destroy();

      // Should not throw error
      expect(mockLogger.error).not.toHaveBeenCalled();
      expect(document.getElementById('tg-tooltip')).toBeNull();
    });
  });

  // Tests for getId()
  describe('getId', () => {
    it('should return correct tooltip ID', () => {
      // Get ID
      const id = TooltipUI.getId();

      // Verify ID
      expect(id).toBe('tg-tooltip');
    });

    it('should return consistent ID across calls', () => {
      // Get ID multiple times
      const id1 = TooltipUI.getId();
      const id2 = TooltipUI.getId();

      // Verify consistency
      expect(id1).toBe(id2);
      expect(id1).toBe('tg-tooltip');
    });
  });

  // Integration tests
  describe('Integration', () => {
    it('should support complete tooltip lifecycle', () => {
      // Complete workflow
      TooltipUI.ensureCreated();
      TooltipUI.setText('Donald Trump');

      // Create target element
      const target = document.createElement('span');
      document.body.appendChild(target);

      TooltipUI.updatePosition(target);
      TooltipUI.show();

      // Verify state
      const tooltipElement = document.getElementById('tg-tooltip');
      expect(tooltipElement).not.toBeNull();
      expect(tooltipElement!.textContent).toBe('Donald Trump');
      expect(tooltipElement!.style.visibility).toBe('visible');

      // Hide and cleanup
      TooltipUI.hide();
      expect(tooltipElement!.style.visibility).toBe('hidden');

      TooltipUI.destroy();
      expect(document.getElementById('tg-tooltip')).toBeNull();
    });

    it('should work with show/hide cycles', () => {
      // Setup
      TooltipUI.ensureCreated();
      TooltipUI.setText('Test content');

      // Show/hide cycle
      TooltipUI.show();
      const tooltipElement = document.getElementById('tg-tooltip');
      expect(tooltipElement!.style.visibility).toBe('visible');

      TooltipUI.hide();
      expect(tooltipElement!.style.visibility).toBe('hidden');

      TooltipUI.show();
      expect(tooltipElement!.style.visibility).toBe('visible');
    });
  });
});
