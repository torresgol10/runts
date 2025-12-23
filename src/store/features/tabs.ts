import { StateCreator } from 'zustand';
import { RuntsState, TabsSlice } from '../types';

export const createTabsFeature: StateCreator<RuntsState, [], [], TabsSlice> = (set, get) => ({
    tabs: [{
        id: 'main',
        title: 'Main.ts',
        content: 'console.log("Hello RunTS! 🚀");'
    }],
    activeTabId: 'main',

    addTab: () => {
        const newId = Math.random().toString(36).substring(7);
        set(state => ({
            tabs: [...state.tabs, { id: newId, title: 'Untitled.ts', content: '' }],
            activeTabId: newId
        }));
    },

    closeTab: (id) => {
        set(state => {
            if (state.tabs.length <= 1) return state;
            const newTabs = state.tabs.filter(t => t.id !== id);
            return {
                tabs: newTabs,
                activeTabId: state.activeTabId === id ? newTabs[0].id : state.activeTabId
            };
        });
    },

    setActiveTab: (id) => set({ activeTabId: id }),

    updateTabContent: (id, content) => {
        set(state => ({
            tabs: state.tabs.map(t => t.id === id ? { ...t, content } : t)
        }));

        const { autoRunEnabled, runCode } = get();
        if (autoRunEnabled) {
            // Simple debounce replacement since we don't have the global timer var here easily
            // We can strictly use a specific window property or similar, but better to just use a local timer 
            // if we export the debounce timer from execution or managed globally. 
            // Ideally, runCode in execution handles the debounce clearing as it did in the monolith.
            // YES, runCode clears debounceTimer. So we just need to schedule it.
            // Wait, we need to schedule the CALL to runCode.

            // Let's just use a timeout here.
            // Ideally store the timer in the store? or module scope?
            // Module scope in tabs.ts works if singleton.
            if ((window as any).__runts_debounce) clearTimeout((window as any).__runts_debounce);
            (window as any).__runts_debounce = setTimeout(() => {
                runCode();
            }, 1000);
        }
    },

    renameTab: (id, title) => {
        set(state => ({
            tabs: state.tabs.map(t => t.id === id ? { ...t, title } : t)
        }));
    },
});
