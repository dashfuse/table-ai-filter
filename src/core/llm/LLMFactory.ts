import { LLMProviderInterface, LLMProviderOptions, LLMProviderRegistry } from './LLMProviderInterface';

// Import providers to register them
import './OpenAIProvider';
import './ClaudeProvider';

/**
 * Factory for creating LLM providers
 */
export class LLMFactory {
  /**
   * Create an LLM provider by name
   */
  static createProvider(
    name: string = 'openai',
    options: LLMProviderOptions = {}
  ): LLMProviderInterface {
    const factory = LLMProviderRegistry.getProvider(name);
    
    if (!factory) {
      throw new Error(`LLM provider '${name}' is not registered. Available providers: ${LLMProviderRegistry.getAvailableProviders().join(', ')}`);
    }
    
    return factory(options);
  }
  
  /**
   * Get all available provider names
   */
  static getAvailableProviders(): string[] {
    return LLMProviderRegistry.getAvailableProviders();
  }
}