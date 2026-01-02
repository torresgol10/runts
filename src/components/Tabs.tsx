import { Plus, X } from 'lucide-react';
import { clsx } from 'clsx';
import { useState, useRef, useEffect } from 'react';

interface TabsProps {
    tabs: { id: string; title: string }[];
    activeTabId: string;
    onTabClick: (id: string) => void;
    onTabClose: (id: string, e: React.MouseEvent) => void;
    onNewTab: () => void;
    onRenameTab: (id: string, newTitle: string) => void;
}

export const Tabs = ({ tabs, activeTabId, onTabClick, onTabClose, onNewTab, onRenameTab }: TabsProps) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editingId && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingId]);

    const startEditing = (id: string, title: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingId(id);
        setEditValue(title);
    };

    const commitEdit = () => {
        if (editingId && editValue.trim()) {
            onRenameTab(editingId, editValue.trim());
        }
        setEditingId(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') commitEdit();
        if (e.key === 'Escape') setEditingId(null);
    };

    return (
        <div className="flex items-center gap-1.5 px-2 pt-2 pb-0 overflow-x-auto no-scrollbar items-end h-[42px]">
            {tabs.map(tab => (
                <div
                    key={tab.id}
                    onClick={() => onTabClick(tab.id)}
                    className={clsx(
                        "group flex items-center gap-2 px-4 py-1.5 cursor-pointer select-none min-w-[120px] max-w-[200px] justify-between transition-all duration-200 border-t border-l border-r rounded-t-lg relative",
                        activeTabId === tab.id
                            ? "bg-[#0e0e11]/90 text-white border-white/10 z-10 shadow-[0_-5px_15px_rgba(0,0,0,0.3)] h-full mb-0"
                            : "bg-white/5 text-text-muted border-transparent hover:bg-white/10 h-[calc(100%-4px)] mb-0 hover:text-gray-300"
                    )}
                    onDoubleClick={(e) => startEditing(tab.id, tab.title, e)}
                >
                    {activeTabId === tab.id && <div className="absolute top-0 left-0 right-0 h-[2px] bg-accent shadow-[0_0_10px_rgba(139,92,246,0.6)] rounded-t-full" />}

                    {editingId === tab.id ? (
                        <input
                            ref={inputRef}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={commitEdit}
                            onKeyDown={handleKeyDown}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-black/50 text-white text-xs px-1.5 py-0.5 rounded border border-accent/50 w-24 outline-none focus:border-accent font-mono"
                        />
                    ) : (
                        <span className="truncate text-xs font-medium tracking-wide">{tab.title}</span>
                    )}

                    <button
                        onClick={(e) => onTabClose(tab.id, e)}
                        className={clsx(
                            "rounded-full p-0.5 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100",
                            activeTabId === tab.id ? "hover:bg-white/20 text-gray-400 hover:text-white" : "hover:bg-white/10 text-gray-600 hover:text-gray-300"
                        )}
                    >
                        <X size={12} />
                    </button>
                </div>
            ))}
            <button
                onClick={onNewTab}
                className="p-1.5 hover:bg-white/10 rounded-md transition-colors ml-1 text-gray-500 hover:text-white mb-1"
                title="New Tab"
            >
                <Plus size={16} />
            </button>
        </div>
    );
};
