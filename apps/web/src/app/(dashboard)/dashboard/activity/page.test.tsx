import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiFetchMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/api-client', () => ({
    apiFetch: apiFetchMock,
    getErrorMessage: (error: unknown, fallback: string) =>
        error instanceof Error ? error.message : fallback,
}));

import ActivityPage from './page';

describe('ActivityPage', () => {
    beforeEach(() => {
        apiFetchMock.mockReset();
    });

    it('loads and renders activities returned by the API', async () => {
        apiFetchMock.mockResolvedValue({
            json: async () => [{
                id: 'activity-1',
                type: 'deal',
                title: 'Deal moved to qualified',
                description: 'Acme renewal is now qualified.',
                createdAt: '2026-08-06T10:00:00.000Z',
                status: 'unread',
            }],
        });

        render(<ActivityPage />);

        expect(screen.getByRole('status', { name: 'Loading activity' })).toBeInTheDocument();
        expect(await screen.findByText('Deal moved to qualified')).toBeInTheDocument();
        expect(screen.getByText('Acme renewal is now qualified.')).toBeInTheDocument();
        expect(apiFetchMock).toHaveBeenCalledWith('/activities?limit=100&offset=0');
    });

    it('shows an explicit empty state when the API has no activities', async () => {
        apiFetchMock.mockResolvedValue({ json: async () => [] });

        render(<ActivityPage />);

        expect(await screen.findByText('No activity has been recorded yet.')).toBeInTheDocument();
    });

    it('shows an error and can retry the API request', async () => {
        apiFetchMock
            .mockRejectedValueOnce(new Error('Activity service unavailable'))
            .mockResolvedValueOnce({ json: async () => [] });

        render(<ActivityPage />);

        expect(await screen.findByRole('alert')).toHaveTextContent('Activity service unavailable');
        fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

        await waitFor(() => expect(screen.getByText('No activity has been recorded yet.')).toBeInTheDocument());
        expect(apiFetchMock).toHaveBeenCalledTimes(2);
    });
});
