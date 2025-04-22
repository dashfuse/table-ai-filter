import { useState, useCallback } from 'react';
import { 
  AIFilterOptions,
  AIFilterResult,
  ParseResult,
  TableAdapter,
} from './types';
import { parseNaturalLanguage, createGenericTextSearch } from './AIFilterParser';

/**
 * Base hook for AI filtering
 * Works with any table library through the adapter pattern
 */
export function useAIFilter<TAdapter extends TableAdapter = TableAdapter>({
  adapter,
  apiKey,
  endpoint,
  model,
  parseQuery: customParseQuery,
  onError,
  onSuccess,
  enableGlobalFilterFallback = true,
}: AIFilterOptions<TAdapter>): AIFilterResult {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);

  // Clear any error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    adapter.clearFilters();
    setExplanation(null);
  }, [adapter]);

  // Main function to process a query
  const processQuery = useCallback(async (explicitQuery?: string) => {
    const queryToProcess = explicitQuery !== undefined ? explicitQuery : query;
    
    if (!queryToProcess.trim()) {
      clearFilters();
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    setExplanation(null);
    
    try {
      // Get column metadata from the adapter
      const columnMetadata = adapter.getColumnMetadata();
      const currentFilters = adapter.getFilters();
      
      // Use custom parser or default
      let result: ParseResult;
      if (customParseQuery) {
        result = await customParseQuery(queryToProcess, columnMetadata);
      } else {
        result = await parseNaturalLanguage({
          query: queryToProcess,
          columnMetadata,
          currentFilters,
          apiKey,
          endpoint,
          model
        });
      }
      
      if (result.success) {
        // Convert filters to library-specific format
        const libraryFilters = adapter.convertToLibraryFilters(result.filters);
        
        // Apply filters
        adapter.applyFilters(libraryFilters);
        
        // Set explanation
        if (result.explanation) {
          setExplanation(result.explanation);
        }
        
        // Call success callback
        if (onSuccess) {
          onSuccess(result);
        }
      } else {
        // Handle parsing failure
        const errorMessage = result.error || 'Failed to understand the query';
        
        // Try fallback to global filter if enabled
        if (enableGlobalFilterFallback && adapter.applyGlobalFilter) {
          adapter.applyGlobalFilter(queryToProcess);
          setExplanation('Using simple text search across all columns.');
        }
        
        // Still set the error
        setError(errorMessage);
        
        // Call error callback
        if (onError) {
          onError(errorMessage);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      
      // Try fallback
      if (enableGlobalFilterFallback && adapter.applyGlobalFilter) {
        adapter.applyGlobalFilter(queryToProcess);
        setExplanation('Using simple text search across all columns.');
      }
      
      // Call error callback
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [
    query,
    adapter,
    apiKey,
    endpoint,
    model,
    customParseQuery,
    enableGlobalFilterFallback,
    onSuccess,
    onError,
    clearFilters
  ]);

  return {
    query,
    setQuery,
    isProcessing,
    error,
    explanation,
    processQuery,
    clearFilters,
    clearError
  };
}