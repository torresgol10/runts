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
        <div className="flex items-center bg-[#0f0f11] border-b border-gray-800 overflow-x-auto">
            {tabs.map(tab => (
                <div
                    key={tab.id}
                    onClick={() => onTabClick(tab.id)}
                    className={clsx(
                        "group flex items-center gap-2 px-4 py-2 border-r border-gray-800 cursor-pointer select-none min-w-[120px] justify-between hover:bg-[#1e1e24] transition-colors",
                        activeTabId === tab.id ? "bg-[#1e1e24] text-white" : "text-gray-500"
                    )}
                    onDoubleClick={(e) => startEditing(tab.id, tab.title, e)}
                >
                    {editingId === tab.id ? (
                        <input
                            ref={inputRef}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={commitEdit}
                            onKeyDown={handleKeyDown}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-black/50 text-white text-sm px-1 rounded border border-accent w-20 outline-none"
                        />
                    ) : (
                        <span className="truncate text-sm">{tab.title}</span>
                    )}

                    <button
                        onClick={(e) => onTabClose(tab.id, e)}
                        className="opacity-0 group-hover:opacity-100 hover:bg-white/20 rounded p-0.5 transition-all"
                    >
                        <X size={12} />
                    </button>
                </div>
            ))}
            <button
                onClick={onNewTab}
                className="p-1 hover:bg-white/10 rounded transition-colors ml-1 text-gray-400 hover:text-white"
                title="New Tab"
            >
                <Plus size={16} />
            </button>
        </div>
    );
};
