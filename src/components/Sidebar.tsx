import { Logo } from './Logo';
import { Package, Play, Settings, Zap, Database, Save, Scissors, AlignLeft } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { themes, ThemeId } from '../utils/themes';
import { PackageManager } from './PackageManager';
import { SnippetManager } from './SnippetManager';
import { EnvManager } from './EnvManager';
import { downloadProjectZip } from '../utils/project';
import { formatCode } from '../utils/prettier';

import { ShareButton } from './ShareButton';

interface SidebarProps {
    onInstall: (pkg: string) => void;
    onRun: () => void;
    isRunning: boolean;
    autoRunEnabled: boolean;
    onToggleAutoRun: () => void;
    currentTheme: ThemeId;
    onThemeChange: (theme: ThemeId) => void;
}

type PopoverType = 'none' | 'package' | 'settings' | 'snippets' | 'env';

export const Sidebar = ({
    onRun,
    isRunning,
    autoRunEnabled,
    onToggleAutoRun,
    currentTheme,
    onThemeChange
}: SidebarProps) => {
    const { activeTabId, tabs, updateTabContent, matchLines, toggleMatchLines } = useStore();
    const [activePopover, setActivePopover] = useState<PopoverType>('none');
    const sidebarRef = useRef<HTMLDivElement>(null);

    const togglePopover = (name: PopoverType) => {
        setActivePopover(current => current === name ? 'none' : name);
    };

    const handleFormat = async () => {
        const activeTab = tabs.find(t => t.id === activeTabId);
        if (activeTab) {
            const formatted = await formatCode(activeTab.content);
            updateTabContent(activeTabId, formatted);
        }
    };

    const handleSave = () => {
        downloadProjectZip(tabs.map(t => ({ name: t.title, content: t.content })));
    };

    // Calculate top position for popovers based on active button
    // This simple heuristic assumes fixed positions or we could use refs map. 
    // Given the dynamic nature, we'll use a simple approach: render them fixed or absolute to sidebar
    // Since sidebar has relative, absolute children align to it. 
    // WE WILL RENDER THEM OUTSIDE THE SCROLL CONTAINER to avoid clipping.

    // Handle click outside to close popovers
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            // If the target is no longer in the document (was unmounted by the click event), 
            // we assume it was part of the UI and ignore it.
            if (!document.contains(target)) return;

            if (sidebarRef.current && !sidebarRef.current.contains(target)) {
                setActivePopover('none');
            }
        };

        if (activePopover !== 'none') {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activePopover]);

    return (
        <div
            ref={sidebarRef}
            className="w-full md:w-16 h-16 md:h-full flex flex-row md:flex-col items-center justify-between md:justify-start glass-panel rounded-t-2xl md:rounded-2xl md:rounded-r-none border-t md:border-t-0 md:border-r border-white/5 px-4 md:px-0 py-0 md:py-4 gap-2 md:gap-4 relative z-50 shadow-[0_-5px_30px_rgba(0,0,0,0.3)] md:shadow-[5px_0_30px_rgba(0,0,0,0.3)] transition-all duration-300"
        >
            <div className="hidden md:block mb-2 hover:scale-105 transition-transform duration-300">
                <Logo />
            </div>

            <button
                onClick={onRun}
                disabled={isRunning}
                className={`p-2 rounded-full transition-all duration-300 cursor-pointer shadow-lg group relative ${isRunning
                    ? 'bg-white/10 text-white/30 cursor-not-allowed'
                    : 'bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white hover:shadow-green-500/30 hover:scale-110'
                    }`}
                title="Run (Ctrl+Enter)"
            >
                <div className={`absolute inset-0 rounded-full bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isRunning ? 'hidden' : ''}`} />
                <Play size={20} fill="currentColor" className="relative z-10" />
            </button>

            <button
                onClick={onToggleAutoRun}
                className={`p-2 rounded-2xl transition-all duration-300 cursor-pointer ${autoRunEnabled
                    ? 'text-accent bg-accent/10 border border-accent/20 shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                    }`}
                title="Toggle Auto-Run"
            >
                <Zap size={20} fill={autoRunEnabled ? 'currentColor' : 'none'} />
            </button>

            <div className="hidden md:block w-8 h-[1px] bg-white/10 my-1 shrink-0" />
            <div className="md:hidden w-[1px] h-8 bg-white/10 mx-1 shrink-0" />

            {/* Scrollable Icons Area */}
            <div className="flex-1 flex flex-row md:flex-col items-center justify-center md:justify-start gap-3 md:w-full overflow-x-auto md:overflow-x-hidden md:overflow-y-auto no-scrollbar py-0 md:py-2">
                {/* Snippets */}
                <div className="relative group shrink-0" id="btn-snippets">
                    <button
                        onClick={() => togglePopover('snippets')}
                        className={`p-2 rounded-2xl transition-all duration-200 cursor-pointer ${activePopover === 'snippets' ? 'text-white bg-white/10 shadow-inner' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
                        title="Snippets"
                    >
                        <Scissors size={20} />
                    </button>
                </div>

                {/* Package Manager */}
                <div className="relative group shrink-0" id="btn-package">
                    <button
                        onClick={() => togglePopover('package')}
                        className={`p-2 rounded-2xl transition-all duration-200 cursor-pointer ${activePopover === 'package' ? 'text-white bg-white/10 shadow-inner' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
                        title="Packages"
                    >
                        <Package size={20} />
                    </button>
                </div>

                {/* Env Vars */}
                <div className="relative group shrink-0" id="btn-env">
                    <button
                        onClick={() => togglePopover('env')}
                        className={`p-2 rounded-2xl transition-all duration-200 cursor-pointer ${activePopover === 'env' ? 'text-white bg-white/10 shadow-inner' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
                        title="Environment Variables"
                    >
                        <Database size={20} />
                    </button>
                </div>

                <div className="hidden md:block w-8 h-[1px] bg-white/10 my-1 shrink-0" />
                <div className="md:hidden w-[1px] h-8 bg-white/10 mx-1 shrink-0" />

                {/* Format */}
                <button
                    onClick={handleFormat}
                    className="p-2 rounded-2xl text-text-secondary hover:text-white hover:bg-white/5 transition-colors cursor-pointer shrink-0"
                    title="Format Code (Prettier)"
                >
                    <AlignLeft size={20} />
                </button>

                {/* Save / Export */}
                <button
                    onClick={handleSave}
                    className="p-2 rounded-2xl text-text-secondary hover:text-white hover:bg-white/5 transition-colors cursor-pointer shrink-0"
                    title="Export Project (ZIP)"
                >
                    <Save size={20} />
                </button>

                {/* Share */}
                <div className="shrink-0">
                    <ShareButton />
                </div>
            </div>

            {/* Settings */}
            <div className="mt-0 md:mt-auto relative pb-0 md:pb-2 group">
                <button
                    onClick={() => togglePopover('settings')}
                    className={`p-2 rounded-2xl transition-all duration-200 cursor-pointer ${activePopover === 'settings' ? 'text-white bg-white/10 shadow-inner' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
                    title="Settings"
                >
                    <Settings size={20} className={activePopover === 'settings' ? 'rotate-90 transition-transform duration-300' : 'transition-transform duration-300 group-hover:rotate-45'} />
                </button>
            </div>

            {/* Popovers rendered OUTSIDE the scroll container to avoid clipping */}
            {/* Positioned absolutely relative to Sidebar. Using simplified fixed alignment for now since items are top-aligned in scroll view usually */}
            {/* Ideally we would calculate Top position, but for now we'll just check activePopover */}

            {activePopover === 'snippets' && (
                <div className="fixed bottom-20 left-4 right-4 md:absolute md:left-full md:top-20 md:ml-4 md:bottom-auto md:right-auto md:w-auto glass-panel rounded-2xl p-4 shadow-2xl z-[60] min-w-[300px] animate-in slide-in-from-bottom-10 md:slide-in-from-left-4 fade-in duration-200">
                    <SnippetManager />
                </div>
            )}

            {activePopover === 'package' && (
                <div className="fixed bottom-20 left-4 right-4 md:absolute md:left-full md:top-32 md:ml-4 md:bottom-auto md:right-auto md:w-auto glass-panel rounded-2xl p-4 shadow-2xl z-[60] min-w-[300px] md:min-w-[320px] animate-in slide-in-from-bottom-10 md:slide-in-from-left-4 fade-in duration-200">
                    <PackageManager />
                </div>
            )}

            {activePopover === 'env' && (
                <div className="fixed bottom-20 left-4 right-4 md:absolute md:left-full md:top-44 md:ml-4 md:bottom-auto md:right-auto md:w-auto glass-panel rounded-2xl p-4 shadow-2xl z-[60] min-w-[300px] animate-in slide-in-from-bottom-10 md:slide-in-from-left-4 fade-in duration-200">
                    <EnvManager />
                </div>
            )}

            {activePopover === 'settings' && (
                <div className="fixed bottom-20 left-4 right-4 md:absolute md:left-full md:bottom-4 md:ml-4 md:right-auto md:w-72 glass-panel border border-white/10 rounded-2xl shadow-2xl p-5 z-[60] animate-in slide-in-from-bottom-10 md:slide-in-from-left-4 fade-in duration-200">
                    <h3 className="text-sm font-semibold mb-4 border-b border-white/10 pb-2 text-white/90">Settings</h3>
                    <div className="space-y-4 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-text-secondary">Theme</span>
                            <select
                                value={currentTheme}
                                onChange={(e) => onThemeChange(e.target.value as ThemeId)}
                                className="bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
                            >
                                {themes.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-text-secondary">Match Lines</span>
                            <button
                                onClick={toggleMatchLines}
                                className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${matchLines ? 'bg-accent shadow-[0_0_10px_rgba(139,92,246,0.4)]' : 'bg-white/10'}`}
                            >
                                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${matchLines ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </button>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-text-secondary">Version</span>
                            <span className="text-white/80 font-mono text-xs bg-white/5 px-2 py-1 rounded">1.0.0 Premium</span>
                        </div>
                        <div className="text-[10px] text-text-muted pt-3 text-center border-t border-white/10 mt-2 uppercase tracking-widest font-bold">
                            RunTS AI
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
