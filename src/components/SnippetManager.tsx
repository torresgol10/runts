import { Play, Trash2, Plus, Code } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../store/useStore';

export const SnippetManager = () => {
    const { snippets, addSnippet, removeSnippet, updateTabContent, activeTabId, tabs } = useStore();
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && code) {
            addSnippet(name, code);
            setName('');
            setCode('');
            setIsOpen(false);
        }
    };

    const insertSnippet = (snippetCode: string) => {
        const activeTab = tabs.find(t => t.id === activeTabId);
        if (activeTab) {
            // Append or insert at cursor? For now append to end or replace? 
            // Simple append for MVP or just replace if empty. 
            // Better: activeTab.content + '\n' + snippetCode
            updateTabContent(activeTabId, activeTab.content + (activeTab.content ? '\n' : '') + snippetCode);
        }
    };

    return (
        <div className="p-4 w-80">
            <h3 className="text-sm font-semibold mb-3 border-b border-gray-700 pb-2 flex items-center justify-between">
                <span>Snippets</span>
                <button onClick={() => setIsOpen(!isOpen)} className="text-accent hover:text-white">
                    <Plus size={16} />
                </button>
            </h3>

            {isOpen && (
                <form onSubmit={handleAdd} className="flex flex-col gap-2 mb-4 bg-white/5 p-3 rounded">
                    <input
                        placeholder="Snippet Name"
                        className="bg-black/30 border border-gray-700 rounded px-2 py-1 text-xs"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                    <textarea
                        placeholder="Code..."
                        className="bg-black/30 border border-gray-700 rounded px-2 py-1 text-xs font-mono h-20"
                        value={code}
                        onChange={e => setCode(e.target.value)}
                    />
                    <div className="flex gap-2 justify-end">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="text-xs text-gray-400 hover:text-white"
                        >
                            Cancel
                        </button>
                        <button type="submit" disabled={!name || !code} className="bg-accent text-black px-2 py-1 rounded text-xs font-bold">
                            Save
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {snippets.map(s => (
                    <div key={s.id} className="group bg-white/5 p-2 rounded text-xs border border-transparent hover:border-gray-700">
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-gray-200 flex items-center gap-1">
                                <Code size={12} className="text-accent" />
                                {s.name}
                            </span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => insertSnippet(s.code)}
                                    title="Insert"
                                    className="p-1 hover:bg-green-500/20 text-green-400 rounded"
                                >
                                    <Play size={12} />
                                </button>
                                <button
                                    onClick={() => removeSnippet(s.id)}
                                    title="Delete"
                                    className="p-1 hover:bg-red-500/20 text-red-400 rounded"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                        <pre className="font-mono text-gray-500 text-[10px] truncate">{s.code}</pre>
                    </div>
                ))}
            </div>
        </div>
    );
};
