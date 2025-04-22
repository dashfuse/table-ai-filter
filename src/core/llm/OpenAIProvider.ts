import { ColumnMetadata, ParseResult } from '../types';
import { LLMProviderInterface, LLMProviderOptions, LLMProviderRegistry } from './LLMProviderInterface';
import { createPrompt, validateParseResult } from './promptUtils';

/**
 * OpenAI-specific provider options
 */
export interface OpenAIProviderOptions extends LLMProviderOptions {
  apiKey?: string;
  endpoint?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * OpenAI LLM provider implementation
 */
export class OpenAIProvider implements LLMProviderInterface {
  private apiKey?: string;
  private endpoint: string;
  private model: string;
  private temperature: number;
  private maxTokens: number;
  
  constructor(options: OpenAIProviderOptions) {
    this.apiKey = options.apiKey || process.env.OPENAI_API_KEY;
    this.endpoint = options.endpoint || 'https://api.openai.com/v1/chat/completions';
    this.model = options.model || 'gpt-3.5-turbo';
    this.temperature = options.temperature || 0.1;
    this.maxTokens = options.maxTokens || 500;
  }
  
  getName(): string {
    return 'openai';
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
      if (!this.isConfigured()) {
        throw new Error('OpenAI API key is required. Provide it via apiKey option or environment variable.');
      }
      
      // Create the prompt for the LLM
      const prompt = createPrompt(query, columnMetadata, currentFilters);
      
      // Call the OpenAI API
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: this.temperature,
          max_tokens: this.maxTokens,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API request failed: ${response.status} ${errorData?.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
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
      console.error('Error in OpenAI parsing:', error);
      return {
        success: false,
        filters: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

// Register the OpenAI provider
LLMProviderRegistry.register('openai', (options: LLMProviderOptions) => {
  return new OpenAIProvider(options as OpenAIProviderOptions);
});