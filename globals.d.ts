// This file contains global type declarations specific to tooltip files
// These are simplified versions of interfaces defined in types.d.ts

interface LoggerInterface {
  debug: (message: string, data?: any) => void;
  info: (message: string, data?: any) => void;
  warn: (message: string, data?: any) => void;
  error: (message: string, data?: any) => void;
}

interface PerformanceUtilsInterface {
  throttle: <T extends (...args: any[]) => any>(
    fn: T,
    options: { delay: number; maxWait?: number } | number
  ) => (...args: any[]) => any;

  debounce: <T extends (...args: any[]) => any>(
    fn: T,
    options: { delay: number; maxWait?: number } | number
  ) => (...args: any[]) => any;

  Configs?: {
    input?: { delay: number; maxWait?: number };
    scroll?: { delay: number; maxWait?: number };
    keyboard?: { delay: number; maxWait?: number };
    mutation?: { delay: number; maxWait?: number };
  };
}

interface TooltipManagerInterface {
  initialize: (uiModule: any) => void;
  dispose: () => void;
}

interface SecurityUtilsInterface {
  escapeHTML: (str: string | null | undefined) => string;
}

interface Window {
  Logger?: LoggerInterface;
  PerformanceUtils?: PerformanceUtilsInterface;
  TooltipManager?: TooltipManagerInterface;
  SecurityUtils?: SecurityUtilsInterface;
}
