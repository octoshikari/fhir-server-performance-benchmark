import { BenchmarkReport, TypedBenchmarkReport, ServerName } from '../types/benchmark.types';
import { parseBenchmarkReport, getServerNames, getBenchmarkDuration, getBenchmarkTimeRange } from '../utils/benchmark-parser';

// Example JSON data matching your structure
const exampleJsonData = `{
  "runid": "2025-06-23T12:22:32Z",
  "start_time": "2025-06-23T12:22:32Z",
  "end_time": "2025-06-23T12:32:32Z",
  "duration": 1000,
  "suites": [
    {
      "name": "CRUD",
      "description": "Create, Read, Update, Delete",
      "result": {
        "type": "Requests per second",
        "unit": "rps",
        "data": {
          "aidbox": 3200,
          "medplum": 1000,
          "hapi": 200
        }
      },
      "test_cases": [
        {
          "group": "Create",
          "test_cases": [
            {
              "group": "Patient",
              "result": {
                "type": "P99",
                "unit": "ms",
                "data": {
                  "aidbox": 3200,
                  "medplum": 1000,
                  "hapi": 200
                }
              }
            }
          ]
        }
      ]
    }
  ]
}`;

// Example usage functions
export function exampleUsage() {
  try {
    // Parse the JSON data
    const report: BenchmarkReport = parseBenchmarkReport(exampleJsonData);
    
    console.log('Benchmark Report ID:', report.runid);
    console.log('Duration:', getBenchmarkDuration(report), 'seconds');
    
    const timeRange = getBenchmarkTimeRange(report);
    console.log('Start time:', timeRange.start.toISOString());
    console.log('End time:', timeRange.end.toISOString());
    
    // Get all server names
    const servers = getServerNames(report);
    console.log('Servers tested:', servers);
    
    // Access specific data
    report.suites.forEach(suite => {
      console.log(`\nSuite: ${suite.name}`);
      console.log(`Description: ${suite.description}`);
      console.log(`Result type: ${suite.result.type}`);
      console.log(`Unit: ${suite.result.unit}`);
      
      // Display server performance data
      Object.entries(suite.result.data).forEach(([server, value]) => {
        console.log(`  ${server}: ${value} ${suite.result.unit}`);
      });
      
      // Access test cases
      suite.test_cases.forEach(testCaseGroup => {
        console.log(`\n  Test Group: ${testCaseGroup.group}`);
        testCaseGroup.test_cases.forEach(testCase => {
          console.log(`    Test: ${testCase.group}`);
          Object.entries(testCase.result.data).forEach(([server, value]) => {
            console.log(`      ${server}: ${value} ${testCase.result.unit}`);
          });
        });
      });
    });
    
  } catch (error) {
    console.error('Error parsing benchmark report:', error);
  }
}

// Type-safe data access example
export function typeSafeDataAccess(report: BenchmarkReport) {
  // TypeScript will provide full intellisense and type checking
  const firstSuite = report.suites[0];
  
  if (firstSuite) {
    // Access server data with type safety
    const aidboxPerformance = firstSuite.result.data.aidbox;
    const medplumPerformance = firstSuite.result.data.medplum;
    const hapiPerformance = firstSuite.result.data.hapi;
    
    console.log('Aidbox performance:', aidboxPerformance);
    console.log('Medplum performance:', medplumPerformance);
    console.log('Hapi performance:', hapiPerformance);
    
    // TypeScript will catch errors like:
    // const invalidServer = firstSuite.result.data.invalidServer; // Error: Property 'invalidServer' does not exist
  }
}

// Utility function to compare server performance
export function compareServerPerformance(report: BenchmarkReport, server1: string, server2: string) {
  const results: { suite: string; server1: number; server2: number; difference: number; percentage: number }[] = [];
  
  report.suites.forEach(suite => {
    const perf1 = suite.result.data[server1];
    const perf2 = suite.result.data[server2];
    
    if (perf1 !== undefined && perf2 !== undefined) {
      const difference = perf1 - perf2;
      const percentage = (difference / perf2) * 100;
      
      results.push({
        suite: suite.name,
        server1: perf1,
        server2: perf2,
        difference,
        percentage
      });
    }
  });
  
  return results;
}

// Example of using the typed interfaces
export function createTypedReport(): TypedBenchmarkReport {
  return {
    runid: "2025-06-23T12:22:32Z",
    start_time: "2025-06-23T12:22:32Z",
    end_time: "2025-06-23T12:32:32Z",
    duration: 1000,
    suites: [
      {
        name: "CRUD",
        description: "Create, Read, Update, Delete",
        result: {
          type: "Requests per second", // TypeScript will enforce this must be a valid ResultType
          unit: "rps", // TypeScript will enforce this must be a valid UnitType
          data: {
            aidbox: 3200,
            medplum: 1000,
            hapi: 200
          }
        },
        test_cases: []
      }
    ]
  };
} 