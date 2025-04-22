import { ColumnMetadata, ParseResult } from '../types';
import { LLMProviderInterface, LLMProviderOptions, LLMProviderRegistry } from './LLMProviderInterface';
import { createPrompt, validateParseResult } from './promptUtils';

/**
 * Anthropic Claude-specific provider options
 */
export interface ClaudeProviderOptions extends LLMProviderOptions {
  apiKey?: string;
  endpoint?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  anthropicVersion?: string;
}

/**
 * Anthropic Claude LLM provider implementation
 */
export class ClaudeProvider implements LLMProviderInterface {
  private apiKey?: string;
  private endpoint: string;
  private model: string;
  private temperature: number;
  private maxTokens: number;
  private anthropicVersion: string;
  
  constructor(options: ClaudeProviderOptions) {
    this.apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY;
    this.endpoint = options.endpoint || 'https://api.anthropic.com/v1/messages';
    this.model = options.model || 'claude-3-haiku-20240307';
    this.temperature = options.temperature || 0.1;
    this.maxTokens = options.maxTokens || 500;
    this.anthropicVersion = options.anthropicVersion || '2023-06-01';
  }
  
  getName(): string {
    return 'claude';
  }
  
  isConfigured(): boolean {
    return !!this.apiKey;
  }
  
  async parseQuery(
    query: string,
    columnMetadata: ColumnMetadata[],
    currentFilters: any[]
  ): Promise<ParseResult> {
    try {
        if (!this.apiKey) {
            return {
                success: false,
                filters: [],
                error: 'Anthropic API key is required. Provide it via apiKey option or environment variable.'
            };
        }
      
      // Create the prompt for the LLM
      const promptContent = createPrompt(query, columnMetadata, currentFilters);
      
      // Call the Anthropic Claude API
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey || '',  // Provide empty string as fallback
            'anthropic-version': this.anthropicVersion,
          } as HeadersInit,
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: promptContent }],
          temperature: this.temperature,
          max_tokens: this.maxTokens,
          system: "You help convert natural language table filter queries into structured filter objects. Respond only with valid JSON.",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API request failed: ${response.status} ${errorData?.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const content = data.content?.[0]?.text || '';
      
      // Parse the JSON response
      try {
        // Extract JSON if it's embedded in additional text
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : content;
        
        const result = JSON.parse(jsonStr) as ParseResult;
        
        // Validate the parsed result
        return validateParseResult(result, columnMetadata);
      } catch (parseError) {
        console.error('Failed to parse LLM response:', parseError);
        return {
          success: false,
          filters: [],
          error: 'Failed to understand the query. Please try rephrasing it.'
        };
      }
    } catch (error) {
      console.error('Error in Claude parsing:', error);
      return {
        success: false,
        filters: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

// Register the Claude provider
LLMProviderRegistry.register('claude', (options: LLMProviderOptions) => {
  return new ClaudeProvider(options as ClaudeProviderOptions);
});