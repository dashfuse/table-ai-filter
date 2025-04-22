# table-ai-filter

> AI-powered natural language filtering for data tables

[![NPM](https://img.shields.io/npm/v/@dashfuse/table-ai-filter.svg)](https://www.npmjs.com/package/@dashfuse/table-ai-filter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Hey there! 👋

I'm excited to share my new project with you! `table-ai-filter` is something I've been working on to make filtering data tables more intuitive using natural language. You know how frustrating it can be clicking through multiple dropdowns and inputs just to filter a table? I thought, "what if we could just type what we want in plain English?"

This is very much a work in progress, but I wanted to get it out there and see if others find it useful too!

> ⚠️ **Early Development**: This package is in its early stages. Expect changes and improvements as we grow!

## What It Does

`table-ai-filter` lets users filter table data by typing natural language queries like "show jeans and shirts over $50" instead of fiddling with separate column filters.

Right now, it works with [TanStack Table](https://tanstack.com/table/v8), but I'm planning to add support for more libraries as time goes on.

## Features

- 🔍 **Natural Language Filtering**: Users can type queries in plain English
- 🧠 **Multi-LLM Support**: Works with OpenAI, Anthropic Claude, or custom providers
- 🔌 **Easy Integration**: Simple setup with existing TanStack Table instances
- 🛠️ **Customizable**: Style, behavior, and LLM provider options
- 🔄 **Fallbacks**: Graceful error handling with global search fallback
- 🧩 **Extensible**: Create custom LLM providers for your specific needs

## Quick Demo

TBD - I'm working on setting up a proper demo site. For now, check out the code examples below!

## Getting Started

```bash
# npm
npm install @dashfuse/table-ai-filter

# yarn
yarn add @dashfuse/table-ai-filter

# pnpm
pnpm add @dashfuse/table-ai-filter
```

## Basic Usage with TanStack Table

```jsx
import React, { useState } from 'react';
import { 
  useReactTable, 
  getCoreRowModel, 
  getFilteredRowModel
} from '@tanstack/react-table';
import { AIFilter } from '@dashfuse/table-ai-filter/tanstack';

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

## Using Different LLM Providers

One of the key features is support for different LLM providers. You can choose which provider to use:

```jsx
// Using OpenAI (default)
<AIFilter
  table={table}
  llmProvider="openai"
  llmOptions={{
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    model: "gpt-3.5-turbo"
  }}
/>

// Using Anthropic Claude
<AIFilter
  table={table}
  llmProvider="claude"
  llmOptions={{
    apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY,
    model: "claude-3-haiku-20240307"
  }}
/>
```

## Creating a Custom LLM Provider

You can create your own provider for custom parsing logic or to integrate with other LLMs:

```jsx
import { LLMProviderInterface, LLMProviderRegistry } from '@dashfuse/table-ai-filter';

// Create a custom provider
class MyCustomProvider implements LLMProviderInterface {
  constructor(options) {
    // Initialize with options
  }
  
  getName() {
    return 'custom';
  }
  
  isConfigured() {
    return true;
  }
  
  async parseQuery(query, columnMetadata, currentFilters) {
    // Custom parsing logic here
    // Return a ParseResult object
    return {
      success: true,
      filters: [
        { id: 'category', operator: 'in', value: ['Jeans'] }
      ],
      explanation: 'Filtered for jeans products'
    };
  }
}

// Register your provider
LLMProviderRegistry.register('custom', options => new MyCustomProvider(options));

// Use your custom provider
<AIFilter
  table={table}
  llmProvider="custom"
  llmOptions={{ /* custom options */ }}
/>
```

## What's Supported So Far

I'm just getting started, but here's what's working:

### Currently Supported
- ✅ [TanStack Table](https://tanstack.com/table/v8) (formerly React Table)
- ✅ OpenAI GPT models
- ✅ Anthropic Claude models
- ✅ Custom provider API

### On My Roadmap
- ⏳ AG Grid
- ⏳ Material UI Data Grid
- ⏳ React Data Grid
- ⏳ Local LLM options (for those who want to avoid API costs)
- ⏳ Better handling of date filters
- ⏳ Improved customization options

I'm building this in my spare time, so progress might be a bit slow - but I'm committed to making this a genuinely useful tool!

## Need Help or Have Ideas?

> 💬 **Need implementation help?** Feel free to reach out directly at [aa@dashfuse.co](mailto:aa@dashfuse.co) - I'm happy to help you get set up!

I'd love to hear your thoughts, feedback, or feature requests! This is very much a community project, and I could really use your help:

- **Found a bug?** Please open an issue!
- **Have an idea for improvement?** Let me know!
- **Want to contribute code?** PRs are very welcome - no contribution is too small
- **Using it in your project?** I'd love to hear about your experience

## Community Support

This project can only get better with community involvement. If you find it useful:

- ⭐ Star the repo to show support
- 🧪 Try it out and provide feedback
- 🐛 Report bugs or documentation issues
- 🔀 Submit PRs for fixes or enhancements
- 📣 Spread the word if you find it useful!

Even just sharing your use case would be super helpful for guiding the project's direction.

## Thank You!

Thanks for checking out this early version of table-ai-filter! I hope it makes your data tables a little more magical. ✨

## License

MIT © Open source with ❤️