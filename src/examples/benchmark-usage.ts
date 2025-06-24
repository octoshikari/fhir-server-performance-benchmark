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
      "description": "Create, Read, Update, Delete operations",
      "result": {
        "label": "Average requests per second. (Higher is better)",
        "description": "Some description",
        "unit": "RPS",
        "data": [
          {
            "category": "CRUD",
            "aidbox": 3200,
            "medplum": 1000,
            "hapi": 200
          }
        ]
      },
      "test_cases": [
        {
          "label": "Create resource latency (Lower is better)",
          "description": "P99 in milliseconds per each resource type",
          "unit": "MS",
          "data": [
            {
              "category": "Patient",
              "aidbox": 3200,
              "medplum": 1000,
              "hapi": 200
            },
            {
              "category": "Observation",
              "aidbox": 3200,
              "medplum": 1000,
              "hapi": 200
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
      console.log(`Result label: ${suite.result.label}`);
      console.log(`Unit: ${suite.result.unit}`);
      
      // Display server performance data for each data point
      suite.result.data.forEach(dataPoint => {
        console.log(`  Category: ${dataPoint.category}`);
        console.log(`    aidbox: ${dataPoint.aidbox} ${suite.result.unit}`);
        console.log(`    medplum: ${dataPoint.medplum} ${suite.result.unit}`);
        console.log(`    hapi: ${dataPoint.hapi} ${suite.result.unit}`);
      });
      
      // Access test cases
      suite.test_cases.forEach(testCase => {
        console.log(`\n  Test Case: ${testCase.label}`);
        console.log(`  Description: ${testCase.description}`);
        console.log(`  Unit: ${testCase.unit}`);
        
        testCase.data.forEach(dataPoint => {
          console.log(`    Category: ${dataPoint.category}`);
          console.log(`      aidbox: ${dataPoint.aidbox} ${testCase.unit}`);
          console.log(`      medplum: ${dataPoint.medplum} ${testCase.unit}`);
          console.log(`      hapi: ${dataPoint.hapi} ${testCase.unit}`);
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
  
  if (firstSuite && firstSuite.result.data.length > 0) {
    const firstDataPoint = firstSuite.result.data[0];
    
    // Access server data with type safety
    const aidboxPerformance = firstDataPoint.aidbox;
    const medplumPerformance = firstDataPoint.medplum;
    const hapiPerformance = firstDataPoint.hapi;
    
    console.log('Aidbox performance:', aidboxPerformance);
    console.log('Medplum performance:', medplumPerformance);
    console.log('Hapi performance:', hapiPerformance);
  }
}

// Utility function to compare server performance
export function compareServerPerformance(report: BenchmarkReport, server1: string, server2: string) {
  const results: { suite: string; category: string; server1: number; server2: number; difference: number; percentage: number }[] = [];
  
  report.suites.forEach(suite => {
    suite.result.data.forEach(dataPoint => {
      const perf1 = dataPoint[server1 as keyof typeof dataPoint] as number;
      const perf2 = dataPoint[server2 as keyof typeof dataPoint] as number;
      
      if (perf1 !== undefined && perf2 !== undefined) {
        const difference = perf1 - perf2;
        const percentage = (difference / perf2) * 100;
        
        results.push({
          suite: suite.name,
          category: dataPoint.category,
          server1: perf1,
          server2: perf2,
          difference,
          percentage
        });
      }
    });
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
        description: "Create, Read, Update, Delete operations",
        result: {
          label: "Average requests per second. (Higher is better)",
          description: "Some description",
          unit: "RPS",
          data: [
            {
              category: "CRUD",
              aidbox: 3200,
              medplum: 1000,
              hapi: 200
            }
          ]
        },
        test_cases: []
      }
    ]
  };
} 