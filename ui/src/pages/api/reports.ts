import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { branch } = req.query;
  const branchName = (branch as string) || 'main';

  try {
    // GCS public bucket URL for listing objects
    const bucketUrl = 'https://storage.googleapis.com/storage/v1/b/samurai-public/o';
    
    // Adjust prefix based on selected branch
    const prefix = branchName === 'main' 
      ? 'fhir-server-performance-benchmark/SNAPSHOT_'
      : `fhir-server-performance-benchmark/${branchName}/SNAPSHOT_`;
    
    const params = new URLSearchParams({
      prefix: prefix,
      maxResults: '30',
      fields: 'items(name,timeCreated)',
    });

    const apiUrl = `${bucketUrl}?${params}`;
    
    // Server-side fetch doesn't have CORS restrictions
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch reports: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching reports list:', error);
    res.status(500).json({ error: 'Failed to fetch reports list from GCS' });
  }
}