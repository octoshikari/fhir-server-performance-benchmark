import { convertSourceData, convertSourceToBenchmarkReport } from './benchmark-converter';
import { TypedBenchmarkReport } from '../types/benchmark.types';

// Example usage of the converter
export function exampleUsage() {
  // Load the source data (this would typically come from a file or API)
  const sourceData = {
    crudTotalRPS: {
      status: "success",
      data: {
        resultType: "vector",
        result: [
          {
            metric: {
              fhirimpl: "aidbox",
              scenario: "crud"
            },
            value: [1750797367, "3626.3400090246837"] as [number, string]
          },
          {
            metric: {
              fhirimpl: "hapi",
              scenario: "crud"
            },
            value: [1750797367, "3247.3707768765485"] as [number, string]
          },
          {
            metric: {
              fhirimpl: "medplum",
              scenario: "crud"
            },
            value: [1750797367, "1268.5178372384419"] as [number, string]
          }
        ]
      }
    },
    crudP99: {
      status: "success",
      data: {
        resultType: "vector",
        result: [
          {
            metric: {
              fhirimpl: "aidbox",
              group: "::create::Patient",
              scenario: "crud"
            },
            value: [1750797367, "161.32035415500002"] as [number, string]
          },
          {
            metric: {
              fhirimpl: "hapi",
              group: "::create::Patient",
              scenario: "crud"
            },
            value: [1750797367, "206.704545965"] as [number, string]
          },
          {
            metric: {
              fhirimpl: "medplum",
              group: "::create::Patient",
              scenario: "crud"
            },
            value: [1750797367, "1257.1371397799999"] as [number, string]
          },
          {
            metric: {
              fhirimpl: "aidbox",
              group: "::read::Patient",
              scenario: "crud"
            },
            value: [1750797367, "171.562826245"] as [number, string]
          },
          {
            metric: {
              fhirimpl: "hapi",
              group: "::read::Patient",
              scenario: "crud"
            },
            value: [1750797367, "200.29198725"] as [number, string]
          },
          {
            metric: {
              fhirimpl: "medplum",
              group: "::read::Patient",
              scenario: "crud"
            },
            value: [1750797367, "393.383961415"] as [number, string]
          }
        ]
      }
    }
  };

  // Convert using the convenience function (auto-generates metadata)
  const convertedReport: TypedBenchmarkReport = convertSourceData(sourceData);
  
  console.log('Converted Report:', JSON.stringify(convertedReport, null, 2));
  
  // Or convert with custom metadata
  const customReport: TypedBenchmarkReport = convertSourceToBenchmarkReport(
    sourceData,
    "2025-06-24T15:54:10Z",
    "2025-06-24T15:54:10Z",
    "2025-06-24T16:04:10Z",
    600000 // 10 minutes in milliseconds
  );
  
  console.log('Custom Report:', JSON.stringify(customReport, null, 2));
  
  return { convertedReport, customReport };
}

// Function to convert from file (for Node.js usage)
export async function convertFromFile(filePath: string): Promise<TypedBenchmarkReport> {
  try {
    const fs = await import('fs/promises');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const sourceData = JSON.parse(fileContent);
    return convertSourceData(sourceData);
  } catch (error) {
    console.error('Error reading or parsing file:', error);
    throw error;
  }
} 