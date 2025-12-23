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
            await instance.mount({
                'package.json': {
                    file: {
                        contents: JSON.stringify({
                            name: 'runts-project',
                            type: 'module',
                            dependencies: {},
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
            get().refreshDependencies();
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

            await writeFile('index.cjs', transpiled.outputText);

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
                if (!matchLines) {
                    logBuffer.push({
                        id: Math.random().toString(36),
                        content: lineStr,
                        timestamp: Date.now()
                    });
                    return;
                }

                let line: number | undefined;
                let cleanPart = lineStr;

                const match = lineStr.match(/\[RUNTS_LINE:(\d+)\]/);
                if (match) {
                    try {
                        line = parseInt(match[1]);
                        cleanPart = lineStr.replace(/\[RUNTS_LINE:\d+\]\s*,?\s*/, '');
                    } catch (e) { }
                }

                logBuffer.push({
                    id: Math.random().toString(36),
                    content: cleanPart,
                    line,
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
        snippets: state.snippets
    })
}));
