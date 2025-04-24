import { renderJsonToHtml } from './render.js';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Path to the JSON file
const jsonFilePath = join(__dirname, '..', 'reports', 'query_results_2025-04-24T14-01-05-626Z.json');

// Render the HTML
renderJsonToHtml(jsonFilePath)
    .then(() => console.log('Rendering completed successfully'))
    .catch(error => console.error('Error:', error)); 