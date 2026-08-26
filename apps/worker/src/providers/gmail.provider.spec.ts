import { GmailProvider } from './gmail.provider';

describe('GmailProvider', () => {
  it('bounds page size and uses readonly metadata requests', async () => {
    const http = { get: jest.fn().mockResolvedValue({ data: { messages: [], historyId: 'h1' } }) };
    const provider = new GmailProvider('token', http as never);
    await provider.listMessageIds(undefined, 999);
    expect(http.get).toHaveBeenCalledWith(expect.stringContaining('/messages'), expect.objectContaining({ params: { maxResults: 100, pageToken: undefined } }));
    await provider.getMessage('msg_1');
    expect(http.get).toHaveBeenLastCalledWith(expect.stringContaining('/messages/msg_1'), expect.objectContaining({ params: expect.objectContaining({ format: 'metadata' }) }));
  });

  it('rejects malformed message identifiers', async () => {
    const provider = new GmailProvider('token', { get: jest.fn() } as never);
    await expect(provider.getMessage('bad/id')).rejects.toThrow('Invalid Gmail message id');
  });
});
