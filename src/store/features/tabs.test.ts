import { describe, it, expect } from 'vitest';
import { createTabsFeature } from './tabs';
import { create } from 'zustand';
import { RuntsState } from '../types';

// Mock minimal state for testing
const useTestStore = create<RuntsState>((set, get, api) => {
    return {
        ...createTabsFeature(set, get, api),
        // Mock other required parts of state if necessary for tabs (autoRunEnabled needed for updateTabContent)
        autoRunEnabled: false,
        runCode: async () => { },
    } as any;
});

describe('Tabs Feature', () => {
    it('should initialize with a main tab', () => {
        const store = useTestStore.getState();
        expect(store.tabs).toHaveLength(1);
        expect(store.tabs[0].id).toBe('main');
    });

    it('should add a new tab', () => {
        const store = useTestStore.getState();
        store.addTab();
        const updated = useTestStore.getState();
        expect(updated.tabs).toHaveLength(2);
        expect(updated.activeTabId).not.toBe('main'); // Should switch to new tab
    });

    it('should update tab content', () => {
        const store = useTestStore.getState();
        const mainId = store.tabs[0].id;

        store.updateTabContent(mainId, 'console.log("Updated");');

        const updated = useTestStore.getState();
        expect(updated.tabs[0].content).toBe('console.log("Updated");');
    });

    it('should close a tab', () => {
        const store = useTestStore.getState();
        store.addTab(); // Ensure 2 tabs
        const tabIdToRemove = store.tabs[1].id;

        store.closeTab(tabIdToRemove);

        const updated = useTestStore.getState();
        expect(updated.tabs).toHaveLength(1);
        expect(updated.activeTabId).toBe('main'); // Fallback to main
    });
});
