import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Fetch all folders/prefixes to identify branches
    const bucketUrl = 'https://storage.googleapis.com/storage/v1/b/samurai-public/o';
    const params = new URLSearchParams({
      prefix: 'fhir-server-performance-benchmark/',
      delimiter: '/',
      fields: 'prefixes',
    });

    const apiUrl = `${bucketUrl}?${params}`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch branches: ${response.status}`);
    }

    const data = await response.json();
    
    let branches = ['main']; // Always include main
    
    if (data.prefixes && Array.isArray(data.prefixes)) {
      // Extract branch names from prefixes
      const extractedBranches = data.prefixes
        .map((prefix: string) => {
          const match = prefix.match(/fhir-server-performance-benchmark\/([^\/]+)\/$/);
          return match ? match[1] : null;
        })
        .filter((branch: string | null) => branch !== null && branch !== 'main');
      
      branches = ['main', ...extractedBranches];
    }
    
    res.status(200).json({ branches });
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({ error: 'Failed to fetch branches from GCS', branches: ['main'] });
  }
}