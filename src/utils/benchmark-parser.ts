import { BenchmarkReport, TypedBenchmarkReport, ServerName } from '../types/benchmark.types';

/**
 * Parse a benchmark report from JSON string
 */
export function parseBenchmarkReport(jsonString: string): BenchmarkReport {
  try {
    const data = JSON.parse(jsonString);
    return validateBenchmarkReport(data);
  } catch (error) {
    throw new Error(`Failed to parse benchmark report: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate and type-check a benchmark report object
 */
export function validateBenchmarkReport(data: any): BenchmarkReport {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid benchmark report: must be an object');
  }

  const requiredFields = ['runid', 'start_time', 'end_time', 'duration', 'suites'];
  for (const field of requiredFields) {
    if (!(field in data)) {
      throw new Error(`Invalid benchmark report: missing required field '${field}'`);
    }
  }

  if (typeof data.runid !== 'string') {
    throw new Error('Invalid benchmark report: runid must be a string');
  }

  if (typeof data.start_time !== 'string') {
    throw new Error('Invalid benchmark report: start_time must be a string');
  }

  if (typeof data.end_time !== 'string') {
    throw new Error('Invalid benchmark report: end_time must be a string');
  }

  if (typeof data.duration !== 'number') {
    throw new Error('Invalid benchmark report: duration must be a number');
  }

  if (!Array.isArray(data.suites)) {
    throw new Error('Invalid benchmark report: suites must be an array');
  }

  const validatedSuites = data.suites.map((suite: any, index: number) => {
    return validateBenchmarkSuite(suite, index);
  });

  return {
    runid: data.runid,
    start_time: data.start_time,
    end_time: data.end_time,
    duration: data.duration,
    suites: validatedSuites,
  };
}

/**
 * Validate a benchmark suite
 */
function validateBenchmarkSuite(suite: any, index: number) {
  if (!suite || typeof suite !== 'object') {
    throw new Error(`Invalid suite at index ${index}: must be an object`);
  }

  const requiredFields = ['name', 'description', 'result', 'test_cases'];
  for (const field of requiredFields) {
    if (!(field in suite)) {
      throw new Error(`Invalid suite at index ${index}: missing required field '${field}'`);
    }
  }

  if (typeof suite.name !== 'string') {
    throw new Error(`Invalid suite at index ${index}: name must be a string`);
  }

  if (typeof suite.description !== 'string') {
    throw new Error(`Invalid suite at index ${index}: description must be a string`);
  }

  const validatedResult = validateBenchmarkResult(suite.result, index);
  const validatedTestCases = suite.test_cases.map((testCase: any, testIndex: number) => {
    return validateTestCaseGroup(testCase, index, testIndex);
  });

  return {
    name: suite.name,
    description: suite.description,
    result: validatedResult,
    test_cases: validatedTestCases,
  };
}

/**
 * Validate a benchmark result
 */
function validateBenchmarkResult(result: any, suiteIndex: number) {
  if (!result || typeof result !== 'object') {
    throw new Error(`Invalid result in suite ${suiteIndex}: must be an object`);
  }

  const requiredFields = ['type', 'unit', 'data'];
  for (const field of requiredFields) {
    if (!(field in result)) {
      throw new Error(`Invalid result in suite ${suiteIndex}: missing required field '${field}'`);
    }
  }

  if (typeof result.type !== 'string') {
    throw new Error(`Invalid result in suite ${suiteIndex}: type must be a string`);
  }

  if (typeof result.unit !== 'string') {
    throw new Error(`Invalid result in suite ${suiteIndex}: unit must be a string`);
  }

  if (!result.data || typeof result.data !== 'object') {
    throw new Error(`Invalid result in suite ${suiteIndex}: data must be an object`);
  }

  // Validate that all values in data are numbers
  for (const [key, value] of Object.entries(result.data)) {
    if (typeof value !== 'number') {
      throw new Error(`Invalid result in suite ${suiteIndex}: data value for '${key}' must be a number`);
    }
  }

  return {
    type: result.type,
    unit: result.unit,
    data: result.data,
  };
}

/**
 * Validate a test case group
 */
function validateTestCaseGroup(testCaseGroup: any, suiteIndex: number, groupIndex: number) {
  if (!testCaseGroup || typeof testCaseGroup !== 'object') {
    throw new Error(`Invalid test case group ${groupIndex} in suite ${suiteIndex}: must be an object`);
  }

  if (!('group' in testCaseGroup)) {
    throw new Error(`Invalid test case group ${groupIndex} in suite ${suiteIndex}: missing required field 'group'`);
  }

  if (typeof testCaseGroup.group !== 'string') {
    throw new Error(`Invalid test case group ${groupIndex} in suite ${suiteIndex}: group must be a string`);
  }

  if (!Array.isArray(testCaseGroup.test_cases)) {
    throw new Error(`Invalid test case group ${groupIndex} in suite ${suiteIndex}: test_cases must be an array`);
  }

  const validatedTestCases = testCaseGroup.test_cases.map((testCase: any, testIndex: number) => {
    return validateTestCase(testCase, suiteIndex, groupIndex, testIndex);
  });

  return {
    group: testCaseGroup.group,
    test_cases: validatedTestCases,
  };
}

/**
 * Validate a test case
 */
function validateTestCase(testCase: any, suiteIndex: number, groupIndex: number, testIndex: number) {
  if (!testCase || typeof testCase !== 'object') {
    throw new Error(`Invalid test case ${testIndex} in group ${groupIndex} of suite ${suiteIndex}: must be an object`);
  }

  if (!('group' in testCase)) {
    throw new Error(`Invalid test case ${testIndex} in group ${groupIndex} of suite ${suiteIndex}: missing required field 'group'`);
  }

  if (typeof testCase.group !== 'string') {
    throw new Error(`Invalid test case ${testIndex} in group ${groupIndex} of suite ${suiteIndex}: group must be a string`);
  }

  if (!('result' in testCase)) {
    throw new Error(`Invalid test case ${testIndex} in group ${groupIndex} of suite ${suiteIndex}: missing required field 'result'`);
  }

  const validatedResult = validateBenchmarkResult(testCase.result, suiteIndex);

  return {
    group: testCase.group,
    result: validatedResult,
  };
}

/**
 * Get all server names from a benchmark report
 */
export function getServerNames(report: BenchmarkReport): ServerName[] {
  const serverNames = new Set<string>();
  
  // Extract server names from suite results
  report.suites.forEach(suite => {
    Object.keys(suite.result.data).forEach(server => serverNames.add(server));
    
    // Extract server names from test cases
    suite.test_cases.forEach(testCaseGroup => {
      testCaseGroup.test_cases.forEach(testCase => {
        Object.keys(testCase.result.data).forEach(server => serverNames.add(server));
      });
    });
  });

  return Array.from(serverNames) as ServerName[];
}

/**
 * Calculate the total duration of a benchmark run in seconds
 */
export function getBenchmarkDuration(report: BenchmarkReport): number {
  return report.duration / 1000; // Convert from milliseconds to seconds
}

/**
 * Get the start and end times as Date objects
 */
export function getBenchmarkTimeRange(report: BenchmarkReport): { start: Date; end: Date } {
  return {
    start: new Date(report.start_time),
    end: new Date(report.end_time),
  };
} 