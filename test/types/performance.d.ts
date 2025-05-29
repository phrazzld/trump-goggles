/**
 * Type definitions for performance testing
 */

export interface TestConfig {
  paragraphs: number;
  referencesPerParagraph: number;
}

export type TestSize = 'small' | 'medium' | 'large' | 'extreme';

export interface MetricsBySize {
  small: number[];
  medium: number[];
  large: number[];
  extreme: number[];
}

export interface AllMetrics {
  generationTime: MetricsBySize;
  processingTime: MetricsBySize;
  tooltipShowTime: MetricsBySize;
  memory: MetricsBySize;
}

export interface PerformanceConfig {
  smallTest: TestConfig;
  mediumTest: TestConfig;
  largeTest: TestConfig;
  extremeTest: TestConfig;
  hoverTestCount: number;
  iterations: number;
}

export interface TestResult {
  size: TestSize;
  generation: number;
  processing: number;
  tooltipShow: number;
  memoryUsage: number;
}

export interface PerformanceTestEnvironment {
  document: Document;
  window: Window;
  tooltipManager?: any;
  domModifier?: any;
}
