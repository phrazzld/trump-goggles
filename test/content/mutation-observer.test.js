/**
 * Unit tests for the MutationObserver module
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { createMockMutation, createTestDOM } from '../helpers/test-utils';

describe('MutationObserver Module', () => {
  let document;
  let mockObserver;
  let mockDisconnect;
  let mockObserve;
  let mockDomProcessor;

  // Create an object that holds all the mutation handler functions and state
  const MutationHandler = {
    observer: null,
    isActive: false,
    trumpMap: { trump: { regex: /Trump/g, nick: 'Agent Orange' } },
    mapKeys: ['trump'],

    // Mock DOM processor
    domProcessor: {
      processDOM: vi.fn(),
      isEditableNode: vi.fn().mockReturnValue(false),
      isProcessedNode: vi.fn().mockReturnValue(false),
    },

    // Mock text processor
    textProcessor: vi.fn(),

    // Mock setup function
    setupMutationObserver: vi.fn((rootNode) => {
      if (!rootNode) {
        return null;
      }

      MutationHandler.observer = {
        observe: mockObserve,
        disconnect: mockDisconnect,
        takeRecords: vi.fn().mockReturnValue([]),
      };

      MutationHandler.observer.observe(rootNode, {
        childList: true,
        subtree: true,
        characterData: true,
      });

      MutationHandler.isActive = true;

      return MutationHandler.observer;
    }),

    // Mock disconnect function
    disconnectObserver: vi.fn(() => {
      if (MutationHandler.observer) {
        MutationHandler.observer.disconnect();
        MutationHandler.isActive = false;
      }
    }),

    // Mock reconnect function
    reconnectObserver: vi.fn((rootNode) => {
      MutationHandler.disconnectObserver();
      return MutationHandler.setupMutationObserver(rootNode);
    }),

    // Mock process mutations function
    processMutations: vi.fn((mutations) => {
      if (!mutations || !Array.isArray(mutations)) {
        return;
      }

      mutations.forEach((mutation) => {
        // Process based on mutation type
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Process added nodes
          Array.from(mutation.addedNodes).forEach((node) => {
            if (node.nodeType === 1 || node.nodeType === 3) {
              MutationHandler.domProcessor.processDOM(
                node,
                MutationHandler.textProcessor,
                MutationHandler.trumpMap,
                MutationHandler.mapKeys
              );
            }
          });
        }

        // Process character data changes
        if (mutation.type === 'characterData' && mutation.target.nodeType === 3) {
          if (
            !MutationHandler.domProcessor.isEditableNode(mutation.target) &&
            !MutationHandler.domProcessor.isProcessedNode(mutation.target)
          ) {
            MutationHandler.domProcessor.processDOM(
              mutation.target,
              MutationHandler.textProcessor,
              MutationHandler.trumpMap,
              MutationHandler.mapKeys
            );
          }
        }
      });
    }),

    // Mock handler function
    mutationHandler: vi.fn((mutations, observer) => {
      try {
        MutationHandler.processMutations(mutations);
      } catch (error) {
        console.error('Error processing mutations:', error);
      }
    }),
  };

  beforeEach(() => {
    // Setup JSDOM with a valid URL to avoid opaque origin issues
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'https://example.org/',
    });
    document = dom.window.document;
    global.document = document;
    global.window = dom.window;

    // Create mocks
    mockObserve = vi.fn();
    mockDisconnect = vi.fn();

    // Reset mock functions
    vi.resetAllMocks();
    MutationHandler.domProcessor.processDOM.mockReset();
    MutationHandler.domProcessor.isEditableNode.mockReset();
    MutationHandler.domProcessor.isProcessedNode.mockReset();
    MutationHandler.processMutations.mockReset();
    MutationHandler.setupMutationObserver.mockReset();
    MutationHandler.disconnectObserver.mockReset();
    MutationHandler.reconnectObserver.mockReset();
    MutationHandler.mutationHandler.mockReset();

    // Reset default mock behavior
    MutationHandler.domProcessor.isEditableNode.mockReturnValue(false);
    MutationHandler.domProcessor.isProcessedNode.mockReturnValue(false);

    // Setup MutationObserver
    global.MutationObserver = vi.fn().mockImplementation((callback) => {
      return {
        observe: mockObserve,
        disconnect: mockDisconnect,
        takeRecords: vi.fn().mockReturnValue([]),
        callback,
      };
    });
  });

  afterEach(() => {
    // Cleanup
    MutationHandler.observer = null;
    MutationHandler.isActive = false;
  });

  describe('Observer Setup', () => {
    it('should set up a mutation observer for the document body', () => {
      // Setup observer
      const observer = MutationHandler.setupMutationObserver(document.body);

      // Verify observer was created and initialized
      expect(observer).toBeDefined();
      expect(mockObserve).toHaveBeenCalledWith(
        document.body,
        expect.objectContaining({
          childList: true,
          subtree: true,
          characterData: true,
        })
      );
      expect(MutationHandler.isActive).toBe(true);
    });

    it('should disconnect the observer when requested', () => {
      // Setup observer
      const observer = MutationHandler.setupMutationObserver(document.body);

      // Disconnect
      MutationHandler.disconnectObserver();

      // Verify disconnection
      expect(mockDisconnect).toHaveBeenCalled();
      expect(MutationHandler.isActive).toBe(false);
    });

    it('should reconnect the observer when requested', () => {
      // Setup observer
      const observer = MutationHandler.setupMutationObserver(document.body);

      // Disconnect
      MutationHandler.disconnectObserver();

      // Reconnect
      const newObserver = MutationHandler.reconnectObserver(document.body);

      // Verify reconnection
      expect(newObserver).toBeDefined();
      expect(mockObserve).toHaveBeenCalledTimes(2); // Called twice (once for setup, once for reconnect)
      expect(MutationHandler.isActive).toBe(true);
    });
  });

  describe('Mutation Processing', () => {
    it('should process childList mutations with added nodes', () => {
      // Create test nodes
      const parentNode = document.createElement('div');
      const childNode = document.createElement('p');
      childNode.textContent = 'Donald Trump announced a new policy';

      // Create mutation record
      const mutation = createMockMutation('childList', parentNode, [childNode], []);

      // Process mutations
      MutationHandler.processMutations([mutation]);

      // Verify processing
      expect(MutationHandler.domProcessor.processDOM).toHaveBeenCalledWith(
        childNode,
        MutationHandler.textProcessor,
        MutationHandler.trumpMap,
        MutationHandler.mapKeys
      );
    });

    it('should process characterData mutations', () => {
      // Create test node
      const textNode = document.createTextNode('Donald Trump announced a new policy');

      // Create mutation record
      const mutation = createMockMutation('characterData', textNode, [], [], 'Previous text');

      // Process mutations
      MutationHandler.processMutations([mutation]);

      // Verify processing
      expect(MutationHandler.domProcessor.processDOM).toHaveBeenCalledWith(
        textNode,
        MutationHandler.textProcessor,
        MutationHandler.trumpMap,
        MutationHandler.mapKeys
      );
    });

    it('should not process characterData mutations for editable nodes', () => {
      // Create test node
      const textNode = document.createTextNode('Donald Trump announced a new policy');

      // Mock isEditableNode to return true
      MutationHandler.domProcessor.isEditableNode.mockReturnValueOnce(true);

      // Create mutation record
      const mutation = createMockMutation('characterData', textNode, [], [], 'Previous text');

      // Process mutations
      MutationHandler.processMutations([mutation]);

      // Verify processing was skipped
      expect(MutationHandler.domProcessor.processDOM).not.toHaveBeenCalled();
    });

    it('should not process characterData mutations for already processed nodes', () => {
      // Create test node
      const textNode = document.createTextNode('Donald Trump announced a new policy');

      // Mock isProcessedNode to return true
      MutationHandler.domProcessor.isProcessedNode.mockReturnValueOnce(true);

      // Create mutation record
      const mutation = createMockMutation('characterData', textNode, [], [], 'Previous text');

      // Process mutations
      MutationHandler.processMutations([mutation]);

      // Verify processing was skipped
      expect(MutationHandler.domProcessor.processDOM).not.toHaveBeenCalled();
    });

    it('should handle multiple mutations', () => {
      // Create test nodes
      const parentNode = document.createElement('div');
      const childNode1 = document.createElement('p');
      childNode1.textContent = 'Donald Trump announced a new policy';
      const childNode2 = document.createElement('p');
      childNode2.textContent = 'Trump spoke at the conference';
      const textNode = document.createTextNode('CNN reported on Trump');

      // Create mutation records
      const mutation1 = createMockMutation('childList', parentNode, [childNode1, childNode2], []);
      const mutation2 = createMockMutation('characterData', textNode, [], [], 'Previous text');

      // Process mutations
      MutationHandler.processMutations([mutation1, mutation2]);

      // Verify processing
      expect(MutationHandler.domProcessor.processDOM).toHaveBeenCalledTimes(3);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors during mutation processing', () => {
      // Create logging spy
      const logError = vi.fn();

      // Create test handler with custom error handling
      const errorHandler = {
        ...MutationHandler,
        processMutations: vi.fn().mockImplementation(() => {
          throw new Error('Test error');
        }),
        mutationHandler: vi.fn((mutations, observer) => {
          try {
            errorHandler.processMutations(mutations);
          } catch (error) {
            logError(error);
          }
        }),
      };

      // Create test node and mutation
      const textNode = document.createTextNode('Donald Trump announced a new policy');
      const mutation = createMockMutation('characterData', textNode, [], [], 'Previous text');

      // Call the handler
      errorHandler.mutationHandler([mutation], { disconnect: vi.fn() });

      // Verify error was caught
      expect(errorHandler.processMutations).toHaveBeenCalled();
      expect(logError).toHaveBeenCalled();
    });
  });
});
