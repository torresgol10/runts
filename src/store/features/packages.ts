import { StateCreator } from 'zustand';
import { RuntsState } from '../types';
import { webContainerService } from '../../services/WebContainerService';

export const createPackagesFeature: StateCreator<RuntsState> = (set, get) => ({
    dependencies: {},

    installPackage: async (pkg: string) => {
        const { appendOutput, refreshDependencies } = get();
        appendOutput(`[System] Installing ${pkg}...`);
        try {
            await webContainerService.install(pkg, (data) => appendOutput(data));
            appendOutput(`[System] ${pkg} installed.`);
            await refreshDependencies();
        } catch (error: any) {
            appendOutput(`[System] Failed to install ${pkg}: ${error.message}`);
        }
    },

    uninstallPackage: async (pkg: string) => {
        const { appendOutput, refreshDependencies } = get();

        // Optimistic UI update
        set(state => {
            const newDeps = { ...state.dependencies };
            delete newDeps[pkg];
            return { dependencies: newDeps };
        });

        appendOutput(`[System] Uninstalling ${pkg}...`);
        try {
            await webContainerService.uninstall(pkg, (data) => appendOutput(data));
            appendOutput(`[System] ${pkg} uninstalled.`);
            await refreshDependencies();
        } catch (error: any) {
            appendOutput(`[System] Failed to uninstall ${pkg}: ${error.message}`);
            // Revert on error
            get().refreshDependencies();
        }
    },

    refreshDependencies: async () => {
        const deps = await webContainerService.refreshDependencies();
        set({ dependencies: deps });
    },
});
