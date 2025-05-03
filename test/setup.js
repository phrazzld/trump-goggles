// Chrome API mock
global.chrome = {
  storage: {
    sync: {
      get: vi.fn(),
      set: vi.fn(),
    },
  },
  action: {
    onClicked: {
      addListener: vi.fn(),
    },
  },
  runtime: {
    openOptionsPage: vi.fn(),
  },
  browserAction: {
    onClicked: {
      addListener: vi.fn(),
    },
  },
};

// Additional browser mocks can be added here as needed