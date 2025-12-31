import { StateCreator } from 'zustand';
import { RuntsState, PackagesSlice } from '../types';
import { webContainerService } from '../../services/WebContainerService';

export const createPackagesFeature: StateCreator<RuntsState, [], [], PackagesSlice> = (set, get) => ({
    dependencies: {
        "@types/node": "latest"
    },

    installPackage: async (pkg: string) => {
        const { appendOutput, refreshDependencies } = get();
        appendOutput(`[System] Installing ${pkg}...`);
        try {
            await webContainerService.install(pkg, (data) => appendOutput(data));
            appendOutput(`[System] ${pkg} installed.`);
            await refreshDependencies();

            // Auto-install types if not already installing a type package
            if (!pkg.startsWith('@types/')) {
                const typePkg = `@types/${pkg}`;
                appendOutput(`[System] Attempting to install ${typePkg}...`);
                try {
                    await webContainerService.install(typePkg, (data) => appendOutput(data));
                    appendOutput(`[System] ${typePkg} installed.`);
                    await refreshDependencies();
                } catch (e) {
                    // Silently fail if types dependnecy doesn't exist or installation fails
                    // Most packages include types now, so this is just a best-effort helper
                    appendOutput(`[System] No separate types found for ${pkg} (or built-in).`);
                }
            }
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
