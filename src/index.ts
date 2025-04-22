/**
 * table-ai-filter - AI-powered natural language filtering for data tables
 * @packageDocumentation
 */

// Re-export core types
export type {
    ColumnMetadata,
    FilterCondition,
    ParseResult,
    ParseOptions,
    TableAdapter,
    AIFilterOptions,
    AIFilterResult,
    AIFilterComponentProps
  } from './core/types';
  
  // Export core functionality
  export { parseNaturalLanguage, createGenericTextSearch } from './core/AIFilterParser';
  export { useAIFilter } from './core/useAIFilter';
  export { AIFilterComponent } from './core/AIFilterComponent';
  
  // Export utils
  export * from './utils';
  
  // Note: TanStack adapter is not exported here.
  // It's available at 'table-ai-filter/tanstack'