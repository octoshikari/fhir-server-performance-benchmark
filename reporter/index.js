import fs from 'fs/promises';
import { instantQuery, rangeQuery } from './metrics.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';


const __dirname = dirname(fileURLToPath(import.meta.url));

// Generate output filename with timestamp
const generateOutputFilename = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return join(__dirname, '..', 'reports', `query_results_${timestamp}.json`);
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
        const outputFile = generateOutputFilename();
        await saveToJson(metricsData, outputFile);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

function generateQueries(runid) {
    return {
        average_rps: {
            query: `sum by (fhirimpl, scenario) (avg_over_time(irate(k6_http_reqs_total{runid="${runid}"} [1m] )[24h])) `,
        }
    };
}

async function main(runid) { 
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - (24 * 60 * 60 * 1000)); // 24 hours ago
    const queries = generateQueries(runid);
    await queryMetrics(queries.average_rps.query, startTime, endTime); 
}



const runid = '2025-04-24T12:29:33Z';

main(runid); 