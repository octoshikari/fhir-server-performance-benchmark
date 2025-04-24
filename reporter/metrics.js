import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const PROMETHEUS_URL = process.env.METRICS_URL || 'http://localhost:9090';
const USERNAME = process.env.METRICS_USERNAME;
const PASSWORD = process.env.METRICS_PASSWORD;

/**
 * Get headers for Prometheus API requests
 * @returns {Object} Headers object
 */
function getHeaders() {
    const headers = {
        'Accept': 'application/json',
    };

    if (USERNAME && PASSWORD) {
        const base64Credentials = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');
        headers['Authorization'] = `Basic ${base64Credentials}`;
    }

    return headers;
}

/**
 * Execute an instant query against Prometheus
 * @param {string} query - PromQL query string
 * @returns {Promise<Object>} Query results
 */
export async function instantQuery(query) {
    if (!query) {
        throw new Error('Query parameter is required');
    }

    const params = new URLSearchParams({
        query: query,
    });

    try {
        const response = await fetch(`${PROMETHEUS_URL}/api/v1/query?${params}`, {
            headers: getHeaders(),
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            if (response.status === 401) {
                throw new Error('Authentication failed: Invalid credentials');
            }
            throw new Error(`Prometheus query failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        
        if (data.status !== 'success') {
            throw new Error(`Prometheus query failed: ${data.error || 'Unknown error'}`);
        }

        return data;
    } catch (error) {
        throw new Error(`Failed to execute Prometheus query: ${error.message}`);
    }
}

/**
 * Execute a range query against Prometheus
 * @param {string} query - PromQL query string
 * @param {Date} start - Start timestamp
 * @param {Date} end - End timestamp
 * @param {string} [step='1h'] - Query resolution step width
 * @returns {Promise<Object>} Query results
 */
export async function rangeQuery(query, start, end, step = '1h') {
    if (!query || !start || !end) {
        throw new Error('Query, start, and end parameters are required');
    }

    const params = new URLSearchParams({
        query: query,
        start: Math.floor(start.getTime() / 1000),
        end: Math.floor(end.getTime() / 1000),
        step: step
    });

    try {
        const response = await fetch(`${PROMETHEUS_URL}/api/v1/query_range?${params}`, {
            headers: getHeaders(),
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            if (response.status === 401) {
                throw new Error('Authentication failed: Invalid credentials');
            }
            throw new Error(`Prometheus range query failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        
        if (data.status !== 'success') {
            throw new Error(`Prometheus range query failed: ${data.error || 'Unknown error'}`);
        }

        return data;
    } catch (error) {
        throw new Error(`Failed to execute Prometheus range query: ${error.message}`);
    }
}
