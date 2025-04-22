import { 
    ColumnMetadata, 
    FilterCondition, 
    ParseOptions, 
    ParseResult 
  } from './types';
  

// Parses a natural language query into structured filter conditions

  export async function parseNaturalLanguage({
    query,
    columnMetadata,
    currentFilters = [],
    apiKey = process.env.REACT_APP_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
    endpoint = 'https://api.openai.com/v1/chat/completions',
    model = 'gpt-3.5-turbo'
  }: ParseOptions): Promise<ParseResult> {
    try {
      // Validate required parameters
      if (!apiKey) {
        throw new Error('OpenAI API key is required. Provide it via apiKey prop or environment variable.');
      }
  
      // Create the prompt for the LLM
      const prompt = createPrompt(query, columnMetadata, currentFilters);
      
      // Call the LLM API
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1, // Low temperature for more deterministic results
          max_tokens: 500,
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
      console.error('Error in AI parsing:', error);
      return {
        success: false,
        filters: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
  /**
   * Creates the prompt for the LLM
   */
  function createPrompt(
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
   */
  function validateParseResult(
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