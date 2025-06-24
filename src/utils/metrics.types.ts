// TypeScript interfaces for Prometheus API responses

export interface PrometheusMetric {
  fhirimpl: string; // The FHIR implementation name (e.g., "aidbox")
  scenario: string; // The test scenario name (e.g., "crud")
  [key: string]: string; // Allow for additional metric labels
}

export interface PrometheusValue {
  timestamp: number; // Unix timestamp in seconds
  value: string; // The metric value as a string
}

export interface PrometheusResult {
  metric: PrometheusMetric;
  value: [number, string];
}

export interface PrometheusVectorData {
  resultType: 'vector';
  result: PrometheusResult[];
}

export interface PrometheusMatrixData {
  resultType: 'matrix';
  result: PrometheusResult[];
}

export interface PrometheusScalarData {
  resultType: 'scalar';
  result: PrometheusValue;
}

export interface PrometheusStringData {
  resultType: 'string';
  result: PrometheusValue;
}
export type PrometheusData =  PrometheusVectorData 
  // | PrometheusMatrixData 
  // | PrometheusScalarData 
  // | PrometheusStringData;

// export type PrometheusData = 
//   | PrometheusVectorData 
//   | PrometheusMatrixData 
//   | PrometheusScalarData 
//   | PrometheusStringData;

export interface PrometheusSuccessResponse {
  status: 'success';
  data: PrometheusData;
}

export interface PrometheusErrorResponse {
  status: 'error';
  errorType: string;
  error: string;
}

export type PrometheusResponse = PrometheusSuccessResponse | PrometheusErrorResponse;

// Helper type for the specific response structure you showed
export interface FHIRBenchmarkResponse extends PrometheusSuccessResponse {
  data: PrometheusVectorData;
} 