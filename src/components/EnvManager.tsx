import { Trash2, Plus } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../store/useStore';

export const EnvManager = () => {
    const { envVars, addEnvVar, removeEnvVar } = useStore();
    const [key, setKey] = useState('');
    const [value, setValue] = useState('');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (key && value) {
            addEnvVar(key, value);
            setKey('');
            setValue('');
        }
    };

    return (
        <div className="p-4 w-80">
            <h3 className="text-sm font-semibold mb-3 border-b border-gray-700 pb-2 flex items-center gap-2">
                Environment Variables
            </h3>

            <form onSubmit={handleAdd} className="flex flex-col gap-2 mb-4">
                <input
                    placeholder="KEY (e.g. API_URL)"
                    className="bg-black/30 border border-gray-700 rounded px-2 py-1 text-xs"
                    value={key}
                    onChange={e => setKey(e.target.value.toUpperCase())}
                />
                <div className="flex gap-2">
                    <input
                        placeholder="VALUE"
                        className="flex-1 bg-black/30 border border-gray-700 rounded px-2 py-1 text-xs"
                        value={value}
                        onChange={e => setValue(e.target.value)}
                    />
                    <button type="submit" disabled={!key || !value} className="bg-accent/20 text-accent p-1 rounded hover:bg-accent/30">
                        <Plus size={14} />
                    </button>
                </div>
            </form>

            <div className="space-y-2 max-h-60 overflow-y-auto">
                {Object.entries(envVars).length === 0 && (
                    <div className="text-gray-500 text-xs text-center py-2">No variables set</div>
                )}
                {Object.entries(envVars).map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center group bg-white/5 p-2 rounded text-xs">
                        <div className="flex flex-col overflow-hidden">
                            <span className="font-bold text-accent truncate">{k}</span>
                            <span className="text-gray-400 truncate max-w-[180px]">{v}</span>
                        </div>
                        <button
                            onClick={() => removeEnvVar(k)}
                            className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
