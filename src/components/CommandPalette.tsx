import { Command } from 'cmdk';
import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import {
    Play,
    Trash2,
    Moon,
    Sun,
    Monitor,
    AlignLeft,
    Package,
    Search
} from 'lucide-react';

export const CommandPalette = () => {
    const [open, setOpen] = useState(false);
    const {
        runCode,
        clearOutput,
        setTheme,
        activeTabId,
        tabs,
        updateTabContent,
        theme
    } = useStore();

    // Toggle with Cmd+K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const runAction = (action: () => void) => {
        action();
        setOpen(false);
    };

    return (
        <Command.Dialog
            open={open}
            onOpenChange={setOpen}
            label="Global Command Menu"
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] max-w-[90vw] bg-[#1e1e24] rounded-xl shadow-2xl border border-gray-700 p-2 z-[100]"
        >
            <div className="flex items-center border-b border-gray-700 px-3 pb-2 mb-2">
                <Search size={16} className="text-gray-400 mr-2" />
                <Command.Input
                    placeholder="Type a command or search..."
                    className="bg-transparent border-none text-white focus:outline-none focus:ring-0 flex-1 h-8 text-sm"
                />
            </div>

            <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden">
                <Command.Empty className="text-gray-500 text-center text-sm py-4">
                    No results found.
                </Command.Empty>

                <Command.Group heading="RunTS Actions" className="text-xs font-semibold text-gray-500 mb-2 px-2">
                    <Command.Item
                        onSelect={() => runAction(runCode)}
                        className="flex items-center text-sm text-gray-300 p-2 rounded hover:bg-white/10 cursor-pointer aria-selected:bg-white/10 aria-selected:text-white"
                    >
                        <Play size={14} className="mr-2" />
                        Run Code
                        <span className="ml-auto text-xs opacity-50">Ctrl+Enter</span>
                    </Command.Item>
                    <Command.Item
                        onSelect={() => runAction(clearOutput)}
                        className="flex items-center text-sm text-gray-300 p-2 rounded hover:bg-white/10 cursor-pointer aria-selected:bg-white/10 aria-selected:text-white"
                    >
                        <Trash2 size={14} className="mr-2" />
                        Clear Console
                    </Command.Item>
                </Command.Group>

                <Command.Group heading="Themes" className="text-xs font-semibold text-gray-500 mb-2 px-2">
                    <Command.Item
                        onSelect={() => runAction(() => setTheme('runts-dark'))}
                        className="flex items-center text-sm text-gray-300 p-2 rounded hover:bg-white/10 cursor-pointer aria-selected:bg-white/10 aria-selected:text-white"
                    >
                        <Moon size={14} className="mr-2" />
                        Dark Theme
                        {theme === 'runts-dark' && <span className="ml-auto text-accent">Helper</span>}
                    </Command.Item>
                    <Command.Item
                        onSelect={() => runAction(() => setTheme('monokai'))}
                        className="flex items-center text-sm text-gray-300 p-2 rounded hover:bg-white/10 cursor-pointer aria-selected:bg-white/10 aria-selected:text-white"
                    >
                        <Monitor size={14} className="mr-2" />
                        Monokai
                    </Command.Item>
                    <Command.Item
                        onSelect={() => runAction(() => setTheme('dracula'))}
                        className="flex items-center text-sm text-gray-300 p-2 rounded hover:bg-white/10 cursor-pointer aria-selected:bg-white/10 aria-selected:text-white"
                    >
                        <Sun size={14} className="mr-2" />
                        Dracula
                    </Command.Item>
                </Command.Group>
            </Command.List>
        </Command.Dialog>
    );
};
