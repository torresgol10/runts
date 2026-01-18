import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RuntsState } from './types';
import { createTabsFeature } from './features/tabs';
import { createExecutionFeature } from './features/execution';
import { createPackagesFeature } from './features/packages';
import { createUIFeature } from './features/ui';

export const useStore = create<RuntsState>()(
    persist((...a) => ({
        ...createTabsFeature(...a),
        ...createExecutionFeature(...a),
        ...createPackagesFeature(...a),
        ...createUIFeature(...a),
    }), {
        name: 'runts-storage',
        partialize: (state) => ({
            tabs: state.tabs,
            activeTabId: state.activeTabId,
            theme: state.theme,
            autoRunEnabled: state.autoRunEnabled,
            matchLines: state.matchLines,
            envVars: state.envVars,
            snippets: state.snippets,
            dependencies: state.dependencies
        })
    })
);

