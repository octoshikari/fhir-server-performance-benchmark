# FHIR Performance Benchmark UI

A Next.js application for viewing and analyzing FHIR server performance benchmark reports.

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm start
```

## CORS Configuration

The application fetches benchmark reports from a Google Cloud Storage bucket. There are two approaches depending on your environment:

### Development (Automatic Fallback)

The application automatically uses a CORS proxy (`corsproxy.io`) when direct fetching fails due to CORS restrictions. This allows development without needing bucket configuration.

You'll see console warnings when the proxy is used:
```
⚠️ Report loaded via CORS proxy. For production, configure CORS on the GCS bucket.
```

### Production (Recommended)

For production deployments, configure CORS on the GCS bucket to allow direct access:

1. Ensure you have `gsutil` installed and authenticated
2. Apply the CORS configuration:
   ```bash
   # From the repository root
   gsutil cors set cors-config.json gs://samurai-public
   ```
3. Verify the configuration:
   ```bash
   gsutil cors get gs://samurai-public
   ```

The `cors-config.json` file in the repository root contains:
```json
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "OPTIONS"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
```

## Deployment

The application can be deployed as a static site to any platform that supports Next.js static exports.

### GitHub Pages (Automated)

The repository includes a GitHub Actions workflow that automatically deploys the UI to GitHub Pages when changes are pushed to the main branch.

1. **Enable GitHub Pages in your repository:**
   - Go to Settings → Pages
   - Set Source to "GitHub Actions"

2. **The workflow will automatically trigger when:**
   - Changes are pushed to the `ui/` directory
   - The workflow is manually triggered

3. **Access the deployed site at:**
   ```
   https://[your-username].github.io/fhir-server-performance-benchmark/
   ```

### GitHub Pages (Manual)

To build and test the GitHub Pages deployment locally:

```bash
# Using the deployment script
./deploy-gh-pages.sh

# Or manually with npm
NEXT_PUBLIC_BASE_PATH=/fhir-server-performance-benchmark npm run build

# Create required files
touch out/.nojekyll
cp out/index.html out/404.html

# Deploy using gh-pages
npx gh-pages -d out
```

### Vercel

Deploy directly from your GitHub repository using Vercel's GitHub integration. No base path configuration needed.

### Custom Domain

If deploying to a custom domain at the root path, you can build without the base path:

```bash
npm run build
```

## Architecture

- **Pages**
  - `/` - Lists available benchmark reports from GCS
  - `/report?runid=XXX` - Displays a specific benchmark report

- **Components**
  - `Suite` - Displays benchmark suite results
  - `ReportSummary` - Shows report metadata and summary
  - `BarChart` - Visualizes benchmark data

- **Libraries**
  - `benchmark-parser.ts` - Validates and parses benchmark JSON
  - `benchmark-converter.ts` - Converts Prometheus data to report format

## Troubleshooting

### "Failed to fetch" Error

This typically indicates CORS is not configured on the GCS bucket. The app will automatically try to use a CORS proxy for development. For production, follow the CORS configuration steps above.

### Report Not Found

Verify the report exists in the GCS bucket:
```bash
gsutil ls gs://samurai-public/fhir-server-performance-benchmark/SNAPSHOT_*
```

### TypeScript Errors

Run the type checker:
```bash
npm run type-check
```

Build errors can be temporarily bypassed by setting `eslint.ignoreDuringBuilds: true` in `next.config.ts`.