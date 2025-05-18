/**
 * Unit tests for the TooltipUI module
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { createTestLogger } from '../helpers/test-utils';
import { TooltipUI } from '../../tooltip-ui.ts';

describe('TooltipUI', () => {
  let document;
  let window;
  let mockLogger;

  beforeEach(() => {
    // Create a fresh JSDOM instance for each test
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'https://example.org/',
      referrer: 'https://example.com/',
      contentType: 'text/html',
    });

    window = dom.window;
    document = window.document;
    global.document = document;
    global.window = window;

    // Mock the Logger
    mockLogger = createTestLogger();
    window.Logger = mockLogger;
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

      // Verify attributes
      expect(tooltipElement.getAttribute('role')).toBe('tooltip');
      expect(tooltipElement.getAttribute('aria-hidden')).toBe('true');
    });

    it('should not create tooltip again if it already exists', () => {
      // Create tooltip first
      TooltipUI.ensureCreated();
      const firstTooltip = document.getElementById('tg-tooltip');

      // Call ensureCreated again
      TooltipUI.ensureCreated();
      const secondTooltip = document.getElementById('tg-tooltip');

      // Verify it's the same element
      expect(secondTooltip).toBe(firstTooltip);
    });

    it('should log creation with Logger if available', () => {
      // Call ensureCreated
      TooltipUI.ensureCreated();

      // Verify Logger was called
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'TooltipUI: Tooltip element created',
        expect.objectContaining({ id: 'tg-tooltip' })
      );
    });
  });

  // Tests for setText()
  describe('setText', () => {
    it('should set text content correctly', () => {
      // Create tooltip and set text
      TooltipUI.ensureCreated();
      TooltipUI.setText('Sample tooltip text');

      // Verify text was set
      const tooltipElement = document.getElementById('tg-tooltip');
      expect(tooltipElement.textContent).toBe('Sample tooltip text');
    });

    it('should ensure tooltip is created first', () => {
      // Set text without creating tooltip first
      TooltipUI.setText('Test text');

      // Verify tooltip was created
      const tooltipElement = document.getElementById('tg-tooltip');
      expect(tooltipElement).not.toBeNull();
      expect(tooltipElement.textContent).toBe('Test text');
    });

    it('should handle null or undefined values safely', () => {
      TooltipUI.ensureCreated();

      // Test with null
      TooltipUI.setText(null);
      let tooltipElement = document.getElementById('tg-tooltip');
      expect(tooltipElement.textContent).toBe('');

      // Test with undefined
      TooltipUI.setText(undefined);
      tooltipElement = document.getElementById('tg-tooltip');
      expect(tooltipElement.textContent).toBe('');
    });

    it('should sanitize HTML content (XSS protection)', () => {
      TooltipUI.ensureCreated();
      const htmlContent = '<b>Bold</b> <script>alert("XSS")</script>';

      TooltipUI.setText(htmlContent);

      // Verify text was set as plain text (not parsed as HTML)
      const tooltipElement = document.getElementById('tg-tooltip');
      expect(tooltipElement.textContent).toBe(htmlContent);
      expect(tooltipElement.innerHTML).not.toContain('<b>');
      expect(tooltipElement.innerHTML).not.toContain('<script>');
    });

    it('should log a snippet of text to the logger', () => {
      TooltipUI.ensureCreated();

      // Clear previous logs
      mockLogger.debug.mockClear();

      // Set text
      TooltipUI.setText('This is a test message');

      // Verify log includes snippet
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'TooltipUI: Set tooltip text',
        expect.objectContaining({ snippet: 'This is a test message' })
      );
    });
  });

  // Tests for updatePosition()
  describe('updatePosition', () => {
    let targetElement;

    beforeEach(() => {
      // Create a target element for positioning tests
      targetElement = document.createElement('button');
      targetElement.style.position = 'absolute';
      targetElement.style.top = '100px';
      targetElement.style.left = '100px';
      targetElement.style.width = '100px';
      targetElement.style.height = '50px';
      document.body.appendChild(targetElement);
    });

    it('should position tooltip above target by default', () => {
      TooltipUI.ensureCreated();
      TooltipUI.updatePosition(targetElement);

      // Verify tooltip has position styles
      const tooltipElement = document.getElementById('tg-tooltip');
      expect(tooltipElement.style.top).toBeTruthy();
      expect(tooltipElement.style.left).toBeTruthy();
    });

    it('should log position type to the logger', () => {
      TooltipUI.ensureCreated();

      // Clear previous logs
      mockLogger.debug.mockClear();

      TooltipUI.updatePosition(targetElement);

      // Verify position was logged
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'TooltipUI: Positioned tooltip',
        expect.objectContaining({
          position: expect.any(String),
          top: expect.any(Number),
          left: expect.any(Number),
        })
      );
    });

    it('should handle missing target element gracefully', () => {
      TooltipUI.ensureCreated();

      // Try to update position with null target
      expect(() => TooltipUI.updatePosition(null)).not.toThrow();

      // Verify warning was logged
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'TooltipUI: Cannot position tooltip - missing element references'
      );
    });

    it('should handle errors gracefully and use fallback positioning', () => {
      TooltipUI.ensureCreated();

      // Mock getBoundingClientRect to throw error
      targetElement.getBoundingClientRect = vi.fn(() => {
        throw new Error('Mock getBoundingClientRect error');
      });

      // Update position
      TooltipUI.updatePosition(targetElement);

      // Verify error logging
      expect(mockLogger.error).toHaveBeenCalledWith(
        'TooltipUI: Error positioning tooltip',
        expect.objectContaining({ error: expect.any(Error) })
      );

      // Verify fallback positioning
      const tooltipElement = document.getElementById('tg-tooltip');
      expect(tooltipElement.style.top).toBe('50%');
      expect(tooltipElement.style.left).toBe('50%');
      expect(tooltipElement.style.transform).toBe('translate(-50%, -50%)');
    });
  });

  // Tests for show()
  describe('show', () => {
    it('should make tooltip visible', () => {
      TooltipUI.ensureCreated();
      TooltipUI.show();

      // Verify visibility styles
      const tooltipElement = document.getElementById('tg-tooltip');
      expect(tooltipElement.style.visibility).toBe('visible');
      expect(tooltipElement.style.opacity).toBe('1');
      expect(tooltipElement.getAttribute('aria-hidden')).toBe('false');
    });

    it('should ensure tooltip is created first', () => {
      // Call show without creating tooltip first
      TooltipUI.show();

      // Verify tooltip was created and is visible
      const tooltipElement = document.getElementById('tg-tooltip');
      expect(tooltipElement).not.toBeNull();
      expect(tooltipElement.style.visibility).toBe('visible');
    });

    it('should log visibility change to the logger', () => {
      TooltipUI.ensureCreated();

      // Clear previous logs
      mockLogger.debug.mockClear();

      TooltipUI.show();

      // Verify logging
      expect(mockLogger.debug).toHaveBeenCalledWith('TooltipUI: Tooltip shown');
    });
  });

  // Tests for hide()
  describe('hide', () => {
    it('should hide tooltip', () => {
      // Create and show tooltip first
      TooltipUI.ensureCreated();
      TooltipUI.show();

      // Now hide it
      TooltipUI.hide();

      // Verify hidden styles
      const tooltipElement = document.getElementById('tg-tooltip');
      expect(tooltipElement.style.visibility).toBe('hidden');
      expect(tooltipElement.style.opacity).toBe('0');
      expect(tooltipElement.getAttribute('aria-hidden')).toBe('true');
    });

    it('should do nothing if tooltip does not exist', () => {
      // Try to hide non-existent tooltip
      expect(() => TooltipUI.hide()).not.toThrow();
    });

    it('should log visibility change to the logger', () => {
      TooltipUI.ensureCreated();

      // Clear previous logs
      mockLogger.debug.mockClear();

      TooltipUI.hide();

      // Verify logging
      expect(mockLogger.debug).toHaveBeenCalledWith('TooltipUI: Tooltip hidden');
    });
  });

  // Tests for destroy()
  describe('destroy', () => {
    it('should remove tooltip from DOM', () => {
      // Create tooltip
      TooltipUI.ensureCreated();
      expect(document.getElementById('tg-tooltip')).not.toBeNull();

      // Destroy it
      TooltipUI.destroy();

      // Verify it's removed
      expect(document.getElementById('tg-tooltip')).toBeNull();
    });

    it('should do nothing if tooltip does not exist', () => {
      // Try to destroy non-existent tooltip
      expect(() => TooltipUI.destroy()).not.toThrow();
    });

    it('should log destruction to the logger', () => {
      TooltipUI.ensureCreated();

      // Clear previous logs
      mockLogger.debug.mockClear();

      TooltipUI.destroy();

      // Verify logging
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'TooltipUI: Tooltip element destroyed',
        expect.objectContaining({ id: 'tg-tooltip' })
      );
    });

    it('should reset state even if removal fails', () => {
      TooltipUI.ensureCreated();
      const tooltipElement = document.getElementById('tg-tooltip');

      // Mock removeChild to throw an error
      tooltipElement.parentNode.removeChild = vi.fn(() => {
        throw new Error('Mock removeChild error');
      });

      // Destroy should not throw
      expect(() => TooltipUI.destroy()).not.toThrow();

      // Verify error was logged
      expect(mockLogger.error).toHaveBeenCalledWith(
        'TooltipUI: Error destroying tooltip element',
        expect.objectContaining({ error: expect.any(Error) })
      );
    });
  });

  // Tests for getId()
  describe('getId', () => {
    it('should return the correct tooltip ID', () => {
      const id = TooltipUI.getId();
      expect(id).toBe('tg-tooltip');
    });
  });
});
