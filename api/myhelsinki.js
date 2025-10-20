// Vercel serverless function to proxy MyHelsinki API requests
// This bypasses CORS restrictions by making the request from the server side

export default async function handler(req, res) {
  // Set CORS headers to allow requests from your frontend
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get query parameters
    const { limit = '100' } = req.query;

    // Fetch from MyHelsinki API
    const response = await fetch(`https://open-api.myhelsinki.fi/v1/events/?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`MyHelsinki API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Return the data
    res.status(200).json(data);
  } catch (error) {
    console.error('Error proxying MyHelsinki API:', error);
    res.status(500).json({ 
      error: 'Failed to fetch events from MyHelsinki',
      message: error.message 
    });
  }
}
