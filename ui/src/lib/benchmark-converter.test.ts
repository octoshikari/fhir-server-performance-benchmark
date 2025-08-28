import { expect, describe, it } from '@jest/globals';
import { convertSourceToBenchmarkReport } from './benchmark-converter';

describe('benchmark-converter', () => {
  it('should convert source data to benchmark report', () => {
    const sourceData = {
      crud: {
        summary: {
          status: 'success',
          data: {
            resultType: 'vector',
            result: [
              {
                metric: { fhirimpl: 'aidbox', scenario: 'crud' },
                value: [1751033226, '3646.47'] as [number, string]
              },
              {
                metric: { fhirimpl: 'hapi', scenario: 'crud' },
                value: [1751033226, '3260.36'] as [number, string]
              },
              {
                metric: { fhirimpl: 'medplum', scenario: 'crud' },
                value: [1751033226, '1278.53'] as [number, string]
              }
            ]
          }
        },
        test_cases: {
          status: 'success',
          data: {
            resultType: 'vector',
            result: [
              {
                metric: { fhirimpl: 'aidbox', group: '::create::Patient', scenario: 'crud' },
                value: [1751033226, '108.75'] as [number, string]
              },
              {
                metric: { fhirimpl: 'hapi', group: '::create::Patient', scenario: 'crud' },
                value: [1751033226, '203.22'] as [number, string]
              },
              {
                metric: { fhirimpl: 'medplum', group: '::create::Patient', scenario: 'crud' },
                value: [1751033226, '935.31'] as [number, string]
              }
            ]
          }
        }
      },
      import: {
        summary: {
          status: 'success',
          data: {
            resultType: 'vector',
            result: [
              {
                metric: { fhirimpl: 'aidbox', scenario: 'import' },
                value: [1751033226, '2.24'] as [number, string]
              },
              {
                metric: { fhirimpl: 'hapi', scenario: 'import' },
                value: [1751033226, '1.64'] as [number, string]
              },
              {
                metric: { fhirimpl: 'medplum', scenario: 'import' },
                value: [1751033226, '0.49'] as [number, string]
              }
            ]
          }
        },
        test_cases: {
          status: 'success',
          data: {
            resultType: 'vector',
            result: [
              {
                metric: { fhirimpl: 'aidbox', scenario: 'import' },
                value: [1751033226, '1720.63'] as [number, string]
              },
              {
                metric: { fhirimpl: 'hapi', scenario: 'import' },
                value: [1751033226, '917.63'] as [number, string]
              },
              {
                metric: { fhirimpl: 'medplum', scenario: 'import' },
                value: [1751033226, '299.18'] as [number, string]
              }
            ]
          }
        }
      },
      search: {
        summary: {
          status: 'success',
          data: {
            resultType: 'vector',
            result: [
              {
                metric: { fhirimpl: 'aidbox', scenario: 'search' },
                value: [1751033226, '234.81'] as [number, string]
              },
              {
                metric: { fhirimpl: 'hapi', scenario: 'search' },
                value: [1751033226, '256.64'] as [number, string]
              },
              {
                metric: { fhirimpl: 'medplum', scenario: 'search' },
                value: [1751033226, '648.95'] as [number, string]
              }
            ]
          }
        }
      }
    };

    const runId = '2025-06-27T00:20:39Z';
    const startTime = runId;
    const endTime = '2025-06-27T00:30:39Z';
    const duration = 600000;

    const report = convertSourceToBenchmarkReport(sourceData, runId, startTime, endTime, duration);

    expect(report.runid).toBe(runId);
    expect(report.start_time).toBe(startTime);
    expect(report.end_time).toBe(endTime);
    expect(report.duration).toBe(duration);
    expect(report.suites).toHaveLength(3);

    // CRUD Suite
    const crudSuite = report.suites[0];
    expect(crudSuite.name).toBe('CRUD');
    expect(crudSuite.result.data).toHaveLength(1);
    expect(crudSuite.result.data[0]).toEqual({
      category: 'Total',
      aidbox: 3646,
      hapi: 3260,
      medplum: 1279
    });
    expect(crudSuite.test_cases).toHaveLength(1);
    expect(crudSuite.test_cases[0].data[0]).toEqual({
      category: 'Patient',
      aidbox: 108,
      hapi: 203,
      medplum: 935
    });

    // Import Suite
    const importSuite = report.suites[1];
    expect(importSuite.name).toBe('Import');
    expect(importSuite.result.data).toHaveLength(1);
    expect(importSuite.result.data[0]).toEqual({
      category: 'Total',
      aidbox: 2,
      hapi: 2,
      medplum: 0
    });
    expect(importSuite.test_cases).toHaveLength(1);
    expect(importSuite.test_cases[0].data[0]).toEqual({
      category: 'Import',
      aidbox: 1721,
      hapi: 918,
      medplum: 299
    });

    // Search Suite
    const searchSuite = report.suites[2];
    expect(searchSuite.name).toBe('FHIR Search');
    expect(searchSuite.result.data).toHaveLength(1);
    expect(searchSuite.result.data[0]).toEqual({
      category: 'Total',
      aidbox: 235,
      hapi: 257,
      medplum: 649
    });
    expect(searchSuite.test_cases).toHaveLength(0);
  });
}); 