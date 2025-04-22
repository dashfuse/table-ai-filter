
// Debounce a function

export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;
    
    return function(...args: Parameters<T>): void {
      const later = () => {
        timeout = null;
        func(...args);
      };
      
      if (timeout !== null) {
        clearTimeout(timeout);
      }
      
      timeout = setTimeout(later, wait);
    };
  }
  
  /**
   * Check if running in browser environment
   */
  export const isBrowser = typeof window !== 'undefined';
  
  /**
   * Get API key from environment with appropriate fallbacks
   */
  export function getApiKey(providedKey?: string): string | undefined {
    if (providedKey) return providedKey;
    
    if (isBrowser) {
      // Check for window.__env if using runtime injection
      const windowEnv = (window as any).__env || {};
      
      return (
        windowEnv.OPENAI_API_KEY ||
        process.env.REACT_APP_OPENAI_API_KEY ||
        process.env.NEXT_PUBLIC_OPENAI_API_KEY ||
        process.env.OPENAI_API_KEY
      );
    }
    
    return process.env.OPENAI_API_KEY;
  }
  
  /**
   * Safely parse JSON with error handling
   */
  export function safeJsonParse<T>(jsonString: string, fallback: T): T {
    try {
      return JSON.parse(jsonString) as T;
    } catch (e) {
      console.error('Failed to parse JSON:', e);
      return fallback;
    }
  }
  
  /**
   * Extract text content from potentially complex column headers
   * (handles React elements, functions, etc.)
   */
  export function extractHeaderText(header: any): string {
    if (!header) return '';
    
    // If it's a string, return directly
    if (typeof header === 'string') return header;
    
    // If it's a function, try to call it (without args)
    if (typeof header === 'function') {
      try {
        const result = header();
        return extractHeaderText(result);
      } catch {
        return '';
      }
    }
    
    // If it's a React element, try to extract displayName or type name
    if (header.type && (header.type.displayName || header.type.name)) {
      return header.type.displayName || header.type.name;
    }
    
    // For other objects, try toString or stringify
    try {
      return header.toString ? header.toString() : JSON.stringify(header);
    } catch {
      return '';
    }
  }