import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const GITHUB_OWNER = 'rogerjs93';
const GITHUB_REPO = 'groupevent';
const USERS_FILE = 'data/users.json';

// Helper to get file content
async function getFileContent() {
  try {
    const { data } = await octokit.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: USERS_FILE,
    });

    if ('content' in data) {
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      return { content: JSON.parse(content), sha: data.sha };
    }
    return { content: [], sha: '' };
  } catch (error: any) {
    if (error.status === 404) {
      return { content: [], sha: '' };
    }
    throw error;
  }
}

// Helper to update file
async function updateFile(content: any, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const { sha } = await getFileContent();
      const contentEncoded = Buffer.from(JSON.stringify(content, null, 2)).toString('base64');

      await octokit.repos.createOrUpdateFileContents({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        path: USERS_FILE,
        message: `Update ${USERS_FILE}`,
        content: contentEncoded,
        sha: sha || undefined,
      });

      return;
    } catch (error: any) {
      if (error.status === 409 && attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }
      throw error;
    }
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Fetch users
      const { content } = await getFileContent();
      return res.status(200).json(content);
    }

    if (req.method === 'POST') {
      // Add new user
      const newUser = req.body;
      const { content } = await getFileContent();
      const users = [...content, newUser];
      await updateFile(users);
      return res.status(201).json(newUser);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
