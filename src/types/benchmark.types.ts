export interface BenchmarkResult {
  type: string;
  unit: string;
  data: Record<string, number>;
}

export interface TestCase {
  group: string;
  result: BenchmarkResult;
}

export interface TestCaseGroup {
  group: string;
  test_cases: TestCase[];
}

export interface BenchmarkSuite {
  name: string;
  description: string;
  result: BenchmarkResult;
  test_cases: TestCaseGroup[];
}

export interface BenchmarkReport {
  runid: string;
  start_time: string;
  end_time: string;
  duration: number;
  suites: BenchmarkSuite[];
}

// Specific types for common result types
export type ResultType = 'Requests per second' | 'P99' | 'P95' | 'P50' | 'Average';
export type UnitType = 'rps' | 'ms' | 's' | 'count';

// Enhanced result interface with specific types
export interface TypedBenchmarkResult {
  type: ResultType;
  unit: UnitType;
  data: Record<string, number>;
}

// Enhanced interfaces using the typed result
export interface TypedTestCase {
  group: string;
  result: TypedBenchmarkResult;
}

export interface TypedTestCaseGroup {
  group: string;
  test_cases: TypedTestCase[];
}

export interface TypedBenchmarkSuite {
  name: string;
  description: string;
  result: TypedBenchmarkResult;
  test_cases: TypedTestCaseGroup[];
}

export interface TypedBenchmarkReport {
  runid: string;
  start_time: string;
  end_time: string;
  duration: number;
  suites: TypedBenchmarkSuite[];
}

// Utility types for working with the data
export type ServerName = 'aidbox' | 'medplum' | 'hapi';

export interface ServerPerformance {
  [key: string]: number;
}

// Helper type for extracting server names from data
export type ExtractServerNames<T> = T extends { data: infer D } 
  ? D extends Record<string, number> 
    ? keyof D 
    : never 
  : never; 