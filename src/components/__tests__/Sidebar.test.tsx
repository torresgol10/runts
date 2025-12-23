import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import { describe, it, expect, vi } from 'vitest';
import { Sidebar } from '../Sidebar';

describe('Sidebar Component', () => {
    const defaultProps = {
        onInstall: vi.fn(),
        onRun: vi.fn(),
        isRunning: false,
        autoRunEnabled: true,
        onToggleAutoRun: vi.fn(),
        currentTheme: 'runts-dark' as const,
        onThemeChange: vi.fn(),
    };

    it('renders correctly', async () => {
        render(<Sidebar {...defaultProps} />);
        await expect.element(page.getByText('TS')).toBeVisible();
    });

    it('calls onRun when play button is clicked', async () => {
        render(<Sidebar {...defaultProps} />);
        const runButton = page.getByTitle('Run (Ctrl+Enter)');
        await runButton.click();
        expect(defaultProps.onRun).toHaveBeenCalled();
    });

    it('toggles package popover when package icon is clicked', async () => {
        render(<Sidebar {...defaultProps} />);
        const packageButton = page.getByTitle('Packages');
        await packageButton.click();
        await expect.element(page.getByText('NPM Packages')).toBeVisible();
    });

    it('shows settings popover when settings icon is clicked', async () => {
        render(<Sidebar {...defaultProps} />);
        const settingsButton = page.getByTitle('Settings');
        await settingsButton.click();
        await expect.element(page.getByText('Settings')).toBeVisible();
    });
});
