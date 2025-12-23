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

    // Close popover when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
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

    return (
        <div ref={sidebarRef} className="w-16 flex flex-col items-center bg-[#0f0f11] border-r border-gray-800 py-4 gap-4 relative z-40">
            <div className="mb-4">
                <Logo />
            </div>

            <button
                onClick={onRun}
                disabled={isRunning}
                className={`p-3 rounded-xl transition-all ${isRunning
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20'
                    }`}
                title="Run (Ctrl+Enter)"
            >
                <Play size={20} fill="currentColor" />
            </button>

            <button
                onClick={onToggleAutoRun}
                className={`p-3 rounded-xl transition-all ${autoRunEnabled
                    ? 'text-accent bg-accent/10'
                    : 'text-gray-500 hover:text-gray-300'
                    }`}
                title="Toggle Auto-Run"
            >
                <Zap size={20} fill={autoRunEnabled ? 'currentColor' : 'none'} />
            </button>

            <div className="w-8 h-[1px] bg-gray-800 my-2" />

            {/* Snippets */}
            <div className="relative">
                <button
                    onClick={() => togglePopover('snippets')}
                    className={`p-3 rounded-xl transition-colors ${activePopover === 'snippets' ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                    title="Snippets"
                >
                    <Scissors size={20} />
                </button>
                {activePopover === 'snippets' && (
                    <div className="absolute left-full top-0 ml-4 bg-[#1e1e24] border border-gray-700 rounded-lg shadow-xl z-50">
                        <SnippetManager />
                    </div>
                )}
            </div>

            {/* Package Manager */}
            <div className="relative">
                <button
                    onClick={() => togglePopover('package')}
                    className={`p-3 rounded-xl transition-colors ${activePopover === 'package' ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                    title="Packages"
                >
                    <Package size={20} />
                </button>
                {activePopover === 'package' && (
                    <div className="absolute left-full top-0 ml-4 bg-[#1e1e24] border border-gray-700 rounded-lg shadow-xl z-50">
                        <PackageManager />
                    </div>
                )}
            </div>

            {/* Env Vars */}
            <div className="relative">
                <button
                    onClick={() => togglePopover('env')}
                    className={`p-3 rounded-xl transition-colors ${activePopover === 'env' ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                    title="Environment Variables"
                >
                    <Database size={20} />
                </button>
                {activePopover === 'env' && (
                    <div className="absolute left-full top-0 ml-4 bg-[#1e1e24] border border-gray-700 rounded-lg shadow-xl z-50">
                        <EnvManager />
                    </div>
                )}
            </div>

            <div className="w-8 h-[1px] bg-gray-800 my-2" />

            {/* Format */}
            <button
                onClick={handleFormat}
                className="p-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Format Code (Prettier)"
            >
                <AlignLeft size={20} />
            </button>

            {/* Save / Export */}
            <button
                onClick={handleSave}
                className="p-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Export Project (ZIP)"
            >
                <Save size={20} />
            </button>

            {/* Share */}
            <ShareButton />

            {/* Settings */}
            <div className="mt-auto relative">
                <button
                    onClick={() => togglePopover('settings')}
                    className={`p-3 rounded-xl transition-colors ${activePopover === 'settings' ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                    title="Settings"
                >
                    <Settings size={20} />
                </button>

                {activePopover === 'settings' && (
                    <div className="absolute left-full bottom-0 ml-4 w-64 bg-[#1e1e24] border border-gray-700 rounded-lg shadow-xl p-4 z-50">
                        <h3 className="text-sm font-semibold mb-3 border-b border-gray-700 pb-2">Settings</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Theme</span>
                                <select
                                    value={currentTheme}
                                    onChange={(e) => onThemeChange(e.target.value as ThemeId)}
                                    className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-accent"
                                >
                                    {themes.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Match Lines</span>
                                <button
                                    onClick={toggleMatchLines}
                                    className={`w-8 h-4 rounded-full relative transition-colors ${matchLines ? 'bg-accent' : 'bg-gray-700'}`}
                                >
                                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${matchLines ? 'left-4.5' : 'left-0.5'}`} style={{ left: matchLines ? '18px' : '2px' }} />
                                </button>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Version</span>
                                <span className="text-white">Full 1.0</span>
                            </div>
                            <div className="text-xs text-gray-500 pt-2 text-center border-t border-gray-700">
                                RunTS by Antigravity
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
