import { StateCreator } from 'zustand';
import { RuntsState, ExecutionSlice } from '../types';
import { webContainerService } from '../../services/WebContainerService';

export const createExecutionFeature: StateCreator<RuntsState, [], [], ExecutionSlice> = (set, get) => ({
    isBooted: false,
    isRunning: false,
    output: [],
    autoRunEnabled: true,
    matchLines: true,

    boot: async () => {
        if (get().isBooted) return;
        try {
            await webContainerService.boot(get().dependencies);
            set({ isBooted: true });

            // Restore dependencies
            if (Object.keys(get().dependencies).length > 0) {
                const { appendOutput } = get();
                appendOutput('[System] Restoring dependencies...');
                await webContainerService.restoreDependencies((data) => appendOutput(data));
                appendOutput('[System] Dependencies restored.');
            }

            get().refreshDependencies();

            if (get().autoRunEnabled) {
                get().runCode();
            }
        } catch (error) {
            console.error('Failed to boot WebContainer', error);
            set({ output: [{ id: 'err', content: '[System] Failed to boot WebContainer.', timestamp: Date.now(), method: 'error' }] });
        }
    },

    toggleAutoRun: () => set(state => ({ autoRunEnabled: !state.autoRunEnabled })),
    toggleMatchLines: () => set(state => ({ matchLines: !state.matchLines })),

    appendLogs: (newLogs) => set(state => ({
        output: [...state.output, ...newLogs]
    })),

    appendOutput: (content, line) => {
        get().appendLogs([{
            id: Math.random().toString(36),
            content,
            line,
            timestamp: Date.now()
        }]);
    },

    clearOutput: () => set({ output: [] }),

    stopCode: () => {
        webContainerService.kill();
        set({ isRunning: false });
    },

    runCode: async () => {
        const { tabs, activeTabId, envVars, matchLines, appendLogs } = get();

        webContainerService.kill(); // Ensure previous stopped
        set({ isRunning: true, output: [] });

        const activeTab = tabs.find(t => t.id === activeTabId);
        if (!activeTab) {
            set({ isRunning: false });
            return;
        }

        // Buffer for logs if needed, or direct dispatch?
        // Direct dispatch is fine for now, Zustand is fast enough usually.
        // Or we could buffer inside service, but for now direct callback.

        await webContainerService.runCode(
            activeTab.content,
            envVars,
            matchLines,
            (log) => appendLogs([log]),
            () => set({ isRunning: false })
        );
    },
});
