# Victoria Metrics Query Script

This script connects to a Victoria Metrics instance, executes a specific query, and saves the results to a JSON file.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the project root with your Victoria Metrics URL:
```
VICTORIA_METRICS_URL=http://your-victoria-metrics-url:8428
```

If not specified, it will default to `http://localhost:8428`.

## Usage

Run the script:
```bash
npm start
```

The script will:
1. Connect to the specified Victoria Metrics instance
2. Execute the query: `sum(irate(k6_http_reqs_total{runid=~"$runid"}[$__rate_interval])) by (fhirimpl, scenario)`
3. Save the results to a timestamped JSON file in the same directory

## Output

The results will be saved in a file named `query_results_[timestamp].json` in the script's directory. 