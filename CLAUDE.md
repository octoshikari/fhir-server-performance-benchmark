# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a FHIR Server Performance Benchmark suite for comparing performance across three FHIR server implementations:
- Aidbox
- HAPI FHIR
- Medplum

The project consists of:
- K6 performance tests for CRUD operations, bulk import, and search functionality
- Next.js web UI for visualizing benchmark results
- Docker Compose infrastructure with Grafana/Prometheus monitoring

## Common Development Commands

### Infrastructure Management
```bash
# Bootstrap and start all FHIR servers and monitoring stack
./runner.sh bootstrap

# Manually start/stop services
docker compose up -d --wait
docker compose down
```

### Running Performance Tests
```bash
# Run default prewarm test on all servers
./runner.sh

# Run specific test on specific server
./runner.sh -t /k6/crud.js -s aidbox
./runner.sh -t /k6/search.js -s hapi
./runner.sh -t /k6/import.js -s medplum

# Run test with custom run ID
./runner.sh -t /k6/crud.js -id my-test-run

# Available test files:
# /k6/prewarm.js - Warm up servers
# /k6/crud.js - CRUD operations benchmark
# /k6/search.js - Search operations benchmark  
# /k6/import.js - Bulk import benchmark
```

### Next.js UI Development
```bash
# Install UI dependencies
npm run ui:install

# Development server with Turbopack
npm run ui:dev

# Build for production
npm run ui:build

# Start production server
npm run ui:start

# Run linting
npm run ui:lint

# Run UI tests
npm run ui:test
```

## Architecture

### Test Infrastructure
- **runner.sh**: Main CLI utility that orchestrates test execution across different FHIR servers
- **k6/**: Performance test scripts using k6.io framework
  - Test data generators in `seed/` directory for various FHIR resources
  - `util.js` contains shared utilities for authentication and request handling
- **docker-compose.yaml**: Defines all services including FHIR servers, monitoring stack, and databases

### Web Application (Next.js)
- **ui/**: Contains the entire Next.js web application
  - **ui/src/pages/**: Next.js pages including main dashboard and report viewer
  - **ui/src/components/**: React components for charts and UI elements
  - **ui/src/lib/**: Core utilities for benchmark data processing and metrics calculation
  - `benchmark-converter.ts`: Converts K6 output to standardized format
  - `benchmark-parser.ts`: Parses benchmark results
  - `metrics.js`: Metrics aggregation logic

### Service Ports
- Aidbox: http://localhost:13080
- HAPI: http://localhost:13090  
- Grafana: http://localhost:13000 (monitoring dashboards)
- Prometheus: http://localhost:13010 (metrics storage)
- PostgreSQL: localhost:13020

### Environment Variables for Tests
Tests require specific environment variables depending on the target server:
- **Aidbox**: `BASE_URL=http://aidbox:8080/fhir`
- **HAPI**: `BASE_URL=http://hapi:8080/fhir`
- **Medplum**: `BASE_URL=http://medplum:8103/fhir/R4` plus OAuth2 credentials

## Key Implementation Notes

1. All FHIR servers share a PostgreSQL instance with separate databases
2. Tests run inside Docker containers with network access to internal services
3. Prometheus collects metrics from K6 tests and server exporters
4. Test results are tagged with `runid` and `fhirimpl` for filtering
5. The runner script handles server-specific configuration automatically
6. Medplum requires OAuth2 authentication while Aidbox and HAPI use basic auth

## GCS Bucket Configuration

The benchmark reports are stored in a public Google Cloud Storage bucket: `gs://samurai-public/fhir-server-performance-benchmark/`

### CORS Configuration Required

For the UI to fetch reports directly from GCS, CORS must be configured on the bucket:

```bash
# Apply CORS configuration (one-time setup)
gsutil cors set cors-config.json gs://samurai-public

# Verify CORS configuration
gsutil cors get gs://samurai-public
```

The `cors-config.json` file is included in the repository and allows GET requests from any origin.

**Note**: Without proper CORS configuration, the UI will encounter "Failed to fetch" errors when trying to load reports from the GCS bucket.