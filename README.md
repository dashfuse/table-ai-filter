# table-ai-filter

> AI-powered natural language filtering for data tables

[![NPM](https://img.shields.io/npm/v/table-ai-filter.svg)](https://www.npmjs.com/package/@dashfuse/table-ai-filter)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

`table-ai-filter` brings natural language filtering capabilities to data tables. It allows users to filter table data using plain English queries like "show jeans and shirts over $50" instead of manually setting filters on individual columns.

Currently supports [TanStack Table](https://tanstack.com/table/v8) with plans to support more table libraries in the future.

👉 [Demo](coming soon)

## Features

- 🧠 **Natural Language Understanding**: Parse queries in plain English and map them to table columns
- 🔌 **Plug-and-Play**: Works with existing table setups with minimal configuration
- 💪 **Extensible**: Architecture supports multiple table libraries through adapters
- 🌐 **Client & Server**: Works with both client-side and server-side filtering
- 🔄 **Fallbacks**: Gracefully handles parsing failures with global search fallback
- 🛠️ **Customizable**: Style and behavior customization options

## Installation

```bash
# npm
npm install table-ai-filter

# yarn
yarn add table-ai-filter

# pnpm
pnpm add table-ai-filter
```

## Quick Start with TanStack Table

```jsx
import React, { useState } from 'react';
import { 
  useReactTable, 
  getCoreRowModel, 
  getFilteredRowModel
} from '@tanstack/react-table';
import { AIFilter } from 'table-ai-filter/tanstack';
import 'table-ai-filter/styles.css'; // Optional default styles

function ProductsTable() {
  // Your existing TanStack Table setup
  const [columnFilters, setColumnFilters] = useState([]);
  
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
    <div>
      {/* Add the AI Filter component */}
      <AIFilter 
        table={table} 
        apiKey={process.env.REACT_APP_OPENAI_API_KEY}
        placeholder="Filter with AI (e.g., 'active products over $100')" 
      />
      
      {/* Your existing table JSX */}
      <table>
        {/* ... */}
      </table>
    </div>
  );
}
```

## How It Works

1. The `AIFilter` component renders an input field where users type natural language queries
2. When a query is submitted, it's sent to an LLM (like OpenAI's GPT-3.5) with context about your table columns
3. The LLM parses the query into structured filter conditions
4. These conditions are applied to your table's filter state through a table-specific adapter
5. The table updates to show the filtered results

## Supported Table Libraries

### Current
- ✅ [TanStack Table](https://tanstack.com/table/v8) (formerly React Table)

### Planned
- ⏳ AG Grid
- ⏳ Material UI Data Grid
- ⏳ React Data Grid

## Configuration

### TanStack Table Integration

#### Basic Props

| Prop | Type | Description |
|------|------|-------------|
| `table` | `Table<any>` | TanStack Table instance |
| `apiKey` | `string` | OpenAI API key |
| `placeholder` | `string` | Placeholder text for the input |
| `showExplanation` | `boolean` | Show explanation of parsed filters |
| `buttonText` | `string` | Text for the filter button |

### Advanced Usage

#### Custom Parser

If you want to use a different LLM or add domain-specific logic:

```jsx
import { AIFilter } from 'table-ai-filter/tanstack';
import { ParseResult } from 'table-ai-filter';

// Custom parser function
const customParser = async (query, columnMetadata) => {
  // Simple keyword matching example
  if (query.toLowerCase().includes('only active')) {
    return {
      success: true,
      filters: [
        {
          id: 'status',
          operator: 'equals',
          value: 'Active'
        }
      ],
      explanation: 'Showing only active items.'
    };
  }
  
  // Call your own LLM API or service
  // ...
  
  // Return in the expected format
  return {
    success: true,
    filters: [
      // Your parsed filters
    ],
    explanation: 'Custom explanation of filters.'
  };
};

// Use the custom parser
<AIFilter 
  table={table} 
  parseQuery={customParser}
  // No need for apiKey when using custom parser
/>
```

#### Styling

The component can be styled using:

1. **CSS Classes**: Override default classes or provide your own
2. **CSS Variables**: Customize colors and sizes through CSS variables
3. **CSS Modules**: Import the component in a CSS Modules environment

```jsx
// Custom classes example
<AIFilter 
  table={table}
  className="my-filter"
  classes={{
    container: 'custom-container',
    input: 'custom-input',
    button: 'custom-button'
  }}
/>
```

## Using the Core Package

For more custom integrations or if you're using a table library that doesn't have a dedicated adapter yet, you can use the core package directly:

```jsx
import { 
  AIFilterComponent, 
  useAIFilter, 
  parseNaturalLanguage 
} from 'table-ai-filter';
import 'table-ai-filter/styles.css';

// Create a custom adapter for your table library
class MyTableAdapter {
  constructor(tableInstance) {
    this.table = tableInstance;
  }
  
  getColumnMetadata() {
    // Return column metadata in the expected format
    return [
      { 
        id: 'name', 
        header: 'Name', 
        filterType: 'text'
      },
      // ...other columns
    ];
  }
  
  // Implement other required adapter methods
  // ...
}

function MyTableWithAIFilter() {
  // Your table setup
  const tableInstance = setupTable();
  
  // Create adapter
  const adapter = new MyTableAdapter(tableInstance);
  
  return (
    <div>
      <AIFilterComponent
        adapter={adapter}
        apiKey={process.env.REACT_APP_OPENAI_API_KEY}
      />
      
      {/* Your table component */}
    </div>
  );
}
```

## Package Structure

The package is organized to support multiple table libraries:

```
table-ai-filter               # Main package
├── dist/                     # Built files
├── src/
│   ├── core/                 # Core functionality
│   │   ├── types.ts          # Common interfaces
│   │   ├── AIFilterParser.ts # LLM integration
│   │   ├── useAIFilter.ts    # Base hook
│   │   └── AIFilterComponent.tsx # Base component
│   ├── adapters/             # Table-specific adapters
│   │   ├── tanstack/         # TanStack Table adapter
│   │   └── ...               # Future adapters
│   ├── utils/                # Utilities
│   └── index.ts              # Main entry point
└── package.json              # Package config with exports
```

## Examples

More examples in the [documentation](https://example.com/docs) (coming soon).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Your Name](https://github.com/dashfuse)