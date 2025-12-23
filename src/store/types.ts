import { ThemeId } from '../utils/themes';

export interface Tab {
    id: string;
    title: string;
    content: string;
}

export interface LogEntry {
    id: string;
    line?: number;
    content: string;
    method?: 'log' | 'error' | 'warn' | 'info';
    timestamp: number;
}

export interface Snippet {
    id: string;
    name: string;
    code: string;
}

export interface RuntsState {
    // Tabs Feature
    tabs: Tab[];
    activeTabId: string;
    addTab: () => void;
    closeTab: (id: string) => void;
    setActiveTab: (id: string) => void;
    updateTabContent: (id: string, content: string) => void;
    renameTab: (id: string, title: string) => void;

    // Execution Feature
    isBooted: boolean;
    isRunning: boolean;
    output: LogEntry[];
    autoRunEnabled: boolean;
    matchLines: boolean;
    boot: () => Promise<void>;
    runCode: () => Promise<void>;
    stopCode: () => void;
    appendLogs: (logs: LogEntry[]) => void;
    appendOutput: (content: string, line?: number) => void;
    clearOutput: () => void;
    toggleAutoRun: () => void;
    toggleMatchLines: () => void;

    // Packages Feature
    dependencies: Record<string, string>;
    installPackage: (pkg: string) => Promise<void>;
    uninstallPackage: (pkg: string) => Promise<void>;
    refreshDependencies: () => Promise<void>;

    // UI Feature
    theme: ThemeId;
    envVars: Record<string, string>;
    snippets: Snippet[];
    setTheme: (theme: ThemeId) => void;
    addEnvVar: (key: string, value: string) => void;
    removeEnvVar: (key: string) => void;
    addSnippet: (name: string, code: string) => void;
    removeSnippet: (id: string) => void;
    deserialize: (state: Partial<RuntsState>) => void;
}
