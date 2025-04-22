import { ColumnMetadata, ParseResult } from '../types';

/**
 * Creates the prompt for the LLM
 * Common for all LLM providers
 */
export function createPrompt(
  query: string, 
  columnMetadata: ColumnMetadata[], 
  currentFilters: any[]
): string {
  return `
    You are an AI assistant that converts natural language table filter queries into structured filters.
    
    TABLE STRUCTURE:
    ${JSON.stringify(columnMetadata, null, 2)}
    
    CURRENT FILTERS:
    ${JSON.stringify(currentFilters, null, 2)}
    
    USER QUERY: "${query}"
    
    TASK:
    Analyze the query and convert it to appropriate filter operations based on the table structure.
    
    Identify which columns are being referenced and what filter values should be applied.
    Handle column references even if they are indirect or use synonyms.
    
    RESPONSE FORMAT:
    Return a JSON object with these fields:
    - success: true if you were able to parse the query, false otherwise
    - filters: array of filter objects, each with:
      - id: the column id to filter
      - operator: one of "contains", "equals", "startsWith", ">", "<", ">=", "<=", "between", "in"
      - value: the value to filter by (appropriate for the filter type)
    - explanation: brief explanation of how you interpreted the query
    - error: error message if parsing failed

    Example queries and expected outputs:
    
    Query: "Jeans and shirts more than 500"
    {
      "success": true,
      "filters": [
        {
          "id": "category",
          "operator": "in",
          "value": ["Jeans", "Shirts"]
        },
        {
          "id": "price",
          "operator": ">",
          "value": 500
        }
      ],
      "explanation": "Filtered for product categories 'Jeans' and 'Shirts' with a minimum price of 500."
    }
    
    Query: "active items"
    {
      "success": true,
      "filters": [
        {
          "id": "status",
          "operator": "equals",
          "value": "Active"
        }
      ],
      "explanation": "Filtered for items with 'Active' status."
    }
    
    Query: "ID starting with P"
    {
      "success": true,
      "filters": [
        {
          "id": "id",
          "operator": "startsWith",
          "value": "P"
        }
      ],
      "explanation": "Filtered for product IDs starting with 'P'."
    }
  `;
}

/**
 * Validates the parsed result and ensures it's properly formatted
 * Common for all LLM providers
 */
export function validateParseResult(
  result: ParseResult,
  columnMetadata: ColumnMetadata[]
): ParseResult {
  if (!result.success) return result;
  
  // If no filters but success is true, something is wrong
  if (!result.filters || !Array.isArray(result.filters) || result.filters.length === 0) {
    return {
      success: false,
      filters: [],
      error: 'No filters were identified in the query.'
    };
  }
  
  // Validate each filter against column metadata
  const validFilters = result.filters.filter(filter => {
    const column = columnMetadata.find(col => col.id === filter.id);
    return !!column; // Only keep filters for valid columns
  });
  
  if (validFilters.length === 0) {
    return {
      success: false,
      filters: [],
      error: 'Could not map query to any table columns. Please try different terms.'
    };
  }
  
  return {
    ...result,
    filters: validFilters
  };
}