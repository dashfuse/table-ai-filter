import React from 'react';
import { AIFilterComponentProps, TableAdapter } from '../../core/types';
import { AIFilterComponent } from '../../core/AIFilterComponent';
import { TanStackAdapter } from './TanStackAdapter';
import { Table, ColumnFiltersState } from '@tanstack/react-table';

/**
 * TanStack-specific props for AIFilter
 */
export interface TanStackAIFilterProps extends Omit<AIFilterComponentProps, 'adapter'> {
  table: Table<any>;
}

/**
 * AIFilter component for TanStack Table
 */
export const AIFilter: React.FC<TanStackAIFilterProps> = ({
  table,
  ...rest
}) => {
  // Create adapter for TanStack table
  const adapter = new TanStackAdapter(table);
  
  // Pass adapter to base component
  return <AIFilterComponent adapter={adapter} {...rest} />;
};

/**
 * Hook for using AIFilter with TanStack Table
 */
export interface UseTanStackAIFilterOptions extends Omit<AIFilterComponentProps, 'adapter'> {
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