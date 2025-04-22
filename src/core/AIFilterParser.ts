import { 
    ColumnMetadata, 
    FilterCondition, 
    ParseOptions, 
    ParseResult 
  } from './types';
  import { LLMFactory } from './llm/LLMFactory';
  import { LLMProviderOptions } from './llm/LLMProviderInterface';
  
  /**
   * Enhanced options for parseNaturalLanguage
   */
  export interface EnhancedParseOptions extends ParseOptions {
    llmProvider?: string;  // 'openai', 'claude', etc.
    llmOptions?: LLMProviderOptions;
  }
  
  /**
   * Parses a natural language query into structured filter conditions
   */
  export async function parseNaturalLanguage({
    query,
    columnMetadata,
    currentFilters = [],
    llmProvider = 'openai',
    llmOptions = {},
    apiKey,
    endpoint,
    model,
  }: EnhancedParseOptions): Promise<ParseResult> {
    try {
      // Support legacy options by merging them into llmOptions
      const mergedOptions: LLMProviderOptions = {
        ...llmOptions,
        apiKey: apiKey || llmOptions.apiKey,
        endpoint: endpoint || llmOptions.endpoint,
        model: model || llmOptions.model,
      };
  
      // Create provider based on specified type
      const provider = LLMFactory.createProvider(llmProvider, mergedOptions);
      
      // Use the provider to parse the query
      return await provider.parseQuery(query, columnMetadata, currentFilters);
    } catch (error) {
      console.error('Error in AI parsing:', error);
      return {
        success: false,
        filters: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
  /**
   * Fallback to generic text search if parsing fails
   */
  export function createGenericTextSearch(query: string): FilterCondition[] {
    return [{
      id: 'global',
      operator: 'contains',
      value: query
    }];
  }
  
  /**
   * Get available LLM providers
   */
  export function getAvailableLLMProviders(): string[] {
    return LLMFactory.getAvailableProviders();
  }