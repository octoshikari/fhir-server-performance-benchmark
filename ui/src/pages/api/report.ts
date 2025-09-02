import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { runid, branch } = req.query;

  if (!runid) {
    return res.status(400).json({ error: 'Run ID is required' });
  }

  const branchName = branch || 'main';
  const basePath = branchName === 'main' 
    ? 'fhir-server-performance-benchmark'
    : `fhir-server-performance-benchmark/${branchName}`;
  
  const reportUrl = `https://storage.googleapis.com/samurai-public/${basePath}/SNAPSHOT_${runid}.json`;

  try {
    // Server-side fetch doesn't have CORS restrictions
    const response = await fetch(reportUrl);
    
    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ error: `Report not found for run ID: ${runid}` });
      }
      return res.status(response.status).json({ error: `Failed to fetch report: ${response.status}` });
    }

    const data = await response.text();
    res.status(200).json({ data });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Failed to fetch report from GCS' });
  }
}