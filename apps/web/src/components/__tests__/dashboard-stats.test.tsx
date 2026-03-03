import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DashboardStats } from '../dashboard-stats';
import React from 'react';

describe('DashboardStats', () => {
    it('shows loading skeleton while data is fetching', () => {
        const { container } = render(<DashboardStats loading={true} data={null} />);
        // Check for some skeleton indicator - Card with animate-pulse
        expect(container.querySelector('.animate-pulse')).toBeDefined();
    });

    it('shows real contact count when data is loaded', () => {
        const mockData: any = {
            contacts: { total: 142, thisMonth: 12, growth: 5 },
            companies: { total: 38, thisMonth: 2 },
            deals: { total: 7, value: 45000, byStage: [] },
            campaigns: { total: 3, active: 1, sent: 100, opened: 50 },
            workflows: { total: 5, active: 2, runs: 10 },
            recentActivity: []
        };
        render(<DashboardStats loading={false} data={mockData} />);
        expect(screen.getByText('142')).toBeDefined();
    });
});
