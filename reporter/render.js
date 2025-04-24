import fs from 'fs/promises';

async function renderJsonToHtml(jsonFilePath) {
    try {
        // Read and parse the JSON file
        const jsonData = JSON.parse(await fs.readFile(jsonFilePath, 'utf-8'));
        
        // Extract unique scenarios and fhirimpl values
        const data = jsonData.data.result;
        const scenarios = [...new Set(data.map(item => item.metric.scenario))];
        const fhirimpls = [...new Set(data.map(item => item.metric.fhirimpl))];
        
        // Create a data map for easy lookup
        const dataMap = new Map();
        data.forEach(item => {
            const key = `${item.metric.scenario}_${item.metric.fhirimpl}`;
            dataMap.set(key, parseFloat(item.value[1]).toFixed(2));
        });
        
        // Generate HTML
        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>FHIR Server Performance Results</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body class="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-['Inter']">
    <div class="max-w-[1080px] mx-auto">
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
            <div class="px-6 py-5 border-b border-gray-200">
                <h2 class="text-xl font-semibold text-gray-900">FHIR Server Performance Comparison</h2>
                <p class="mt-1 text-sm text-gray-500">Requests per second by implementation and scenario</p>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th scope="col" class="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                Scenario
                            </th>
                            ${fhirimpls.map(impl => `
                                <th scope="col" class="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                                    ${impl}
                                </th>
                            `).join('')}
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 bg-white">
                        ${scenarios.map(scenario => `
                            <tr class="hover:bg-gray-50 transition-colors">
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    ${scenario}
                                </td>
                                ${fhirimpls.map(impl => {
                                    const value = dataMap.get(`${scenario}_${impl}`);
                                    return `
                                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm ${
                                            parseFloat(value) > 1000 ? 'text-green-600 font-semibold' : 'text-gray-500'
                                        }">
                                            ${value || '-'}
                                        </td>
                                    `;
                                }).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        <div class="mt-4 text-center text-sm text-gray-500">
            Generated on ${new Date().toLocaleString()}
        </div>
    </div>
</body>
</html>`;

        // Generate output filename
        const htmlFilePath = jsonFilePath.replace('.json', '.html');
        
        // Write HTML file
        await fs.writeFile(htmlFilePath, html);
        console.log(`HTML report generated: ${htmlFilePath}`);
        
    } catch (error) {
        console.error('Error rendering HTML:', error);
        throw error;
    }
}

// Export the render function
export { renderJsonToHtml };
