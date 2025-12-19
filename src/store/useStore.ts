import { create } from 'zustand';
import { getWebContainerInstance, writeFile } from '../webcontainer/instance';
import ts from 'typescript';
import { ThemeId } from '../utils/themes';

interface Tab {
    id: string;
    title: string;
    content: string;
}

interface RuntsState {
    isBooted: boolean;
    tabs: Tab[];
    activeTabId: string;
    output: string[];
    isRunning: boolean;
    autoRunEnabled: boolean;
    theme: ThemeId;

    // Actions
    boot: () => Promise<void>;
    addTab: () => void;
    closeTab: (id: string) => void;
    setActiveTab: (id: string) => void;
    updateTabContent: (id: string, content: string) => void;
    renameTab: (id: string, title: string) => void;
    toggleAutoRun: () => void;
    runCode: () => Promise<void>;
    appendOutput: (line: string) => void;
    clearOutput: () => void;
    installPackage: (pkg: string) => Promise<void>;
    setTheme: (theme: ThemeId) => void;
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const transformCode = (code: string): string => {
    try {
        const sourceFile = ts.createSourceFile(
            'index.ts',
            code,
            ts.ScriptTarget.ESNext,
            true
        );

        const statements = sourceFile.statements;
        if (statements.length === 0) return code;

        let magicCode = code;

        // Iterate backwards to preserve string indices when modifying
        for (let i = statements.length - 1; i >= 0; i--) {
            const stmt = statements[i];

            if (ts.isExpressionStatement(stmt)) {
                const stmtText = stmt.getText(sourceFile);
                // Skip if it is already a console call
                if (stmtText.trim().match(/^console\.(log|info|warn|error|debug|table)/)) {
                    continue;
                }

                // Get the range of the statement
                const start = stmt.getStart(sourceFile);
                const end = stmt.getEnd();

                // We extract the expression itself, excluding the trailing semicolon if possible,
                // but `stmt.expression` might not include it. 
                // A safe way is to wrap the expression text.
                const exprText = stmt.expression.getText(sourceFile);

                // Construct replacement: console.log(<expr>);
                // We add a newline to ensure separation if specific formatting was weird,
                // but usually direct replacement is fine.
                const newText = `console.log(${exprText});`;

                magicCode = magicCode.substring(0, start) + newText + magicCode.substring(end);
            }
        }

        return magicCode;
    } catch (e) {
        return code;
    }
};

export const useStore = create<RuntsState>((set, get) => ({
    isBooted: false,
    tabs: [{ id: 'main', title: 'Main', content: 'console.log("Hello RunTS");' }],
    activeTabId: 'main',
    output: [],
    isRunning: false,
    autoRunEnabled: true,
    theme: 'runts-dark',

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
        } catch (error) {
            console.error('Failed to boot WebContainer', error);
            set({ output: ['[System] Failed to boot WebContainer. Check console.'] });
        }
    },

    addTab: () => {
        const newId = Math.random().toString(36).substring(7);
        set(state => ({
            tabs: [...state.tabs, { id: newId, title: 'Untitled', content: '' }],
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
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                runCode();
            }, 1000);
        }
    },

    renameTab: (id, title) => {
        set(state => ({
            tabs: state.tabs.map(t => t.id === id ? { ...t, title } : t)
        }));
    },

    toggleAutoRun: () => set(state => ({ autoRunEnabled: !state.autoRunEnabled })),

    appendOutput: (line) => set(state => ({ output: [...state.output, line] })),
    clearOutput: () => set({ output: [] }),

    runCode: async () => {
        const { isBooted, tabs, activeTabId, appendOutput } = get();
        if (!isBooted) return;

        set({ isRunning: true, output: [] });

        try {
            const activeTab = tabs.find(t => t.id === activeTabId);
            if (!activeTab) return;

            const instance = await getWebContainerInstance();
            const codeToRun = transformCode(activeTab.content);

            // Transpile TypeScript to JavaScript
            const transpiled = ts.transpileModule(codeToRun, {
                compilerOptions: {
                    module: ts.ModuleKind.CommonJS,
                    target: ts.ScriptTarget.ES2022,
                    esModuleInterop: true,
                }
            });

            await writeFile('index.cjs', transpiled.outputText);
            const process = await instance.spawn('node', ['index.cjs']);

            process.output.pipeTo(new WritableStream({
                write(data) {
                    appendOutput(data);
                }
            }));

            await process.exit;
        } catch (error: any) {
            appendOutput(`[Error] ${error.message}`);
        } finally {
            set({ isRunning: false });
        }
    },

    installPackage: async (pkg) => {
        const { isBooted, appendOutput } = get();
        if (!isBooted) return;

        appendOutput(`[System] Installing ${pkg}...`);
        try {
            const instance = await getWebContainerInstance();
            const process = await instance.spawn('pnpm', ['install', pkg]);
            process.output.pipeTo(new WritableStream({
                write(data) {
                    appendOutput(data);
                }
            }));
            await process.exit;
            appendOutput(`[System] ${pkg} installed.`);
        } catch (error: any) {
            appendOutput(`[System] Failed to install ${pkg}: ${error.message}`);
        }
    },

    setTheme: (theme) => set({ theme })
}));
