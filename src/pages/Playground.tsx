import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Tabs } from '../components/Tabs';
import { ResizableLayout } from '../components/ResizableLayout';
import { Sidebar } from '../components/Sidebar';
import { CommandPalette } from '../components/CommandPalette';
import lzString from 'lz-string';

export function Playground() {
    const {
        isBooted,
        bootStatus,
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
    }, [boot, deserialize]);

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
                    <p className="text-gray-400 font-mono">
                        {bootStatus === 'restoring' ? 'Restoring packages...' :
                            bootStatus === 'booting' ? 'Booting WebContainer...' :
                                'Initializing environment...'}
                    </p>
                    {bootStatus === 'restoring' && <p className="text-xs text-gray-600 mt-2">This might take a moment</p>}
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

                <div className="flex-1 min-h-0 relative">
                    <ResizableLayout
                        activeTab={activeTab}
                        output={output}
                        clearOutput={clearOutput}
                        matchLines={matchLines}
                        updateTabContent={updateTabContent}
                        theme={theme}
                    />
                </div>
            </div>
        </div>
    );
}
