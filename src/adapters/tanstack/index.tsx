import * as React from 'react';
import { TableAdapter } from '../../core/types';
import { EnhancedAIFilterComponentProps } from '../../core/AIFilterComponent';
import { AIFilterComponent } from '../../core/AIFilterComponent';
import { TanStackAdapter } from './TanStackAdapter';
import { Table, ColumnFiltersState } from '@tanstack/react-table';
import { LLMProviderOptions } from '../../core/llm/LLMProviderInterface';

/**
 * TanStack-specific props for AIFilter with LLM provider support
 */
export interface TanStackAIFilterProps extends Omit<EnhancedAIFilterComponentProps, 'adapter'> {
  /**
   * TanStack Table instance
   */
  table: Table<any>;
  
  /**
   * LLM Provider settings
   */
  llmProvider?: string;  // 'openai', 'claude', etc.
  llmOptions?: LLMProviderOptions;
}

/**
 * AIFilter component for TanStack Table
 * Now with support for different LLM providers
 */
export const AIFilter: React.FC<TanStackAIFilterProps> = ({
  table,
  llmProvider = 'openai',
  llmOptions = {},
  ...rest
}) => {
  // Create adapter for TanStack table
  const adapter = new TanStackAdapter(table);
  
  // Pass adapter and LLM provider options to base component
  return React.createElement(AIFilterComponent, { 
    adapter, 
    llmProvider,
    llmOptions,
    ...rest 
  });
};

/**
 * Hook for using AIFilter with TanStack Table
 */
export interface UseTanStackAIFilterOptions extends Omit<EnhancedAIFilterComponentProps, 'adapter'> {
  table: Table<any>;
}

/**
 * Custom hook for TanStack Table AI filtering
 */
export { useAIFilter } from '../../core/useAIFilter';

/**
 * Export the adapter for advanced usage
 */
export { TanStackAdapter };

/**
 * Export LLM provider utilities
 */
export { getAvailableLLMProviders } from '../../core/AIFilterParser';