import { Terminal, Trash2 } from 'lucide-react';
import Anser from 'anser';
import { useRef, useEffect } from 'react';

interface ConsoleProps {
    logs: string[];
    onClear: () => void;
}

export const Console = ({ logs, onClear }: ConsoleProps) => {
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="flex flex-col h-full bg-secondary text-gray-300 font-mono text-sm border-t border-gray-700">
            <div className="flex items-center justify-between px-4 py-2 bg-[#18181b] border-b border-gray-700">
                <div className="flex items-center gap-2">
                    <Terminal size={14} />
                    <span className="font-semibold uppercase text-xs tracking-wider">Console</span>
                </div>
                <button
                    onClick={onClear}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                    title="Clear Console"
                >
                    <Trash2 size={14} />
                </button>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-1">
                {logs.length === 0 && (
                    <div className="text-gray-600 italic">No output yet...</div>
                )}
                {logs.map((log, i) => (
                    <div key={i} className="whitespace-pre-wrap break-all">
                        {Anser.ansiToJson(log, { use_classes: true }).map((chunk, j) => (
                            <span
                                key={j}
                                style={{
                                    color: chunk.fg ? `rgb(${chunk.fg})` : undefined,
                                    backgroundColor: chunk.bg ? `rgb(${chunk.bg})` : undefined,
                                    fontWeight: chunk.decoration === 'bold' ? 'bold' : 'normal',
                                }}
                            >
                                {chunk.content}
                            </span>
                        ))}
                    </div>
                ))}
                <div ref={endRef} />
            </div>
        </div>
    );
};
