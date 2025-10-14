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

// Helper to update file
const updateFile = async (path: string, content: any, sha: string): Promise<void> => {
  const message = `Update ${path}`;
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
  const { content, sha } = await getFileContent(EVENTS_FILE);
  const events = [...content, event];
  await updateFile(EVENTS_FILE, events, sha);
};

export const updateEvent = async (updatedEvent: Event): Promise<void> => {
  const { content, sha } = await getFileContent(EVENTS_FILE);
  const events = content.map((event: Event) =>
    event.id === updatedEvent.id ? updatedEvent : event
  );
  await updateFile(EVENTS_FILE, events, sha);
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
  const { content, sha } = await getFileContent(USERS_FILE);
  const users = [...content, user];
  await updateFile(USERS_FILE, users, sha);
};
