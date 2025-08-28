# Benchmark Converter

This module provides utilities to convert Prometheus-style metrics data to the `TypedBenchmarkReport` format used by the FHIR server performance benchmark application.

## Overview

The converter transforms data from the source format (Prometheus-style metrics) to the target format (structured benchmark reports) that can be used by the application's UI components.

## Source Format

The source data follows a Prometheus-style structure with metrics organized by:
- `crudTotalRPS`: Total requests per second for CRUD operations
- `crudP99`: P99 latency metrics for CRUD operations, grouped by operation type and resource type

Example source structure:
```json
{
  "crudTotalRPS": {
    "status": "success",
    "data": {
      "resultType": "vector",
      "result": [
        {
          "metric": {
            "fhirimpl": "aidbox",
            "scenario": "crud"
          },
          "value": [1750797367, "3626.3400090246837"]
        }
      ]
    }
  },
  "crudP99": {
    "status": "success",
    "data": {
      "resultType": "vector",
      "result": [
        {
          "metric": {
            "fhirimpl": "aidbox",
            "group": "::create::Patient",
            "scenario": "crud"
          },
          "value": [1750797367, "161.32035415500002"]
        }
      ]
    }
  }
}
```

## Target Format

The target format is a `TypedBenchmarkReport` with structured suites, test cases, and data points:

```typescript
interface TypedBenchmarkReport {
  runid: string;
  start_time: string;
  end_time: string;
  duration: number;
  suites: TypedBenchmarkSuite[];
}
```

## Usage

### Basic Conversion

```typescript
import { convertSourceData } from './benchmark-converter';

const sourceData = { /* your source data */ };
const report = convertSourceData(sourceData);
```

### Custom Metadata

```typescript
import { convertSourceToBenchmarkReport } from './benchmark-converter';

const report = convertSourceToBenchmarkReport(
  sourceData,
  "2025-06-24T15:54:10Z",
  "2025-06-24T15:54:10Z",
  "2025-06-24T16:04:10Z",
  600000 // duration in milliseconds
);
```

### From File

```typescript
import { convertFromFile } from './benchmark-converter.test';

const report = await convertFromFile('./path/to/source-data.json');
```

## Key Features

1. **Automatic Grouping**: Groups metrics by operation type (create, read, update, delete) and resource type
2. **Server Comparison**: Organizes data for comparison between aidbox, medplum, and hapi servers
3. **Flexible Metadata**: Supports custom run IDs, timestamps, and durations
4. **Type Safety**: Full TypeScript support with proper type definitions

## Data Transformation

The converter performs the following transformations:

1. **Total RPS**: Aggregates total requests per second for each server
2. **P99 Latency**: Groups P99 latency metrics by operation and resource type
3. **Test Cases**: Creates separate test cases for each operation type
4. **Data Points**: Structures data for easy comparison across servers

## Supported Operations

- Create operations
- Read operations  
- Update operations
- Delete operations
- Search operations (if search data is provided)

## Supported Resource Types

- Patient
- Observation
- Encounter
- Claim
- Location
- MedicationRequest
- Organization
- Practitioner
- ExplanationOfBenefit

## Error Handling

The converter includes error handling for:
- Missing or malformed data
- File reading errors
- JSON parsing errors
- Invalid metric structures 