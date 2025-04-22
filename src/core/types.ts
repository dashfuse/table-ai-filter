
// Common types and interfaces for the table-ai-filter package


// Core column metadata used for LLM parsing
export interface ColumnMetadata {
    id: string;
    header?: string;
    accessorKey?: string;
    filterType: 'text' | 'range' | 'select' | 'multi';
    possibleValues?: any[];
  }
  
  // Core filter condition returned by LLM
  export interface FilterCondition {
    id: string;
    operator: 'contains' | 'equals' | 'startsWith' | '>' | '<' | '>=' | '<=' | 'between' | 'in';
    value: any;
  }
  
  // Result from parsing a natural language query
  export interface ParseResult {
    success: boolean;
    filters: FilterCondition[];
    explanation?: string;
    error?: string;
  }
  
  // Options for the parse function
  export interface ParseOptions {
    query: string;
    columnMetadata: ColumnMetadata[];
    currentFilters?: any[];
    apiKey?: string;
    endpoint?: string;
    model?: string;
  }
  
  // Adapter interface for different table libraries
  export interface TableAdapter<TColumnFilters = any[]> {
    // Get column metadata
    getColumnMetadata(): ColumnMetadata[];
    
    // Get current filter state
    getFilters(): TColumnFilters;
    
    // Apply filters
    applyFilters(filters: TColumnFilters): void;
    
    // Apply global filter (for fallbacks)
    applyGlobalFilter?(query: string): void;
    
    // Clear all filters
    clearFilters(): void;
    
    // Convert the generic FilterCondition[] to library-specific filters
    convertToLibraryFilters(conditions: FilterCondition[]): TColumnFilters;
  }
  
  // Base options for useAIFilter hook
  export interface AIFilterOptions<TAdapter extends TableAdapter = TableAdapter> {
    // Table adapter
    adapter: TAdapter;
    
    // API configuration
    apiKey?: string;
    endpoint?: string;
    model?: string;
    
    // Custom parser
    parseQuery?: (query: string, columnMetadata: ColumnMetadata[]) => Promise<ParseResult>;
    
    // Callbacks
    onError?: (error: string) => void;
    onSuccess?: (result: ParseResult) => void;
    
    // Behavior
    enableGlobalFilterFallback?: boolean;
  }
  
  // Return type for useAIFilter hook
  export interface AIFilterResult {
    // Query state
    query: string;
    setQuery: (query: string) => void;
    
    // Processing state
    isProcessing: boolean;
    error: string | null;
    explanation: string | null;
    
    // Actions
    processQuery: (query?: string) => Promise<void>;
    clearFilters: () => void;
    clearError: () => void;
  }
  
  // Base props for AIFilterComponent
  export interface AIFilterComponentProps extends AIFilterOptions {
    // UI customization
    placeholder?: string;
    buttonText?: string;
    loadingText?: string;
    showExplanation?: boolean;
    className?: string;
    classes?: Record<string, string>;
    
    // Behavior
    submitOnEnter?: boolean;
    autoSubmitDelay?: number;
    clearAfterSubmit?: boolean;
    
    // Additional props
    disabled?: boolean;
    ariaLabel?: string;
  }