import fs from 'fs/promises';
import { instantQuery } from './metrics.js';
import { renderReportToHtml } from './render.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';


const __dirname = dirname(fileURLToPath(import.meta.url));

// Generate output filename with timestamp
const generateOutputFilename = (runid) => {
    return join(__dirname, '..', 'reports', `query_results_${runid}.json`);
};

// Save data to JSON file
async function saveToJson(data, outputFile) {
    try {
        // Ensure the directory exists
        const dir = dirname(outputFile);
        await fs.mkdir(dir, { recursive: true });
        
        // Write the file
        await fs.writeFile(outputFile, JSON.stringify(data, null, 2));
        console.log(`Results saved to: ${outputFile}`);
    } catch (error) {
        console.error(`Error saving file: ${error.message}`);
        throw error;
    }
}

// Main function that orchestrates the process
async function queryMetrics(query, startTime, endTime) {
    try {
        const metricsData = await instantQuery(query);
        return metricsData;
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

function generateQueries(runid) {
    return {
        crud: {
            average_rps: {
                query: `sum by (fhirimpl, scenario) (avg_over_time(irate(k6_http_reqs_total{runid="${runid}", scenario="crud"} [1m] )[24h])) `,
            },
            average_crud_p99: {
                query: `sum by (fhirimpl, method, name) (avg_over_time(k6_http_req_duration_p99{runid="${runid}", scenario="crud"}[24h]))`,
            }
        }
    };
}

async function doReport(runid) { 
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - (24 * 60 * 60 * 1000)); // 24 hours ago
    const queries = generateQueries(runid);
    let reportData = {};
    for (const [scenario, metrics] of Object.entries(queries)) {
        reportData[scenario] = {};
        for (const [metric, query] of Object.entries(metrics)) {
            reportData[scenario][metric] = await queryMetrics(query.query, startTime, endTime);
        }
    }

    const outputFile = generateOutputFilename(runid);
    await saveToJson(reportData, outputFile);
    renderReportToHtml(outputFile);
}

// Get runid from command line arguments
async function main() {
    const args = process.argv.slice(2);
    if (args.length !== 1) {
        console.error('Usage: node reporter/index.js <runid>');
        console.error('Example: node reporter/index.js 2025-04-24T12:29:33Z');
        process.exit(1);
    }

    const runid = args[0];
    await doReport(runid);
}

// Run the main function
main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
}); 