import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { CodeEditor } from '../components/Editor';
import { Console } from '../components/Console';
import { Tabs } from '../components/Tabs';
import { Sidebar } from '../components/Sidebar';
import { CommandPalette } from '../components/CommandPalette';
import lzString from 'lz-string';

export function Playground() {
    const {
        isBooted,
        boot,
        tabs,
        activeTabId,
        addTab,
        closeTab,
        setActiveTab,
        updateTabContent,
        output,
        clearOutput,
        runCode,
        isRunning,
        installPackage,
        autoRunEnabled,
        toggleAutoRun,
        renameTab,
        theme,
        setTheme,
        deserialize,
        matchLines
    } = useStore();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const codeParam = params.get('code');
        if (codeParam) {
            try {
                const decompressed = lzString.decompressFromEncodedURIComponent(codeParam);
                if (decompressed) {
                    const data = JSON.parse(decompressed);
                    deserialize(data);
                    // Standard boot after hydration if needed, but boot check handles it
                    // Remove param from URL without reload to clean up
                    window.history.replaceState({}, '', window.location.pathname);
                }
            } catch (e) {
                console.error("Failed to load shared state", e);
            }
        }
        boot();
    }, []);

    // Get active tab content
    const activeTab = tabs.find(t => t.id === activeTabId);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                runCode();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [runCode]);

    if (!isBooted) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background text-white animate-pulse">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-accent mb-4">RunTS</h1>
                    <p className="text-gray-400 font-mono">Booting WebContainer Environment...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row h-screen w-full bg-transparent text-white overflow-hidden p-3 gap-3">
            <CommandPalette />

            {/* Sidebar Floating Panel */}
            <div className="shrink-0 flex flex-col z-50 w-full h-auto md:w-auto md:h-full order-last md:order-first">
                <Sidebar
                    onInstall={installPackage}
                    onRun={runCode}
                    isRunning={isRunning}
                    autoRunEnabled={autoRunEnabled}
                    onToggleAutoRun={toggleAutoRun}
                    currentTheme={theme}
                    onThemeChange={setTheme}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-0 gap-3 overflow-hidden">
                {/* Tabs Bar */}
                <div className="shrink-0 pt-1">
                    <Tabs
                        tabs={tabs}
                        activeTabId={activeTabId}
                        onTabClick={setActiveTab}
                        onTabClose={(id, e) => { e.stopPropagation(); closeTab(id); }}
                        onNewTab={addTab}
                        onRenameTab={renameTab}
                    />
                </div>

                <div className="flex-1 flex flex-col md:flex-row min-h-0 gap-3">
                    {/* Editor Panel */}
                    <div className="flex-1 h-1/2 md:h-full min-h-0 glass-panel rounded-2xl overflow-hidden shadow-2xl relative">
                        <div className="absolute inset-0 bg-[#09090b]/50 backdrop-blur-sm -z-10" />

                        <div className="w-full h-full">
                            {activeTab && (
                                <CodeEditor
                                    value={activeTab.content}
                                    onChange={(val) => updateTabContent(activeTab!.id, val || '')}
                                    theme={theme}
                                />
                            )}
                            {!activeTab && (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                                        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-accent animate-spin" />
                                    </div>
                                    <p className="font-mono text-sm opacity-50">Select or create a file</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Console Panel */}
                    <div className="h-1/2 md:h-full md:w-[40%] md:min-w-[300px] flex flex-col min-h-0 glass-panel rounded-2xl overflow-hidden shadow-2xl">
                        <Console
                            logs={output}
                            onClear={clearOutput}
                            matchLines={matchLines}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
