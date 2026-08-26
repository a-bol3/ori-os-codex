import axios, { AxiosInstance } from 'axios';

export type GmailListPage = { messages?: Array<{ id: string; threadId?: string }>; nextPageToken?: string; historyId?: string; resultSizeEstimate?: number };
export type GmailMessage = { id: string; threadId?: string; internalDate?: string; snippet?: string; payload?: { headers?: Array<{ name: string; value: string }>; labelIds?: string[] } };

export class GmailProvider {
  private readonly client: AxiosInstance;

  constructor(private readonly accessToken: string, http: AxiosInstance = axios.create()) {
    if (!accessToken || accessToken.length > 8192) throw new Error('Invalid Gmail access token');
    this.client = http;
  }

  async listMessageIds(pageToken?: string, maxResults = 100): Promise<GmailListPage> {
    const bounded = Math.max(1, Math.min(maxResults, 100));
    const response = await this.client.get<GmailListPage>('https://gmail.googleapis.com/gmail/v1/users/me/messages', {
      headers: { Authorization: `Bearer ${this.accessToken}` },
      params: { maxResults: bounded, pageToken },
      timeout: 10_000,
    });
    return response.data;
  }

  async getMessage(id: string): Promise<GmailMessage> {
    if (!/^[A-Za-z0-9_-]{1,256}$/.test(id)) throw new Error('Invalid Gmail message id');
    const response = await this.client.get<GmailMessage>(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
      params: { format: 'metadata', metadataHeaders: ['Subject', 'From', 'To', 'Date'] },
      timeout: 10_000,
    });
    return response.data;
  }
}
