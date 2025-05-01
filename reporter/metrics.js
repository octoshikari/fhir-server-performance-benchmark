import dotenv from 'dotenv'
dotenv.config()

const PROMETHEUS_URL = process.env.METRICS_URL || 'http://localhost:9090'
const USERNAME = process.env.METRICS_USERNAME
const PASSWORD = process.env.METRICS_PASSWORD

/**
 * Get headers for Prometheus API requests
 * @returns {Object} Headers object
 */
function getHeaders() {
  const headers = {
    'Accept': 'application/json',
  }

  if (USERNAME && PASSWORD) {
    const base64Credentials = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64')
    headers['Authorization'] = `Basic ${base64Credentials}`
  }

  return headers
}

export async function execute(path, params) {
  const queryParams = new URLSearchParams(params)

  try {
    const response = await fetch(`${PROMETHEUS_URL}/api/v1/${path}?${queryParams}`, {
      headers: getHeaders(),
    })

    if (!response.ok) {
      const errorText = await response.text()
      if (response.status === 401) {
        throw new Error('Authentication failed: Invalid credentials')
      }
      throw new Error(`Prometheus query failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()

    if (data.status !== 'success') {
      throw new Error(`Prometheus query failed: ${data.error || 'Unknown error'}`)
    }

    return data
  } catch (error) {
    throw new Error(`Failed to execute Prometheus query: ${error.message}`)
  }
}

/**
 * Execute an instant query against Prometheus
 * @param {string} query - PromQL query string
 * @returns {Promise<Object>} Query results
 */
export async function instantQuery(query) {
  if (!query) {
    throw new Error('Query parameter is required')
  }
  return await execute('query', { query })
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
    throw new Error('Query, start, and end parameters are required')
  }
  return await execute('query_range', {
    query,
    start: Math.floor(start.getTime() / 1000),
    end: Math.floor(end.getTime() / 1000),
    step
  })
}
