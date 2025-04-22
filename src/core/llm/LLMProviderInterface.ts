import { ColumnMetadata, ParseResult } from '../types';

/**
 * Configuration options for LLM providers
 */
export interface LLMProviderOptions {
  apiKey?: string;
  endpoint?: string;
  model?: string;
  [key: string]: any; // Allow additional provider-specific options
}

/**
 * Common interface for all LLM providers
 */
export interface LLMProviderInterface {
  /**
   * Parse a natural language query into filter conditions
   */
  parseQuery(
    query: string, 
    columnMetadata: ColumnMetadata[],
    currentFilters: any[]
  ): Promise<ParseResult>;
  
  /**
   * Get provider name
   */
  getName(): string;
  
  /**
   * Check if the provider is configured correctly
   */
  isConfigured(): boolean;
}

/**
 * Factory function type for creating LLM providers
 */
export type LLMProviderFactory = (options: LLMProviderOptions) => LLMProviderInterface;

/**
 * Registry of available LLM providers
 */
export class LLMProviderRegistry {
  private static providers: Record<string, LLMProviderFactory> = {};
  
  /**
   * Register a new LLM provider
   */
  static register(name: string, factory: LLMProviderFactory): void {
    LLMProviderRegistry.providers[name] = factory;
  }
  
  /**
   * Get a provider factory by name
   */
  static getProvider(name: string): LLMProviderFactory | undefined {
    return LLMProviderRegistry.providers[name];
  }
  
  /**
   * Get all registered provider names
   */
  static getAvailableProviders(): string[] {
    return Object.keys(LLMProviderRegistry.providers);
  }
}