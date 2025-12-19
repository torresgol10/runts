import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import { describe, it, expect, vi } from 'vitest';
import { Tabs } from '../Tabs';

describe('Tabs Component', () => {
    const mockTabs = [
        { id: '1', title: 'Tab 1', content: '' },
        { id: '2', title: 'Tab 2', content: '' },
    ];

    it('renders all tabs', async () => {
        render(
            <Tabs
                tabs={mockTabs}
                activeTabId="1"
                onTabClick={() => { }}
                onTabClose={() => { }}
                onNewTab={() => { }}
                onRenameTab={() => { }}
            />
        );
        await expect.element(page.getByText('Tab 1')).toBeVisible();
        await expect.element(page.getByText('Tab 2')).toBeVisible();
    });

    it('calls onTabClick when a tab is clicked', async () => {
        const onTabClick = vi.fn();
        render(
            <Tabs
                tabs={mockTabs}
                activeTabId="1"
                onTabClick={onTabClick}
                onTabClose={() => { }}
                onNewTab={() => { }}
                onRenameTab={() => { }}
            />
        );
        const tab2 = page.getByText('Tab 2');
        await tab2.click();
        expect(onTabClick).toHaveBeenCalledWith('2');
    });

    it('calls onNewTab when the plus button is clicked', async () => {
        const onNewTab = vi.fn();
        render(
            <Tabs
                tabs={mockTabs}
                activeTabId="1"
                onTabClick={() => { }}
                onTabClose={() => { }}
                onNewTab={onNewTab}
                onRenameTab={() => { }}
            />
        );
        const newTabButton = page.getByTitle('New Tab');
        await newTabButton.click();
        expect(onNewTab).toHaveBeenCalled();
    });
});
