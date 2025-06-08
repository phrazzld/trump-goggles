/**
 * Trump Mappings Module Type Declarations
 *
 * This file provides TypeScript type definitions for the TrumpMappings module.
 */

/**
 * Trump mapping entry with regex pattern and nickname
 */
export interface TrumpMapping {
  /** Regular expression to match phrases */
  regex: RegExp;
  /** Trump's nickname for the matched phrase */
  nick: string;
  /** Optional key terms for additional matching */
  keyTerms?: string[];
  /** Whether to match partial words */
  matchesPartialWords?: boolean;
}

/**
 * Trump mappings interface
 */
export interface TrumpMappingsInterface {
  /**
   * Returns regex-nickname pairs for text replacement
   * @returns Object with mappings
   */
  getReplacementMap: () => Record<string, TrumpMapping>;

  /**
   * Gets the keys of all available mappings
   * @returns Array of mapping keys
   */
  getKeys: () => string[];
}

/**
 * Immutable trump mapping entry with readonly properties
 */
export interface ImmutableTrumpMapping {
  /** Regular expression to match phrases */
  readonly regex: RegExp;
  /** Trump's nickname for the matched phrase */
  readonly nick: string;
  /** Optional key terms for additional matching */
  readonly keyTerms?: readonly string[];
  /** Whether to match partial words */
  readonly matchesPartialWords?: boolean;
}

/**
 * Immutable record type for trump mappings
 */
export type ImmutableTrumpMappingsRecord = {
  readonly [K in string]: ImmutableTrumpMapping;
};

/**
 * Immutable trump mappings interface with readonly return types
 */
export interface ImmutableTrumpMappingsInterface {
  /**
   * Returns immutable regex-nickname pairs for text replacement
   * @returns Readonly object with mappings
   */
  readonly getReplacementMap: () => ImmutableTrumpMappingsRecord;

  /**
   * Gets the keys of all available mappings
   * @returns Readonly array of mapping keys
   */
  readonly getKeys: () => readonly string[];
}

declare global {
  interface Window {
    /** Trump Mappings module */
    TrumpMappings: TrumpMappingsInterface;

    /** @deprecated Use TrumpMappings.getReplacementMap() instead */
    buildTrumpMap?: () => Record<string, TrumpMapping>;

    /** Global initialization flag */
    trumpGogglesInitialized: boolean;
  }
}

/**
 * The TrumpMappings module provides Trump nickname mappings and utilities.
 */
declare const TrumpMappings: TrumpMappingsInterface;

export default TrumpMappings;
