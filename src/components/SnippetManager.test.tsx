import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SnippetManager } from './SnippetManager';
import { useStore } from '../store/useStore';

vi.mock('../store/useStore', () => ({
    useStore: vi.fn(),
}));

describe('SnippetManager Component', () => {
    const mockAddSnippet = vi.fn();
    const mockRemoveSnippet = vi.fn();
    const mockUpdateTabContent = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useStore as any).mockReturnValue({
            snippets: [
                { id: '1', name: 'Log', code: 'console.log()' }
            ],
            tabs: [{ id: 'tab1', content: '' }],
            activeTabId: 'tab1',
            addSnippet: mockAddSnippet,
            removeSnippet: mockRemoveSnippet,
            updateTabContent: mockUpdateTabContent,
        });
    });

    it('should render snippets', () => {
        render(<SnippetManager />);
        expect(screen.getByText('Log')).toBeDefined();
    });

    it('should open form on add button click', () => {
        render(<SnippetManager />);
        // There might be multiple buttons (add, delete, play). The "Add" button is in the header.
        // We can click the first button or find the one in the header if we had structure.
        // For now, let's assume the "Add" button is NOT in the list (the list items have delete/play).
        // Actually, SnippetManager has a "Plus" button in the header.
        const buttons = screen.getAllByRole('button');
        // The header button is usually first if it's at the top.
        const addBtn = buttons[0];
        fireEvent.click(addBtn);
        expect(screen.getByPlaceholderText('Snippet Name')).toBeDefined();
    });

    it('should insert snippet into editor', () => {
        render(<SnippetManager />);
        const playBtn = screen.getByTitle('Insert');
        fireEvent.click(playBtn);
        // Should append to current tab content ('') + code ('console.log()')
        // Logic in component: activeTab.content + (activeTab.content ? '\n' : '') + snippetCode
        expect(mockUpdateTabContent).toHaveBeenCalledWith('tab1', 'console.log()');
    });
});
