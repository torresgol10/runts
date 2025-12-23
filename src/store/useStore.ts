import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getWebContainerInstance, writeFile } from '../webcontainer/instance';
import ts from 'typescript';
import { ThemeId } from '../utils/themes';
import { transformCode } from '../utils/transform';

interface Tab {
    id: string;
    title: string;
    content: string;
}

interface LogEntry {
    id: string;
    line?: number;
    content: string;
    method?: 'log' | 'error' | 'warn' | 'info';
    timestamp: number;
}

interface Snippet {
    id: string;
    name: string;
    code: string;
}

interface RuntsState {
    isBooted: boolean;
    tabs: Tab[];
    activeTabId: string;
    output: LogEntry[];
    isRunning: boolean;
    autoRunEnabled: boolean;
    theme: ThemeId;
    matchLines: boolean;
    envVars: Record<string, string>;
    snippets: Snippet[];
    dependencies: Record<string, string>;

    boot: () => Promise<void>;
    addTab: () => void;
    closeTab: (id: string) => void;
    setActiveTab: (id: string) => void;
    updateTabContent: (id: string, content: string) => void;
    renameTab: (id: string, title: string) => void;
    toggleAutoRun: () => void;
    toggleMatchLines: () => void;
    runCode: () => Promise<void>;
    stopCode: () => void;
    appendLogs: (logs: LogEntry[]) => void;
    appendOutput: (content: string, line?: number) => void;
    clearOutput: () => void;
    installPackage: (pkg: string) => Promise<void>;
    uninstallPackage: (pkg: string) => Promise<void>;
    setTheme: (theme: ThemeId) => void;
    addEnvVar: (key: string, value: string) => void;
    removeEnvVar: (key: string) => void;
    addSnippet: (name: string, code: string) => void;
    removeSnippet: (id: string) => void;
    refreshDependencies: () => Promise<void>;
    deserialize: (state: Partial<RuntsState>) => void;
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let activeProcess: any = null;

export const useStore = create<RuntsState>()(persist((set, get) => ({
    isBooted: false,
    tabs: [{
        id: 'main',
        title: 'Main.ts',
        content: 'console.log("Hello RunTS! 🚀");'
    }],
    activeTabId: 'main',
    output: [],
    isRunning: false,
    autoRunEnabled: true,
    theme: 'runts-dark',
    matchLines: true,
    envVars: {},
    snippets: [
        { id: '1', name: 'Log', code: 'console.log();' },
        { id: '2', name: 'Timeout', code: 'setTimeout(() => {\n  \n}, 1000);' }
    ],
    dependencies: {},

    boot: async () => {
        if (get().isBooted) return;
        try {
            const instance = await getWebContainerInstance();
            const { dependencies } = get();

            await instance.mount({
                'package.json': {
                    file: {
                        contents: JSON.stringify({
                            name: 'runts-project',
                            type: 'module',
                            dependencies: dependencies,
                            scripts: { start: 'node index.js' }
                        })
                    }
                },
                'index.js': {
                    file: {
                        contents: 'console.log("Welcome to RunTS");'
                    }
                }
            });
            set({ isBooted: true });

            // Re-install dependencies if there are any
            if (Object.keys(dependencies).length > 0) {
                const { appendOutput } = get();
                appendOutput('[System] Restoring dependencies...');
                try {
                    const installProcess = await instance.spawn('npm', ['install']);
                    installProcess.output.pipeTo(new WritableStream({
                        write(data) {
                            appendOutput(data);
                        }
                    }));
                    await installProcess.exit;
                    appendOutput('[System] Dependencies restored.');
                } catch (e) {
                    appendOutput(`[System] Failed to restore dependencies: ${e}`);
                }
            }

            get().refreshDependencies();

            if (get().autoRunEnabled) {
                get().runCode();
            }
        } catch (error) {
            console.error('Failed to boot WebContainer', error);
            set({ output: [{ id: 'err', content: '[System] Failed to boot WebContainer.', timestamp: Date.now() }] });
        }
    },

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

        if (get().autoRunEnabled) {
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                get().runCode();
            }, 1500);
        }
    },

    renameTab: (id, title) => {
        set(state => ({
            tabs: state.tabs.map(t => t.id === id ? { ...t, title } : t)
        }));
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

    runCode: async () => {
        const { tabs, activeTabId, envVars, appendLogs, matchLines } = get();
        if (activeProcess) {
            activeProcess.kill();
        }

        if (debounceTimer) {
            clearTimeout(debounceTimer);
            debounceTimer = null;
        }

        set({ isRunning: true, output: [] });

        try {
            const activeTab = tabs.find(t => t.id === activeTabId);
            if (!activeTab) return;

            const instance = await getWebContainerInstance();
            const codeToRun = matchLines ? transformCode(activeTab.content) : activeTab.content;

            const transpiled = ts.transpileModule(codeToRun, {
                compilerOptions: {
                    module: ts.ModuleKind.CommonJS,
                    target: ts.ScriptTarget.ES2022,
                    esModuleInterop: true,
                }
            });

            // Inject console shim to capture method types via stdout
            const consoleShim = `
const __runts_log = console.log;
const __runts_error = console.error;
const __runts_warn = console.warn;
const __runts_info = console.info;

console.log = (...args) => __runts_log('__RUNTS_LOG__', ...args);
console.error = (...args) => __runts_log('__RUNTS_ERR__', ...args); // Redirect to stdout for capture
console.warn = (...args) => __runts_log('__RUNTS_WRN__', ...args);
console.info = (...args) => __runts_log('__RUNTS_INF__', ...args);
`;

            const finalCode = consoleShim + '\n' + transpiled.outputText;

            await writeFile('index.cjs', finalCode);

            const process = await instance.spawn('node', ['index.cjs'], {
                env: { ...envVars }
            });

            activeProcess = process;
            let streamBuffer = '';
            let logBuffer: LogEntry[] = [];

            const flushFilter = () => {
                if (logBuffer.length > 0) {
                    appendLogs(logBuffer);
                    logBuffer = [];
                }
            };

            const flushInterval = setInterval(flushFilter, 50);

            const processLine = (lineStr: string) => {
                let method: LogEntry['method'] = 'log';
                let content = lineStr;

                // Detect Method
                if (content.includes('__RUNTS_ERR__')) { method = 'error'; content = content.replace('__RUNTS_ERR__ ', '').replace('__RUNTS_ERR__', ''); }
                else if (content.includes('__RUNTS_WRN__')) { method = 'warn'; content = content.replace('__RUNTS_WRN__ ', '').replace('__RUNTS_WRN__', ''); }
                else if (content.includes('__RUNTS_INF__')) { method = 'info'; content = content.replace('__RUNTS_INF__ ', '').replace('__RUNTS_INF__', ''); }
                else if (content.includes('__RUNTS_LOG__')) { method = 'log'; content = content.replace('__RUNTS_LOG__ ', '').replace('__RUNTS_LOG__', ''); }

                // Detect Line Number
                let line: number | undefined;
                if (matchLines) {
                    const match = content.match(/\[RUNTS_LINE:(\d+)\]/);
                    if (match) {
                        try {
                            line = parseInt(match[1]);
                            content = content.replace(/\[RUNTS_LINE:\d+\]\s*,?\s*/, '');
                        } catch (e) { }
                    }
                } else {
                    // Clean line tag even if match lines is off if it leaked? Should check.
                    // But for now, just standard behavior.
                    // Actually, if we injected transformCode, the tag is there.
                    // We should clean it if 'matchLines' is true logic was applied upstream.
                }

                logBuffer.push({
                    id: Math.random().toString(36),
                    content: content,
                    line,
                    method,
                    timestamp: Date.now()
                });
            };

            process.output.pipeTo(new WritableStream({
                write(data) {
                    streamBuffer += data;
                    const lines = streamBuffer.split('\n');
                    streamBuffer = lines.pop() || '';

                    lines.forEach(lineStr => {
                        processLine(lineStr);
                    });

                    if (logBuffer.length > 50) flushFilter();
                }
            }));

            await process.exit;

            if (streamBuffer) {
                processLine(streamBuffer);
            }

            clearInterval(flushInterval);
            flushFilter();
        } catch (error: any) {
            get().appendLogs([{ id: 'err', content: `[Error] ${error.message}`, timestamp: Date.now() }]);
        } finally {
            activeProcess = null;
            set({ isRunning: false });
        }
    },

    stopCode: () => {
        if (activeProcess) {
            activeProcess.kill();
            activeProcess = null;
            set({ isRunning: false });
        }
    },

    installPackage: async (pkg: string) => {
        const { appendOutput, refreshDependencies } = get();
        appendOutput(`[System] Installing ${pkg}...`);
        try {
            const instance = await getWebContainerInstance();
            const process = await instance.spawn('npm', ['install', pkg]);
            process.output.pipeTo(new WritableStream({
                write(data) {
                    appendOutput(data);
                }
            }));
            await process.exit;
            appendOutput(`[System] ${pkg} installed.`);
            await refreshDependencies();
        } catch (error: any) {
            appendOutput(`[System] Failed to install ${pkg}: ${error.message}`);
        }
    },

    uninstallPackage: async (pkg: string) => {
        const { appendOutput, refreshDependencies } = get();

        // Optimistic UI update: Remove immediately from state
        set(state => {
            const newDeps = { ...state.dependencies };
            delete newDeps[pkg];
            return { dependencies: newDeps };
        });

        appendOutput(`[System] Uninstalling ${pkg}...`);
        try {
            const instance = await getWebContainerInstance();
            const process = await instance.spawn('npm', ['uninstall', pkg]);
            process.output.pipeTo(new WritableStream({
                write(data) {
                    appendOutput(data);
                }
            }));
            await process.exit;
            appendOutput(`[System] ${pkg} uninstalled.`);

            await refreshDependencies();
        } catch (error: any) {
            appendOutput(`[System] Failed to uninstall ${pkg}: ${error.message}`);
            // If failed, we should technically restore it, but simple refresh will sort it out eventually
            get().refreshDependencies();
        }
    },

    setTheme: (theme) => set({ theme }),

    addEnvVar: (key, value) => set(state => ({ envVars: { ...state.envVars, [key]: value } })),

    removeEnvVar: (key) => set(state => {
        const { [key]: _, ...rest } = state.envVars;
        return { envVars: rest };
    }),

    addSnippet: (name, code) => set(state => ({
        snippets: [...state.snippets, { id: Math.random().toString(36), name, code }]
    })),

    removeSnippet: (id) => set(state => ({
        snippets: state.snippets.filter(s => s.id !== id)
    })),

    refreshDependencies: async () => {
        try {
            const instance = await getWebContainerInstance();
            const raw = await instance.fs.readFile('package.json', 'utf-8');
            const json = JSON.parse(raw);
            set({ dependencies: json.dependencies || {} });
        } catch (e) { }
    },

    deserialize: (newState) => set(state => ({ ...state, ...newState }))
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
}));
