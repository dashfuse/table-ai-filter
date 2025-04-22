import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  createColumnHelper,
  ColumnFiltersState
} from '@tanstack/react-table';
import { AIFilter } from 'data-table-ai-filter';
import './styles.css'; // Your existing styles

// Sample product data
const products = [
  { 
    id: 'P001',
    name: 'Classic Blue Jeans', 
    price: 59.99, 
    status: 'Active', 
    category: ['Jeans'] 
  },
  { 
    id: 'P002',
    name: 'Slim Fit White Shirt', 
    price: 45.99, 
    status: 'Active', 
    category: ['Shirts'] 
  },
  { 
    id: 'P003',
    name: 'Leather Jacket', 
    price: 199.99, 
    status: 'Active', 
    category: ['Outerwear'] 
  },
  { 
    id: 'P004',
    name: 'Vintage Denim Jacket', 
    price: 129.99, 
    status: 'Inactive', 
    category: ['Outerwear', 'Jeans'] 
  },
  { 
    id: 'P005',
    name: 'Cotton T-shirt', 
    price: 24.99, 
    status: 'Active', 
    category: ['Shirts'] 
  },
  // More products...
];

// Column helper for type safety
const columnHelper = createColumnHelper<typeof products[0]>();

// Column definitions
const columns = [
  columnHelper.accessor('id', {
    header: 'Product ID',
    cell: info => info.getValue(),
    filterFn: 'includesString'
  }),
  columnHelper.accessor('name', {
    header: 'Product Name',
    cell: info => info.getValue(),
    filterFn: 'includesString'
  }),
  columnHelper.accessor('price', {
    header: 'Product Price',
    cell: info => `$${info.getValue().toFixed(2)}`,
    filterFn: 'betweenNumberRange'
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: info => info.getValue(),
    filterFn: 'equalsString',
    meta: {
      filterOptions: ['Active', 'Inactive', 'Archived']
    }
  }),
  columnHelper.accessor('category', {
    header: 'Product Category',
    cell: info => info.getValue().join(', '),
    filterFn: 'arrIncludes',
    meta: {
      filterOptions: ['Jeans', 'Shirts', 'Outerwear', 'Accessories', 'Shoes']
    }
  }),
];

// Example 1: Basic usage with client-side filtering
function ClientSideFilteringExample() {
  // Table state
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  
  // Create the table instance
  const table = useReactTable({
    data: products,
    columns,
    state: {
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });
  
  return (
    <div className="products-container">
      <h1>Products List (Client-side Filtering)</h1>
      
      {/* AI Filter - Basic Usage */}
      <div className="ai-filter-section">
        <h3>Try Natural Language Filtering</h3>
        <AIFilter
          table={table}
          apiKey={process.env.REACT_APP_OPENAI_API_KEY}
          placeholder="Try: 'jeans and shirts more than $50'"
          showExplanation={true}
        />
      </div>
      
      {/* Regular Table Filters (optional) */}
      <div className="standard-filters">
        <h3>Standard Filters</h3>
        <div className="filters-row">
          <input
            placeholder="Filter by ID..."
            value={(table.getColumn('id')?.getFilterValue() as string) ?? ''}
            onChange={e => table.getColumn('id')?.setFilterValue(e.target.value)}
            className="filter-input"
          />
          
          <input
            placeholder="Filter by name..."
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={e => table.getColumn('name')?.setFilterValue(e.target.value)}
            className="filter-input"
          />
          
          {/* Price range filter */}
          <div className="range-filter">
            <input
              type="number"
              placeholder="Min price"
              value={(table.getColumn('price')?.getFilterValue() as {min?: number, max?: number})?.min ?? ''}
              onChange={e => {
                const min = e.target.value ? Number(e.target.value) : undefined;
                const max = (table.getColumn('price')?.getFilterValue() as {min?: number, max?: number})?.max;
                table.getColumn('price')?.setFilterValue({ min, max });
              }}
              className="filter-input"
            />
            <input
              type="number"
              placeholder="Max price"
              value={(table.getColumn('price')?.getFilterValue() as {min?: number, max?: number})?.max ?? ''}
              onChange={e => {
                const max = e.target.value ? Number(e.target.value) : undefined;
                const min = (table.getColumn('price')?.getFilterValue() as {min?: number, max?: number})?.min;
                table.getColumn('price')?.setFilterValue({ min, max });
              }}
              className="filter-input"
            />
          </div>
        </div>
      </div>
      
      {/* Table */}
      <table className="products-table">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id}>
                  {header.isPlaceholder ? null : header.column.columnDef.header}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>{cell.getValue() as React.ReactNode}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {table.getRowModel().rows.length === 0 && (
        <div className="no-results">No products match your filter criteria</div>
      )}
    </div>
  );
}

// Example 2: Server-side filtering
function ServerSideFilteringExample() {
  // State for data and filters
  const [data, setData] = useState(products);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Create the table instance
  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    manualFiltering: true, // Important: tell TanStack we're handling filtering manually
  });
  
  // Mock API call - in a real app, this would be a fetch to your backend
  const fetchFilteredData = async (filters: ColumnFiltersState) => {
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // This would be your API call in a real application
      // const response = await fetch('/api/products', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ filters })
      // });
      // const data = await response.json();
      
      // For demo, we'll filter the data client-side to simulate server filtering
      let filteredData = [...products];
      
      filters.forEach(filter => {
        const { id, value } = filter;
        
        if (id === 'id' && typeof value === 'string') {
          filteredData = filteredData.filter(item => 
            item.id.toLowerCase().includes(value.toLowerCase())
          );
        }
        
        if (id === 'name' && typeof value === 'string') {
          filteredData = filteredData.filter(item => 
            item.name.toLowerCase().includes(value.toLowerCase())
          );
        }
        
        if (id === 'price' && typeof value === 'object') {
          const { min, max } = value as { min?: number, max?: number };
          
          if (min !== undefined) {
            filteredData = filteredData.filter(item => item.price >= min);
          }
          
          if (max !== undefined) {
            filteredData = filteredData.filter(item => item.price <= max);
          }
        }
        
        if (id === 'status' && typeof value === 'string') {
          filteredData = filteredData.filter(item => 
            item.status === value
          );
        }
        
        if (id === 'category' && Array.isArray(value)) {
          filteredData = filteredData.filter(item => 
            value.some(val => item.category.includes(val))
          );
        }
      });
      
      setData(filteredData);
    } catch (error) {
      console.error('Error fetching filtered data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle filter changes
  React.useEffect(() => {
    fetchFilteredData(columnFilters);
  }, [columnFilters]);
  
  return (
    <div className="products-container">
      <h1>Products List (Server-side Filtering)</h1>
      
      {/* AI Filter for server-side */}
      <div className="ai-filter-section">
        <h3>Try Natural Language Filtering</h3>
        <AIFilter
          table={table}
          apiKey={process.env.REACT_APP_OPENAI_API_KEY}
          placeholder="Try: 'active outerwear'"
          showExplanation={true}
        />
        
        {isLoading && <div className="loading-indicator">Loading data...</div>}
      </div>
      
      {/* Table */}
      <table className="products-table">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id}>
                  {header.isPlaceholder ? null : header.column.columnDef.header}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>{cell.getValue() as React.ReactNode}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {table.getRowModel().rows.length === 0 && !isLoading && (
        <div className="no-results">No products match your filter criteria</div>
      )}
    </div>
  );
}

// Example 3: Advanced customization
function CustomizedExample() {
  // Table state
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  
  // Create the table instance
  const table = useReactTable({
    data: products,
    columns,
    state: {
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });
  
  // Custom parser logic
  const customParseQuery = async (query: string, columnMetadata: any[]) => {
    // Simple example of a custom parser for specific patterns
    
    // Check for pattern like "cheap" or "expensive"
    if (query.toLowerCase().includes('cheap')) {
      return {
        success: true,
        filters: [
          {
            id: 'price',
            operator: '<',
            value: 50
          }
        ],
        explanation: 'Found products under $50 (cheap).'
      };
    }
    
    if (query.toLowerCase().includes('expensive')) {
      return {
        success: true,
        filters: [
          {
            id: 'price',
            operator: '>',
            value: 100
          }
        ],
        explanation: 'Found products over $100 (expensive).'
      };
    }
    
    // For other queries, use the default OpenAI parser
    // In a real implementation, you would import the parseNaturalLanguage function
    // This is just a placeholder to show the idea
    return {
      success: false,
      filters: [],
      error: 'Custom parser could not handle this query. Would fallback to LLM in real implementation.'
    };
  };
  
  return (
    <div className="products-container">
      <h1>Products List (Customized Implementation)</h1>
      
      {/* AI Filter with customization */}
      <div className="ai-filter-section">
        <h3>Customized AI Filter</h3>
        <AIFilter
          table={table}
          parseQuery={customParseQuery}
          placeholder="Try: 'cheap' or 'expensive'"
          buttonText="Search"
          showExplanation={true}
          classes={{
            container: 'custom-filter-container',
            input: 'custom-filter-input',
            button: 'custom-filter-button'
          }}
          autoSubmitDelay={1000} // Auto-submit after 1 second of typing
        />
      </div>
      
      {/* Table */}
      <table className="products-table">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id}>
                  {header.isPlaceholder ? null : header.column.columnDef.header}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>{cell.getValue() as React.ReactNode}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {table.getRowModel().rows.length === 0 && (
        <div className="no-results">No products match your filter criteria</div>
      )}
    </div>
  );
}

// Export the examples
export { 
  ClientSideFilteringExample,
  ServerSideFilteringExample,
  CustomizedExample
};