# FHIR Server Performance Benchmark - Web UI

This directory contains the Next.js web application for visualizing FHIR server performance benchmark results.

## Getting Started

### Prerequisites

Make sure you have Node.js 18+ installed.

### Installation

From the root directory:
```bash
npm run ui:install
```

Or from this directory:
```bash
npm install
```

### Development

From the root directory:
```bash
npm run ui:dev
```

Or from this directory:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Building for Production

From the root directory:
```bash
npm run ui:build
npm run ui:start
```

Or from this directory:
```bash
npm run build
npm run start
```

## Project Structure

- `src/pages/` - Next.js pages and API routes
- `src/components/` - React components
- `src/lib/` - Utility functions and benchmark processing logic
- `src/types/` - TypeScript type definitions
- `public/` - Static assets

## Features

- Dashboard for viewing benchmark results
- Real-time report generation from Prometheus metrics
- Interactive charts for performance comparison
- Support for CRUD, Import, and Search benchmarks

## Technologies

- Next.js 15 with TypeScript
- React 19
- Recharts for data visualization
- Tailwind CSS for styling
- shadcn/ui components