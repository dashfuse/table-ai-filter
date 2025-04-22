import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { AIFilterComponentProps } from './types';
import { useAIFilter } from './useAIFilter';
import { LLMProviderOptions } from './llm/LLMProviderInterface';

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
  providerBadge: 'ai-filter-provider-badge',
};

/**
 * Enhanced component props with LLM provider settings
 */
export interface EnhancedAIFilterComponentProps extends AIFilterComponentProps {
  // LLM Provider settings
  llmProvider?: string;  // 'openai', 'claude', etc.
  llmOptions?: LLMProviderOptions;
  showProviderBadge?: boolean;
}

/**
 * Base AIFilterComponent that works with any table library
 * through the adapter pattern
 */
export const AIFilterComponent: React.FC<EnhancedAIFilterComponentProps> = ({
  // Adapter
  adapter,
  
  // API configuration
  apiKey,
  endpoint,
  model,
  
  // LLM Provider settings
  llmProvider = 'openai',
  llmOptions = {},
  showProviderBadge = false,
  
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
    llmProvider,
    llmOptions,
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

  // Use React.createElement instead of JSX
  return React.createElement(
    'div',
    { className: `${mergedClasses.container} ${className}` },
    [
      // Form
      React.createElement(
        'form',
        { 
          onSubmit: handleSubmit,
          key: 'form'
        },
        React.createElement(
          'div',
          { className: mergedClasses.inputWrapper },
          [
            // Input
            React.createElement('input', {
              type: 'text',
              value: query,
              onChange: handleQueryChange,
              onKeyDown: handleKeyDown,
              placeholder,
              disabled: disabled || isProcessing,
              className: mergedClasses.input,
              'aria-label': ariaLabel,
              key: 'input'
            }),
            
            // Button
            React.createElement(
              'button',
              {
                type: 'submit',
                disabled: disabled || isProcessing || !query.trim(),
                className: mergedClasses.button,
                'aria-label': 'Apply AI filter',
                key: 'button'
              },
              isProcessing
                ? [
                    React.createElement('span', {
                      className: mergedClasses.loadingIndicator,
                      key: 'loading-indicator'
                    }),
                    loadingText
                  ]
                : buttonText
            )
          ]
        )
      ),
      
      // Provider badge
      showProviderBadge && React.createElement(
        'div',
        {
          className: mergedClasses.providerBadge,
          key: 'provider-badge'
        },
        `Powered by ${llmProvider.charAt(0).toUpperCase()}${llmProvider.slice(1)}`
      ),
      
      // Error message
      error && React.createElement(
        'div',
        { 
          className: mergedClasses.errorContainer,
          key: 'error-container'
        },
        React.createElement(
          'div',
          {
            className: mergedClasses.errorMessage,
            role: 'alert'
          },
          error
        )
      ),
      
      // Explanation
      showExplanation && explanation && !error && React.createElement(
        'div',
        { 
          className: mergedClasses.explanationContainer,
          key: 'explanation-container'
        },
        React.createElement(
          'div',
          {
            className: mergedClasses.explanation,
            'aria-live': 'polite'
          },
          explanation
        )
      )
    ]
  );
};