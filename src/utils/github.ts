import { Octokit } from '@octokit/rest';
import { Event, User } from '../types';

// GitHub configuration
const GITHUB_OWNER = 'rogerjs93';
const GITHUB_REPO = 'groupevent';
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || '';

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

const EVENTS_FILE = 'data/events.json';
const USERS_FILE = 'data/users.json';

// Helper to get file content
const getFileContent = async (path: string): Promise<any> => {
  try {
    const { data } = await octokit.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path,
    });

    if ('content' in data) {
      const content = atob(data.content);
      return { content: JSON.parse(content), sha: data.sha };
    }
    return { content: [], sha: '' };
  } catch (error: any) {
    if (error.status === 404) {
      return { content: [], sha: '' };
    }
    throw error;
  }
};

// Helper to update file with retry logic
const updateFile = async (path: string, content: any, maxRetries = 3): Promise<void> => {
  const message = `Update ${path}`;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Always fetch the latest SHA before updating
      const { sha } = await getFileContent(path);
      const contentEncoded = btoa(JSON.stringify(content, null, 2));

      if (sha) {
        // Update existing file
        await octokit.repos.createOrUpdateFileContents({
          owner: GITHUB_OWNER,
          repo: GITHUB_REPO,
          path,
          message,
          content: contentEncoded,
          sha,
        });
      } else {
        // Create new file
        await octokit.repos.createOrUpdateFileContents({
          owner: GITHUB_OWNER,
          repo: GITHUB_REPO,
          path,
          message,
          content: contentEncoded,
        });
      }
      
      // Success - exit the retry loop
      return;
    } catch (error: any) {
      // If it's a SHA mismatch and we have retries left, try again
      if (error.status === 409 && attempt < maxRetries - 1) {
        console.log(`Retry attempt ${attempt + 1} for ${path}`);
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms before retry
        continue;
      }
      // If we're out of retries or it's a different error, throw it
      throw error;
    }
  }
};

// Events API
export const fetchEvents = async (): Promise<Event[]> => {
  try {
    const { content } = await getFileContent(EVENTS_FILE);
    return content;
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

export const addEvent = async (event: Event): Promise<void> => {
  const { content } = await getFileContent(EVENTS_FILE);
  const events = [...content, event];
  await updateFile(EVENTS_FILE, events);
};

export const updateEvent = async (updatedEvent: Event): Promise<void> => {
  const { content } = await getFileContent(EVENTS_FILE);
  const events = content.map((event: Event) =>
    event.id === updatedEvent.id ? updatedEvent : event
  );
  await updateFile(EVENTS_FILE, events);
};

// Users API
export const fetchUsers = async (): Promise<User[]> => {
  try {
    const { content } = await getFileContent(USERS_FILE);
    return content;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const addUser = async (user: User): Promise<void> => {
  const { content } = await getFileContent(USERS_FILE);
  const users = [...content, user];
  await updateFile(USERS_FILE, users);
};
