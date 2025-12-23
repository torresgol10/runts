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
        <div className="flex h-screen w-full bg-background text-white overflow-hidden">
            <CommandPalette />
            <Sidebar
                onInstall={installPackage}
                onRun={runCode}
                isRunning={isRunning}
                autoRunEnabled={autoRunEnabled}
                onToggleAutoRun={toggleAutoRun}
                currentTheme={theme}
                onThemeChange={setTheme}
            />

            <div className="flex-1 flex flex-col h-full min-w-0">
                <Tabs
                    tabs={tabs}
                    activeTabId={activeTabId}
                    onTabClick={setActiveTab}
                    onTabClose={(id, e) => { e.stopPropagation(); closeTab(id); }}
                    onNewTab={addTab}
                    onRenameTab={renameTab}
                />

                <div className="flex-1 flex flex-col md:flex-row min-h-0">
                    <div className="flex-1 h-1/2 md:h-full min-h-0 border-b md:border-b-0 md:border-r border-gray-800">
                        {/* Editor Container */}
                        <div className="w-full h-full">
                            {activeTab && (
                                <CodeEditor
                                    value={activeTab.content}
                                    onChange={(val) => updateTabContent(activeTab.id, val || '')}
                                    theme={theme}
                                />
                            )}
                            {!activeTab && (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    No open tabs
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="h-1/2 md:h-full md:w-[40%] md:min-w-[300px] flex flex-col min-h-0">
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
