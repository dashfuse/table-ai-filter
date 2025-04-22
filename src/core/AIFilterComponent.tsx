import React, { useState, useEffect, useRef } from 'react';
import { AIFilterComponentProps } from './types';
import { useAIFilter } from './useAIFilter';

// Default CSS class names
const defaultClasses = {
  container: 'ai-filter-container',
  inputWrapper: 'ai-filter-input-wrapper',
  input: 'ai-filter-input',
  button: 'ai-filter-button',
  loadingIndicator: 'ai-filter-loading',
  errorContainer: 'ai-filter-error-container',
  errorMessage: 'ai-filter-error',
  explanationContainer: 'ai-filter-explanation-container',
  explanation: 'ai-filter-explanation',
};

/**
 * Base AIFilterComponent that works with any table library
 * through the adapter pattern
 */
export const AIFilterComponent: React.FC<AIFilterComponentProps> = ({
  // Adapter
  adapter,
  
  // API configuration
  apiKey,
  endpoint,
  model,
  
  // Custom parser
  parseQuery,
  
  // Callbacks
  onError,
  onSuccess,
  
  // UI customization
  placeholder = 'Filter with AI (e.g., "active products over $100")',
  buttonText = 'Filter',
  loadingText = 'Processing...',
  showExplanation = true,
  className = '',
  classes = {},
  
  // Behavior
  submitOnEnter = true,
  autoSubmitDelay = 0,
  clearAfterSubmit = false,
  enableGlobalFilterFallback = true,
  
  // Additional props
  disabled = false,
  ariaLabel = 'AI filter input',
}) => {
  // Timer refs for auto-submit
  const autoSubmitTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Merge default classes with user-provided ones
  const mergedClasses = {
    ...defaultClasses,
    ...classes,
  };
  
  // Use the AIFilter hook
  const {
    query,
    setQuery,
    isProcessing,
    error,
    explanation,
    processQuery,
    clearFilters,
    clearError,
  } = useAIFilter({
    adapter,
    apiKey,
    endpoint,
    model,
    parseQuery,
    onError,
    onSuccess,
    enableGlobalFilterFallback,
  });

  // Handle input change
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    clearError();
    
    // Handle auto-submit if enabled
    if (autoSubmitDelay > 0 && newQuery.trim()) {
      if (autoSubmitTimerRef.current) {
        clearTimeout(autoSubmitTimerRef.current);
      }
      
      autoSubmitTimerRef.current = setTimeout(() => {
        handleSubmit();
      }, autoSubmitDelay);
    } else if (autoSubmitDelay > 0 && !newQuery.trim()) {
      // If query is cleared and auto-submit is enabled, clear filters
      clearFilters();
    }
  };

  // Handle form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || isProcessing || disabled) return;
    
    await processQuery();
    
    if (clearAfterSubmit) {
      setQuery('');
    }
  };

  // Handle key down for Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (submitOnEnter && e.key === 'Enter' && !isProcessing && !disabled) {
      handleSubmit();
    }
  };

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (autoSubmitTimerRef.current) {
        clearTimeout(autoSubmitTimerRef.current);
      }
    };
  }, []);

  return (
    <div className={`${mergedClasses.container} ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className={mergedClasses.inputWrapper}>
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isProcessing}
            className={mergedClasses.input}
            aria-label={ariaLabel}
          />
          
          <button 
            type="submit" 
            disabled={disabled || isProcessing || !query.trim()}
            className={mergedClasses.button}
            aria-label="Apply AI filter"
          >
            {isProcessing ? (
              <>
                <span className={mergedClasses.loadingIndicator}></span>
                {loadingText}
              </>
            ) : buttonText}
          </button>
        </div>
      </form>
      
      {/* Error message */}
      {error && (
        <div className={mergedClasses.errorContainer}>
          <div className={mergedClasses.errorMessage} role="alert">
            {error}
          </div>
        </div>
      )}
      
      {/* Explanation */}
      {showExplanation && explanation && !error && (
        <div className={mergedClasses.explanationContainer}>
          <div className={mergedClasses.explanation} aria-live="polite">
            {explanation}
          </div>
        </div>
      )}
    </div>
  );
};