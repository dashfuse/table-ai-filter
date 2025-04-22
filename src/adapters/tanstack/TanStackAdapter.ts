import { TableAdapter, ColumnMetadata, FilterCondition } from '../../core/types';
import { Table, ColumnFiltersState } from '@tanstack/react-table';


// Adapter for TanStack Table integration

export class TanStackAdapter implements TableAdapter<ColumnFiltersState> {
  constructor(private table: Table<any>) {
    if (!table) {
      throw new Error('TanStackAdapter requires a valid table instance');
    }
  }


// Extract column metadata from TanStack Table

  getColumnMetadata(): ColumnMetadata[] {
    const columns = this.table.getAllLeafColumns();
    
    return columns.map(column => {
      const accessorKey = 'accessorKey' in column.columnDef 
        ? (column.columnDef as any).accessorKey as string | undefined 
        : undefined;
        
      return {
        id: column.id,
        header: typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id,
        accessorKey: accessorKey,
        filterType: this.determineFilterType(column),
        possibleValues: this.getPossibleValues(column)
      };
    });
  }

  /**
   * Get current filter state from TanStack Table
   */
  getFilters(): ColumnFiltersState {
    return this.table.getState().columnFilters;
  }

  /**
   * Apply filters to TanStack Table
   */
  applyFilters(filters: ColumnFiltersState): void {
    this.table.setColumnFilters(filters);
  }

  /**
   * Apply global filter for fallback scenarios
   */
  applyGlobalFilter(query: string): void {
    this.table.setGlobalFilter(query);
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.table.resetColumnFilters();
    this.table.resetGlobalFilter();
  }

  /**
   * Convert generic filter conditions to TanStack Table column filters
   */
  convertToLibraryFilters(conditions: FilterCondition[]): ColumnFiltersState {
    const columnMetadata = this.getColumnMetadata();
    
    return conditions.map(filter => {
      const { id, operator, value } = filter;
      const column = columnMetadata.find(col => col.id === id);
      
      if (!column) return null; // Skip if column not found
      
      const filterType = column.filterType;
      let tanstackFilterValue;
      
      // Convert based on filter type
      switch (filterType) {
        case 'text':
          // For text columns, usually just pass the value directly
          tanstackFilterValue = value;
          break;
          
        case 'range':
          // For range filters, we need to create a min/max object
          if (operator === '>' || operator === '>=') {
            tanstackFilterValue = { min: value, max: undefined };
          } else if (operator === '<' || operator === '<=') {
            tanstackFilterValue = { min: undefined, max: value };
          } else if (operator === 'between') {
            tanstackFilterValue = { min: value[0], max: value[1] };
          } else {
            tanstackFilterValue = value; // Direct equality
          }
          break;
          
        case 'select':
          // For select filters, just pass the value
          tanstackFilterValue = value;
          break;
          
        case 'multi':
          // For multi-select filters, ensure the value is an array
          tanstackFilterValue = Array.isArray(value) ? value : [value];
          break;
          
        default:
          tanstackFilterValue = value;
      }
      
      return {
        id,
        value: tanstackFilterValue
      };
    }).filter(Boolean) as ColumnFiltersState; // Remove any null entries
  }

  /**
   * Determine filter type based on column configuration
   */
  private determineFilterType(column: any): ColumnMetadata['filterType'] {
    const filterFn = column.getFilterFn()?.name;
    
    if (!filterFn) return 'text'; // Default
    
    // Map filter functions to types
    if (filterFn.includes('between') || filterFn.includes('Range')) return 'range';
    if (filterFn.includes('equals')) return 'select';
    if (filterFn.includes('includes') && 
        (Array.isArray(column.getFilterValue()) || filterFn.includes('arr'))) return 'multi';
    
    return 'text';
  }

  /**
   * Get possible values for select/multi filters
   */
  private getPossibleValues(column: any): any[] {
    // Check if the column has predefined filter options in meta
    if (column.columnDef.meta?.filterOptions) {
      return column.columnDef.meta.filterOptions;
    }
    
    return []; // No predefined values
  }
}