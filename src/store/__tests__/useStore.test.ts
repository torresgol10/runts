import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStore } from '../useStore';

// Mock WebContainer instance
vi.mock('../../webcontainer/instance', () => ({
    getWebContainerInstance: vi.fn(),
    writeFile: vi.fn(),
}));

describe('useStore', () => {
    beforeEach(() => {
        // Reset or setup logic here if needed
    });

    it('should have initial state', () => {
        const state = useStore.getState();
        expect(state.isBooted).toBe(false);
        expect(state.tabs).toHaveLength(1);
        expect(state.activeTabId).toBe('main');
        expect(state.theme).toBe('runts-dark');
    });

    it('should add a new tab', () => {
        const { addTab } = useStore.getState();
        addTab();
        const state = useStore.getState();
        expect(state.tabs).toHaveLength(2);
        expect(state.tabs[1].title).toBe('Untitled');
    });

    it('should set active tab', () => {
        const { addTab, setActiveTab } = useStore.getState();
        addTab();
        const stateBefore = useStore.getState();
        const newTabId = stateBefore.tabs[1].id;

        setActiveTab(newTabId);
        const stateAfter = useStore.getState();
        expect(stateAfter.activeTabId).toBe(newTabId);
    });

    it('should rename a tab', () => {
        const { renameTab } = useStore.getState();
        renameTab('main', 'New Name');
        const state = useStore.getState();
        expect(state.tabs[0].title).toBe('New Name');
    });

    it('should toggle auto-run', () => {
        const initialState = useStore.getState().autoRunEnabled;
        const { toggleAutoRun } = useStore.getState();
        toggleAutoRun();
        expect(useStore.getState().autoRunEnabled).toBe(!initialState);
    });

    it('should change theme', () => {
        const { setTheme } = useStore.getState();
        setTheme('dracula');
        expect(useStore.getState().theme).toBe('dracula');
    });

    it('should clear output', () => {
        // Manually add some output first
        useStore.setState({
            output: [
                { id: '1', content: 'line 1', timestamp: 123 },
                { id: '2', content: 'line 2', timestamp: 456 }
            ]
        });
        const { clearOutput } = useStore.getState();
        clearOutput();
        expect(useStore.getState().output).toHaveLength(0);
    });
});
