import { describe, it, expect } from 'vitest';
import { createTabsFeature } from './tabs';
import { create } from 'zustand';
import { RuntsState } from '../types';

// Factory for fresh store per test
const createTestStore = () => create<RuntsState>((set, get, api) => {
    return {
        ...createTabsFeature(set, get, api),
        autoRunEnabled: false,
        runCode: async () => { },
    } as any;
});

describe('Tabs Feature', () => {
    it('should initialize with a main tab', () => {
        const useStore = createTestStore();
        const store = useStore.getState();
        expect(store.tabs).toHaveLength(1);
        expect(store.tabs[0].id).toBe('main');
    });

    it('should add a new tab', () => {
        const useStore = createTestStore();
        const state = useStore.getState();
        state.addTab();
        const updated = useStore.getState();
        expect(updated.tabs).toHaveLength(2);
        expect(updated.activeTabId).not.toBe('main');
    });

    it('should update tab content', () => {
        const useStore = createTestStore();
        const state = useStore.getState();
        const mainId = state.tabs[0].id;

        state.updateTabContent(mainId, 'console.log("Updated");');

        const updated = useStore.getState();
        expect(updated.tabs[0].content).toBe('console.log("Updated");');
    });

    it('should close a tab', () => {
        const useStore = createTestStore();
        const state = useStore.getState();
        state.addTab(); // Now have 2 tabs
        const updatedState = useStore.getState();
        const tabIdToRemove = updatedState.tabs[1].id;

        state.closeTab(tabIdToRemove);

        const finalState = useStore.getState();
        expect(finalState.tabs).toHaveLength(1);
        expect(finalState.activeTabId).toBe('main');
    });
});
